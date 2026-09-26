export function normalizeGeocodeResult(result){
  const lat=Number(result?.lat);
  const lng=Number(result?.lon);
  if(!Number.isFinite(lat)||!Number.isFinite(lng))return null;
  return {
    lat,
    lng,
    displayName:String(result?.display_name||'').trim(),
    address:result?.address&&typeof result.address==='object'?result.address:{},
    type:String(result?.type||'').toLowerCase(),
    addresstype:String(result?.addresstype||'').toLowerCase()
  };
}

export function geocodeResultIsExact(result){
  const r=normalizeGeocodeResult(result);
  if(!r)return false;
  if(String(r.address.house_number||'').trim())return true;
  return ['house','building','apartments'].includes(r.type)||['house','building','apartments'].includes(r.addresstype);
}

export function geocodeResultZoom(result){
  const r=normalizeGeocodeResult(result);
  if(!r)return 14;
  if(geocodeResultIsExact(result))return 18;
  if(['postcode','postal_code','city','town','municipality','county','state'].includes(r.type)||['postcode','postal_code','city','town','municipality','county','state'].includes(r.addresstype))return 13;
  return 16;
}
