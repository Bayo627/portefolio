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

    /* -----------------------------------------------
       7. GESTION DYNAMIQUE DES PROJETS (MySQL)
    ----------------------------------------------- */
    const API_URL = 'http://localhost:5000/api/projects';
    const projectsGrid = document.getElementById('projectsGrid');
    const projectModal = document.getElementById('projectModal');
    const projectForm = document.getElementById('projectForm');
    const btnManage = document.getElementById('btnManageProjects');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');

    // Charger les projets depuis l'API
    async function loadProjects() {
        if (!projectsGrid) return;
        
        try {
            const response = await fetch(API_URL);
            const projects = await response.json();
            renderProjects(projects);
        } catch (error) {
            console.error('Erreur lors du chargement des projets:', error);
            projectsGrid.innerHTML = `
                <div class="error-msg" style="grid-column: 1/-1; text-align: center; color: #ff6b6b; padding: 2rem; background: rgba(255,107,107,0.1); border-radius: 1rem;">
                    <span class="material-symbols-outlined" style="font-size: 3rem; margin-bottom: 1rem;">database_off</span>
                    <p>Impossible de se connecter au serveur MySQL.</p>
                    <p style="font-size: 0.8rem; margin-top: 0.5rem;">Vérifiez que le backend Node.js est lancé sur le port 5000.</p>
                </div>`;
        }
    }

    // Afficher les projets dans le DOM
    function renderProjects(projects) {
        if (!projects || projects.length === 0) {
            projectsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--on-surface-variant);">Aucun projet trouvé.</p>';
            return;
        }

        projectsGrid.innerHTML = '';
        projects.forEach(project => {
            const tagsHtml = project.tags 
                ? project.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('') 
                : '';

            const article = document.createElement('article');
            article.className = 'project-card reveal visible'; 
            article.innerHTML = `
                <button class="delete-btn" data-id="${project.id}" title="Supprimer le projet">
                    <span class="material-symbols-outlined">delete</span>
                </button>
                <div class="card-image-wrapper">
                    <img src="${project.image_url}" alt="${project.title}" onerror="this.src='https://placehold.co/600x400/0f172a/64ffda?text=Image+indisponible'">
                </div>
                <div class="card-content">
                    <div class="tags">${tagsHtml}</div>
                    <h3 class="card-title-proj">${project.title}</h3>
                    <p class="card-description">${project.description}</p>
                    <a href="${project.link || '#'}" class="card-link" target="_blank">
                        Voir le projet
                        <span class="material-symbols-outlined">arrow_forward</span>
                    </a>
                </div>
            `;
            projectsGrid.appendChild(article);
        });

        // Ajouter les écouteurs pour la suppression
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const id = this.dataset.id;
                if(confirm('Voulez-vous vraiment supprimer ce projet ?')) {
                    deleteProject(id);
                }
            });
        });
    }

    // Ajouter un projet
    if (projectForm) {
        projectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const projectData = {
                title: document.getElementById('title').value,
                image_url: document.getElementById('imageUrl').value,
                tags: document.getElementById('tags').value,
                description: document.getElementById('description').value,
                link: document.getElementById('link').value
            };

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(projectData)
                });

                if (response.ok) {
                    projectForm.reset();
                    projectModal.classList.remove('active');
                    loadProjects();
                } else {
                    alert('Erreur lors de l\'ajout du projet.');
                }
            } catch (error) {
                console.error('Erreur:', error);
            }
        });
    }

    // Supprimer un projet
    async function deleteProject(id) {
        try {
            const response = await fetch(\`\${API_URL}/\${id}\`, { method: 'DELETE' });
            if (response.ok) {
                loadProjects();
            } else {
                alert('Erreur lors de la suppression.');
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    }

    // Modal UI Controls
    if (btnManage) {
        btnManage.addEventListener('click', () => projectModal.classList.add('active'));
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => projectModal.classList.remove('active'));
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => projectModal.classList.remove('active'));
    }

    // Fermer au clic en dehors
    window.addEventListener('click', (e) => {
        if (e.target === projectModal) projectModal.classList.remove('active');
    });

    // Initialisation
    loadProjects();


});
