document.addEventListener('DOMContentLoaded', () => {
  const placeholder = document.getElementById('navbar-placeholder');
  if (!placeholder) return;

  const navbarMarkup = `
<nav class="navbar navbar-expand-lg navbar-dark fixed-top">
  <div class="container">
    <a class="navbar-brand" href="#home">MATIKA<span class="plus">+</span></a>
    <a class="navbar-rule-link" href="pravidla-skoly.html">Pravidlá školy</a>

    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" aria-controls="navMenu" aria-expanded="false" aria-label="Prepnúť navigáciu">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navMenu">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link" href="#home" data-nav-home>Domov</a></li>
        <li class="nav-item"><a class="nav-link" href="#kurzy" data-nav-kurzy>Kurzy</a></li>
        <li class="nav-item"><a class="nav-link" href="online-hodiny.html">Online hodiny</a></li>
        <li class="nav-item"><a class="nav-link" href="spoluprace-mszs.html">Spolupráce MŠ/ZŠ</a></li>
        <li class="nav-item"><a class="nav-link" href="akcie.html">Akcie</a></li>
        <li class="nav-item"><a class="nav-link" href="#registracia" data-nav-registracia>Registrácia</a></li>
        <li class="nav-item ms-lg-2"><a class="contact-btn" href="#kontakt" data-nav-kontakt>Kontakt</a></li>
      </ul>
    </div>
  </div>
</nav>`;

  const isHomePage = () => {
    const path = window.location.pathname.replace(/\\/g, '/');
    return path === '/' || /\/index\.html$/i.test(path) || /\/$/.test(path);
  };

  const getHomeHref = (anchor) => (isHomePage() ? `#${anchor}` : `index.html#${anchor}`);
  const getSectionHref = (target) => (isHomePage() ? `#${target}` : `index.html?target=${target}`);

  const applyNavbarLinks = (root) => {
    const brandLink = root.querySelector('.navbar-brand');
    if (brandLink) {
      brandLink.setAttribute('href', getHomeHref('home'));
    }

    const homeLink = root.querySelector('[data-nav-home]');
    if (homeLink) {
      homeLink.setAttribute('href', getHomeHref('home'));
    }

    const coursesLink = root.querySelector('[data-nav-kurzy]');
    if (coursesLink) {
      coursesLink.setAttribute('href', getSectionHref('kurzy'));
    }

    const registerLink = root.querySelector('[data-nav-registracia]');
    if (registerLink) {
      registerLink.setAttribute('href', getSectionHref('registracia'));
    }

    const contactLink = root.querySelector('[data-nav-kontakt]');
    if (contactLink) {
      contactLink.setAttribute('href', getHomeHref('kontakt'));
    }

    const navMenuEl = document.getElementById('navMenu');
    const navbarLinks = root.querySelectorAll('.nav-link');

    navbarLinks.forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (!href.startsWith('#')) return;

      link.addEventListener('click', (event) => {
        event.preventDefault();

        const targetId = href.slice(1);
        const finishNavigation = () => {
          scrollToSection(targetId);
          history.replaceState({}, '', href === '#home' ? window.location.pathname + window.location.search : href);
        };

        const toggler = root.querySelector('.navbar-toggler');
        const expanded = navMenuEl && (navMenuEl.classList.contains('show') || toggler?.getAttribute('aria-expanded') === 'true');
        if (expanded && typeof bootstrap !== 'undefined') {
          navMenuEl.addEventListener('hidden.bs.collapse', finishNavigation, { once: true });
          const collapse = bootstrap.Collapse.getOrCreateInstance(navMenuEl);

          if (navMenuEl.classList.contains('collapsing')) {
            navMenuEl.addEventListener('shown.bs.collapse', () => collapse.hide(), { once: true });
          } else {
            collapse.hide();
          }
          return;
        }

        finishNavigation();
      });
    });
  };

  const scrollToSection = (targetId) => {
    if (!targetId || targetId === '#') return;

    const section = document.getElementById(targetId) || document.querySelector(targetId);
    if (!section) return;

    const navbar = document.querySelector('.navbar.fixed-top');
    const navbarOffset = navbar ? navbar.offsetHeight : 72;
    const heading = section.querySelector('.section-title, h1, h2, h3') || section;
    const targetTop = heading.getBoundingClientRect().top + window.pageYOffset - navbarOffset - 12;

    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'instant' });
  };

  const handleInitialTarget = () => {
    const params = new URLSearchParams(window.location.search);
    const target = params.get('target');
    if (!target) return;

    const normalizedTarget = target === 'home' ? 'home' : target;
    requestAnimationFrame(() => {
      setTimeout(() => scrollToSection(normalizedTarget), 120);
    });
  };

  placeholder.innerHTML = navbarMarkup;
  applyNavbarLinks(placeholder);
  handleInitialTarget();
});
