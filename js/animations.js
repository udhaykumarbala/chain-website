/* =====================================================
   0G Storage - Scroll Animations
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initParallaxEffects();
});

/* ==================== Intersection Observer for Scroll Animations ==================== */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Stagger children animations
                const children = entry.target.querySelectorAll('.animate-on-scroll');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('visible');
                    }, index * 100);
                });

                // Optionally unobserve after animation
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with animate-on-scroll class
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // Observe section headers
    document.querySelectorAll('.section-header').forEach(el => {
        observer.observe(el);
    });
}

/* ==================== Parallax Effects ==================== */
function initParallaxEffects() {
    const gradientOrbs = document.querySelectorAll('.gradient-orb');

    if (gradientOrbs.length === 0) return;

    // Only apply parallax on desktop
    if (window.matchMedia('(min-width: 1024px)').matches) {
        window.addEventListener('scroll', window.utils.throttle(() => {
            const scrollY = window.pageYOffset;

            gradientOrbs.forEach((orb, index) => {
                const speed = 0.1 + (index * 0.05);
                orb.style.transform = `translateY(${scrollY * speed}px)`;
            });
        }, 16));
    }
}

/* ==================== Counter Animation ==================== */
function animateCounter(element, start, end, duration = 2000, decimals = 0) {
    const startTime = performance.now();
    const difference = end - start;

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (easeOutExpo)
        const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

        const currentValue = start + (difference * easeOutExpo);
        element.textContent = currentValue.toFixed(decimals);

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.classList.add('counting');
            setTimeout(() => element.classList.remove('counting'), 300);
        }
    }

    requestAnimationFrame(updateCounter);
}

/* ==================== Typing Effect ==================== */
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

/* ==================== Stagger Animation Helper ==================== */
function staggerAnimation(elements, animationClass, delay = 100) {
    elements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add(animationClass);
        }, index * delay);
    });
}

// Export animation utilities
window.animations = {
    animateCounter,
    typeWriter,
    staggerAnimation
};
