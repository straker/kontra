(function() {
  let type = localStorage.getItem('kontra-example-type') || 'global';
  document.body.setAttribute('data-examples', type);

  Array.from(document.querySelectorAll(`[role=tab]`)).forEach(tab => {
    tab.setAttribute('tabindex', -1);
  });

  Array.from(document.querySelectorAll(`[data-tab=${type}] [role=tab]`)).forEach(tab => {
    tab.setAttribute('aria-selected', true);
    tab.setAttribute('tabindex', 0);
  });


  Array.from(document.querySelectorAll('[role=tablist]')).forEach(tablist => {
    let tabs = [];

    function switchTab(index) {
      let tab = tabs[index];
      let type = tab.parentElement.dataset.tab;
      localStorage.setItem('kontra-example-type', type);
      document.body.setAttribute('data-examples', type);

      let priorTab = tablist.querySelector('[aria-selected]')
      priorTab.removeAttribute('aria-selected');
      priorTab.setAttribute('tabindex', -1);

      tab.setAttribute('aria-selected', true);
      tab.focus();
      tab.setAttribute('tabindex', 0);
    }

    Array.from(tablist.querySelectorAll('[role=tab]')).forEach((tab, index) => {
      tabs.push(tab);

      tab.addEventListener('click', e => {
        switchTab(index);
      });

      tab.addEventListener('keydown', e => {
        let tabIndex;
        if (e.which === 37) {
          tabIndex = index - 1 <= 0 ? 0 : index - 1;
          switchTab(tabIndex);
        }
        else if (e.which === 39) {
          tabIndex = index + 1 >= tabs.length - 1 ? tabs.length - 1 : index + 1;
          switchTab(tabIndex);
        }
      });
    });
  });
})();