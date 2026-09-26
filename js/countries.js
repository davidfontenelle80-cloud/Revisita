const ISO_REGION_CODES='AD,AE,AF,AG,AI,AL,AM,AO,AQ,AR,AS,AT,AU,AW,AX,AZ,BA,BB,BD,BE,BF,BG,BH,BI,BJ,BL,BM,BN,BO,BQ,BR,BS,BT,BV,BW,BY,BZ,CA,CC,CD,CF,CG,CH,CI,CK,CL,CM,CN,CO,CR,CU,CV,CW,CX,CY,CZ,DE,DJ,DK,DM,DO,DZ,EC,EE,EG,EH,ER,ES,ET,FI,FJ,FK,FM,FO,FR,GA,GB,GD,GE,GF,GG,GH,GI,GL,GM,GN,GP,GQ,GR,GS,GT,GU,GW,GY,HK,HM,HN,HR,HT,HU,ID,IE,IL,IM,IN,IO,IQ,IR,IS,IT,JE,JM,JO,JP,KE,KG,KH,KI,KM,KN,KP,KR,KW,KY,KZ,LA,LB,LC,LI,LK,LR,LS,LT,LU,LV,LY,MA,MC,MD,ME,MF,MG,MH,MK,ML,MM,MN,MO,MP,MQ,MR,MS,MT,MU,MV,MW,MX,MY,MZ,NA,NC,NE,NF,NG,NI,NL,NO,NP,NR,NU,NZ,OM,PA,PE,PF,PG,PH,PK,PL,PM,PN,PR,PS,PT,PW,PY,QA,RE,RO,RS,RU,RW,SA,SB,SC,SD,SE,SG,SH,SI,SJ,SK,SL,SM,SN,SO,SR,SS,ST,SV,SX,SY,SZ,TC,TD,TF,TG,TH,TJ,TK,TL,TM,TN,TO,TR,TT,TV,TW,TZ,UA,UG,UM,US,UY,UZ,VA,VC,VE,VG,VI,VN,VU,WF,WS,YE,YT,ZA,ZM,ZW'.split(',');

const normalized=text=>String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

function displayNames(locale){
  try{return new Intl.DisplayNames([locale],{type:'region'});}catch{return null;}
}

export function isCountryCode(code){
  return ISO_REGION_CODES.includes(String(code||'').toUpperCase());
}

export function countryName(code,language='es'){
  const upper=String(code||'').toUpperCase();
  if(!isCountryCode(upper))return upper;
  const locale=language==='en'?'en':'es';
  return displayNames(locale)?.of(upper)||displayNames('en')?.of(upper)||upper;
}

export function countryOptions(language='es'){
  const locale=language==='en'?'en':'es';
  const localNames=displayNames(locale),englishNames=displayNames('en');
  return ISO_REGION_CODES.map(code=>{
    const name=localNames?.of(code)||englishNames?.of(code)||code;
    const english=englishNames?.of(code)||name;
    return {code:code.toLowerCase(),name,search:normalized(`${name} ${english} ${code}`)};
  }).sort((a,b)=>a.name.localeCompare(b.name,locale,{sensitivity:'base'}));
}

export function filterCountries(options,query){
  const q=normalized(query).trim();
  if(!q)return options;
  return options.filter(item=>item.search.includes(q));
}

export const COUNTRY_COUNT=ISO_REGION_CODES.length;
