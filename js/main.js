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
       7. GESTION SECRÈTE DES PROJETS (MySQL & LocalStorage)
    ----------------------------------------------- */
    const API_URL = 'http://localhost:5000/api/projects';
    const projectsGrid = document.getElementById('projectsGrid');
    const projectModal = document.getElementById('projectModal');
    const projectForm = document.getElementById('projectForm');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    
    // Inputs formulaire
    const imageFileInput = document.getElementById('imageFile');
    const imageFileNameDisplay = document.getElementById('imageFileName');
    const imageUrlInput = document.getElementById('imageUrl');
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewImg = imagePreview ? imagePreview.querySelector('img') : null;

    const projectFileInput = document.getElementById('projectFile');
    const projectFileNameDisplay = document.getElementById('projectFileName');
    const projectLinkInput = document.getElementById('link');

    const adminStorageBadge = document.getElementById('adminStorageBadge');

    let useLocalStorage = false;
    let isAdminActive = false;

    // Helper de compression client via Canvas (redimensionne à 800px max, compresse à 80% JPEG)
    function compressImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    
                    canvas.toBlob((blob) => {
                        resolve({ dataUrl: compressedDataUrl, blob: blob });
                    }, 'image/jpeg', quality);
                };
            };
        });
    }

    // Projets par défaut si localstorage vide
    const DEFAULT_PROJECTS = [
        {
            id: 'default-1',
            title: 'FinTech Dashboard',
            description: "Interface d'analyse financière conçue pour offrir une lisibilité maximale des données complexes avec une navigation intuitive.",
            image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfwN-32F90Le-7PUSKjFb7TkZuroKVJHoHHgDXD1ErfGXUSWgxPaP0YaKR1KYlAqkcBM62b16ntZUP3UJZTq1wLD1qXsO_y0b5G9lgUxAM3Q6W-BqFDE5zKyJ8nX1IrmBZfMlSknkt-1ZmyeCyG6msdaf5tV0zorpyrX8WmYbB-mqxg0siryakK-5EqjpAVNqU8asLtSbRONAoGIAGYQs1_IcdW2lSpiZgogQcqAZCdY-oyCkB7_mF7ro4QHFj1g8ZwCbJECUteF0',
            tags: 'React,Tailwind',
            link: '#'
        },
        {
            id: 'default-2',
            title: 'E-commerce Premium',
            description: "Refonte de l'expérience d'achat mobile pour une marque de luxe, avec un accent sur la fluidité des micro-interactions.",
            image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQDilrRrpFPz8orWoOiECT4edam0rSSNZLD_us0LKp6MYxNCYrliOxBVPywMzRoECpq29XmegYN9mgc0HRyb7XGfjXuDOjCNMO5lnz1LAIVVkj3TgZu89Tsr_lFvGTFIulSazbk6ZujZ7MBcy2we8-gYhhGsmncpQ5IapM5_WVIz5XLCAKUVJSvPsYSstdrI1sSsl6CJK8wn8MaZ0VH2ZMLiu5xv9MYU6vY456EXarJiGlakccdLJ85EkE9bXeHA58qN-YtOKi74E',
            tags: 'Vue.js,Figma',
            link: '#'
        },
        {
            id: 'default-3',
            title: 'Architecture Système',
            description: "Conception d'une architecture backend robuste et évolutive pour supporter une plateforme SaaS à fort trafic.",
            image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTyrWaF-wjC_Ay0a7tzX50-xnGgYPnT_l9MGqUVONU8IpSXBPGROKEDlpoO555bl1WX_eAywxb1yrJXTNg0mdbbIvfptsKS287_u15gfqgsVuWpaFrYgDdLtgowpevY7fhPlFd5UzOW4ecgZGgtGPFA6c0mGbO9OO1NvRKVBepVigMcQHIoaeaKpN64n2hFKWotRgyCyqjMSDfo2wKIGZyrospT6RNiU4uP7iJ6CqVCxvR-yMgmsofoXmWEKhh8gr-i7FeXdiQk1s',
            tags: 'Node.js,API',
            link: '#'
        }
    ];

    // Détection du mode d'accès Administrateur Secret
    function checkAdminAccess() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('admin')) {
            enableAdminMode();
        }
    }

    function enableAdminMode() {
        if (isAdminActive) return;
        isAdminActive = true;
        document.body.classList.add('admin-mode');
        console.log("Mode Administrateur activé ! Vous pouvez maintenant gérer vos projets.");
        
        // Notification toast ou message dans la console pour l'utilisateur
        showNotification("Mode Administration activé. Survolez les projets pour les supprimer ou Ctrl+Shift+A pour en stocker un.");
    }

    function showNotification(message) {
        let toast = document.getElementById('adminToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'adminToast';
            toast.style.cssText = `
                position: fixed; bottom: 20px; right: 20px;
                background: rgba(15, 23, 42, 0.95);
                color: var(--primary);
                border: 1px solid var(--primary);
                padding: 1rem 1.5rem;
                border-radius: var(--radius-xl);
                z-index: 9999;
                font-family: inherit; font-size: 0.9rem;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                backdrop-filter: blur(8px);
                transition: opacity 0.3s ease;
                display: flex; align-items: center; gap: 0.5rem;
            `;
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<span class="material-symbols-outlined">admin_panel_settings</span> ${message}`;
        toast.style.opacity = '1';
        setTimeout(() => {
            toast.style.opacity = '0';
        }, 5000);
    }

    // Détecteur de raccourci clavier : Ctrl + Shift + A
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            enableAdminMode();
            if (projectModal) {
                projectModal.classList.add('active');
                updateModalStorageBadge();
            }
        }
    });

    // Mettre à jour le badge de statut de stockage dans le modal
    function updateModalStorageBadge() {
        if (!adminStorageBadge) return;
        if (useLocalStorage) {
            adminStorageBadge.textContent = "Stockage : Navigateur (Local)";
            adminStorageBadge.className = "storage-badge local-mode";
        } else {
            adminStorageBadge.textContent = "Stockage : Base de données (MySQL)";
            adminStorageBadge.className = "storage-badge";
        }
    }

    // Gestion de l'aperçu de l'image sélectionnée et affichage du nom
    if (imageFileInput) {
        imageFileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                if (imageFileNameDisplay) imageFileNameDisplay.textContent = file.name;
                
                // Prévisualiser
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (imagePreviewImg) imagePreviewImg.src = e.target.result;
                    if (imagePreview) imagePreview.style.display = 'flex';
                };
                reader.readAsDataURL(file);
            } else {
                if (imageFileNameDisplay) imageFileNameDisplay.textContent = "Aucun fichier";
                if (imagePreview) imagePreview.style.display = 'none';
            }
        });
    }

    // Gestion de l'affichage du nom du fichier de projet
    if (projectFileInput) {
        projectFileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                if (projectFileNameDisplay) projectFileNameDisplay.textContent = file.name;
            } else {
                if (projectFileNameDisplay) projectFileNameDisplay.textContent = "Aucun fichier";
            }
        });
    }

    // Charger les projets depuis l'API ou LocalStorage en cas d'erreur
    async function loadProjects() {
        if (!projectsGrid) return;
        
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error("Erreur de serveur");
            
            const projects = await response.json();
            useLocalStorage = false;
            renderProjects(projects);
        } catch (error) {
            console.warn('Impossible de joindre le serveur MySQL. Basculement sur LocalStorage :', error.message);
            useLocalStorage = true;
            
            // Récupérer depuis localStorage
            let localProjects = localStorage.getItem('portfolio_projects');
            if (!localProjects) {
                // Initialiser avec les projets par défaut si vide
                localStorage.setItem('portfolio_projects', JSON.stringify(DEFAULT_PROJECTS));
                localProjects = JSON.stringify(DEFAULT_PROJECTS);
            }
            
            renderProjects(JSON.parse(localProjects));
        }
    }

    // Afficher les projets dans le DOM
    function renderProjects(projects) {
        if (!projectsGrid) return;
        
        if (!projects || projects.length === 0) {
            projectsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--on-surface-variant);">Aucun projet trouvé.</p>';
            return;
        }

        projectsGrid.innerHTML = '';
        projects.forEach(project => {
            const tagsHtml = project.tags 
                ? project.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('') 
                : '';

            // Détecter si le lien est un fichier joint téléversé (archive source, PDF, etc.)
            const isFile = project.link && (
                project.link.includes('/uploads/') && (
                    project.link.toLowerCase().endsWith('.zip') || 
                    project.link.toLowerCase().endsWith('.rar') || 
                    project.link.toLowerCase().endsWith('.pdf') || 
                    project.link.toLowerCase().endsWith('.doc') || 
                    project.link.toLowerCase().endsWith('.docx')
                ) || 
                project.link.startsWith('data:application/') ||
                project.link.startsWith('data:image/')
            );

            const linkText = isFile ? 'Télécharger les sources' : 'Voir le projet';
            const linkIcon = isFile ? 'download' : 'arrow_forward';
            const downloadAttr = isFile ? 'download' : '';

            const article = document.createElement('article');
            article.className = 'project-card reveal visible'; 
            article.innerHTML = `
                <button class="delete-btn" data-id="${project.id}" title="Supprimer le projet">
                    <span class="material-symbols-outlined">delete</span>
                </button>
                <div class="card-image-wrapper">
                    <img src="${project.image_url}" alt="${project.title}" loading="lazy" onerror="this.src='https://placehold.co/600x400/0f172a/64ffda?text=Image+indisponible'">
                </div>
                <div class="card-content">
                    <div class="tags">${tagsHtml}</div>
                    <h3 class="card-title-proj">${project.title}</h3>
                    <p class="card-description">${project.description}</p>
                    <a href="${project.link || '#'}" class="card-link" target="_blank" ${downloadAttr}>
                        ${linkText}
                        <span class="material-symbols-outlined">${linkIcon}</span>
                    </a>
                </div>
            `;
            projectsGrid.appendChild(article);
        });

        // Attacher les écouteurs pour la suppression des projets
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const id = this.dataset.id;
                if (confirm('Voulez-vous vraiment supprimer ce projet réalisé ?')) {
                    deleteProject(id);
                }
            });
        });
    }

    // Soumission du formulaire d'ajout
    if (projectForm) {
        projectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const title = document.getElementById('title').value;
            const tags = document.getElementById('tags').value;
            const description = document.getElementById('description').value;

            // Compresser l'image si un fichier est sélectionné
            const imageFile = imageFileInput.files[0];
            let compressedImage = null;
            if (imageFile) {
                showNotification("Optimisation de la photo en cours...");
                compressedImage = await compressImage(imageFile, 800, 600, 0.8);
            }

            if (useLocalStorage) {
                // Mode local storage
                let imageUrl = imageUrlInput.value || 'https://placehold.co/600x400/0f172a/64ffda?text=Projet';
                let projectLink = projectLinkInput.value || '#';

                const saveToLocal = (fileData) => {
                    const newProject = {
                        id: 'local-' + Date.now(),
                        title: title,
                        description: description,
                        image_url: compressedImage ? compressedImage.dataUrl : imageUrl,
                        tags: tags,
                        link: fileData || projectLink
                    };

                    let localProjects = JSON.parse(localStorage.getItem('portfolio_projects') || '[]');
                    localProjects.unshift(newProject);
                    localStorage.setItem('portfolio_projects', JSON.stringify(localProjects));
                    
                    finalizeSubmission();
                };

                // Si un fichier source/projet a été choisi, on le lit en Base64
                const projectFile = projectFileInput.files[0];
                if (projectFile) {
                    showNotification("Traitement du document joint...");
                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        saveToLocal(evt.target.result);
                    };
                    reader.readAsDataURL(projectFile);
                } else {
                    saveToLocal();
                }
            } else {
                // Mode serveur (avec FormData pour supporter les téléversements physiques)
                const formData = new FormData();
                formData.append('title', title);
                formData.append('tags', tags);
                formData.append('description', description);

                if (compressedImage && compressedImage.blob) {
                    // Envoyer le fichier JPEG compressé de ~50Ko au lieu du fichier brut de 5Mo !
                    formData.append('imageFile', compressedImage.blob, 'project_image.jpg');
                } else {
                    formData.append('image_url', imageUrlInput.value);
                }

                const projectFile = projectFileInput.files[0];
                if (projectFile) {
                    formData.append('projectFile', projectFile);
                } else {
                    formData.append('link', projectLinkInput.value);
                }

                try {
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok) {
                        finalizeSubmission();
                    } else {
                        alert('Erreur lors du stockage du projet sur le serveur MySQL.');
                    }
                } catch (error) {
                    console.error('Erreur de requête POST:', error);
                    alert('Une erreur est survenue lors de l\'envoi vers le serveur.');
                }
            }
        });
    }

    function finalizeSubmission() {
        projectForm.reset();
        if (imagePreview) imagePreview.style.display = 'none';
        if (imageFileNameDisplay) imageFileNameDisplay.textContent = "Aucun fichier";
        if (projectFileNameDisplay) projectFileNameDisplay.textContent = "Aucun fichier";
        projectModal.classList.remove('active');
        loadProjects();
        showNotification("Projet stocké avec succès !");
    }

    // Supprimer un projet
    async function deleteProject(id) {
        if (useLocalStorage) {
            // Mode local storage
            let localProjects = JSON.parse(localStorage.getItem('portfolio_projects') || '[]');
            localProjects = localProjects.filter(p => p.id != id);
            localStorage.setItem('portfolio_projects', JSON.stringify(localProjects));
            loadProjects();
            showNotification("Projet local supprimé.");
        } else {
            // Mode serveur
            try {
                const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    loadProjects();
                    showNotification("Projet supprimé du serveur MySQL.");
                } else {
                    alert('Erreur lors de la suppression sur le serveur.');
                }
            } catch (error) {
                console.error('Erreur lors de la requête de suppression:', error);
            }
        }
    }

    // Modal UI Controls
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

    // Gestion du Formulaire de Contact Direct par E-mail
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            const message = document.getElementById('contactMessage').value;
            
            const subject = encodeURIComponent(`Nouveau message de ${name} - Portfolio`);
            const body = encodeURIComponent(`Bonjour Moussa,\n\nVous avez reçu un nouveau message depuis votre Portfolio.\n\nNom de l'expéditeur : ${name}\nE-mail de l'expéditeur : ${email}\n\nMessage :\n${message}\n\nCordialement,\n${name}`);
            
            const mailtoUrl = `mailto:kankanbayo627@mail.com?subject=${subject}&body=${body}`;
            
            // Lancer le client e-mail pré-rempli local
            window.location.href = mailtoUrl;
            
            // Vider les champs après l'envoi
            contactForm.reset();
        });
    }

    // Initialisation
    checkAdminAccess();
    loadProjects();

});
