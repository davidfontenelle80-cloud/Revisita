const WEB_PUSH_RS = 4096;
function textBytes(value) {
  return new TextEncoder().encode(String(value));
}

function concatBytes() {
  const parts = Array.prototype.slice.call(arguments).map(part => part instanceof Uint8Array ? part : new Uint8Array(part));
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function base64UrlToBytes(value) {
  const normalized = String(value || '').trim().replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToBase64Url(bytes) {
  let binary = '';
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < view.length; i += 1) binary += String.fromCharCode(view[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function hmac(keyBytes, dataBytes) {
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, dataBytes));
}

async function hkdfExtract(saltBytes, ikmBytes) {
  return hmac(saltBytes, ikmBytes);
}

async function hkdfExpand(prkBytes, infoBytes, length) {
  const bytes = await hmac(prkBytes, concatBytes(infoBytes, new Uint8Array([1])));
  return bytes.slice(0, length);
}

function uint32Bytes(value) {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value, false);
  return bytes;
}

function subscriptionEndpointOrigin(endpoint) {
  return new URL(endpoint).origin;
}

function importVapidSigningKey(env) {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.VAPID_SUBJECT) {
    throw new Error('Missing VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, or VAPID_SUBJECT.');
  }
  const publicKey = base64UrlToBytes(env.VAPID_PUBLIC_KEY);
  const privateKey = base64UrlToBytes(env.VAPID_PRIVATE_KEY);
  if (publicKey.length !== 65 || publicKey[0] !== 4) {
    throw new Error('VAPID_PUBLIC_KEY must be an uncompressed P-256 public key.');
  }
  if (privateKey.length !== 32) {
    throw new Error('VAPID_PRIVATE_KEY must be a base64url P-256 private scalar.');
  }
  return crypto.subtle.importKey('jwk', {
    kty: 'EC',
    crv: 'P-256',
    x: bytesToBase64Url(publicKey.slice(1, 33)),
    y: bytesToBase64Url(publicKey.slice(33, 65)),
    d: bytesToBase64Url(privateKey),
    ext: false,
  }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
}

function normalizeEcdsaSignature(signature) {
  const sig = signature instanceof Uint8Array ? signature : new Uint8Array(signature);
  if (sig.length === 64) return sig;
  if (sig[0] !== 0x30) throw new Error('Unsupported ECDSA signature format.');
  let offset = 2;
  if (sig[1] & 0x80) offset = 2 + (sig[1] & 0x7f);
  if (sig[offset] !== 0x02) throw new Error('Invalid ECDSA signature.');
  const rLen = sig[offset + 1];
  const r = sig.slice(offset + 2, offset + 2 + rLen);
  offset = offset + 2 + rLen;
  if (sig[offset] !== 0x02) throw new Error('Invalid ECDSA signature.');
  const sLen = sig[offset + 1];
  const s = sig.slice(offset + 2, offset + 2 + sLen);
  const out = new Uint8Array(64);
  out.set(r.slice(Math.max(0, r.length - 32)), 32 - Math.min(32, r.length));
  out.set(s.slice(Math.max(0, s.length - 32)), 64 - Math.min(32, s.length));
  return out;
}

async function createVapidJwt(endpoint, env) {
  const header = bytesToBase64Url(textBytes(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const claims = bytesToBase64Url(textBytes(JSON.stringify({
    aud: subscriptionEndpointOrigin(endpoint),
    exp: Math.floor(Date.now() / 1000) + (12 * 60 * 60),
    sub: env.VAPID_SUBJECT,
  })));
  const signingInput = `${header}.${claims}`;
  const key = await importVapidSigningKey(env);
  const signature = normalizeEcdsaSignature(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, textBytes(signingInput)));
  return `${signingInput}.${bytesToBase64Url(signature)}`;
}

async function encryptPushPayload(subscription, payload) {
  const uaPublic = base64UrlToBytes(subscription.keys && subscription.keys.p256dh);
  const authSecret = base64UrlToBytes(subscription.keys && subscription.keys.auth);
  if (uaPublic.length !== 65 || uaPublic[0] !== 4) throw new Error('Subscription p256dh key is invalid.');
  if (authSecret.length !== 16) throw new Error('Subscription auth secret is invalid.');

  const asKeys = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', asKeys.publicKey));
  const uaKey = await crypto.subtle.importKey('raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const ecdhSecret = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, asKeys.privateKey, 256));

  const keyInfo = concatBytes(textBytes('WebPush: info'), new Uint8Array([0]), uaPublic, asPublic);
  const prkKey = await hkdfExtract(authSecret, ecdhSecret);
  const ikm = await hkdfExpand(prkKey, keyInfo, 32);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const prk = await hkdfExtract(salt, ikm);
  const cek = await hkdfExpand(prk, concatBytes(textBytes('Content-Encoding: aes128gcm'), new Uint8Array([0])), 16);
  const nonce = await hkdfExpand(prk, concatBytes(textBytes('Content-Encoding: nonce'), new Uint8Array([0])), 12);

  const plaintext = concatBytes(textBytes(JSON.stringify(payload)), new Uint8Array([2]));
  if (plaintext.length + 16 >= WEB_PUSH_RS) throw new Error('Push payload is too large.');
  const aesKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, plaintext));

  return concatBytes(salt, uint32Bytes(WEB_PUSH_RS), new Uint8Array([asPublic.length]), asPublic, ciphertext);
}


export { createVapidJwt, encryptPushPayload };
