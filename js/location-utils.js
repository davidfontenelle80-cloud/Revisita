export function locationFromPosition(position){
  const lat=Number(position?.coords?.latitude);
  const lng=Number(position?.coords?.longitude);
  const accuracy=Number(position?.coords?.accuracy);
  if(!Number.isFinite(lat)||!Number.isFinite(lng))return null;
  return {
    lat,
    lng,
    accuracy:Number.isFinite(accuracy)&&accuracy>=0?accuracy:Infinity
  };
}

export function betterLocation(current,candidate){
  if(!candidate)return current||null;
  if(!current)return candidate;
  const a=Number(current.accuracy),b=Number(candidate.accuracy);
  if(!Number.isFinite(a))return candidate;
  if(!Number.isFinite(b))return current;
  return b<a?candidate:current;
}

export function accuracyLevel(meters){
  const value=Number(meters);
  if(!Number.isFinite(value)||value<0)return 'unknown';
  if(value<=80)return 'good';
  if(value<=250)return 'fair';
  return 'poor';
}

export function formatAccuracy(meters){
  const value=Number(meters);
  if(!Number.isFinite(value)||value<0)return '';
  if(value>=1000){
    const km=value/1000;
    return `${km>=10?Math.round(km):km.toFixed(1)} km`;
  }
  return `${Math.max(1,Math.round(value))} m`;
}
