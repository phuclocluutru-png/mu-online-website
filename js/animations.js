// Advanced animations for MU Online Website

// Animation utilities
const AnimationUtils = {
    // Easing functions
    easing: {
        easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeOut: t => 1 - Math.pow(1 - t, 3),
        easeIn: t => t * t * t,
        bounce: t => {
            if (t < 1 / 2.75) {
                return 7.5625 * t * t;
            } else if (t < 2 / 2.75) {
                return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
            } else if (t < 2.5 / 2.75) {
                return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
            } else {
                return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
            }
        }
    },

    // Animate number counting
    animateNumber: function (element, start, end, duration = 2000, easing = this.easing.easeOut) {
        const startTime = performance.now();

        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easing(progress);

            const current = start + (end - start) * easedProgress;
            element.textContent = Math.floor(current).toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        }

        requestAnimationFrame(updateNumber);
    },

    // Stagger animation for multiple elements
    staggerAnimation: function (elements, animationClass, delay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add(animationClass);
            }, index * delay);
        });
    },

    // Create floating particles
    createParticles: function (container, count = 50) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(255, 107, 53, 0.7);
                border-radius: 50%;
                pointer-events: none;
                animation: float ${5 + Math.random() * 10}s infinite linear;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 5}s;
            `;
            container.appendChild(particle);
        }
    }
};

// Advanced scroll animations
class ScrollAnimations {
    constructor() {
        this.observers = new Map();
        this.init();
    }

    init() {
        this.createObservers();
        this.initParallaxElements();
        this.initRevealAnimations();
        this.initCounterAnimations();
    }

    createObservers() {
        // Standard reveal observer
        this.observers.set('reveal', new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        }));

        // Counter animation observer
        this.observers.set('counter', new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    this.animateCounter(entry.target);
                    entry.target.dataset.animated = 'true';
                }
            });
        }, {
            threshold: 0.5
        }));
    }

    initRevealAnimations() {
        // Add reveal animations to elements
        const revealElements = document.querySelectorAll('.class-card, .news-card, .download-btn');

        revealElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'all 0.6s ease';
            element.style.transitionDelay = `${index * 0.1}s`;

            this.observers.get('reveal').observe(element);
        });

        // Add revealed class styles
        const style = document.createElement('style');
        style.textContent = `
            .revealed {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }

    initCounterAnimations() {
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            this.observers.get('counter').observe(counter);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target')) || 0;
        AnimationUtils.animateNumber(element, 0, target, 2000);
    }

    initParallaxElements() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');

        window.addEventListener('scroll', throttle(() => {
            const scrollTop = window.pageYOffset;

            parallaxElements.forEach(element => {
                const speed = element.dataset.parallax || 0.5;
                const yPos = -(scrollTop * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        }, 16));
    }
}

// Advanced button animations
class ButtonAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.addRippleEffect();
        this.addHoverEffects();
        this.addClickEffects();
    }

    addRippleEffect() {
        const buttons = document.querySelectorAll('.btn');

        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;

                button.style.position = 'relative';
                button.style.overflow = 'hidden';
                button.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // Add ripple animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    addHoverEffects() {
        const cards = document.querySelectorAll('.class-card, .news-card');

        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    addClickEffects() {
        const downloadBtns = document.querySelectorAll('.download-btn');

        downloadBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();

                // Add click animation
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 150);

                // Show download progress simulation
                this.simulateDownload(btn);
            });
        });
    }

    simulateDownload(button) {
        const originalText = button.innerHTML;
        const progressBar = document.createElement('div');

        progressBar.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            transition: width 0.1s ease;
            width: 0%;
        `;

        button.style.position = 'relative';
        button.appendChild(progressBar);

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            progressBar.style.width = Math.min(progress, 100) + '%';

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    progressBar.remove();
                    button.innerHTML = '<i class="fas fa-check"></i> Tải Thành Công!';
                    setTimeout(() => {
                        button.innerHTML = originalText;
                    }, 2000);
                }, 500);
            }
        }, 100);
    }
}

// Particle system for background effects
class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
        this.init();
    }

    init() {
        this.createParticles();
        this.animate();
    }

    createParticles() {
        const particleCount = Math.min(50, Math.floor(window.innerWidth / 30));

        for (let i = 0; i < particleCount; i++) {
            const particle = {
                element: this.createElement(),
                x: Math.random() * this.container.offsetWidth,
                y: Math.random() * this.container.offsetHeight,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                life: Math.random() * 100,
                maxLife: 100 + Math.random() * 100
            };

            this.particles.push(particle);
            this.container.appendChild(particle.element);
        }
    }

    createElement() {
        const element = document.createElement('div');
        element.className = 'particle';
        element.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(255, 107, 53, 0.3);
            border-radius: 50%;
            pointer-events: none;
            transition: opacity 0.3s ease;
        `;
        return element;
    }

    animate() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life++;

            // Wrap around edges
            if (particle.x < 0) particle.x = this.container.offsetWidth;
            if (particle.x > this.container.offsetWidth) particle.x = 0;
            if (particle.y < 0) particle.y = this.container.offsetHeight;
            if (particle.y > this.container.offsetHeight) particle.y = 0;

            // Update opacity based on life
            const opacity = 1 - (particle.life / particle.maxLife);
            particle.element.style.opacity = Math.max(0, opacity);

            // Reset particle if life ended
            if (particle.life >= particle.maxLife) {
                particle.life = 0;
                particle.x = Math.random() * this.container.offsetWidth;
                particle.y = Math.random() * this.container.offsetHeight;
            }

            // Update position
            particle.element.style.left = particle.x + 'px';
            particle.element.style.top = particle.y + 'px';
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Text animation effects
class TextAnimations {
    static typewriter(element, text, speed = 50) {
        element.textContent = '';
        let i = 0;

        const timer = setInterval(() => {
            element.textContent += text.charAt(i);
            i++;

            if (i >= text.length) {
                clearInterval(timer);
            }
        }, speed);
    }

    static glitch(element, duration = 1000) {
        const originalText = element.textContent;
        const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        const interval = setInterval(() => {
            element.textContent = originalText
                .split('')
                .map(char => Math.random() < 0.1 ? chars[Math.floor(Math.random() * chars.length)] : char)
                .join('');
        }, 50);

        setTimeout(() => {
            clearInterval(interval);
            element.textContent = originalText;
        }, duration);
    }
}

// Initialize all animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Initialize animation systems
    new ScrollAnimations();
    new ButtonAnimations();

    // Add particles to hero section
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        new ParticleSystem(heroSection);
    }

    // Add floating animation styles
    const floatStyles = document.createElement('style');
    floatStyles.textContent = `
        @keyframes float {
            0%, 100% {
                transform: translateY(0) rotate(0deg);
                opacity: 0;
            }
            10%, 90% {
                opacity: 1;
            }
            50% {
                transform: translateY(-20px) rotate(180deg);
            }
        }
        
        @keyframes pulse-glow {
            0%, 100% {
                box-shadow: 0 0 5px rgba(255, 107, 53, 0.5);
            }
            50% {
                box-shadow: 0 0 20px rgba(255, 107, 53, 0.8), 0 0 30px rgba(255, 107, 53, 0.6);
            }
        }
        
        .pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
        }
    `;
    document.head.appendChild(floatStyles);

    // Add pulse glow to important buttons
    const primaryBtns = document.querySelectorAll('.btn-primary');
    primaryBtns.forEach(btn => btn.classList.add('pulse-glow'));
});

// Utility function for throttling
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
