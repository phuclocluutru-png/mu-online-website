// Main JavaScript for MU Online Website

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeWebsite();
});

// Initialize all website functionality
function initializeWebsite() {
    initNavigation();
    initHeroAnimations();
    initStatCounters();
    initScrollEffects();
    initBackToTop();
    initLoadingScreen();
    initClassCards();
    initNewsCards();
    initSmoothScrolling();
    initParallaxEffects();
}

// Navigation functionality
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // Header background on scroll
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 100) {
                header.style.background = 'rgba(10, 10, 10, 0.98)';
            } else {
                header.style.background = 'rgba(10, 10, 10, 0.95)';
            }
        });
    }
}

// Hero section animations
function initHeroAnimations() {
    const heroTitle = document.querySelector('.hero-title');
    const heroDescription = document.querySelector('.hero-description');
    const heroButtons = document.querySelector('.hero-buttons');
    const heroStats = document.querySelector('.hero-stats');

    // Add animation classes with delays
    setTimeout(() => {
        if (heroTitle) heroTitle.classList.add('fade-in-up');
    }, 300);

    setTimeout(() => {
        if (heroDescription) heroDescription.classList.add('fade-in-up');
    }, 600);

    setTimeout(() => {
        if (heroButtons) heroButtons.classList.add('fade-in-up');
    }, 900);

    setTimeout(() => {
        if (heroStats) heroStats.classList.add('fade-in-up');
    }, 1200);
}

// Animated counters for statistics
function initStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    let hasAnimated = false;

    function animateCounters() {
        if (hasAnimated) return;

        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                stat.textContent = Math.floor(current).toLocaleString();
            }, 16);
        });

        hasAnimated = true;
    }

    // Trigger animation when stats come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        observer.observe(statsSection);
    }
}

// Scroll effects for sections
function initScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observe all sections
    const sections = document.querySelectorAll('.classes-section, .news-section, .download-section, .register-section');
    sections.forEach(section => {
        observer.observe(section);
    });

    // Observe individual cards
    const cards = document.querySelectorAll('.class-card, .news-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        observer.observe(card);
    });
}

// Back to top button
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');

    if (backToTopBtn) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Loading screen
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');

    if (loadingScreen) {
        // Simulate loading progress
        const progressBar = document.querySelector('.loading-progress');
        let progress = 0;

        const loadingInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadingInterval);

                // Hide loading screen after completion
                setTimeout(() => {
                    loadingScreen.style.opacity = '0';
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                    }, 500);
                }, 500);
            }

            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
        }, 100);
    }
}

// Character class cards interactions
function initClassCards() {
    const classCards = document.querySelectorAll('.class-card');

    classCards.forEach(card => {
        // Animate stat bars when card is hovered
        card.addEventListener('mouseenter', function () {
            const statFills = card.querySelectorAll('.stat-fill');
            statFills.forEach((fill, index) => {
                setTimeout(() => {
                    fill.style.transform = 'scaleX(1)';
                }, index * 100);
            });
        });

        // Add click effect
        card.addEventListener('click', function () {
            const className = card.getAttribute('data-class');
            showClassInfo(className);
        });
    });
}

// Show class information modal (placeholder)
function showClassInfo(className) {
    // This would typically open a modal with detailed class information
    console.log(`Showing info for: ${className}`);

    // For now, just show an alert
    const classNames = {
        'dark-knight': 'Dark Knight',
        'dark-wizard': 'Dark Wizard',
        'fairy-elf': 'Fairy Elf',
        'magic-gladiator': 'Magic Gladiator'
    };

    alert(`Thông tin về ${classNames[className]} sẽ được hiển thị ở đây!`);
}

// News cards interactions
function initNewsCards() {
    const newsCards = document.querySelectorAll('.news-card');

    newsCards.forEach(card => {
        card.addEventListener('click', function (e) {
            // Prevent default if clicking on a link
            if (e.target.tagName === 'A') return;

            // Add click animation
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        });
    });
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Parallax effects
function initParallaxEffects() {
    const heroVideo = document.querySelector('.hero-video video');

    if (heroVideo) {
        window.addEventListener('scroll', function () {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;

            heroVideo.style.transform = `translateY(${parallax}px)`;
        });
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Error handling
window.addEventListener('error', function (e) {
    console.error('JavaScript Error:', e.error);
});

// Resize handler
window.addEventListener('resize', debounce(function () {
    // Handle resize events
    const isMobile = window.innerWidth <= 768;
    document.body.classList.toggle('mobile', isMobile);
}, 250));

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', function () {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart + 'ms');
        }, 0);
    });
}

// Service Worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        // Service worker would be registered here
        // navigator.serviceWorker.register('/sw.js');
    });
}
