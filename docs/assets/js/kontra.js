var kontra=function(){"use strict";let t,e,i={};function s(t,e){i[t]=i[t]||[],i[t].push(e)}function h(t,...e){i[t]&&i[t].map(t=>t(...e))}function n(){return t}function r(){return e}const o=()=>{};function a(t){function e(){return new t(...arguments)}return e.prototype=t.prototype,e.class=t,e}const c="position:absolute;left:-9999px";class d{constructor({spriteSheet:t,frames:e,frameRate:i,loop:s=!0}={}){this.spriteSheet=t,this.frames=e,this.frameRate=i,this.loop=s;let{width:h,height:n,margin:r=0}=t.frame;this.width=h,this.height=n,this.margin=r,this._f=0,this._a=0}clone(){return new d(this)}reset(){this._f=0,this._a=0}update(t=1/60){if(this.loop||this._f!=this.frames.length-1)for(this._a+=t;this._a*this.frameRate>=1;)this._f=++this._f%this.frames.length,this._a-=1/this.frameRate}render({x:t,y:e,width:i=this.width,height:s=this.height,context:h=r()}={}){if(this.spriteSheet.atlas){let n=this.frames[this._f],r=this.spriteSheet.atlas.frames[n],{x:o,y:a,w:c,h:d}=r.frame;h.drawImage(this.spriteSheet.image,o,a,c,d,t,e,i,s)}else{let n=this.frames[this._f]/this.spriteSheet._f|0,r=this.frames[this._f]%this.spriteSheet._f|0;h.drawImage(this.spriteSheet.image,r*this.width+(2*r+1)*this.margin,n*this.height+(2*n+1)*this.margin,this.width,this.height,t,e,i,s)}}}var l=a(d);let u=/(jpeg|jpg|gif|png)$/,f=/(wav|mp3|ogg|aac)$/,_=/^\//,p=/\/$/,g=new WeakMap,m="",w="",x="";function y(t,e){return new URL(t,e).href}function v(t,e){return[t.replace(p,""),t?e.replace(_,""):e].filter(t=>t).join("/")}function b(t){return t.split(".").pop()}function A(t){let e=t.replace("."+b(t),"");return 2==e.split("/").length?e.replace(_,""):e}let j={},S={},P={};function M(){window.__k||(window.__k={dm:g,u:y,d:P,i:j})}function O(t){return M(),new Promise((e,i)=>{let s,n,r;if(s=v(m,t),j[s])return e(j[s]);(n=new Image).onload=function(){r=y(s,window.location.href),j[A(t)]=j[s]=j[r]=this,h("assetLoaded",this,t),e(this)},n.onerror=function(){i(s)},n.src=s})}function E(t){return new Promise((e,i)=>{let s,n,r,o,a=t;return s=new Audio,n=function(t){return{wav:t.canPlayType('audio/wav; codecs="1"'),mp3:t.canPlayType("audio/mpeg;"),ogg:t.canPlayType('audio/ogg; codecs="vorbis"'),aac:t.canPlayType("audio/aac;")}}(s),(t=[].concat(t).reduce((t,e)=>t||(n[b(e)]?e:null),0))?(r=v(w,t),S[r]?e(S[r]):(s.addEventListener("canplay",function(){o=y(r,window.location.href),S[A(t)]=S[r]=S[o]=this,h("assetLoaded",this,t),e(this)}),s.onerror=function(){i(r)},s.src=r,void s.load())):i(a)})}function C(t){let e,i;return M(),e=v(x,t),P[e]?Promise.resolve(P[e]):fetch(e).then(t=>{if(!t.ok)throw t;return t.clone().json().catch(()=>t.text())}).then(s=>(i=y(e,window.location.href),"object"==typeof s&&g.set(s,i),P[A(t)]=P[e]=P[i]=s,h("assetLoaded",s,t),s))}class L{constructor(t=0,e=0,i={}){this.x=t,this.y=e,i._c&&(this.clamp(i._a,i._b,i._d,i._e),this.x=t,this.y=e)}add(t){return new L(this.x+t.x,this.y+t.y,this)}subtract(t){return new L(this.x-t.x,this.y-t.y,this)}scale(t){return new L(this.x*t,this.y*t)}normalize(t=this.length()){return new L(this.x/t,this.y/t)}dot(t){return this.x*t.x+this.y*t.y}length(){return Math.hypot(this.x,this.y)}distance(t){return Math.hypot(this.x-t.x,this.y-t.y)}angle(t){return Math.acos(this.dot(t)/(this.length()*t.length()))}clamp(t,e,i,s){this._c=!0,this._a=t,this._b=e,this._d=i,this._e=s}get x(){return this._x}get y(){return this._y}set x(t){this._x=this._c?Math.min(Math.max(this._a,t),this._d):t}set y(t){this._y=this._c?Math.min(Math.max(this._b,t),this._e):t}}var k=a(L);var I=a(class{constructor(t){return this.init(t)}init(t={}){this.position=k(),this.width=this.height=0,this.context=r(),this.localPosition=k(),this.localRotation=0,this._rot=0,this.children=[],this.velocity=k(),this.acceleration=k(),this.rotation=0,this.ttl=1/0,this.anchor={x:0,y:0},this.sx=this.sy=0;let{render:e,...i}=t;Object.assign(this,i),this._rf=e||this.draw}get x(){return this.position.x}get y(){return this.position.y}set x(t){this.position.x=t,this.localPosition.x=this.parent?t-this.parent.x:t,this.children.map(e=>{e.localPosition&&(e.x=t+e.localPosition.x)})}set y(t){this.position.y=t,this.localPosition.y=this.parent?t-this.parent.y:t,this.children.map(e=>{e.localPosition&&(e.y=t+e.localPosition.y)})}get dx(){return this.velocity.x}get dy(){return this.velocity.y}set dx(t){this.velocity.x=t}set dy(t){this.velocity.y=t}get ddx(){return this.acceleration.x}get ddy(){return this.acceleration.y}set ddx(t){this.acceleration.x=t}set ddy(t){this.acceleration.y=t}get viewX(){return this.x-this.sx}get viewY(){return this.y-this.sy}set viewX(t){}set viewY(t){}isAlive(){return this.ttl>0}get rotation(){return this._rot}set rotation(t){this._rot=t,this.localRotation=this.parent?t-this.parent.rotation:t,this.children.map(e=>{e.localRotation&&(e.rotation=t+e.localRotation)})}addChild(t){this.children.push(t),t.parent=this,t.x=t.x,t.y=t.y,t.rotation=t.rotation}removeChild(t){let e=this.children.indexOf(t);-1!==e&&(this.children.splice(e,1),t.parent=null,t.x=t.x,t.y=t.y,t.rotation=t.rotation)}update(t){this.advance(t)}advance(t){this.velocity=this.velocity.add(this.acceleration,t),this.position=this.position.add(this.velocity,t),this.ttl--}render(){let t=0,e=0,i=this.x,s=this.y;if(t=-this.width*this.anchor.x,e=-this.height*this.anchor.y,i=this.viewX,s=this.viewY,this.parent&&(i=this.localPosition.x,s=this.localPosition.y),this.context.save(),this.context.translate(i,s),this.rotation){let t=this.rotation;t=this.localRotation,this.context.rotate(t)}this.context.translate(t,e),this._rf(),this.children.map(t=>t.render&&t.render()),this.context.restore()}draw(){}});let T=/(\d+)(\w+)/;var R=a(class extends I.class{init(t){this.textAlign="",this.font=r().font,s("font",t=>{this.font=this.font.replace(T,(e,i,s)=>t+s),this._p()}),super.init(t),this._p()}get text(){return this._t}set text(t){this._t=t,this._d=!0}get font(){return this._f}set font(t){this._f=t,this._fs=function(t){let e=t.match(T),i=+e[1];return{size:i,unit:e[2],computed:i}}(t).computed,this._d=!0}get width(){return this._w}set width(t){this._w=t,this._d=!0,this._fw=t}render(){this._d&&this._p(),super.render()}_p(){if(this._s=[],this._d=!1,this.context.font=this.font,!this._s.length&&this._fw){let t=this._t.split(" "),e=0,i=2;for(;i<=t.length;i++){let s=t.slice(e,i).join(" ");this.context.measureText(s).width>this._fw&&(this._s.push(t.slice(e,i-1).join(" ")),e=i-1)}this._s.push(t.slice(e,i).join(" "))}if(!this._s.length&&this._t.includes("\n")){let t=0;this._t.split("\n").map(e=>{this._s.push(e),t=Math.max(t,this.context.measureText(e).width)}),this._w=t}this._s.length||(this._s.push(this.text),this._w=this.context.measureText(this._t).width),this.height=this._s.length*this._fs}draw(){let t=0,e=this.textAlign;e=this.textAlign||("rtl"===this.context.canvas.dir?"right":"left"),t="right"===e?this.width:"center"===e?this.width/2|0:0,this._s.map((i,s)=>{this.context.textBaseline="top",this.context.textAlign=e,this.context.fillStyle=this.color,this.context.font=this.font,this.context.fillText(i,t,this._fs*s)})}});let z,D=[],W=[],U={},X=[],Y={},B={0:"left",1:"middle",2:"right"},F={x:0,y:0,radius:5};function N(t,e){const i=e||F;let s=t.x,h=t.y;t.anchor&&(s-=t.width*t.anchor.x,h-=t.height*t.anchor.y);let n=i.x-Math.max(s,Math.min(i.x,s+t.width)),r=i.y-Math.max(h,Math.min(i.y,h+t.height));return n*n+r*r<i.radius*i.radius}function H(t){const e=t||F;let i,s,h=W.length?W:D;for(let t=h.length-1;t>=0;t--)if(s=(i=h[t]).collidesWithPointer?i.collidesWithPointer(e):N(i,e))return i}function K(t){let e=void 0!==t.button?B[t.button]:"left";Y[e]=!0,J(t,"onDown")}function q(t){let e=void 0!==t.button?B[t.button]:"left";Y[e]=!1,J(t,"onUp")}function $(t){J(t,"onOver")}function G(){Y={},z=null}function J(t,e){let i,s,h=n();if(!h)return;let r=h.height/h.offsetHeight,o=h.getBoundingClientRect(),a=-1!==["touchstart","touchmove","touchend"].indexOf(t.type);if(a){F.touches={};for(var c=0;c<t.touches.length;c++)F.touches[t.touches[c].identifier]={id:t.touches[c].identifier,x:(t.touches[c].clientX-o.left)*r,y:(t.touches[c].clientY-o.top)*r,changed:!1};for(c=t.changedTouches.length;c--;){const h=t.changedTouches[c].identifier;void 0!==F.touches[h]&&(F.touches[h].changed=!0),i=t.changedTouches[c].clientX,s=t.changedTouches[c].clientY;let n=H({id:h,x:(i-o.left)*r,y:(s-o.top)*r,radius:F.radius});n&&n[e]&&n[e](t),U[e]&&U[e](t,n)}}else i=t.clientX,s=t.clientY;if(F.x=(i-o.left)*r,F.y=(s-o.top)*r,t.preventDefault(),!a){let i=H();i&&i[e]&&i[e](t),U[e]&&U[e](t,i),"onOver"==e&&(i!=z&&z&&z.onOut&&z.onOut(t),z=i)}}function Q(...t){t.map(t=>{t._r||(t._r=t.render,t.render=function(){D.push(this),this._r()},X.push(t))})}var V=a(class extends R.class{init(t){super.init(t),Q(this);const e=this._dn=document.createElement("button");e.style=c,e.textContent=this.text,e.addEventListener("focus",()=>this.focus()),e.addEventListener("blur",()=>this.blur()),e.addEventListener("click",()=>this.onUp()),document.body.appendChild(e)}destroy(){this._dn.remove()}render(){this._d&&this._t!==this._dn.textContent&&(this._dn.textContent=this._t),super.render()}enable(){this.disabled=this._dn.disabled=!1,this.onEnable()}disable(){this.disabled=this._dn.disabled=!0,this.onDisable()}focus(){this.focused=!0,document.activeElement!=this._dn&&this._dn.focus(),this.onFocus()}blur(){this.focused=!1,document.activeElement==this._dn&&this._dn.blur(),this.onBlur()}onOver(){this.focus()}onOut(){this.blur()}onEnable(){}onDisable(){}onFocus(){}onBlur(){}onUp(){}});function Z(){let t=n();r().clearRect(0,0,t.width,t.height)}let tt={},et={},it={Enter:"enter",Escape:"esc",Space:"space",ArrowLeft:"left",ArrowUp:"up",ArrowRight:"right",ArrowDown:"down",13:"enter",27:"esc",32:"space",37:"left",38:"up",39:"right",40:"down"};function st(t){let e=it[t.code||t.which];et[e]=!0,tt[e]&&tt[e](t)}function ht(t){et[it[t.code||t.which]]=!1}function nt(){et={}}function rt(t){let e=t.substr(t.search(/[A-Z]/));return e[0].toLowerCase()+e.substr(1)}function ot(t,e){let i=t.indexOf(e);-1!==i&&t.splice(i,1)}var at=a(class{constructor({create:t,maxSize:e=1024}={}){this._c=t,this.objects=[t()],this.size=0,this.maxSize=e}get(t={}){if(this.size===this.objects.length){if(this.size===this.maxSize)return;for(let t=0;t<this.size&&this.objects.length<this.maxSize;t++)this.objects.push(this._c())}let e=this.objects[this.size];return this.size++,e.init(t),e}getAliveObjects(){return this.objects.slice(0,this.size)}clear(){this.size=this.objects.length=0,this.objects.push(this._c())}update(t){let e,i=!1;for(let s=this.size;s--;)(e=this.objects[s]).update(t),e.isAlive()||(i=!0,this.size--);i&&this.objects.sort((t,e)=>e.isAlive()-t.isAlive())}render(){for(let t=this.size;t--;)this.objects[t].render()}});function ct(t,e){let i=[],s=e.x+e.width/2,h=e.y+e.height/2,n=t.y<h&&t.y+t.height>=e.y,r=t.y+t.height>=h&&t.y<e.y+e.height;return t.x<s&&t.x+t.width>=e.x&&(n&&i.push(0),r&&i.push(2)),t.x+t.width>=s&&t.x<e.x+e.width&&(n&&i.push(1),r&&i.push(3)),i}class dt{constructor({maxDepth:t=3,maxObjects:e=25,bounds:i}={}){this.maxDepth=t,this.maxObjects=e;let s=n();this.bounds=i||{x:0,y:0,width:s.width,height:s.height},this._b=!1,this._d=0,this._o=[],this._s=[],this._p=null}clear(){this._s.map(function(t){t.clear()}),this._b=!1,this._o.length=0}get(t){let e,i,s=new Set;for(;this._s.length&&this._b;){for(e=ct(t,this.bounds),i=0;i<e.length;i++)this._s[e[i]].get(t).forEach(t=>s.add(t));return Array.from(s)}return this._o.filter(e=>e!==t)}add(){let t,e,i,s;for(e=0;e<arguments.length;e++)if(i=arguments[e],Array.isArray(i))this.add.apply(this,i);else if(this._b)this._a(i);else if(this._o.push(i),this._o.length>this.maxObjects&&this._d<this.maxDepth){for(this._sp(),t=0;s=this._o[t];t++)this._a(s);this._o.length=0}}_a(t,e,i){for(e=ct(t,this.bounds),i=0;i<e.length;i++)this._s[e[i]].add(t)}_sp(t,e,i){if(this._b=!0,!this._s.length)for(t=this.bounds.width/2|0,e=this.bounds.height/2|0,i=0;i<4;i++)this._s[i]=new dt({bounds:{x:this.bounds.x+(i%2==1?t:0),y:this.bounds.y+(i>=2?e:0),width:t,height:e},maxDepth:this.maxDepth,maxObjects:this.maxObjects}),this._s[i]._d=this._d+1}}var lt=a(dt);var ut=a(class{constructor(t={}){this.name=t.id,Object.assign(this,t),this.children=[];const e=this._dn=document.createElement("section");e.id=this.id,e.tabIndex=-1,e.style=c,e.setAttribute("aria-label",this.name),document.body.appendChild(e),this.add(...t.children||[])}show(){this.hidden=this._dn.hidden=!1;let t=this.children.find(t=>t.focus);t?t.focus():this._dn.focus(),this.onShow()}hide(){this.hidden=this._dn.hidden=!0,this.onHide()}add(...t){this.children=this.children.concat(t),t.map(t=>{t._dn&&this._dn.appendChild(t._dn)})}remove(t){this.children=this.children.filter(e=>e!==t),t._dn&&document.body.appendChild(t._dn)}destroy(){this._dn.remove(),this.children.map(t=>t.destroy&&t.destroy())}update(t){this.hidden||this.children.map(e=>e.update&&e.update(t))}render(){this.hidden||this.children.map(t=>{if(!t.render)return;let e=n(),i=void 0!==t.viewX?t.viewX:t.x,s=void 0!==t.viewY?t.viewY:t.y;(void 0===i||i+t.width>0&&i<e.width&&s+t.height>0&&s<e.height)&&t.render()})}onShow(){}onHide(){}});var ft=a(class extends I.class{init(t={}){this._fx=this._fy=1,super.init(t);let{width:e,height:i,image:s}=t;s&&(this.width=void 0!==e?e:s.width,this.height=void 0!==i?i:s.height)}get animations(){return this._a}set animations(t){let e,i;for(e in this._a={},t)this._a[e]=t[e].clone(),i=i||this._a[e];this.currentAnimation=i,this.width=this.width||i.width,this.height=this.height||i.height}playAnimation(t){this.currentAnimation=this.animations[t],this.currentAnimation.loop||this.currentAnimation.reset()}advance(t){super.advance(t),this.currentAnimation&&this.currentAnimation.update(t)}get width(){return this._w}get height(){return this._h}set width(t){let e=t<0?-1:1;this._fx=e,this._w=t*e}set height(t){let e=t<0?-1:1;this._fy=e,this._h=t*e}draw(){if(-1==this._fx||-1==this._fy){let t=this.width/2,e=this.height/2;this.context.translate(t,e),this.context.scale(this._fx,this._fy),this.context.translate(-t,-e)}this.image&&this.context.drawImage(this.image,0,0,this.image.width,this.image.height,0,0,this.width,this.height),this.currentAnimation&&this.currentAnimation.render({x:0,y:0,width:this.width,height:this.height,context:this.context}),this.color&&(this.context.fillStyle=this.color,this.context.fillRect(0,0,this.width,this.height))}});function _t(t){if(+t===t)return t;let e=[],i=t.split(".."),s=+i[0],h=+i[1],n=s;if(s<h)for(;n<=h;n++)e.push(n);else for(;n>=h;n--)e.push(n);return e}var pt=a(class{constructor({image:t,frameWidth:e,frameHeight:i,frameMargin:s,atlas:h,animations:n}={}){this.animations={},this.image=t,this.atlas=h,this.frame={width:e,height:i,margin:s},this._f=t.width/e|0,this.createAnimations(n)}createAnimations(t){let e,i;for(i in t){let{frames:s,frameRate:h,loop:n}=t[i];e=[],[].concat(s).map(t=>{e=e.concat(this.atlas?t:_t(t))}),this.animations[i]=l({spriteSheet:this,frames:e,frameRate:h,loop:n})}}});let gt={start:t=>t?1:0,center:()=>.5,end:t=>t?0:1},mt={set:(t,e,i)=>("_"!=e[0]&&t[e]!==i&&(t._d=!0),t[e]=i,!0)};var wt=a(class extends I.class{init(t={}){let{flow:e="column",align:i="start",justify:h="start",gap:n=0,numCols:r=1,breakpoints:o=[]}=t;return this.flow=e,this.align=i,this.justify=h,this.gap=n,this.numCols=r,this.breakpoints=o,s("font",t=>{this._fs=t,this.breakpoints.map(e=>{e.metric(t)&&this._b!==e&&(this._b=e,e.callback.call(this))}),setTimeout(()=>{this._d=!0},0)}),super.init(t),new Proxy(this,mt)}get width(){return this._w}set width(t){this._w=t,this._d=!0,this._fw=t}get height(){return this._h}set height(t){this._h=t,this._d=!0,this._fh=t}addChild(t){this._d=!0,super.addChild(t)}removeChild(t){this._d=!0,super.removeChild(t)}render(){this._d&&this._p(),super.render()}_p(){this._d=!1;let t,e,i,s,h,r,o,a,c=n(),d=[],l=[],u=[];(()=>{i="column"===this.flow,s="row"===this.flow,h="grid"===this.flow,r=this.children,o=this.gap,a=i?1:s?r.length:this.numCols,t=Math.ceil(r.length/a),e="rtl"===c.dir&&!this.direction||"rtl"===this.direction;for(let e=0;e<t;e++){d[e]=[];for(let t=0;t<a;t++){let i=r[e*a+t];i?(d[e][t]=i,i._p&&i._p(),u[e]=Math.max(u[e]||0,i.height),l[t]=Math.max(l[t]||0,i.width)):d[e][t]={}}}this._w=l.reduce((t,e)=>t+=e,0)+o*(a-1),this._h=u.reduce((t,e)=>t+=e,0)+o*(t-1)})(),e&&(d=d.map(t=>t.reverse()),l=l.reverse());let f=this.y;d.map((t,i)=>{let s=e&&!this.parent?c.width-(this.x+this._w*(1-2*this.anchor.x)):this.x;t.map((t,h)=>{if(!t)return;let n=gt[t.justifySelf?t.justifySelf:this.justify](e),r=gt[t.alignSelf?t.alignSelf:this.align]();t.x=s+l[h]*n,t.y=f+u[i]*r,t.anchor={x:n,y:r},s+=l[h]+o}),f+=u[i]+o})}});return{Animation:l,imageAssets:j,audioAssets:S,dataAssets:P,setImagePath:function(t){m=t},setAudioPath:function(t){w=t},setDataPath:function(t){x=t},loadImage:O,loadAudio:E,loadData:C,load:function(...t){return M(),Promise.all(t.map(t=>{let e=b([].concat(t)[0]);return e.match(u)?O(t):e.match(f)?E(t):C(t)}))},Button:V,collides:function(t,e){if(t.rotation||e.rotation)return null;let i=t.x,s=t.y;t.anchor&&(i-=t.width*t.anchor.x,s-=t.height*t.anchor.y);let h=e.x,n=e.y;return e.anchor&&(h-=e.width*e.anchor.x,n-=e.height*e.anchor.y),i<h+e.width&&i+t.width>h&&s<n+e.height&&s+t.height>n},init:function(i){return t=document.getElementById(i)||i||document.querySelector("canvas"),(e=t.getContext("2d")).imageSmoothingEnabled=!1,h("init"),{canvas:t,context:e}},getCanvas:n,getContext:r,on:s,off:function(t,e){let s;!i[t]||(s=i[t].indexOf(e))<0||i[t].splice(s,1)},emit:h,GameLoop:function({fps:t=60,clearCanvas:e=!0,update:i,render:s}={}){let n,r,a,c,d,l=0,u=1e3/t,f=1/t,_=e?Z:o;function p(){if(r=requestAnimationFrame(p),a=performance.now(),c=a-n,n=a,!(c>1e3)){for(h("tick"),l+=c;l>=u;)d.update(f),l-=u;_(),d.render()}}return d={update:i,render:s,isStopped:!0,start(){n=performance.now(),this.isStopped=!1,requestAnimationFrame(p)},stop(){this.isStopped=!0,cancelAnimationFrame(r)}}},GameObject:I,degToRad:function(t){return t*Math.PI/180},radToDeg:function(t){return 180*t/Math.PI},angleToTarget:function(t,e){return Math.atan2(e.y-t.y,e.x-t.x)+Math.PI/2},randInt:function(t,e){return Math.floor(Math.random()*(e-t+1))+t},seedRand:function(t){for(var e=0,i=2166136261;e<t.length;e++)i=Math.imul(i^t.charCodeAt(e),16777619);i+=i<<13,i^=i>>>7,i+=i<<3,i^=i>>>17;let s=(i+=i<<5)>>>0,h=()=>(2**31-1&(s=Math.imul(48271,s)))/2**31;return h(),h},lerp:function(t,e,i){return t*(1-i)+e*i},inverseLerp:function(t,e,i){return(i-t)/(e-t)},clamp:function(t,e,i){return Math.min(Math.max(t,i),e)},keyMap:it,initKeys:function(){let t;for(t=0;t<26;t++)it[t+65]=it["Key"+String.fromCharCode(t+65)]=String.fromCharCode(t+97);for(t=0;t<10;t++)it[48+t]=it["Digit"+t]=""+t;window.addEventListener("keydown",st),window.addEventListener("keyup",ht),window.addEventListener("blur",nt)},bindKeys:function(t,e){[].concat(t).map(t=>tt[t]=e)},unbindKeys:function(t){[].concat(t).map(t=>tt[t]=0)},keyPressed:function(t){return!!et[t]},registerPlugin:function(t,e){let i=t.prototype;i&&(i._inc||(i._inc={},i._bInc=function(t,e,...i){return this._inc[e].before.reduce((e,i)=>{let s=i(t,...e);return s||e},i)},i._aInc=function(t,e,i,...s){return this._inc[e].after.reduce((e,i)=>{let h=i(t,e,...s);return h||e},i)}),Object.getOwnPropertyNames(e).forEach(t=>{let s=rt(t);i[s]&&(i["_o"+s]||(i["_o"+s]=i[s],i[s]=function(...t){let e=this._bInc(this,s,...t),h=i["_o"+s].call(this,...e);return this._aInc(this,s,h,...t)}),i._inc[s]||(i._inc[s]={before:[],after:[]}),t.startsWith("before")?i._inc[s].before.push(e[t]):t.startsWith("after")&&i._inc[s].after.push(e[t]))}))},unregisterPlugin:function(t,e){let i=t.prototype;i&&i._inc&&Object.getOwnPropertyNames(e).forEach(t=>{let s=rt(t);t.startsWith("before")?ot(i._inc[s].before,e[t]):t.startsWith("after")&&ot(i._inc[s].after,e[t])})},extendObject:function(t,e){let i=t.prototype;i&&Object.getOwnPropertyNames(e).forEach(t=>{i[t]||(i[t]=e[t])})},initPointer:function(){let t=n();t.addEventListener("mousedown",K),t.addEventListener("touchstart",K),t.addEventListener("mouseup",q),t.addEventListener("touchend",q),t.addEventListener("touchcancel",q),t.addEventListener("blur",G),t.addEventListener("mousemove",$),t.addEventListener("touchmove",$),s("tick",()=>{W.length=0,D.map(t=>{W.push(t)}),D.length=0})},pointer:F,track:Q,untrack:function(...t){t.map(t=>{t.render=t._r,t._r=0;let e=X.indexOf(t);-1!==e&&X.splice(e,1)})},pointerOver:function(t){return!!X.includes(t)&&H()===t},onPointerDown:function(t){U.onDown=t},onPointerUp:function(t){U.onUp=t},pointerPressed:function(t){return!!Y[t]},Pool:at,Quadtree:lt,Scene:ut,Sprite:ft,SpriteSheet:pt,setStoreItem:function(t,e){void 0===e?localStorage.removeItem(t):localStorage.setItem(t,JSON.stringify(e))},getStoreItem:function(t){let e=localStorage.getItem(t);try{e=JSON.parse(e)}catch(t){}return e},Text:R,TileEngine:function(t={}){let{width:e,height:i,tilewidth:s,tileheight:h,context:o=r(),tilesets:a,layers:c}=t,d=e*s,l=i*h,u=document.createElement("canvas"),f=u.getContext("2d");u.width=d,u.height=l;let _={},p={},g=[],m=Object.assign({context:o,mapwidth:d,mapheight:l,_sx:0,_sy:0,_d:!1,get sx(){return this._sx},get sy(){return this._sy},set sx(t){this._sx=Math.min(Math.max(0,t),d-n().width),g.forEach(t=>t.sx=this._sx)},set sy(t){this._sy=Math.min(Math.max(0,t),l-n().height),g.forEach(t=>t.sy=this._sy)},render(){this._d&&(this._d=!1,this._p()),v(u)},renderLayer(t){let e=p[t],i=_[t];e||((e=document.createElement("canvas")).width=d,e.height=l,p[t]=e,m._r(i,e.getContext("2d"))),i._d&&(i._d=!1,e.getContext("2d").clearRect(0,0,e.width,e.height),m._r(i,e.getContext("2d"))),v(e)},layerCollidesWith(t,e){let i=e.x,s=e.y;e.anchor&&(i-=e.width*e.anchor.x,s-=e.height*e.anchor.y);let h=w(s),n=x(i),r=w(s+e.height),o=x(i+e.width),a=_[t];for(let t=h;t<=r;t++)for(let e=n;e<=o;e++)if(a.data[e+t*this.width])return!0;return!1},tileAtLayer(t,e){let i=e.row||w(e.y),s=e.col||x(e.x);return _[t]?_[t].data[s+i*m.width]:-1},setTileAtLayer(t,e,i){let s=e.row||w(e.y),h=e.col||x(e.x);_[t]&&(_[t]._d=!0,_[t].data[h+s*m.width]=i)},setLayer(t,e){_[t]&&(_[t]._d=!0,_[t].data=e)},addObject(t){g.push(t),t.sx=this._sx,t.sy=this._sy},removeObject(t){let e=g.indexOf(t);-1!==e&&(g.splice(e,1),t.sx=t.sy=0)},_r:function(t,e){e.save(),e.globalAlpha=t.opacity,t.data.map((t,i)=>{if(!t)return;let s;for(let e=m.tilesets.length-1;e>=0&&(s=m.tilesets[e],!(t/s.firstgid>=1));e--);let h=s.tilewidth||m.tilewidth,n=s.tileheight||m.tileheight,r=s.margin||0,o=s.image,a=t-s.firstgid,c=s.columns||o.width/(h+r)|0,d=i%m.width*h,l=(i/m.width|0)*n,u=a%c*(h+r),f=(a/c|0)*(n+r);e.drawImage(o,u,f,h,n,d,l,h,n)}),e.restore()},_p:y},t);function w(t){return t/m.tileheight|0}function x(t){return t/m.tilewidth|0}function y(){m.layers&&m.layers.map(t=>{t._d=!1,_[t.name]=t,t.data&&!1!==t.visible&&m._r(t,f)})}function v(t){const{width:e,height:i}=n(),s=Math.min(t.width,e),h=Math.min(t.height,i);m.context.drawImage(t,m.sx,m.sy,s,h,0,0,s,h)}return m.tilesets.map(e=>{let i=(window.__k?window.__k.dm.get(t):"")||window.location.href;if(e.source){let t=window.__k.d[window.__k.u(e.source,i)];Object.keys(t).map(i=>{e[i]=t[i]})}if(""+e.image===e.image){let t=window.__k.i[window.__k.u(e.image,i)];e.image=t}}),y(),m},UIManager:wt,Vector:k}}();