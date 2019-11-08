var kontra=function(){"use strict";let t,e,i={};function n(t,e){i[t]=i[t]||[],i[t].push(e)}function s(t,...e){i[t]&&i[t].map(t=>t(...e))}function h(){return t}function r(){return e}const o=()=>{};function a(t){function e(){return new t(...arguments)}return e.prototype=t.prototype,e.class=t,e}class c{constructor({spriteSheet:t,frames:e,frameRate:i,loop:n=!0}={}){this.spriteSheet=t,this.frames=e,this.frameRate=i,this.loop=n;let{width:s,height:h,margin:r=0}=t.frame;this.width=s,this.height=h,this.margin=r,this._f=0,this._a=0}clone(){return new c(this)}reset(){this._f=0,this._a=0}update(t=1/60){if(this.loop||this._f!=this.frames.length-1)for(this._a+=t;this._a*this.frameRate>=1;)this._f=++this._f%this.frames.length,this._a-=1/this.frameRate}render({x:t,y:e,width:i=this.width,height:n=this.height,context:s=r()}={}){let h=this.frames[this._f]/this.spriteSheet._f|0,o=this.frames[this._f]%this.spriteSheet._f|0;s.drawImage(this.spriteSheet.image,o*this.width+(2*o+1)*this.margin,h*this.height+(2*h+1)*this.margin,this.width,this.height,t,e,i,n)}}var d=a(c);let u=/(jpeg|jpg|gif|png)$/,l=/(wav|mp3|ogg|aac)$/,f=/^\//,g=/\/$/,m=new WeakMap,_="",p="",w="";function x(t,e){return new URL(t,e).href}function y(t,e){return[t.replace(g,""),t?e.replace(f,""):e].filter(t=>t).join("/")}function b(t){return t.split(".").pop()}function v(t){let e=t.replace("."+b(t),"");return 2==e.split("/").length?e.replace(f,""):e}let A={},j={},S={};function O(){window.__k||(window.__k={dm:m,u:x,d:S,i:A})}function E(t){return O(),new Promise((e,i)=>{let n,h,r;if(n=y(_,t),A[n])return e(A[n]);(h=new Image).onload=function(){r=x(n,window.location.href),A[v(t)]=A[n]=A[r]=this,s("assetLoaded",this,t),e(this)},h.onerror=function(){i(n)},h.src=n})}function L(t){return new Promise((e,i)=>{let n,h,r,o;return n=new Audio,h=function(t){return{wav:"",mp3:t.canPlayType("audio/mpeg;"),ogg:t.canPlayType('audio/ogg; codecs="vorbis"'),aac:t.canPlayType("audio/aac;")}}(n),(t=[].concat(t).reduce((t,e)=>t||(h[b(e)]?e:null),0))?(r=y(p,t),j[r]?e(j[r]):(n.addEventListener("canplay",function(){o=x(r,window.location.href),j[v(t)]=j[r]=j[o]=this,s("assetLoaded",this,t),e(this)}),n.onerror=function(){i(r)},n.src=r,void n.load())):i(t)})}function P(t){let e,i;return O(),e=y(w,t),S[e]?Promise.resolve(S[e]):fetch(e).then(t=>{if(!t.ok)throw t;return t.clone().json().catch(()=>t.text())}).then(n=>(i=x(e,window.location.href),"object"==typeof n&&m.set(n,i),S[v(t)]=S[e]=S[i]=n,s("assetLoaded",n,t),n))}function k(){let t=h();r().clearRect(0,0,t.width,t.height)}let I={},M={},z={Enter:"enter",Escape:"esc",Space:"space",ArrowLeft:"left",ArrowUp:"up",ArrowRight:"right",ArrowDown:"down",13:"enter",27:"esc",32:"space",37:"left",38:"up",39:"right",40:"down"};function C(t){let e=z[t.code||t.which];M[e]=!0,I[e]&&I[e](t)}function D(t){M[z[t.code||t.which]]=!1}function R(){M={}}function T(t){let e=t.substr(t.search(/[A-Z]/));return e[0].toLowerCase()+e.substr(1)}function W(t,e){let i=t.indexOf(e);-1!==i&&t.splice(i,1)}let N=[],U=[],K={},q=[],F={},X={0:"left",1:"middle",2:"right"},Y={x:0,y:0,radius:5};function $(t,e){const i=e||Y;let n=t.x,s=t.y;t.anchor&&(n-=t.width*t.anchor.x,s-=t.height*t.anchor.y);let h=i.x-Math.max(n,Math.min(i.x,n+t.width)),r=i.y-Math.max(s,Math.min(i.y,s+t.height));return h*h+r*r<i.radius*i.radius}function B(t){const e=t||Y;let i,n,s=U.length?U:N;for(let t=s.length-1;t>=0;t--)if(n=(i=s[t]).collidesWithPointer?i.collidesWithPointer(e):$(i,e))return i}function H(t){let e=void 0!==t.button?X[t.button]:"left";F[e]=!0,V(t,"onDown")}function J(t){let e=void 0!==t.button?X[t.button]:"left";F[e]=!1,V(t,"onUp")}function G(t){V(t,"onOver")}function Q(){F={}}function V(t,e){let i,n,s=h();if(!s)return;let r=s.height/s.offsetHeight,o=s.getBoundingClientRect(),a=-1!==["touchstart","touchmove","touchend"].indexOf(t.type);if(a){Y.touches={};for(var c=0;c<t.touches.length;c++)Y.touches[t.touches[c].identifier]={id:t.touches[c].identifier,x:(t.touches[c].clientX-o.left)*r,y:(t.touches[c].clientY-o.top)*r,changed:!1};for(c=t.changedTouches.length;c--;){const s=t.changedTouches[c].identifier;void 0!==Y.touches[s]&&(Y.touches[s].changed=!0),i=t.changedTouches[c].clientX,n=t.changedTouches[c].clientY;let h=B({id:s,x:(i-o.left)*r,y:(n-o.top)*r,radius:Y.radius});h&&h[e]&&h[e](t),K[e]&&K[e](t,h)}}else i=t.clientX,n=t.clientY;if(Y.x=(i-o.left)*r,Y.y=(n-o.top)*r,t.preventDefault(),!a){let i=B();i&&i[e]&&i[e](t),K[e]&&K[e](t,i)}}var Z=a(class{constructor({create:t,maxSize:e=1024}={}){this._c=t,this.objects=[t()],this.size=0,this.maxSize=e}get(t={}){if(this.size===this.objects.length){if(this.size===this.maxSize)return;for(let t=0;t<this.size&&this.objects.length<this.maxSize;t++)this.objects.push(this._c())}let e=this.objects[this.size];return this.size++,e.init(t),e}getAliveObjects(){return this.objects.slice(0,this.size)}clear(){this.size=this.objects.length=0,this.objects.push(this._c())}update(t){let e,i=!1;for(let n=this.size;n--;)(e=this.objects[n]).update(t),e.isAlive()||(i=!0,this.size--);i&&this.objects.sort((t,e)=>e.isAlive()-t.isAlive())}render(){for(let t=this.size;t--;)this.objects[t].render()}});function tt(t,e){let i=[],n=e.x+e.width/2,s=e.y+e.height/2,h=t.y<s&&t.y+t.height>=e.y,r=t.y+t.height>=s&&t.y<e.y+e.height;return t.x<n&&t.x+t.width>=e.x&&(h&&i.push(0),r&&i.push(2)),t.x+t.width>=n&&t.x<e.x+e.width&&(h&&i.push(1),r&&i.push(3)),i}class et{constructor({maxDepth:t=3,maxObjects:e=25,bounds:i}={}){this.maxDepth=t,this.maxObjects=e;let n=h();this.bounds=i||{x:0,y:0,width:n.width,height:n.height},this._b=!1,this._d=0,this._o=[],this._s=[],this._p=null}clear(){this._s.map(function(t){t.clear()}),this._b=!1,this._o.length=0}get(t){let e,i,n=new Set;for(;this._s.length&&this._b;){for(e=tt(t,this.bounds),i=0;i<e.length;i++)this._s[e[i]].get(t).forEach(t=>n.add(t));return Array.from(n)}return this._o.filter(e=>e!==t)}add(){let t,e,i,n;for(e=0;e<arguments.length;e++)if(i=arguments[e],Array.isArray(i))this.add.apply(this,i);else if(this._b)this._a(i);else if(this._o.push(i),this._o.length>this.maxObjects&&this._d<this.maxDepth){for(this._sp(),t=0;n=this._o[t];t++)this._a(n);this._o.length=0}}_a(t,e,i){for(e=tt(t,this.bounds),i=0;i<e.length;i++)this._s[e[i]].add(t)}_sp(t,e,i){if(this._b=!0,!this._s.length)for(t=this.bounds.width/2|0,e=this.bounds.height/2|0,i=0;i<4;i++)this._s[i]=new et({bounds:{x:this.bounds.x+(i%2==1?t:0),y:this.bounds.y+(i>=2?e:0),width:t,height:e},maxDepth:this.maxDepth,maxObjects:this.maxObjects}),this._s[i]._d=this._d+1}}var it=a(et);class nt{constructor(t=0,e=0,i={}){this._x=t,this._y=e,i._c&&(this.clamp(i._a,i._b,i._d,i._e),this.x=t,this.y=e)}add(t,e=1){return new nt(this.x+(t.x||0)*e,this.y+(t.y||0)*e,this)}clamp(t,e,i,n){this._c=!0,this._a=t,this._b=e,this._d=i,this._e=n}get x(){return this._x}get y(){return this._y}set x(t){this._x=this._c?Math.min(Math.max(this._a,t),this._d):t}set y(t){this._y=this._c?Math.min(Math.max(this._b,t),this._e):t}}var st=a(nt);var ht=a(class{constructor(t){this.init(t)}init(t={}){this.position=st(),this.width=this.height=0,this.context=r(),Object.assign(this,t)}get x(){return this.position.x}get y(){return this.position.y}set x(t){this.position.x=t}set y(t){this.position.y=t}update(t){}render(){this.draw()}draw(){let t=this.x,e=this.y;this.context.save(),this.context.translate(t,e),this._d(0,0),this.context.restore()}_d(){}});var rt=a(class extends ht.class{init(t={}){this._fx=this._fy=1,super.init(t);let{width:e,height:i,image:n}=t;n&&(this.width=void 0!==e?e:n.width,this.height=void 0!==i?i:n.height)}get animations(){return this._a}set animations(t){let e,i;for(e in this._a={},t)this._a[e]=t[e].clone(),i=i||this._a[e];this.currentAnimation=i,this.width=this.width||i.width,this.height=this.height||i.height}playAnimation(t){this.currentAnimation=this.animations[t],this.currentAnimation.loop||this.currentAnimation.reset()}update(t){super.update(t)}advance(t){super.advance(t),this.currentAnimation&&this.currentAnimation.update(t)}get width(){return this._w}get height(){return this._h}set width(t){let e=t<0?-1:1;this._fx=e,this._w=t*e}set height(t){let e=t<0?-1:1;this._fy=e,this._h=t*e}_d(t,e){if(-1==this._fx||-1==this._fy){let i=this.width/2+t,n=this.height/2+e;this.context.translate(i,n),this.context.scale(this._fx,this._fy),this.context.translate(-i,-n)}this.image&&this.context.drawImage(this.image,0,0,this.image.width,this.image.height,t,e,this.width,this.height),this.currentAnimation&&this.currentAnimation.render({x:t,y:e,width:this.width,height:this.height,context:this.context}),this.color&&(this.context.fillStyle=this.color,this.context.fillRect(t,e,this.width,this.height))}});function ot(t){if(+t===t)return t;let e=[],i=t.split(".."),n=+i[0],s=+i[1],h=n;if(n<s)for(;h<=s;h++)e.push(h);else for(;h>=s;h--)e.push(h);return e}var at=a(class{constructor({image:t,frameWidth:e,frameHeight:i,frameMargin:n,animations:s}={}){this.animations={},this.image=t,this.frame={width:e,height:i,margin:n},this._f=t.width/e|0,this.createAnimations(s)}createAnimations(t){let e,i;for(i in t){let{frames:n,frameRate:s,loop:h}=t[i];e=[],[].concat(n).map(t=>{e=e.concat(ot(t))}),this.animations[i]=d({spriteSheet:this,frames:e,frameRate:s,loop:h})}}});return{Animation:d,imageAssets:A,audioAssets:j,dataAssets:S,setImagePath:function(t){_=t},setAudioPath:function(t){p=t},setDataPath:function(t){w=t},loadImage:E,loadAudio:L,loadData:P,load:function(...t){return O(),Promise.all(t.map(t=>{let e=b([].concat(t)[0]);return e.match(u)?E(t):e.match(l)?L(t):P(t)}))},collides:function(t,e){if(t.rotation||e.rotation)return null;let i=t.x,n=t.y;t.anchor&&(i-=t.width*t.anchor.x,n-=t.height*t.anchor.y);let s=e.x,h=e.y;return e.anchor&&(s-=e.width*e.anchor.x,h-=e.height*e.anchor.y),i<s+e.width&&i+t.width>s&&n<h+e.height&&n+t.height>h},init:function(i){return t=document.getElementById(i)||i||document.querySelector("canvas"),(e=t.getContext("2d")).imageSmoothingEnabled=!1,s("init"),{canvas:t,context:e}},getCanvas:h,getContext:r,on:n,off:function(t,e){let n;!i[t]||(n=i[t].indexOf(e))<0||i[t].splice(n,1)},emit:s,GameLoop:function({fps:t=60,clearCanvas:e=!0,update:i,render:n}={}){let h,r,a,c,d,u=0,l=1e3/t,f=1/t,g=e?k:o;function m(){if(r=requestAnimationFrame(m),a=performance.now(),c=a-h,h=a,!(c>1e3)){for(s("tick"),u+=c;u>=l;)d.update(f),u-=l;g(),d.render()}}return d={update:i,render:n,isStopped:!0,start(){h=performance.now(),this.isStopped=!1,requestAnimationFrame(m)},stop(){this.isStopped=!0,cancelAnimationFrame(r)}}},keyMap:z,initKeys:function(){let t;for(t=0;t<26;t++)z[t+65]=z["Key"+String.fromCharCode(t+65)]=String.fromCharCode(t+97);for(t=0;t<10;t++)z[48+t]=z["Digit"+t]=""+t;window.addEventListener("keydown",C),window.addEventListener("keyup",D),window.addEventListener("blur",R)},bindKeys:function(t,e){[].concat(t).map(t=>I[t]=e)},unbindKeys:function(t){[].concat(t).map(t=>I[t]=0)},keyPressed:function(t){return!!M[t]},registerPlugin:function(t,e){let i=t.prototype;i&&(i._inc||(i._inc={},i._bInc=function(t,e,...i){return this._inc[e].before.reduce((e,i)=>{let n=i(t,...e);return n||e},i)},i._aInc=function(t,e,i,...n){return this._inc[e].after.reduce((e,i)=>{let s=i(t,e,...n);return s||e},i)}),Object.getOwnPropertyNames(e).forEach(t=>{let n=T(t);i[n]&&(i["_o"+n]||(i["_o"+n]=i[n],i[n]=function(...t){let e=this._bInc(this,n,...t),s=i["_o"+n].call(this,...e);return this._aInc(this,n,s,...t)}),i._inc[n]||(i._inc[n]={before:[],after:[]}),t.startsWith("before")?i._inc[n].before.push(e[t]):t.startsWith("after")&&i._inc[n].after.push(e[t]))}))},unregisterPlugin:function(t,e){let i=t.prototype;i&&i._inc&&Object.getOwnPropertyNames(e).forEach(t=>{let n=T(t);t.startsWith("before")?W(i._inc[n].before,e[t]):t.startsWith("after")&&W(i._inc[n].after,e[t])})},extendObject:function(t,e){let i=t.prototype;i&&Object.getOwnPropertyNames(e).forEach(t=>{i[t]||(i[t]=e[t])})},initPointer:function(){let t=h();t.addEventListener("mousedown",H),t.addEventListener("touchstart",H),t.addEventListener("mouseup",J),t.addEventListener("touchend",J),t.addEventListener("touchcancel",J),t.addEventListener("blur",Q),t.addEventListener("mousemove",G),t.addEventListener("touchmove",G),n("tick",()=>{U.length=0,N.map(t=>{U.push(t)}),N.length=0})},pointer:Y,track:function(t){[].concat(t).map(t=>{t._r||(t._r=t.render,t.render=function(){N.push(this),this._r()},q.push(t))})},untrack:function(t){[].concat(t).map(t=>{t.render=t._r,t._r=0;let e=q.indexOf(t);-1!==e&&q.splice(e,1)})},pointerOver:function(t){return!!q.includes(t)&&B()===t},onPointerDown:function(t){K.onDown=t},onPointerUp:function(t){K.onUp=t},pointerPressed:function(t){return!!F[t]},Pool:Z,Quadtree:it,Sprite:rt,SpriteSheet:at,setStoreItem:function(t,e){void 0===e?localStorage.removeItem(t):localStorage.setItem(t,JSON.stringify(e))},getStoreItem:function(t){let e=localStorage.getItem(t);try{e=JSON.parse(e)}catch(t){}return e},TileEngine:function(t={}){let{width:e,height:i,tilewidth:n,tileheight:s,context:o=r(),tilesets:a,layers:c}=t,d=e*n,u=i*s,l=document.createElement("canvas"),f=l.getContext("2d");l.width=d,l.height=u;let g={},m={},_=[],p=Object.assign({context:o,mapwidth:d,mapheight:u,_sx:0,_sy:0,_d:!1,get sx(){return this._sx},get sy(){return this._sy},set sx(t){this._sx=Math.min(Math.max(0,t),d-h().width),_.forEach(t=>t.sx=this._sx)},set sy(t){this._sy=Math.min(Math.max(0,t),u-h().height),_.forEach(t=>t.sy=this._sy)},render(){this._d&&(this._d=!1,this._p()),b(l)},renderLayer(t){let e=m[t],i=g[t];e||((e=document.createElement("canvas")).width=d,e.height=u,m[t]=e,p._r(i,e.getContext("2d"))),i._d&&(i._d=!1,e.getContext("2d").clearRect(0,0,e.width,e.height),p._r(i,e.getContext("2d"))),b(e)},layerCollidesWith(t,e){let i=e.x,n=e.y;e.anchor&&(i-=e.width*e.anchor.x,n-=e.height*e.anchor.y);let s=w(n),h=x(i),r=w(n+e.height),o=x(i+e.width),a=g[t];for(let t=s;t<=r;t++)for(let e=h;e<=o;e++)if(a.data[e+t*this.width])return!0;return!1},tileAtLayer(t,e){let i=e.row||w(e.y),n=e.col||x(e.x);return g[t]?g[t].data[n+i*p.width]:-1},setTileAtLayer(t,e,i){let n=e.row||w(e.y),s=e.col||x(e.x);g[t]&&(g[t]._d=!0,g[t].data[s+n*p.width]=i)},setLayer(t,e){g[t]&&(g[t]._d=!0,g[t].data=e)},addObject(t){_.push(t),t.sx=this._sx,t.sy=this._sy},removeObject(t){let e=_.indexOf(t);-1!==e&&(_.splice(e,1),t.sx=t.sy=0)},_r:function(t,e){e.save(),e.globalAlpha=t.opacity,t.data.map((t,i)=>{if(!t)return;let n;for(let e=p.tilesets.length-1;e>=0&&(n=p.tilesets[e],!(t/n.firstgid>=1));e--);let s=n.tilewidth||p.tilewidth,h=n.tileheight||p.tileheight,r=n.margin||0,o=n.image,a=t-n.firstgid,c=n.columns||o.width/(s+r)|0,d=i%p.width*s,u=(i/p.width|0)*h,l=a%c*(s+r),f=(a/c|0)*(h+r);e.drawImage(o,l,f,s,h,d,u,s,h)}),e.restore()},_p:y},t);function w(t){return t/p.tileheight|0}function x(t){return t/p.tilewidth|0}function y(){p.layers&&p.layers.map(t=>{t._d=!1,g[t.name]=t,!1!==t.visible&&p._r(t,f)})}function b(t){const{width:e,height:i}=h(),n=Math.min(t.width,e),s=Math.min(t.height,i);p.context.drawImage(t,p.sx,p.sy,n,s,0,0,n,s)}return p.tilesets.map(e=>{let i=(window.__k?window.__k.dm.get(t):"")||window.location.href;if(e.source){let t=window.__k.d[window.__k.u(e.source,i)];Object.keys(t).map(i=>{e[i]=t[i]})}if(""+e.image===e.image){let t=window.__k.i[window.__k.u(e.image,i)];e.image=t}}),y(),p},Vector:st}}();