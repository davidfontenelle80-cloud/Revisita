const clean=value=>String(value||'').trim();

export function buildAddressSearch(country, values={}){
  const code=clean(country).toLowerCase();
  let parts=[],countryCode=/^[a-z]{2}$/.test(code)?code:'';
  if(code==='us'){
    parts=[values.street,values.city,values.region,values.postal,values.countryName||'United States'];
  }else if(code==='do'){
    parts=[values.street,values.neighborhood,values.city,values.region,values.postal,values.countryName||'República Dominicana'];
  }else{
    parts=[values.address,values.countryName];
  }
  const query=parts.map(clean).filter(Boolean).join(', ');
  return {query,countryCode};
}

export function hasAddressSearchInput(country,values={}){
  const code=clean(country).toLowerCase();
  if(code==='us')return [values.street,values.city,values.region,values.postal].some(v=>clean(v));
  if(code==='do')return [values.street,values.neighborhood,values.city,values.region,values.postal].some(v=>clean(v));
  return Boolean(clean(values.address));
}
