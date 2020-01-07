var kontra=function(){"use strict";let t,e,i={};function s(t,e){i[t]=i[t]||[],i[t].push(e)}function n(t,...e){i[t]&&i[t].map(t=>t(...e))}function h(){return t}function o(){return e}const r=()=>{};function a(t){function e(){return new t(...arguments)}return e.prototype=t.prototype,e.class=t,e}const c="position:absolute;left:-9999px";class d{constructor({spriteSheet:t,frames:e,frameRate:i,loop:s=!0}={}){this.spriteSheet=t,this.frames=e,this.frameRate=i,this.loop=s;let{width:n,height:h,margin:o=0}=t.frame;this.width=n,this.height=h,this.margin=o,this._f=0,this._a=0}clone(){return new d(this)}reset(){this._f=0,this._a=0}update(t=1/60){if(this.loop||this._f!=this.frames.length-1)for(this._a+=t;this._a*this.frameRate>=1;)this._f=++this._f%this.frames.length,this._a-=1/this.frameRate}render({x:t,y:e,width:i=this.width,height:s=this.height,context:n=o()}={}){let h=this.frames[this._f]/this.spriteSheet._f|0,r=this.frames[this._f]%this.spriteSheet._f|0;n.drawImage(this.spriteSheet.image,r*this.width+(2*r+1)*this.margin,h*this.height+(2*h+1)*this.margin,this.width,this.height,t,e,i,s)}}var l=a(d);let u=/(jpeg|jpg|gif|png)$/,f=/(wav|mp3|ogg|aac)$/,_=/^\//,g=/\/$/,p=new WeakMap,m="",x="",w="";function y(t,e){return new URL(t,e).href}function b(t,e){return[t.replace(g,""),t?e.replace(_,""):e].filter(t=>t).join("/")}function v(t){return t.split(".").pop()}function A(t){let e=t.replace("."+v(t),"");return 2==e.split("/").length?e.replace(_,""):e}let j={},O={},E={};function P(){window.__k||(window.__k={dm:p,u:y,d:E,i:j})}function S(t){return P(),new Promise((e,i)=>{let s,h,o;if(s=b(m,t),j[s])return e(j[s]);(h=new Image).onload=function(){o=y(s,window.location.href),j[A(t)]=j[s]=j[o]=this,n("assetLoaded",this,t),e(this)},h.onerror=function(){i(s)},h.src=s})}function L(t){return new Promise((e,i)=>{let s,h,o,r;return s=new Audio,h=function(t){return{wav:"",mp3:t.canPlayType("audio/mpeg;"),ogg:t.canPlayType('audio/ogg; codecs="vorbis"'),aac:t.canPlayType("audio/aac;")}}(s),(t=[].concat(t).reduce((t,e)=>t||(h[v(e)]?e:null),0))?(o=b(x,t),O[o]?e(O[o]):(s.addEventListener("canplay",function(){r=y(o,window.location.href),O[A(t)]=O[o]=O[r]=this,n("assetLoaded",this,t),e(this)}),s.onerror=function(){i(o)},s.src=o,void s.load())):i(t)})}function C(t){let e,i;return P(),e=b(w,t),E[e]?Promise.resolve(E[e]):fetch(e).then(t=>{if(!t.ok)throw t;return t.clone().json().catch(()=>t.text())}).then(s=>(i=y(e,window.location.href),"object"==typeof s&&p.set(s,i),E[A(t)]=E[e]=E[i]=s,n("assetLoaded",s,t),s))}class M{constructor(t=0,e=0,i={}){this.x=t,this.y=e,i._c&&(this.clamp(i._a,i._b,i._d,i._e),this.x=t,this.y=e)}add(t){return new M(this.x+t.x,this.y+t.y,this)}subtract(t){return new M(this.x-t.x,this.y-t.y,this)}scale(t){return new M(this.x*t,this.y*t)}normalize(t=this.length()){return new M(this.x/t,this.y/t)}dot(t){return this.x*t.x+this.y*t.y}distance(t){return Math.hypot(this.x-t.x,this.y-t.y)}angle(t){return Math.acos(this.dot(t)/(this.length()*t.length()))}clamp(t,e,i,s){this._c=!0,this._a=t,this._b=e,this._d=i,this._e=s}get x(){return this._x}get y(){return this._y}set x(t){this._x=this._c?Math.min(Math.max(this._a,t),this._d):t}set y(t){this._y=this._c?Math.min(Math.max(this._b,t),this._e):t}}var I=a(M);var k=a(class{constructor(t){this.init(t)}init(t={}){this.position=I(),this.width=this.height=0,this.context=o(),this.localPosition=I(),this.localRotation=0,this._rot=0,this.children=[],this.velocity=I(),this.acceleration=I(),this.rotation=0,this.ttl=1/0,this.anchor={x:0,y:0},this.sx=this.sy=0,Object.assign(this,t)}get x(){return this.position.x}get y(){return this.position.y}set x(t){this.position.x=t,this.localPosition.x=this.parent?t-this.parent.x:t,this.children.map(e=>{e.localPosition&&(e.x=t+e.localPosition.x)})}set y(t){this.position.y=t,this.localPosition.y=this.parent?t-this.parent.y:t,this.children.map(e=>{e.localPosition&&(e.y=t+e.localPosition.y)})}get dx(){return this.velocity.x}get dy(){return this.velocity.y}set dx(t){this.velocity.x=t}set dy(t){this.velocity.y=t}get ddx(){return this.acceleration.x}get ddy(){return this.acceleration.y}set ddx(t){this.acceleration.x=t}set ddy(t){this.acceleration.y=t}get viewX(){return this.x-this.sx}get viewY(){return this.y-this.sy}set viewX(t){}set viewY(t){}isAlive(){return this.ttl>0}get rotation(){return this._rot}set rotation(t){this._rot=t,this.localRotation=this.parent?t-this.parent.rotation:t,this.children.map(e=>{e.localRotation&&(e.rotation=t+e.localRotation)})}addChild(t){this.children.push(t),t.parent=this,t.x=t.x,t.y=t.y,t.rotation=t.rotation}removeChild(t){let e=this.children.indexOf(t);-1!==e&&(this.children.splice(e,1),t.parent=null,t.x=t.x,t.y=t.y,t.rotation=t.rotation)}update(t){this.advance(t)}advance(t){this.velocity=this.velocity.add(this.acceleration,t),this.position=this.position.add(this.velocity,t),this.ttl--}render(){this.draw()}draw(){let t=0,e=0,i=this.x,s=this.y;if(t=-this.width*this.anchor.x,e=-this.height*this.anchor.y,i=this.viewX,s=this.viewY,this.parent&&(i=this.localPosition.x,s=this.localPosition.y),this.context.save(),this.context.translate(i,s),this.rotation){let t=this.rotation;t=this.localRotation,this.context.rotate(t)}this._dc(t,e),this.children.map(t=>t.render&&t.render()),this.context.restore()}_dc(){}});var R=a(class extends k.class{init(t){this.textAlign="",this.font=o().font,super.init(t),this._p()}get text(){return this._t}set text(t){this._t=t,this._d=!0}get font(){return this._f}set font(t){this._f=t,this._fs=parseInt(t),this._d=!0}get width(){return this._w}set width(t){this._w=t,this._d=!0,this._fw=t}render(){this._d&&this._p(),super.render()}_p(){if(this._s=[],this._d=!1,this.context.font=this.font,!this._s.length&&this._fw){let t=this._t.split(" "),e=0,i=2;for(;i<=t.length;i++){let s=t.slice(e,i).join(" ");this.context.measureText(s).width>this._fw&&(this._s.push(t.slice(e,i-1).join(" ")),e=i-1)}this._s.push(t.slice(e,i).join(" "))}if(!this._s.length&&this._t.includes("\n")){let t=0;this._t.split("\n").map(e=>{this._s.push(e),t=Math.max(t,this.context.measureText(e).width)}),this._w=t}this._s.length||(this._s.push(this.text),this._w=this.context.measureText(this._t).width),this.height=this._s.length*this._fs}_dc(t,e){let i=t,s=this.textAlign;s=this.textAlign||("rtl"===this.context.canvas.dir?"right":"left"),i="right"===s?t+this.width:"center"===s?t+this.width/2|0:t,this._s.map((t,n)=>{this.context.textBaseline="top",this.context.textAlign=s,this.context.fillStyle=this.color,this.context.font=this.font,this.context.fillText(t,i,e+this._fs*n)})}});let z,D=[],T=[],W={},U=[],B={},X={0:"left",1:"middle",2:"right"},Y={x:0,y:0,radius:5};function F(t,e){const i=e||Y;let s=t.x,n=t.y;t.anchor&&(s-=t.width*t.anchor.x,n-=t.height*t.anchor.y);let h=i.x-Math.max(s,Math.min(i.x,s+t.width)),o=i.y-Math.max(n,Math.min(i.y,n+t.height));return h*h+o*o<i.radius*i.radius}function N(t){const e=t||Y;let i,s,n=T.length?T:D;for(let t=n.length-1;t>=0;t--)if(s=(i=n[t]).collidesWithPointer?i.collidesWithPointer(e):F(i,e))return i}function H(t){let e=void 0!==t.button?X[t.button]:"left";B[e]=!0,G(t,"onDown")}function K(t){let e=void 0!==t.button?X[t.button]:"left";B[e]=!1,G(t,"onUp")}function q(t){G(t,"onOver")}function $(){B={},z=null}function G(t,e){let i,s,n=h();if(!n)return;let o=n.height/n.offsetHeight,r=n.getBoundingClientRect(),a=-1!==["touchstart","touchmove","touchend"].indexOf(t.type);if(a){Y.touches={};for(var c=0;c<t.touches.length;c++)Y.touches[t.touches[c].identifier]={id:t.touches[c].identifier,x:(t.touches[c].clientX-r.left)*o,y:(t.touches[c].clientY-r.top)*o,changed:!1};for(c=t.changedTouches.length;c--;){const n=t.changedTouches[c].identifier;void 0!==Y.touches[n]&&(Y.touches[n].changed=!0),i=t.changedTouches[c].clientX,s=t.changedTouches[c].clientY;let h=N({id:n,x:(i-r.left)*o,y:(s-r.top)*o,radius:Y.radius});h&&h[e]&&h[e](t),W[e]&&W[e](t,h)}}else i=t.clientX,s=t.clientY;if(Y.x=(i-r.left)*o,Y.y=(s-r.top)*o,t.preventDefault(),!a){let i=N();i&&i[e]&&i[e](t),W[e]&&W[e](t,i),"onOver"==e&&(i!=z&&z&&z.onOut&&z.onOut(t),z=i)}}function J(...t){t.map(t=>{t._r||(t._r=t.render,t.render=function(){D.push(this),this._r()},U.push(t))})}var Q=a(class extends R.class{init(t){super.init(t),J(this);const e=this._dn=document.createElement("button");e.style=c,e.textContent=this.text,e.addEventListener("focus",()=>this.focus()),e.addEventListener("blur",()=>this.blur()),e.addEventListener("click",()=>this.onUp()),document.body.appendChild(e)}destroy(){this._dn.remove()}render(){this._d&&this._t!==this._dn.textContent&&(this._dn.textContent=this._t),super.render()}enable(){this.disabled=this._dn.disabled=!1,this.onEnable()}disable(){this.disabled=this._dn.disabled=!0,this.onDisable()}focus(){this.focused=!0,document.activeElement!=this._dn&&this._dn.focus(),this.onFocus()}blur(){this.focused=!1,document.activeElement==this._dn&&this._dn.blur(),this.onBlur()}onOver(){this.focus()}onOut(){this.blur()}onEnable(){}onDisable(){}onFocus(){}onBlur(){}onUp(){}});function V(){let t=h();o().clearRect(0,0,t.width,t.height)}let Z={},tt={},et={Enter:"enter",Escape:"esc",Space:"space",ArrowLeft:"left",ArrowUp:"up",ArrowRight:"right",ArrowDown:"down",13:"enter",27:"esc",32:"space",37:"left",38:"up",39:"right",40:"down"};function it(t){let e=et[t.code||t.which];tt[e]=!0,Z[e]&&Z[e](t)}function st(t){tt[et[t.code||t.which]]=!1}function nt(){tt={}}function ht(t){let e=t.substr(t.search(/[A-Z]/));return e[0].toLowerCase()+e.substr(1)}function ot(t,e){let i=t.indexOf(e);-1!==i&&t.splice(i,1)}var rt=a(class{constructor({create:t,maxSize:e=1024}={}){this._c=t,this.objects=[t()],this.size=0,this.maxSize=e}get(t={}){if(this.size===this.objects.length){if(this.size===this.maxSize)return;for(let t=0;t<this.size&&this.objects.length<this.maxSize;t++)this.objects.push(this._c())}let e=this.objects[this.size];return this.size++,e.init(t),e}getAliveObjects(){return this.objects.slice(0,this.size)}clear(){this.size=this.objects.length=0,this.objects.push(this._c())}update(t){let e,i=!1;for(let s=this.size;s--;)(e=this.objects[s]).update(t),e.isAlive()||(i=!0,this.size--);i&&this.objects.sort((t,e)=>e.isAlive()-t.isAlive())}render(){for(let t=this.size;t--;)this.objects[t].render()}});function at(t,e){let i=[],s=e.x+e.width/2,n=e.y+e.height/2,h=t.y<n&&t.y+t.height>=e.y,o=t.y+t.height>=n&&t.y<e.y+e.height;return t.x<s&&t.x+t.width>=e.x&&(h&&i.push(0),o&&i.push(2)),t.x+t.width>=s&&t.x<e.x+e.width&&(h&&i.push(1),o&&i.push(3)),i}class ct{constructor({maxDepth:t=3,maxObjects:e=25,bounds:i}={}){this.maxDepth=t,this.maxObjects=e;let s=h();this.bounds=i||{x:0,y:0,width:s.width,height:s.height},this._b=!1,this._d=0,this._o=[],this._s=[],this._p=null}clear(){this._s.map(function(t){t.clear()}),this._b=!1,this._o.length=0}get(t){let e,i,s=new Set;for(;this._s.length&&this._b;){for(e=at(t,this.bounds),i=0;i<e.length;i++)this._s[e[i]].get(t).forEach(t=>s.add(t));return Array.from(s)}return this._o.filter(e=>e!==t)}add(){let t,e,i,s;for(e=0;e<arguments.length;e++)if(i=arguments[e],Array.isArray(i))this.add.apply(this,i);else if(this._b)this._a(i);else if(this._o.push(i),this._o.length>this.maxObjects&&this._d<this.maxDepth){for(this._sp(),t=0;s=this._o[t];t++)this._a(s);this._o.length=0}}_a(t,e,i){for(e=at(t,this.bounds),i=0;i<e.length;i++)this._s[e[i]].add(t)}_sp(t,e,i){if(this._b=!0,!this._s.length)for(t=this.bounds.width/2|0,e=this.bounds.height/2|0,i=0;i<4;i++)this._s[i]=new ct({bounds:{x:this.bounds.x+(i%2==1?t:0),y:this.bounds.y+(i>=2?e:0),width:t,height:e},maxDepth:this.maxDepth,maxObjects:this.maxObjects}),this._s[i]._d=this._d+1}}var dt=a(ct);var lt=a(class{constructor(t){this.name=t.id,Object.assign(this,t),this.children=[];const e=this._dn=document.createElement("section");e.id=this.id,e.tabIndex=-1,e.style=c,e.setAttribute("aria-label",this.name),document.body.appendChild(e),this.add(...t.children||[])}show(){this.hidden=this._dn.hidden=!1;let t=this.children.find(t=>t.focus);t?t.focus():this._dn.focus(),this.onShow()}hide(){this.hidden=this._dn.hidden=!0,this.onHide()}add(...t){this.children=this.children.concat(t),t.map(t=>{t._dn&&this._dn.appendChild(t._dn)})}remove(t){this.children=this.children.filter(e=>e!==t),t._dn&&document.body.appendChild(t._dn)}destroy(){this._dn.remove(),this.children.map(t=>t.destroy&&t.destroy())}update(t){this.hidden||this.children.map(e=>e.update&&e.update(t))}render(){this.hidden||this.children.map(t=>t.render&&t.render())}onShow(){}onHide(){}});var ut=a(class extends k.class{init(t={}){this._fx=this._fy=1,super.init(t);let{width:e,height:i,image:s}=t;s&&(this.width=void 0!==e?e:s.width,this.height=void 0!==i?i:s.height)}get animations(){return this._a}set animations(t){let e,i;for(e in this._a={},t)this._a[e]=t[e].clone(),i=i||this._a[e];this.currentAnimation=i,this.width=this.width||i.width,this.height=this.height||i.height}playAnimation(t){this.currentAnimation=this.animations[t],this.currentAnimation.loop||this.currentAnimation.reset()}advance(t){super.advance(t),this.currentAnimation&&this.currentAnimation.update(t)}get width(){return this._w}get height(){return this._h}set width(t){let e=t<0?-1:1;this._fx=e,this._w=t*e}set height(t){let e=t<0?-1:1;this._fy=e,this._h=t*e}_dc(t,e){if(-1==this._fx||-1==this._fy){let i=this.width/2+t,s=this.height/2+e;this.context.translate(i,s),this.context.scale(this._fx,this._fy),this.context.translate(-i,-s)}this.image&&this.context.drawImage(this.image,0,0,this.image.width,this.image.height,t,e,this.width,this.height),this.currentAnimation&&this.currentAnimation.render({x:t,y:e,width:this.width,height:this.height,context:this.context}),this.color&&(this.context.fillStyle=this.color,this.context.fillRect(t,e,this.width,this.height))}});function ft(t){if(+t===t)return t;let e=[],i=t.split(".."),s=+i[0],n=+i[1],h=s;if(s<n)for(;h<=n;h++)e.push(h);else for(;h>=n;h--)e.push(h);return e}var _t=a(class{constructor({image:t,frameWidth:e,frameHeight:i,frameMargin:s,animations:n}={}){this.animations={},this.image=t,this.frame={width:e,height:i,margin:s},this._f=t.width/e|0,this.createAnimations(n)}createAnimations(t){let e,i;for(i in t){let{frames:s,frameRate:n,loop:h}=t[i];e=[],[].concat(s).map(t=>{e=e.concat(ft(t))}),this.animations[i]=l({spriteSheet:this,frames:e,frameRate:n,loop:h})}}});return{Animation:l,imageAssets:j,audioAssets:O,dataAssets:E,setImagePath:function(t){m=t},setAudioPath:function(t){x=t},setDataPath:function(t){w=t},loadImage:S,loadAudio:L,loadData:C,load:function(...t){return P(),Promise.all(t.map(t=>{let e=v([].concat(t)[0]);return e.match(u)?S(t):e.match(f)?L(t):C(t)}))},Button:Q,collides:function(t,e){if(t.rotation||e.rotation)return null;let i=t.x,s=t.y;t.anchor&&(i-=t.width*t.anchor.x,s-=t.height*t.anchor.y);let n=e.x,h=e.y;return e.anchor&&(n-=e.width*e.anchor.x,h-=e.height*e.anchor.y),i<n+e.width&&i+t.width>n&&s<h+e.height&&s+t.height>h},init:function(i){return t=document.getElementById(i)||i||document.querySelector("canvas"),(e=t.getContext("2d")).imageSmoothingEnabled=!1,n("init"),{canvas:t,context:e}},getCanvas:h,getContext:o,on:s,off:function(t,e){let s;!i[t]||(s=i[t].indexOf(e))<0||i[t].splice(s,1)},emit:n,GameLoop:function({fps:t=60,clearCanvas:e=!0,update:i,render:s}={}){let h,o,a,c,d,l=0,u=1e3/t,f=1/t,_=e?V:r;function g(){if(o=requestAnimationFrame(g),a=performance.now(),c=a-h,h=a,!(c>1e3)){for(n("tick"),l+=c;l>=u;)d.update(f),l-=u;_(),d.render()}}return d={update:i,render:s,isStopped:!0,start(){h=performance.now(),this.isStopped=!1,requestAnimationFrame(g)},stop(){this.isStopped=!0,cancelAnimationFrame(o)}}},GameObject:k,degToRad:function(t){return t*Math.PI/180},radToDeg:function(t){return 180*t/Math.PI},randInt:function(t,e){return Math.floor(Math.random()*(e-t+1))+t},keyMap:et,initKeys:function(){let t;for(t=0;t<26;t++)et[t+65]=et["Key"+String.fromCharCode(t+65)]=String.fromCharCode(t+97);for(t=0;t<10;t++)et[48+t]=et["Digit"+t]=""+t;window.addEventListener("keydown",it),window.addEventListener("keyup",st),window.addEventListener("blur",nt)},bindKeys:function(t,e){[].concat(t).map(t=>Z[t]=e)},unbindKeys:function(t){[].concat(t).map(t=>Z[t]=0)},keyPressed:function(t){return!!tt[t]},registerPlugin:function(t,e){let i=t.prototype;i&&(i._inc||(i._inc={},i._bInc=function(t,e,...i){return this._inc[e].before.reduce((e,i)=>{let s=i(t,...e);return s||e},i)},i._aInc=function(t,e,i,...s){return this._inc[e].after.reduce((e,i)=>{let n=i(t,e,...s);return n||e},i)}),Object.getOwnPropertyNames(e).forEach(t=>{let s=ht(t);i[s]&&(i["_o"+s]||(i["_o"+s]=i[s],i[s]=function(...t){let e=this._bInc(this,s,...t),n=i["_o"+s].call(this,...e);return this._aInc(this,s,n,...t)}),i._inc[s]||(i._inc[s]={before:[],after:[]}),t.startsWith("before")?i._inc[s].before.push(e[t]):t.startsWith("after")&&i._inc[s].after.push(e[t]))}))},unregisterPlugin:function(t,e){let i=t.prototype;i&&i._inc&&Object.getOwnPropertyNames(e).forEach(t=>{let s=ht(t);t.startsWith("before")?ot(i._inc[s].before,e[t]):t.startsWith("after")&&ot(i._inc[s].after,e[t])})},extendObject:function(t,e){let i=t.prototype;i&&Object.getOwnPropertyNames(e).forEach(t=>{i[t]||(i[t]=e[t])})},initPointer:function(){let t=h();t.addEventListener("mousedown",H),t.addEventListener("touchstart",H),t.addEventListener("mouseup",K),t.addEventListener("touchend",K),t.addEventListener("touchcancel",K),t.addEventListener("blur",$),t.addEventListener("mousemove",q),t.addEventListener("touchmove",q),s("tick",()=>{T.length=0,D.map(t=>{T.push(t)}),D.length=0})},pointer:Y,track:J,untrack:function(...t){t.map(t=>{t.render=t._r,t._r=0;let e=U.indexOf(t);-1!==e&&U.splice(e,1)})},pointerOver:function(t){return!!U.includes(t)&&N()===t},onPointerDown:function(t){W.onDown=t},onPointerUp:function(t){W.onUp=t},pointerPressed:function(t){return!!B[t]},Pool:rt,Quadtree:dt,Scene:lt,Sprite:ut,SpriteSheet:_t,setStoreItem:function(t,e){void 0===e?localStorage.removeItem(t):localStorage.setItem(t,JSON.stringify(e))},getStoreItem:function(t){let e=localStorage.getItem(t);try{e=JSON.parse(e)}catch(t){}return e},Text:R,TileEngine:function(t={}){let{width:e,height:i,tilewidth:s,tileheight:n,context:r=o(),tilesets:a,layers:c}=t,d=e*s,l=i*n,u=document.createElement("canvas"),f=u.getContext("2d");u.width=d,u.height=l;let _={},g={},p=[],m=Object.assign({context:r,mapwidth:d,mapheight:l,_sx:0,_sy:0,_d:!1,get sx(){return this._sx},get sy(){return this._sy},set sx(t){this._sx=Math.min(Math.max(0,t),d-h().width),p.forEach(t=>t.sx=this._sx)},set sy(t){this._sy=Math.min(Math.max(0,t),l-h().height),p.forEach(t=>t.sy=this._sy)},render(){this._d&&(this._d=!1,this._p()),b(u)},renderLayer(t){let e=g[t],i=_[t];e||((e=document.createElement("canvas")).width=d,e.height=l,g[t]=e,m._r(i,e.getContext("2d"))),i._d&&(i._d=!1,e.getContext("2d").clearRect(0,0,e.width,e.height),m._r(i,e.getContext("2d"))),b(e)},layerCollidesWith(t,e){let i=e.x,s=e.y;e.anchor&&(i-=e.width*e.anchor.x,s-=e.height*e.anchor.y);let n=x(s),h=w(i),o=x(s+e.height),r=w(i+e.width),a=_[t];for(let t=n;t<=o;t++)for(let e=h;e<=r;e++)if(a.data[e+t*this.width])return!0;return!1},tileAtLayer(t,e){let i=e.row||x(e.y),s=e.col||w(e.x);return _[t]?_[t].data[s+i*m.width]:-1},setTileAtLayer(t,e,i){let s=e.row||x(e.y),n=e.col||w(e.x);_[t]&&(_[t]._d=!0,_[t].data[n+s*m.width]=i)},setLayer(t,e){_[t]&&(_[t]._d=!0,_[t].data=e)},addObject(t){p.push(t),t.sx=this._sx,t.sy=this._sy},removeObject(t){let e=p.indexOf(t);-1!==e&&(p.splice(e,1),t.sx=t.sy=0)},_r:function(t,e){e.save(),e.globalAlpha=t.opacity,t.data.map((t,i)=>{if(!t)return;let s;for(let e=m.tilesets.length-1;e>=0&&(s=m.tilesets[e],!(t/s.firstgid>=1));e--);let n=s.tilewidth||m.tilewidth,h=s.tileheight||m.tileheight,o=s.margin||0,r=s.image,a=t-s.firstgid,c=s.columns||r.width/(n+o)|0,d=i%m.width*n,l=(i/m.width|0)*h,u=a%c*(n+o),f=(a/c|0)*(h+o);e.drawImage(r,u,f,n,h,d,l,n,h)}),e.restore()},_p:y},t);function x(t){return t/m.tileheight|0}function w(t){return t/m.tilewidth|0}function y(){m.layers&&m.layers.map(t=>{t._d=!1,_[t.name]=t,!1!==t.visible&&m._r(t,f)})}function b(t){const{width:e,height:i}=h(),s=Math.min(t.width,e),n=Math.min(t.height,i);m.context.drawImage(t,m.sx,m.sy,s,n,0,0,s,n)}return m.tilesets.map(e=>{let i=(window.__k?window.__k.dm.get(t):"")||window.location.href;if(e.source){let t=window.__k.d[window.__k.u(e.source,i)];Object.keys(t).map(i=>{e[i]=t[i]})}if(""+e.image===e.image){let t=window.__k.i[window.__k.u(e.image,i)];e.image=t}}),y(),m},Vector:I}}();