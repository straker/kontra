(function () {
  var pre = document.createElement('pre');
  pre.innerHTML =
    '<code class="language-javascript" style="font-size: 14px;">' +
    document.getElementById('code').innerHTML +
    '</code>';
  document.body.appendChild(pre);

  var prisimcss = document.createElement('link');
  prisimcss.setAttribute('rel', 'stylesheet');
  prisimcss.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.15.0/themes/prism.min.css';
  document.head.appendChild(prisimcss);

  var prisimjs = document.createElement('script');
  prisimjs.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.15.0/prism.min.js';
  document.body.appendChild(prisimjs);
})();
