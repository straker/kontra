var kontra=function(){"use strict";let t,e,i={};function s(t,e){i[t]=i[t]||[],i[t].push(e)}function n(t,...e){i[t]&&i[t].map(t=>t(...e))}function h(){return t}function r(){return e}const o=()=>{};function a(t){function e(){return new t(...arguments)}return e.prototype=t.prototype,e.class=t,e}class c{constructor({spriteSheet:t,frames:e,frameRate:i,loop:s=!0}={}){this.spriteSheet=t,this.frames=e,this.frameRate=i,this.loop=s;let{width:n,height:h,margin:r=0}=t.frame;this.width=n,this.height=h,this.margin=r,this._f=0,this._a=0}clone(){return new c(this)}reset(){this._f=0,this._a=0}update(t=1/60){if(this.loop||this._f!=this.frames.length-1)for(this._a+=t;this._a*this.frameRate>=1;)this._f=++this._f%this.frames.length,this._a-=1/this.frameRate}render({x:t,y:e,width:i=this.width,height:s=this.height,context:n=r()}={}){let h=this.frames[this._f]/this.spriteSheet._f|0,o=this.frames[this._f]%this.spriteSheet._f|0;n.drawImage(this.spriteSheet.image,o*this.width+(2*o+1)*this.margin,h*this.height+(2*h+1)*this.margin,this.width,this.height,t,e,i,s)}}var d=a(c);let l=/(jpeg|jpg|gif|png)$/,u=/(wav|mp3|ogg|aac)$/,f=/^\//,g=/\/$/,_=new WeakMap,m="",p="",w="";function x(t,e){return new URL(t,e).href}function y(t,e){return[t.replace(g,""),t?e.replace(f,""):e].filter(t=>t).join("/")}function b(t){return t.split(".").pop()}function v(t){let e=t.replace("."+b(t),"");return 2==e.split("/").length?e.replace(f,""):e}let A={},j={},S={};function O(){window.__k||(window.__k={dm:_,u:x,d:S,i:A})}function E(t){return O(),new Promise((e,i)=>{let s,h,r;if(s=y(m,t),A[s])return e(A[s]);(h=new Image).onload=function(){r=x(s,window.location.href),A[v(t)]=A[s]=A[r]=this,n("assetLoaded",this,t),e(this)},h.onerror=function(){i(s)},h.src=s})}function L(t){return new Promise((e,i)=>{let s,h,r,o;return s=new Audio,h=function(t){return{wav:"",mp3:t.canPlayType("audio/mpeg;"),ogg:t.canPlayType('audio/ogg; codecs="vorbis"'),aac:t.canPlayType("audio/aac;")}}(s),(t=[].concat(t).reduce((t,e)=>t||(h[b(e)]?e:null),0))?(r=y(p,t),j[r]?e(j[r]):(s.addEventListener("canplay",function(){o=x(r,window.location.href),j[v(t)]=j[r]=j[o]=this,n("assetLoaded",this,t),e(this)}),s.onerror=function(){i(r)},s.src=r,void s.load())):i(t)})}function P(t){let e,i;return O(),e=y(w,t),S[e]?Promise.resolve(S[e]):fetch(e).then(t=>{if(!t.ok)throw t;return t.clone().json().catch(()=>t.text())}).then(s=>(i=x(e,window.location.href),"object"==typeof s&&_.set(s,i),S[v(t)]=S[e]=S[i]=s,n("assetLoaded",s,t),s))}function k(){let t=h();r().clearRect(0,0,t.width,t.height)}class I{constructor(t=0,e=0,i={}){this._x=t,this._y=e,i._c&&(this.clamp(i._a,i._b,i._d,i._e),this.x=t,this.y=e)}add(t,e=1){return new I(this.x+(t.x||0)*e,this.y+(t.y||0)*e,this)}clamp(t,e,i,s){this._c=!0,this._a=t,this._b=e,this._d=i,this._e=s}get x(){return this._x}get y(){return this._y}set x(t){this._x=this._c?Math.min(Math.max(this._a,t),this._d):t}set y(t){this._y=this._c?Math.min(Math.max(this._b,t),this._e):t}}var M=a(I);var z=a(class{constructor(t){this.init(t)}init(t={}){this.position=M(),this.width=this.height=0,this.context=r(),Object.assign(this,t)}get x(){return this.position.x}get y(){return this.position.y}set x(t){this.position.x=t}set y(t){this.position.y=t}update(t){}render(){this.draw()}draw(){let t=this.x,e=this.y;this.context.save(),this.context.translate(t,e),this._dc(0,0),this.context.restore()}_dc(){}});let C={},D={},R={Enter:"enter",Escape:"esc",Space:"space",ArrowLeft:"left",ArrowUp:"up",ArrowRight:"right",ArrowDown:"down",13:"enter",27:"esc",32:"space",37:"left",38:"up",39:"right",40:"down"};function T(t){let e=R[t.code||t.which];D[e]=!0,C[e]&&C[e](t)}function W(t){D[R[t.code||t.which]]=!1}function N(){D={}}function U(t){let e=t.substr(t.search(/[A-Z]/));return e[0].toLowerCase()+e.substr(1)}function K(t,e){let i=t.indexOf(e);-1!==i&&t.splice(i,1)}let q=[],B=[],F={},X=[],Y={},$={0:"left",1:"middle",2:"right"},G={x:0,y:0,radius:5};function H(t,e){const i=e||G;let s=t.x,n=t.y;t.anchor&&(s-=t.width*t.anchor.x,n-=t.height*t.anchor.y);let h=i.x-Math.max(s,Math.min(i.x,s+t.width)),r=i.y-Math.max(n,Math.min(i.y,n+t.height));return h*h+r*r<i.radius*i.radius}function J(t){const e=t||G;let i,s,n=B.length?B:q;for(let t=n.length-1;t>=0;t--)if(s=(i=n[t]).collidesWithPointer?i.collidesWithPointer(e):H(i,e))return i}function Q(t){let e=void 0!==t.button?$[t.button]:"left";Y[e]=!0,et(t,"onDown")}function V(t){let e=void 0!==t.button?$[t.button]:"left";Y[e]=!1,et(t,"onUp")}function Z(t){et(t,"onOver")}function tt(){Y={}}function et(t,e){let i,s,n=h();if(!n)return;let r=n.height/n.offsetHeight,o=n.getBoundingClientRect(),a=-1!==["touchstart","touchmove","touchend"].indexOf(t.type);if(a){G.touches={};for(var c=0;c<t.touches.length;c++)G.touches[t.touches[c].identifier]={id:t.touches[c].identifier,x:(t.touches[c].clientX-o.left)*r,y:(t.touches[c].clientY-o.top)*r,changed:!1};for(c=t.changedTouches.length;c--;){const n=t.changedTouches[c].identifier;void 0!==G.touches[n]&&(G.touches[n].changed=!0),i=t.changedTouches[c].clientX,s=t.changedTouches[c].clientY;let h=J({id:n,x:(i-o.left)*r,y:(s-o.top)*r,radius:G.radius});h&&h[e]&&h[e](t),F[e]&&F[e](t,h)}}else i=t.clientX,s=t.clientY;if(G.x=(i-o.left)*r,G.y=(s-o.top)*r,t.preventDefault(),!a){let i=J();i&&i[e]&&i[e](t),F[e]&&F[e](t,i)}}var it=a(class{constructor({create:t,maxSize:e=1024}={}){this._c=t,this.objects=[t()],this.size=0,this.maxSize=e}get(t={}){if(this.size===this.objects.length){if(this.size===this.maxSize)return;for(let t=0;t<this.size&&this.objects.length<this.maxSize;t++)this.objects.push(this._c())}let e=this.objects[this.size];return this.size++,e.init(t),e}getAliveObjects(){return this.objects.slice(0,this.size)}clear(){this.size=this.objects.length=0,this.objects.push(this._c())}update(t){let e,i=!1;for(let s=this.size;s--;)(e=this.objects[s]).update(t),e.isAlive()||(i=!0,this.size--);i&&this.objects.sort((t,e)=>e.isAlive()-t.isAlive())}render(){for(let t=this.size;t--;)this.objects[t].render()}});function st(t,e){let i=[],s=e.x+e.width/2,n=e.y+e.height/2,h=t.y<n&&t.y+t.height>=e.y,r=t.y+t.height>=n&&t.y<e.y+e.height;return t.x<s&&t.x+t.width>=e.x&&(h&&i.push(0),r&&i.push(2)),t.x+t.width>=s&&t.x<e.x+e.width&&(h&&i.push(1),r&&i.push(3)),i}class nt{constructor({maxDepth:t=3,maxObjects:e=25,bounds:i}={}){this.maxDepth=t,this.maxObjects=e;let s=h();this.bounds=i||{x:0,y:0,width:s.width,height:s.height},this._b=!1,this._d=0,this._o=[],this._s=[],this._p=null}clear(){this._s.map(function(t){t.clear()}),this._b=!1,this._o.length=0}get(t){let e,i,s=new Set;for(;this._s.length&&this._b;){for(e=st(t,this.bounds),i=0;i<e.length;i++)this._s[e[i]].get(t).forEach(t=>s.add(t));return Array.from(s)}return this._o.filter(e=>e!==t)}add(){let t,e,i,s;for(e=0;e<arguments.length;e++)if(i=arguments[e],Array.isArray(i))this.add.apply(this,i);else if(this._b)this._a(i);else if(this._o.push(i),this._o.length>this.maxObjects&&this._d<this.maxDepth){for(this._sp(),t=0;s=this._o[t];t++)this._a(s);this._o.length=0}}_a(t,e,i){for(e=st(t,this.bounds),i=0;i<e.length;i++)this._s[e[i]].add(t)}_sp(t,e,i){if(this._b=!0,!this._s.length)for(t=this.bounds.width/2|0,e=this.bounds.height/2|0,i=0;i<4;i++)this._s[i]=new nt({bounds:{x:this.bounds.x+(i%2==1?t:0),y:this.bounds.y+(i>=2?e:0),width:t,height:e},maxDepth:this.maxDepth,maxObjects:this.maxObjects}),this._s[i]._d=this._d+1}}var ht=a(nt);var rt=a(class extends z.class{init(t={}){this._fx=this._fy=1,super.init(t);let{width:e,height:i,image:s}=t;s&&(this.width=void 0!==e?e:s.width,this.height=void 0!==i?i:s.height)}get animations(){return this._a}set animations(t){let e,i;for(e in this._a={},t)this._a[e]=t[e].clone(),i=i||this._a[e];this.currentAnimation=i,this.width=this.width||i.width,this.height=this.height||i.height}playAnimation(t){this.currentAnimation=this.animations[t],this.currentAnimation.loop||this.currentAnimation.reset()}update(t){super.update(t)}advance(t){super.advance(t),this.currentAnimation&&this.currentAnimation.update(t)}get width(){return this._w}get height(){return this._h}set width(t){let e=t<0?-1:1;this._fx=e,this._w=t*e}set height(t){let e=t<0?-1:1;this._fy=e,this._h=t*e}_dc(t,e){if(-1==this._fx||-1==this._fy){let i=this.width/2+t,s=this.height/2+e;this.context.translate(i,s),this.context.scale(this._fx,this._fy),this.context.translate(-i,-s)}this.image&&this.context.drawImage(this.image,0,0,this.image.width,this.image.height,t,e,this.width,this.height),this.currentAnimation&&this.currentAnimation.render({x:t,y:e,width:this.width,height:this.height,context:this.context}),this.color&&(this.context.fillStyle=this.color,this.context.fillRect(t,e,this.width,this.height))}});function ot(t){if(+t===t)return t;let e=[],i=t.split(".."),s=+i[0],n=+i[1],h=s;if(s<n)for(;h<=n;h++)e.push(h);else for(;h>=n;h--)e.push(h);return e}var at=a(class{constructor({image:t,frameWidth:e,frameHeight:i,frameMargin:s,animations:n}={}){this.animations={},this.image=t,this.frame={width:e,height:i,margin:s},this._f=t.width/e|0,this.createAnimations(n)}createAnimations(t){let e,i;for(i in t){let{frames:s,frameRate:n,loop:h}=t[i];e=[],[].concat(s).map(t=>{e=e.concat(ot(t))}),this.animations[i]=d({spriteSheet:this,frames:e,frameRate:n,loop:h})}}});var ct=a(class extends z.class{init(t){this.color=null,this.textAlign="left",super.init(t),this._p()}get text(){return this._t}set text(t){this._t=t,this._s=[],this._d=!0}get font(){return this._f}set font(t){this._f=t,this._fs=parseInt(t),this._d=!0}get width(){return this._w}set width(t){this._w=t,this._d=!0}render(){this._d&&this._p(),super.render()}_p(){this._d=!1,this.context.font=this.font,this._s.length||(this._s.push(this.text),this._w=this.context.measureText(this._t).width),this.height=this._s.length*this._fs}_dc(t,e){let i=t,s=this.textAlign;this._s.map((t,n)=>{this.context.textBaseline="top",this.context.textAlign=s,this.context.fillStyle=this.color,this.context.font=this.font,this.context.fillText(t,i,e+this._fs*n)})}});return{Animation:d,imageAssets:A,audioAssets:j,dataAssets:S,setImagePath:function(t){m=t},setAudioPath:function(t){p=t},setDataPath:function(t){w=t},loadImage:E,loadAudio:L,loadData:P,load:function(...t){return O(),Promise.all(t.map(t=>{let e=b([].concat(t)[0]);return e.match(l)?E(t):e.match(u)?L(t):P(t)}))},collides:function(t,e){if(t.rotation||e.rotation)return null;let i=t.x,s=t.y;t.anchor&&(i-=t.width*t.anchor.x,s-=t.height*t.anchor.y);let n=e.x,h=e.y;return e.anchor&&(n-=e.width*e.anchor.x,h-=e.height*e.anchor.y),i<n+e.width&&i+t.width>n&&s<h+e.height&&s+t.height>h},init:function(i){return t=document.getElementById(i)||i||document.querySelector("canvas"),(e=t.getContext("2d")).imageSmoothingEnabled=!1,n("init"),{canvas:t,context:e}},getCanvas:h,getContext:r,on:s,off:function(t,e){let s;!i[t]||(s=i[t].indexOf(e))<0||i[t].splice(s,1)},emit:n,GameLoop:function({fps:t=60,clearCanvas:e=!0,update:i,render:s}={}){let h,r,a,c,d,l=0,u=1e3/t,f=1/t,g=e?k:o;function _(){if(r=requestAnimationFrame(_),a=performance.now(),c=a-h,h=a,!(c>1e3)){for(n("tick"),l+=c;l>=u;)d.update(f),l-=u;g(),d.render()}}return d={update:i,render:s,isStopped:!0,start(){h=performance.now(),this.isStopped=!1,requestAnimationFrame(_)},stop(){this.isStopped=!0,cancelAnimationFrame(r)}}},GameObject:z,keyMap:R,initKeys:function(){let t;for(t=0;t<26;t++)R[t+65]=R["Key"+String.fromCharCode(t+65)]=String.fromCharCode(t+97);for(t=0;t<10;t++)R[48+t]=R["Digit"+t]=""+t;window.addEventListener("keydown",T),window.addEventListener("keyup",W),window.addEventListener("blur",N)},bindKeys:function(t,e){[].concat(t).map(t=>C[t]=e)},unbindKeys:function(t){[].concat(t).map(t=>C[t]=0)},keyPressed:function(t){return!!D[t]},registerPlugin:function(t,e){let i=t.prototype;i&&(i._inc||(i._inc={},i._bInc=function(t,e,...i){return this._inc[e].before.reduce((e,i)=>{let s=i(t,...e);return s||e},i)},i._aInc=function(t,e,i,...s){return this._inc[e].after.reduce((e,i)=>{let n=i(t,e,...s);return n||e},i)}),Object.getOwnPropertyNames(e).forEach(t=>{let s=U(t);i[s]&&(i["_o"+s]||(i["_o"+s]=i[s],i[s]=function(...t){let e=this._bInc(this,s,...t),n=i["_o"+s].call(this,...e);return this._aInc(this,s,n,...t)}),i._inc[s]||(i._inc[s]={before:[],after:[]}),t.startsWith("before")?i._inc[s].before.push(e[t]):t.startsWith("after")&&i._inc[s].after.push(e[t]))}))},unregisterPlugin:function(t,e){let i=t.prototype;i&&i._inc&&Object.getOwnPropertyNames(e).forEach(t=>{let s=U(t);t.startsWith("before")?K(i._inc[s].before,e[t]):t.startsWith("after")&&K(i._inc[s].after,e[t])})},extendObject:function(t,e){let i=t.prototype;i&&Object.getOwnPropertyNames(e).forEach(t=>{i[t]||(i[t]=e[t])})},initPointer:function(){let t=h();t.addEventListener("mousedown",Q),t.addEventListener("touchstart",Q),t.addEventListener("mouseup",V),t.addEventListener("touchend",V),t.addEventListener("touchcancel",V),t.addEventListener("blur",tt),t.addEventListener("mousemove",Z),t.addEventListener("touchmove",Z),s("tick",()=>{B.length=0,q.map(t=>{B.push(t)}),q.length=0})},pointer:G,track:function(t){[].concat(t).map(t=>{t._r||(t._r=t.render,t.render=function(){q.push(this),this._r()},X.push(t))})},untrack:function(t){[].concat(t).map(t=>{t.render=t._r,t._r=0;let e=X.indexOf(t);-1!==e&&X.splice(e,1)})},pointerOver:function(t){return!!X.includes(t)&&J()===t},onPointerDown:function(t){F.onDown=t},onPointerUp:function(t){F.onUp=t},pointerPressed:function(t){return!!Y[t]},Pool:it,Quadtree:ht,Sprite:rt,SpriteSheet:at,setStoreItem:function(t,e){void 0===e?localStorage.removeItem(t):localStorage.setItem(t,JSON.stringify(e))},getStoreItem:function(t){let e=localStorage.getItem(t);try{e=JSON.parse(e)}catch(t){}return e},Text:ct,TileEngine:function(t={}){let{width:e,height:i,tilewidth:s,tileheight:n,context:o=r(),tilesets:a,layers:c}=t,d=e*s,l=i*n,u=document.createElement("canvas"),f=u.getContext("2d");u.width=d,u.height=l;let g={},_={},m=[],p=Object.assign({context:o,mapwidth:d,mapheight:l,_sx:0,_sy:0,_d:!1,get sx(){return this._sx},get sy(){return this._sy},set sx(t){this._sx=Math.min(Math.max(0,t),d-h().width),m.forEach(t=>t.sx=this._sx)},set sy(t){this._sy=Math.min(Math.max(0,t),l-h().height),m.forEach(t=>t.sy=this._sy)},render(){this._d&&(this._d=!1,this._p()),b(u)},renderLayer(t){let e=_[t],i=g[t];e||((e=document.createElement("canvas")).width=d,e.height=l,_[t]=e,p._r(i,e.getContext("2d"))),i._d&&(i._d=!1,e.getContext("2d").clearRect(0,0,e.width,e.height),p._r(i,e.getContext("2d"))),b(e)},layerCollidesWith(t,e){let i=e.x,s=e.y;e.anchor&&(i-=e.width*e.anchor.x,s-=e.height*e.anchor.y);let n=w(s),h=x(i),r=w(s+e.height),o=x(i+e.width),a=g[t];for(let t=n;t<=r;t++)for(let e=h;e<=o;e++)if(a.data[e+t*this.width])return!0;return!1},tileAtLayer(t,e){let i=e.row||w(e.y),s=e.col||x(e.x);return g[t]?g[t].data[s+i*p.width]:-1},setTileAtLayer(t,e,i){let s=e.row||w(e.y),n=e.col||x(e.x);g[t]&&(g[t]._d=!0,g[t].data[n+s*p.width]=i)},setLayer(t,e){g[t]&&(g[t]._d=!0,g[t].data=e)},addObject(t){m.push(t),t.sx=this._sx,t.sy=this._sy},removeObject(t){let e=m.indexOf(t);-1!==e&&(m.splice(e,1),t.sx=t.sy=0)},_r:function(t,e){e.save(),e.globalAlpha=t.opacity,t.data.map((t,i)=>{if(!t)return;let s;for(let e=p.tilesets.length-1;e>=0&&(s=p.tilesets[e],!(t/s.firstgid>=1));e--);let n=s.tilewidth||p.tilewidth,h=s.tileheight||p.tileheight,r=s.margin||0,o=s.image,a=t-s.firstgid,c=s.columns||o.width/(n+r)|0,d=i%p.width*n,l=(i/p.width|0)*h,u=a%c*(n+r),f=(a/c|0)*(h+r);e.drawImage(o,u,f,n,h,d,l,n,h)}),e.restore()},_p:y},t);function w(t){return t/p.tileheight|0}function x(t){return t/p.tilewidth|0}function y(){p.layers&&p.layers.map(t=>{t._d=!1,g[t.name]=t,!1!==t.visible&&p._r(t,f)})}function b(t){const{width:e,height:i}=h(),s=Math.min(t.width,e),n=Math.min(t.height,i);p.context.drawImage(t,p.sx,p.sy,s,n,0,0,s,n)}return p.tilesets.map(e=>{let i=(window.__k?window.__k.dm.get(t):"")||window.location.href;if(e.source){let t=window.__k.d[window.__k.u(e.source,i)];Object.keys(t).map(i=>{e[i]=t[i]})}if(""+e.image===e.image){let t=window.__k.i[window.__k.u(e.image,i)];e.image=t}}),y(),p},Vector:M}}();