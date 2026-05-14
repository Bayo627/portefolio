// Mobile Menu Toggle Logic
document.addEventListener('DOMContentLoaded', () => {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            // This is a placeholder for actual mobile menu logic
            // You can add a class like 'active' to navLinks and style it in CSS
            console.log('Mobile menu toggled');
        });
    }
});
