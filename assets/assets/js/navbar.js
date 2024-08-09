(function () {
  let nav = document.querySelector('.main-nav');
  nav.addEventListener(
    'scroll',
    function (e) {
      if (this.offsetHeight + this.scrollTop >= this.scrollHeight) {
        this.classList.remove('showScroll');
      } else {
        this.classList.add('showScroll');
      }
    }.bind(nav)
  );

  let menuBtn = document.querySelector('.menu-button');
  let menu = document.querySelector('#menu');
  menuBtn.addEventListener('click', function () {
    let expanded = !(this.getAttribute('aria-expanded') === 'true');
    this.setAttribute('aria-expanded', expanded);
    document.body.classList.toggle('menu-expanded');
    if (expanded) {
      menu.style.height = menu.scrollHeight + 'px';
    } else {
      menu.style.height = null;
    }
  });

  // save scroll position between page loads
  window.addEventListener('unload', function (event) {
    sessionStorage.setItem('kontra-nav-scroll', nav.scrollTop);
  });
})();
