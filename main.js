// ================================================
//  main.js — Moussa Traore Portfolio (Single Page)
// ================================================

document.addEventListener('DOMContentLoaded', function () {

    /* -----------------------------------------------
       1. MOBILE MENU TOGGLE
    ----------------------------------------------- */
    var toggle   = document.getElementById('mobileToggle');
    var navLinks = document.getElementById('navLinks');
    var overlay  = document.getElementById('navOverlay');
    var body     = document.body;

    function openMenu() {
        navLinks.classList.add('mobile-active');
        toggle.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        body.style.overflow = 'hidden';
        // Activer l'overlay via style inline (plus fiable que classList)
        if (overlay) {
            overlay.style.opacity       = '1';
            overlay.style.pointerEvents = 'auto';
        }
    }

    function closeMenu() {
        navLinks.classList.remove('mobile-active');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
        if (overlay) {
            overlay.style.opacity       = '0';
            overlay.style.pointerEvents = 'none';
        }
    }

    if (toggle && navLinks) {
        // Ouvrir / fermer au clic sur le bouton
        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            navLinks.classList.contains('mobile-active') ? closeMenu() : openMenu();
        });

        // Fermer en cliquant sur l'overlay
        if (overlay) {
            overlay.addEventListener('click', closeMenu);
        }

        // Fermer en cliquant sur un lien ou le CTA du drawer
        document.querySelectorAll('.nav-link, .drawer-cta').forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });

        // Fermer avec la touche Échap
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeMenu();
        });
    }

    /* -----------------------------------------------
       2. NAVBAR SHADOW AU SCROLL
    ----------------------------------------------- */
    var navbar = document.getElementById('navbar');
    window.addEventListener('scroll', function () {
        if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 20);
        }
    }, { passive: true });

    /* -----------------------------------------------
       3. LIEN ACTIF SELON LA SECTION VISIBLE
    ----------------------------------------------- */
    var sections = document.querySelectorAll('section[id]');
    var navItems = document.querySelectorAll('.nav-link[data-section]');

    if (sections.length && navItems.length && 'IntersectionObserver' in window) {
        var sectionObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.id;
                    navItems.forEach(function (link) {
                        link.classList.toggle('active', link.dataset.section === id);
                    });
                }
            });
        }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

        sections.forEach(function (s) { sectionObserver.observe(s); });
    }

    /* -----------------------------------------------
       4. SMOOTH SCROLL (sécurisé contre href="#")
    ----------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            // Ignorer les ancres vides ou invalides
            if (!href || href === '#') return;
            try {
                var target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            } catch (err) {
                // Sélecteur invalide — on laisse le comportement par défaut
            }
        });
    });

    /* -----------------------------------------------
       5. ANIMATION DES BARRES DE PROGRESSION
    ----------------------------------------------- */
    var bars = document.querySelectorAll('.progress-fill[data-width]');

    if (bars.length && 'IntersectionObserver' in window) {
        var barObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.width = entry.target.dataset.width;
                    barObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        bars.forEach(function (b) { barObserver.observe(b); });
    } else {
        bars.forEach(function (b) { b.style.width = b.dataset.width; });
    }

    /* -----------------------------------------------
       6. SCROLL REVEAL
    ----------------------------------------------- */
    var revealTargets = document.querySelectorAll(
        '.hero-text, .hero-visual, .about-header, .portrait-card, .text-card,' +
        '.skills-header, .skill-card, .section-header, .project-card,' +
        '.teaser-section, .contact-section'
    );

    if ('IntersectionObserver' in window) {
        revealTargets.forEach(function (el) { el.classList.add('reveal'); });

        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });

        revealTargets.forEach(function (el) { revealObserver.observe(el); });
    } else {
        // Fallback : afficher directement si pas de support IntersectionObserver
        revealTargets.forEach(function (el) { el.classList.add('reveal', 'visible'); });
    }

});
