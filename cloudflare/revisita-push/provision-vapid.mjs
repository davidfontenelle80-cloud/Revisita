// Run once after creating revisita-push. Never prints or writes the private key.
// Public configuration is updated only after Cloudflare accepts the secret.
import {generateKeyPairSync} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const directory=path.dirname(fileURLToPath(import.meta.url));
const configPath=path.join(directory,'wrangler.toml');
const config=readFileSync(configPath,'utf8');
if(!/^name\s*=\s*"revisita-push"\s*$/m.test(config))throw new Error('Refusing to provision a different Worker.');
if(/^VAPID_PUBLIC_KEY\s*=/m.test(config))throw new Error('Public key already configured. Do not rotate keys accidentally.');
const wrangler=process.argv[2]||path.join(process.env.APPDATA||'', 'npm/node_modules/wrangler/bin/wrangler.js');
if(!existsSync(wrangler))throw new Error('Pass the absolute path to wrangler/bin/wrangler.js.');
const {privateKey,publicKey}=generateKeyPairSync('ec',{namedCurve:'prime256v1'});
const priv=privateKey.export({format:'jwk'}),pub=publicKey.export({format:'jwk'});
const publicRaw=Buffer.concat([Buffer.from([4]),Buffer.from(pub.x,'base64url'),Buffer.from(pub.y,'base64url')]).toString('base64url');
const result=spawnSync(process.execPath,[wrangler,'secret','put','VAPID_PRIVATE_KEY','--config',configPath],{
 cwd:directory,input:priv.d+'\n',encoding:'utf8',env:{...process.env,WRANGLER_LOG:'error',WRANGLER_SEND_METRICS:'false'},windowsHide:true,
});
priv.d='';
if(result.status!==0)throw new Error('Secret upload failed. No key was saved locally; authenticate Wrangler and retry.');
writeFileSync(configPath,config.replace('[vars]',`[vars]\nVAPID_PUBLIC_KEY = "${publicRaw}"`));
console.log('New Revisita VAPID secret installed. Public key written to wrangler.toml. Deploy again.');
