document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    document.body.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }
    
    themeToggle.addEventListener('click', () => {
        let newTheme = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
        } else {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
        }
    });
    
    const scrollElements = document.querySelectorAll('.animate-on-scroll');
    const elementObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    scrollElements.forEach(el => elementObserver.observe(el));

    const navToggle = document.querySelector('.nav-toggle');
    const navUl = document.querySelector('nav ul');
    navToggle.addEventListener('click', function() {
        navUl.classList.toggle('open');
    });

    document.querySelectorAll('nav ul a').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelector('nav ul').classList.remove('open');
        });
    });
});