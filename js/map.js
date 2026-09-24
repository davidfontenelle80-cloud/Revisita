import{TILE_SIZE,clamp,latLngToWorld,worldToLatLng}from'./map-utils.js?v=1.4.5';

export class SimpleMap{
  constructor(el,o={}){
    this.el=el;
    this.center={lat:o.lat??18.7357,lng:o.lng??-70.1627};
    this.zoom=clamp(Math.round(o.zoom??8),2,19);
    this.interactive=o.interactive!==false;
    this.markers=[];
    this.draft=null;
    this.userLocation=null;
    this.onTap=()=>{};
    this.onMarkerTap=()=>{};
    this.onViewChange=()=>{};
    this.drag=null;
    this.tileNodes=new Map();
    this.fallbackZoom=null;
    this.markerNodes=new Map();
    this.draftNode=null;
    this.userNode=null;
    this.renderFrame=0;
    this.lastWheelAt=0;
    this.buildLayers();
    if(this.interactive)this.bind();
    this.resizeObserver=new ResizeObserver(()=>this.scheduleRender());
    this.resizeObserver.observe(this.el);
    this.scheduleRender();
  }

  buildLayers(){
    this.fallbackLayer=document.createElement('div');
    this.fallbackLayer.className='tile-layer map-fallback-layer';
    this.tileLayer=document.createElement('div');
    this.tileLayer.className='tile-layer';
    this.markerLayer=document.createElement('div');
    this.markerLayer.className='marker-layer';
    this.el.append(this.fallbackLayer,this.tileLayer,this.markerLayer);
  }

  bind(){
    this.el.addEventListener('pointerdown',e=>{
      if(e.button!==0)return;
      this.el.setPointerCapture?.(e.pointerId);
      this.drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};
    });

    this.el.addEventListener('pointermove',e=>{
      if(!this.drag||this.drag.id!==e.pointerId)return;
      const dx=e.clientX-this.drag.lastX;
      const dy=e.clientY-this.drag.lastY;
      const total=Math.hypot(e.clientX-this.drag.startX,e.clientY-this.drag.startY);
      if(total>7)this.drag.moved=true;
      if(!dx&&!dy)return;
      const c=latLngToWorld(this.center.lat,this.center.lng,this.zoom);
      const ll=worldToLatLng(c.x-dx,c.y-dy,this.zoom);
      this.center={lat:ll.lat,lng:nLng(ll.lng)};
      this.drag.lastX=e.clientX;
      this.drag.lastY=e.clientY;
      this.scheduleRender();
    });

    const end=e=>{
      if(!this.drag||this.drag.id!==e.pointerId)return;
      const moved=this.drag.moved;
      this.drag=null;
      if(!moved){
        const r=this.el.getBoundingClientRect();
        this.onTap(this.screenToLatLng(e.clientX-r.left,e.clientY-r.top));
      }else{
        this.scheduleRender();
        this.onViewChange({...this.center,zoom:this.zoom});
      }
    };

    this.el.addEventListener('pointerup',end);
    this.el.addEventListener('pointercancel',()=>{this.drag=null;});

