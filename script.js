document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');

    // Function to update theme across the site
    function setTheme(theme) {
        // Validate theme
        theme = theme === 'light' ? 'light' : 'dark';

        // Update DOM
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);

        // Update icon
        if (themeIcon) {
            if (theme === 'dark') {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        }

        // Save preference
        localStorage.setItem('theme', theme);
    }

    // Get current theme
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';

    // Ensure icon matches current theme
    setTheme(currentTheme);

    // Theme toggle click handler
    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    // Navigation functionality
    const navToggle = document.querySelector('.nav-toggle');
    const navUl = document.querySelector('nav ul');
    const menuIcon = navToggle.querySelector('i');
    const menuItems = document.querySelectorAll('nav ul li');
    let isMenuOpen = false;

    // Function to handle smooth scrolling
    function scrollToSection(targetId) {
        const targetSection = document.querySelector(targetId);
        if (!targetSection) return;

        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPosition = targetSection.offsetTop - headerHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    function toggleMenu(forceClose = false) {
        if (forceClose) {
            isMenuOpen = false;
        } else {
            isMenuOpen = !isMenuOpen;
        }

        // Toggle menu visibility and animation
        navUl.classList.toggle('active', isMenuOpen);
        navToggle.setAttribute('aria-expanded', isMenuOpen);
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';

        // Animate menu items
        menuItems.forEach((item, index) => {
            if (isMenuOpen) {
                item.style.transitionDelay = `${index * 0.1}s`;
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            } else {
                item.style.transitionDelay = '0s';
                item.style.opacity = '0';
                item.style.transform = 'translateY(-20px)';
            }
        });

        // Update hamburger icon
        if (menuIcon) {
            menuIcon.className = isMenuOpen ? 'fas fa-times' : 'fas fa-bars';
        }
    }

    // Handle navigation click events
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');

            // First close the menu if it's open
            if (isMenuOpen) {
                toggleMenu(true);
            }

            // Wait for menu animation to complete before scrolling
            setTimeout(() => {
                scrollToSection(targetId);
            }, isMenuOpen ? 300 : 0);
        });
    });

    // Toggle menu button click handler
    navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !navUl.contains(e.target) && !navToggle.contains(e.target)) {
            toggleMenu(true);
        }
    });

    // Close menu on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && isMenuOpen) {
            toggleMenu(true);
        }
    });

    // Handle initial hash in URL
    if (window.location.hash) {
        setTimeout(() => {
            scrollToSection(window.location.hash);
        }, 0);
    }
});