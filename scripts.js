document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.site-header');
    const burger = document.querySelector('.hamburger');
    const menu = document.getElementById('primary-menu');

    // --- helpers ---
    const headerHeight = () => header?.offsetHeight || 72;
    const syncMenuTop = () => { if (menu) menu.style.top = `${headerHeight() - 5}px`; };
    const syncMenuHeight = () => { if (menu) menu.style.setProperty('--menu-h', `${menu.scrollHeight}px`); };

    // Force compact while menu is open
    let forceCompact = false;
    const setCompact = () => {
        const compact = forceCompact || window.scrollY > 120;
        header?.classList.toggle('is-compact', compact);
        syncMenuTop();
        syncMenuHeight();
    };

    const openMenu = () => {
        if (!menu) return;
        menu.classList.add('open');
        document.body.classList.add('noscroll');
        forceCompact = true;
        setCompact();
        syncMenuHeight(); // <- ensure height is right after fonts/layout settle
        burger?.setAttribute('aria-expanded', 'true');
    };

    const closeMenu = () => {
        if (!menu) return;
        menu.classList.remove('open');
        document.body.classList.remove('noscroll');
        forceCompact = false;
        setCompact();
        burger?.setAttribute('aria-expanded', 'false');
    };

    // --- init header state ---
    setCompact();
    window.addEventListener('scroll', setCompact, { passive: true });
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) closeMenu();
        setCompact(); // recalc menu top after rotation/breakpoint change
    });

    // --- mobile menu toggle & accessibility ---
    if (burger && menu) {
        burger.setAttribute('aria-controls', 'primary-menu');
        burger.setAttribute('aria-expanded', 'false');

        burger.addEventListener('click', () => {
            menu.classList.contains('open') ? closeMenu() : openMenu();
        });

        // close on nav item click
        menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

        // close on Escape
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

        // close when clicking outside
        document.addEventListener('click', e => {
            if (!menu.classList.contains('open')) return;
            const inside = menu.contains(e.target) || burger.contains(e.target);
            if (!inside) closeMenu();
        });
    }

    // --- smooth scroll with live header offset ---
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const id = link.getAttribute('href');
            if (!id || id === '#') return;

            const target = document.querySelector(id);
            if (!target) return;

            e.preventDefault();
            const y = target.getBoundingClientRect().top + window.scrollY - (headerHeight() - 20);
            window.scrollTo({ top: y, behavior: 'smooth' });
        });
    });

    // --- mailto fallback (GitHub Pages) ---
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const name = document.getElementById('name')?.value.trim() || '';
            const email = document.getElementById('email')?.value.trim() || '';
            const message = document.getElementById('message')?.value.trim() || '';
            const to = 'amanda@songbirdtherapy.uk';
            const subject = encodeURIComponent('New enquiry via Songbird Therapy');
            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
            window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
        });
    }

    // --- year ---
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // on resize:
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) closeMenu();
        setCompact();       // recompute top
        syncMenuHeight();   // recompute height for new width/orientation
    });

});
