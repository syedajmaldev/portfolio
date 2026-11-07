/* ==========================================================================
   Syed Ajmal · Portfolio interactions
   Vanilla JS, no dependencies. Every feature degrades gracefully: the page is
   fully readable and navigable without this file.
   ========================================================================== */
(() => {
    'use strict';

    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const supportsIO = 'IntersectionObserver' in window;

    // Enable scroll-reveal styles as early as possible (script is deferred,
    // so this runs before DOMContentLoaded and before content is revealed).
    if (supportsIO && !reduceMotion.matches) {
        root.classList.add('reveal-ready');
    }

    /* ----------------------------------------------------------------------
       Theme: saved choice > system preference. Initial value is applied by
       the inline script in <head> to avoid a flash of the wrong theme.
       ---------------------------------------------------------------------- */
    const THEME_KEY = 'theme';
    const THEME_COLORS = { dark: '#07080c', light: '#fafbfc' };
    const themeToggle = document.querySelector('[data-theme-toggle]');
    const themeMeta = document.querySelector('meta[name="theme-color"]');

    const readStoredTheme = () => {
        try {
            const value = localStorage.getItem(THEME_KEY);
            return value === 'light' || value === 'dark' ? value : null;
        } catch {
            return null;
        }
    };

    const applyTheme = (theme) => {
        root.setAttribute('data-theme', theme);
        themeMeta?.setAttribute('content', THEME_COLORS[theme]);
        themeToggle?.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    };

    applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

    themeToggle?.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        const commit = () => {
            applyTheme(next);
            try { localStorage.setItem(THEME_KEY, next); } catch { /* storage blocked */ }
        };

        if (typeof document.startViewTransition === 'function' && !reduceMotion.matches) {
            document.startViewTransition(commit);
        } else {
            commit();
        }
    });

    // Follow OS theme changes until the visitor picks a theme explicitly.
    window.matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', (event) => {
        if (!readStoredTheme()) applyTheme(event.matches ? 'light' : 'dark');
    });

    /* ----------------------------------------------------------------------
       Header: elevated style after scrolling + back-to-top visibility
       ---------------------------------------------------------------------- */
    const header = document.querySelector('[data-header]');
    const toTop = document.querySelector('[data-to-top]');
    let scrollQueued = false;

    const updateOnScroll = () => {
        const y = window.scrollY;
        header?.classList.toggle('is-scrolled', y > 8);
        toTop?.classList.toggle('is-visible', y > 720);
        scrollQueued = false;
    };

    window.addEventListener('scroll', () => {
        if (!scrollQueued) {
            scrollQueued = true;
            window.requestAnimationFrame(updateOnScroll);
        }
    }, { passive: true });

    updateOnScroll();

    /* ----------------------------------------------------------------------
       Mobile navigation
       ---------------------------------------------------------------------- */
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const siteNav = document.getElementById('site-nav');
    const desktopQuery = window.matchMedia('(min-width: 900px)');

    const isMenuOpen = () => header?.classList.contains('is-open') ?? false;

    const setMenu = (open, { restoreFocus = false } = {}) => {
        if (!header || !menuToggle) return;
        header.classList.toggle('is-open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        if (open) {
            siteNav?.querySelector('a')?.focus({ preventScroll: true });
        } else if (restoreFocus) {
            menuToggle.focus();
        }
    };

    menuToggle?.addEventListener('click', () => setMenu(!isMenuOpen()));

    siteNav?.addEventListener('click', (event) => {
        if (event.target.closest('a') && isMenuOpen()) setMenu(false);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && isMenuOpen()) setMenu(false, { restoreFocus: true });
    });

    document.addEventListener('click', (event) => {
        if (isMenuOpen() && header && !header.contains(event.target)) setMenu(false);
    });

    desktopQuery.addEventListener?.('change', (event) => {
        if (event.matches && isMenuOpen()) setMenu(false);
    });

    /* ----------------------------------------------------------------------
       Active section highlighting in the nav
       ---------------------------------------------------------------------- */
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));

    if (supportsIO && navLinks.length) {
        const setActive = (id) => {
            navLinks.forEach((link) => {
                if (link.getAttribute('href') === `#${id}`) {
                    link.setAttribute('aria-current', 'true');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) setActive(entry.target.id);
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));
    }

    /* ----------------------------------------------------------------------
       Scroll reveal
       ---------------------------------------------------------------------- */
    if (root.classList.contains('reveal-ready')) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

        document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
    }

    /* ----------------------------------------------------------------------
       Card spotlight (desktop pointers only)
       ---------------------------------------------------------------------- */
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        document.querySelectorAll('.spotlight').forEach((card) => {
            card.addEventListener('pointermove', (event) => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
                card.style.setProperty('--my', `${event.clientY - rect.top}px`);
            });
        });
    }

    /* ----------------------------------------------------------------------
       Copy email to clipboard
       ---------------------------------------------------------------------- */
    const liveRegion = document.querySelector('[data-live]');
    const announce = (message) => {
        if (!liveRegion) return;
        liveRegion.textContent = '';
        window.setTimeout(() => { liveRegion.textContent = message; }, 50);
    };

    const legacyCopy = (text) => {
        const field = document.createElement('textarea');
        field.value = text;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        let copied = false;
        try { copied = document.execCommand('copy'); } catch { copied = false; }
        field.remove();
        return copied;
    };

    document.querySelectorAll('[data-copy]').forEach((button) => {
        const label = button.querySelector('[data-copy-label]');
        const defaultLabel = label?.textContent ?? '';
        let resetTimer;

        button.addEventListener('click', async () => {
            const text = button.getAttribute('data-copy');
            let copied = false;

            try {
                await navigator.clipboard.writeText(text);
                copied = true;
            } catch {
                copied = legacyCopy(text);
            }

            if (!copied) {
                window.location.href = `mailto:${text}`;
                return;
            }

            button.classList.add('is-copied');
            if (label) label.textContent = 'Copied';
            announce('Email address copied to clipboard');

            window.clearTimeout(resetTimer);
            resetTimer = window.setTimeout(() => {
                button.classList.remove('is-copied');
                if (label) label.textContent = defaultLabel;
            }, 2000);
        });
    });

    /* ----------------------------------------------------------------------
       Certificate lightbox (native <dialog>; links still work without it)
       ---------------------------------------------------------------------- */
    const dialog = document.getElementById('cert-dialog');

    if (dialog && typeof dialog.showModal === 'function') {
        const dialogImg = dialog.querySelector('.lightbox__img');
        const dialogTitle = dialog.querySelector('[data-dialog-title]');

        document.querySelectorAll('[data-lightbox]').forEach((link) => {
            link.addEventListener('click', (event) => {
                // Let modified clicks open the image in a new tab as usual.
                if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();

                const title = link.getAttribute('data-title') || 'Certificate';
                dialogTitle.textContent = title;
                dialogImg.alt = `${title} certificate`;
                dialogImg.src = link.getAttribute('href');
                dialog.showModal();
            });
        });

        dialog.querySelector('[data-dialog-close]')?.addEventListener('click', () => dialog.close());

        // Close when clicking the backdrop (the dialog element itself).
        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) dialog.close();
        });

        dialog.addEventListener('close', () => {
            dialogImg.removeAttribute('src');
        });
    }

    /* ----------------------------------------------------------------------
       Footer year
       ---------------------------------------------------------------------- */
    const year = String(new Date().getFullYear());
    document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = year; });
})();
