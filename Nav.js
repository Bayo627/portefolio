// Navigation Logic for Mobile
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
            toggle.classList.toggle('active');
            
            // Toggle Icon (menu vs close)
            const icon = toggle.querySelector('.material-symbols-outlined');
            if (icon) {
                icon.textContent = navLinks.classList.contains('mobile-active') ? 'close' : 'menu';
            }

            // Prevent scroll when menu is open
            if (navLinks.classList.contains('mobile-active')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        });

        // Close menu when a link is clicked
        const links = navLinks.querySelectorAll('.nav-link');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('mobile-active');
                toggle.classList.remove('active');
                const icon = toggle.querySelector('.material-symbols-outlined');
                if (icon) icon.textContent = 'menu';
                body.style.overflow = '';
            });
        });
    }
});
