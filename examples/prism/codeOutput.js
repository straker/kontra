(function() {
  var pre = document.createElement('pre');
  pre.innerHTML = '<code class="language-javascript" style="font-size: 14px;">' + document.getElementById('code').innerHTML + '</code>';
  document.body.appendChild(pre);

  var prisimcss = document.createElement('link');
  prisimcss.setAttribute('rel', 'stylesheet');
  prisimcss.href = '../prism/prism.css';
  document.head.appendChild(prisimcss);

  var prisimjs = document.createElement('script');
  prisimjs.src = '../prism/prism.js';
  document.body.appendChild(prisimjs);
})();