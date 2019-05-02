(function() {
  let nav = document.querySelector('.main-nav');
  nav.classList.add('main-nav', 'showScroll');

  // adjust path based on location (github pages required kontra url)
  if (window.location.host.indexOf('localhost') === -1) {
    Array.from(document.querySelectorAll('a')).forEach(a => {
      let href = a.getAttribute('href').replace(/^\//, '');

      if (href.startsWith('http')) return;

      a.setAttribute('href', `https://straker.github.io/kontra/${href}`);
    });
  }
  document.querySelectorAll('a');

  nav.addEventListener('scroll', function(e) {
    if (this.offsetHeight + this.scrollTop >= this.scrollHeight) {
      this.classList.remove('showScroll');
    }
    else {
      this.classList.add('showScroll');
    }
  }.bind(nav));

  let menuBtn = document.querySelector('.menu-button');
  let menu = document.querySelector('#menu');
  menuBtn.addEventListener('click', function() {
    let expanded = !(this.getAttribute('aria-expanded') === 'true');
    this.setAttribute('aria-expanded', expanded);
    document.body.classList.toggle('menu-expanded');
    if (expanded) {
      menu.style.height = menu.scrollHeight + 'px';
    }
    else {
      menu.style.height = null;
    }
  });
})();