    this.el.addEventListener('wheel',e=>{
      e.preventDefault();
      const now=performance.now();
      if(now-this.lastWheelAt<90)return;
      this.lastWheelAt=now;
      this.setZoom(this.zoom+(e.deltaY<0?1:-1));
    },{passive:false});
  }

  screenToLatLng(x,y){
    const c=latLngToWorld(this.center.lat,this.center.lng,this.zoom);
    return worldToLatLng(c.x+x-this.el.clientWidth/2,c.y+y-this.el.clientHeight/2,this.zoom);
  }

  setView(lat,lng,zoom=this.zoom){
    this.center={lat:clamp(Number(lat),-85,85),lng:nLng(Number(lng))};
    const nextZoom=clamp(Math.round(zoom),2,19);
    if(nextZoom!==this.zoom)this.keepTilesDuringZoom();
    this.zoom=nextZoom;
    this.scheduleRender();
    this.onViewChange({...this.center,zoom:this.zoom});
  }

  setZoom(z){
    const n=clamp(Math.round(z),2,19);
    if(n===this.zoom)return;
    this.keepTilesDuringZoom();
    this.zoom=n;
    this.scheduleRender();
    this.onViewChange({...this.center,zoom:this.zoom});
  }

  setMarkers(markers){
    this.markers=Array.isArray(markers)?markers:[];
    this.syncMarkerNodes();
    this.scheduleRender();
  }

  setDraft(lat,lng){
    this.draft=Number.isFinite(lat)&&Number.isFinite(lng)?{lat,lng}:null;
    this.syncAuxiliaryMarkers();
    this.scheduleRender();
  }

  setUserLocation(lat,lng){
    this.userLocation=Number.isFinite(lat)&&Number.isFinite(lng)?{lat,lng}:null;
    this.syncAuxiliaryMarkers();
    this.scheduleRender();
  }

  fitPoints(points,maxZoom=16){
    if(!points?.length)return;
    if(points.length===1){
      this.setView(points[0].lat,points[0].lng,maxZoom);
      return;
    }
    const w=Math.max(120,this.el.clientWidth-100);
    const h=Math.max(120,this.el.clientHeight-100);
    for(let z=maxZoom;z>=2;z--){
      const ps=points.map(p=>latLngToWorld(p.lat,p.lng,z));
      const xs=ps.map(p=>p.x),ys=ps.map(p=>p.y);
      const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
      if(maxX-minX<=w&&maxY-minY<=h){
        const ll=worldToLatLng((minX+maxX)/2,(minY+maxY)/2,z);
        this.setView(ll.lat,ll.lng,z);
        return;
      }
    }
  }

  render(){
    this.scheduleRender();
  }

  keepTilesDuringZoom(){
    const loaded=[...this.tileNodes.values()].filter(img=>img.complete&&img.naturalWidth>0);
    // A rapid second zoom may arrive before its tiles load. Keep the earlier image in that case.
    if(loaded.length&&!this.fallbackLayer.childElementCount){
      this.fallbackLayer.replaceChildren(...loaded);
      this.fallbackZoom=this.zoom;
    }
    for(const img of this.tileNodes.values())if(img.parentNode===this.tileLayer)img.remove();
    this.tileNodes.clear();
  }

  scheduleRender(){
    if(this.renderFrame)return;
    this.renderFrame=requestAnimationFrame(()=>{
      this.renderFrame=0;
      this.renderNow();
    });
  }

  renderNow(){
    if(!this.el.clientWidth||!this.el.clientHeight)return;
    this.renderFallback();
    this.renderTiles();
    this.renderMarkerPositions();
  }

  renderFallback(){
    if(this.fallbackZoom===null)return;
    const ratio=2**(this.zoom-this.fallbackZoom);
    const c=latLngToWorld(this.center.lat,this.center.lng,this.zoom);
    const world=2**this.zoom*TILE_SIZE;
    const left=c.x-this.el.clientWidth/2,top=c.y-this.el.clientHeight/2;
    for(const img of this.fallbackLayer.children){
      const [,x,y]=img.dataset.tileKey.split('/').map(Number);
      let tileX=x*TILE_SIZE*ratio;
      const dx=tileX+TILE_SIZE*ratio/2-c.x;
      if(dx>world/2)tileX-=world;
      if(dx<-world/2)tileX+=world;
      img.style.transformOrigin='top left';
      img.style.transform=`translate3d(${Math.round(tileX-left)}px,${Math.round(y*TILE_SIZE*ratio-top)}px,0) scale(${ratio})`;
    }
  }

  renderTiles(){
    const w=this.el.clientWidth;
    const h=this.el.clientHeight;
    const c=latLngToWorld(this.center.lat,this.center.lng,this.zoom);
    const left=c.x-w/2;
    const top=c.y-h/2;
    const minTx=Math.floor(left/TILE_SIZE)-1;
    const maxTx=Math.floor((left+w)/TILE_SIZE)+1;
    const minTy=Math.floor(top/TILE_SIZE)-1;
    const maxTy=Math.floor((top+h)/TILE_SIZE)+1;
    const n=2**this.zoom;
    const needed=new Set();

    const tiles=[];
    for(let ty=minTy;ty<=maxTy;ty++){
      if(ty<0||ty>=n)continue;
      for(let tx=minTx;tx<=maxTx;tx++)tiles.push({tx,ty});
    }
    // Request visible tiles before the panning buffer, nearest the center first.
    const isVisible=({tx,ty})=>tx*TILE_SIZE-left<w&&(tx+1)*TILE_SIZE-left>0&&ty*TILE_SIZE-top<h&&(ty+1)*TILE_SIZE-top>0;
    tiles.sort((a,b)=>Number(isVisible(b))-Number(isVisible(a))||Math.hypot(a.tx*TILE_SIZE+128-c.x,a.ty*TILE_SIZE+128-c.y)-Math.hypot(b.tx*TILE_SIZE+128-c.x,b.ty*TILE_SIZE+128-c.y));
    let visibleReady=true;
    for(const {tx,ty} of tiles){
        const wrappedX=((tx%n)+n)%n;
        const key=`${this.zoom}/${tx}/${ty}`;
        needed.add(key);
        const x=Math.round(tx*TILE_SIZE-left);
        const y=Math.round(ty*TILE_SIZE-top);
        const visible=isVisible({tx,ty});
        let img=this.tileNodes.get(key);
        if(!img){
          img=document.createElement('img');
          img.className='map-tile';
          img.alt='';
          img.draggable=false;
          img.decoding='async';
          img.fetchPriority=visible?'high':'low';
          img.addEventListener('load',()=>this.scheduleRender());
          img.src=`https://tile.openstreetmap.org/${this.zoom}/${wrappedX}/${ty}.png`;
          img.dataset.tileKey=key;
          img.style.left='0';
          img.style.top='0';
          this.tileNodes.set(key,img);
          this.tileLayer.append(img);
        }
        if(visible&&!(img.complete&&img.naturalWidth>0))visibleReady=false;
        img.style.transform=`translate3d(${x}px,${y}px,0)`;
    }

    for(const [key,img] of this.tileNodes){
      if(needed.has(key))continue;
      img.remove();
      this.tileNodes.delete(key);
    }
    if(this.fallbackZoom!==null&&visibleReady){
      this.fallbackLayer.replaceChildren();
      this.fallbackZoom=null;
    }
  }

  syncMarkerNodes(){
    const active=new Set();
    for(const marker of this.markers){
      if(!marker?.id)continue;
      active.add(marker.id);
      let node=this.markerNodes.get(marker.id);
      if(!node){
        node=document.createElement('button');
        node.type='button';
        node.className='marker';
        node.style.left='0';
        node.style.top='0';
        node.addEventListener('pointerdown',e=>e.stopPropagation());
        node.addEventListener('click',e=>{
          e.stopPropagation();
          this.onMarkerTap(marker.id);
        });
        this.markerNodes.set(marker.id,node);
        this.markerLayer.append(node);
      }
      node.className='marker'+(marker.status==='completed'?' completed':'')+(marker.isOverdue?' overdue':'');
      node.setAttribute('aria-label',`Abrir revisita ${marker.name||''}`.trim());
      node.dataset.markerId=marker.id;
    }
    for(const [id,node] of this.markerNodes){
      if(active.has(id))continue;
      node.remove();
      this.markerNodes.delete(id);
    }
    this.syncAuxiliaryMarkers();
  }

  syncAuxiliaryMarkers(){
    if(this.draft&&!this.draftNode){
      this.draftNode=document.createElement('div');
      this.draftNode.className='marker draft';
      this.draftNode.style.left='0';
      this.draftNode.style.top='0';
      this.markerLayer.append(this.draftNode);
    }else if(!this.draft&&this.draftNode){
      this.draftNode.remove();
      this.draftNode=null;
    }

    if(this.userLocation&&!this.userNode){
      this.userNode=document.createElement('div');
      this.userNode.className='user-dot';
      this.userNode.style.left='0';
      this.userNode.style.top='0';
      this.markerLayer.append(this.userNode);
    }else if(!this.userLocation&&this.userNode){
      this.userNode.remove();
      this.userNode=null;
    }
  }

  renderMarkerPositions(){
    const w=this.el.clientWidth;
    const h=this.el.clientHeight;
    const c=latLngToWorld(this.center.lat,this.center.lng,this.zoom);
    const left=c.x-w/2;
    const top=c.y-h/2;
    const world=2**this.zoom*TILE_SIZE;
    const point=(lat,lng)=>{
      let p=latLngToWorld(lat,lng,this.zoom);
      const dx=p.x-c.x;
      if(dx>world/2)p={...p,x:p.x-world};
      if(dx<-world/2)p={...p,x:p.x+world};
      return{x:p.x-left,y:p.y-top};
    };

    for(const marker of this.markers){
      const node=this.markerNodes.get(marker.id);
      if(!node)continue;
      const p=point(marker.lat,marker.lng);
      const visible=!(p.x<-50||p.y<-50||p.x>w+50||p.y>h+50);
      node.hidden=!visible;
      if(visible)node.style.transform=`translate3d(${p.x}px,${p.y}px,0) translate(-50%,-100%)`;
    }

    if(this.draft&&this.draftNode){
      const p=point(this.draft.lat,this.draft.lng);
      this.draftNode.style.transform=`translate3d(${p.x}px,${p.y}px,0) translate(-50%,-100%)`;
    }

    if(this.userLocation&&this.userNode){
      const p=point(this.userLocation.lat,this.userLocation.lng);
      this.userNode.style.transform=`translate3d(${p.x}px,${p.y}px,0) translate(-50%,-50%)`;
    }
  }
}

function nLng(l){
  while(l>180)l-=360;
  while(l<-180)l+=360;
  return l;
}
