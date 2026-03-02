/* ============================================
   DotaT B2B — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // --- Navbar scroll effect ---
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        const scrollThreshold = 50;
        const onScroll = () => {
            if (window.scrollY > scrollThreshold) {
                navbar.classList.add('navbar--scrolled');
            } else {
                navbar.classList.remove('navbar--scrolled');
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // run on load
    }

    // --- Mobile menu toggle ---
    const toggle = document.querySelector('.navbar__toggle');
    const navLinks = document.querySelector('.navbar__links');
    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('navbar__links--open');
            toggle.setAttribute('aria-expanded',
                navLinks.classList.contains('navbar__links--open') ? 'true' : 'false'
            );
        });
        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('navbar__links--open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // --- Intersection Observer for fade-in animations ---
    const animatedElements = document.querySelectorAll('[data-animate]');
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        animatedElements.forEach(el => observer.observe(el));
    }

});
