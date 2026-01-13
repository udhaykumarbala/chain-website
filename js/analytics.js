/* =====================================================
   0G Storage - Google Analytics Tracking
   ===================================================== */

// Google Analytics Configuration
const GA_CONFIG = {
    measurementId: 'G-9EDXBFBC1K',
    enabled: true,
    debug: true // Set to true to log events to console
};

// Helper function to send events
function trackEvent(eventName, parameters = {}) {
    if (!GA_CONFIG.enabled) return;

    if (GA_CONFIG.debug) {
        console.log('GA Event:', eventName, parameters);
    }

    if (typeof gtag === 'function') {
        gtag('event', eventName, parameters);
    }
}

// ==================== Button Click Tracking ====================

function initButtonTracking() {
    // Track all CTA buttons
    document.querySelectorAll('.btn, .btn-hero-primary, .btn-hero-secondary, .btn-primary, .btn-secondary').forEach(button => {
        button.addEventListener('click', function(e) {
            const buttonText = this.textContent.trim();
            const buttonClass = this.className;
            const href = this.getAttribute('href') || 'no-href';
            const section = getParentSection(this);

            trackEvent('button_click', {
                button_text: buttonText,
                button_type: getButtonType(buttonClass),
                button_location: section,
                destination_url: href,
                event_category: 'engagement'
            });
        });
    });

    // Track navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            trackEvent('navigation_click', {
                link_text: this.textContent.trim(),
                link_url: this.getAttribute('href'),
                event_category: 'navigation'
            });
        });
    });

    // Track logo clicks
    document.querySelectorAll('.nav-logo, .footer-logo').forEach(logo => {
        logo.addEventListener('click', function(e) {
            trackEvent('logo_click', {
                logo_location: this.classList.contains('nav-logo') ? 'header' : 'footer',
                event_category: 'navigation'
            });
        });
    });

    // Track social media links
    document.querySelectorAll('.footer-social a').forEach(social => {
        social.addEventListener('click', function(e) {
            const platform = getSocialPlatform(this);
            trackEvent('social_click', {
                social_platform: platform,
                link_url: this.getAttribute('href'),
                event_category: 'social'
            });
        });
    });

    // Track footer links
    document.querySelectorAll('.footer-column a').forEach(link => {
        link.addEventListener('click', function(e) {
            const category = this.closest('.footer-column').querySelector('h4')?.textContent || 'unknown';
            trackEvent('footer_link_click', {
                link_text: this.textContent.trim(),
                link_category: category,
                link_url: this.getAttribute('href'),
                event_category: 'navigation'
            });
        });
    });
}

// ==================== Scroll Depth Tracking ====================

function initScrollTracking() {
    const scrollThresholds = [25, 50, 75, 100];
    const scrolledThresholds = new Set();

    function getScrollPercentage() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        return Math.round((scrollTop / docHeight) * 100);
    }

    function checkScrollDepth() {
        const scrollPercent = getScrollPercentage();

        scrollThresholds.forEach(threshold => {
            if (scrollPercent >= threshold && !scrolledThresholds.has(threshold)) {
                scrolledThresholds.add(threshold);
                trackEvent('scroll_depth', {
                    percent_scrolled: threshold,
                    event_category: 'engagement'
                });
            }
        });
    }

    // Throttle scroll events
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) return;
        scrollTimeout = setTimeout(function() {
            checkScrollDepth();
            scrollTimeout = null;
        }, 100);
    });
}

// ==================== Section Visibility Tracking ====================

function initSectionTracking() {
    const sections = document.querySelectorAll('section[id]');
    const viewedSections = new Set();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !viewedSections.has(entry.target.id)) {
                viewedSections.add(entry.target.id);
                trackEvent('section_view', {
                    section_id: entry.target.id,
                    section_name: getSectionName(entry.target.id),
                    event_category: 'engagement'
                });
            }
        });
    }, {
        threshold: 0.5 // 50% of section must be visible
    });

    sections.forEach(section => observer.observe(section));
}

// ==================== Form Interaction Tracking ====================

function initFormTracking() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    // Track form start (first field focus)
    let formStarted = false;
    contactForm.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('focus', function() {
            if (!formStarted) {
                formStarted = true;
                trackEvent('form_start', {
                    form_name: 'contact_form',
                    first_field: this.name || this.id,
                    event_category: 'form'
                });
            }
        });

        // Track field completion
        field.addEventListener('blur', function() {
            if (this.value.trim()) {
                trackEvent('form_field_complete', {
                    form_name: 'contact_form',
                    field_name: this.name || this.id,
                    event_category: 'form'
                });
            }
        });
    });

    // Track form submission
    contactForm.addEventListener('submit', function(e) {
        trackEvent('form_submit', {
            form_name: 'contact_form',
            event_category: 'form'
        });
    });

    // Track modal open
    const openModalBtn = document.getElementById('openContactModal');
    if (openModalBtn) {
        openModalBtn.addEventListener('click', function() {
            trackEvent('modal_open', {
                modal_name: 'contact_modal',
                event_category: 'engagement'
            });
        });
    }

    // Track modal close
    const closeModalBtns = document.querySelectorAll('#closeContactModal, #closeSuccessModal');
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            trackEvent('modal_close', {
                modal_name: 'contact_modal',
                event_category: 'engagement'
            });
        });
    });
}

// ==================== Outbound Link Tracking ====================

function initOutboundTracking() {
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        const href = link.getAttribute('href');
        // Check if it's an external link
        if (!href.includes(window.location.hostname)) {
            link.addEventListener('click', function(e) {
                trackEvent('outbound_click', {
                    link_url: href,
                    link_text: this.textContent.trim().substring(0, 100),
                    link_domain: new URL(href).hostname,
                    event_category: 'outbound'
                });
            });
        }
    });
}

// ==================== Time on Page Tracking ====================

function initTimeTracking() {
    const timeIntervals = [30, 60, 120, 300]; // seconds
    const trackedIntervals = new Set();
    let startTime = Date.now();

    setInterval(function() {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);

        timeIntervals.forEach(interval => {
            if (timeSpent >= interval && !trackedIntervals.has(interval)) {
                trackedIntervals.add(interval);
                trackEvent('time_on_page', {
                    seconds_on_page: interval,
                    event_category: 'engagement'
                });
            }
        });
    }, 5000); // Check every 5 seconds
}

// ==================== Accordion Tracking ====================

function initAccordionTracking() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', function() {
            const question = this.querySelector('.accordion-title')?.textContent.trim() || 'unknown';
            const isOpening = !this.closest('.accordion-item')?.classList.contains('active');

            trackEvent('accordion_toggle', {
                accordion_question: question.substring(0, 100),
                action: isOpening ? 'open' : 'close',
                event_category: 'engagement'
            });
        });
    });
}

// ==================== Page Load Tracking ====================

function trackPageLoad() {
    // Track page view with custom dimensions
    trackEvent('page_view_enhanced', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
        referrer: document.referrer || 'direct',
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        event_category: 'page'
    });

    // Track performance metrics
    if (window.performance) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    trackEvent('page_performance', {
                        load_time: Math.round(perfData.loadEventEnd - perfData.startTime),
                        dom_interactive: Math.round(perfData.domInteractive - perfData.startTime),
                        dom_complete: Math.round(perfData.domComplete - perfData.startTime),
                        event_category: 'performance'
                    });
                }
            }, 0);
        });
    }
}

// ==================== Helper Functions ====================

function getParentSection(element) {
    const section = element.closest('section');
    if (section && section.id) {
        return section.id;
    }
    if (element.closest('.navbar')) return 'navbar';
    if (element.closest('.footer')) return 'footer';
    if (element.closest('.modal')) return 'modal';
    return 'unknown';
}

function getButtonType(className) {
    if (className.includes('hero-primary')) return 'hero_primary';
    if (className.includes('hero-secondary')) return 'hero_secondary';
    if (className.includes('btn-primary')) return 'primary';
    if (className.includes('btn-secondary')) return 'secondary';
    if (className.includes('btn-tertiary')) return 'tertiary';
    return 'default';
}

function getSocialPlatform(element) {
    const href = element.getAttribute('href') || '';
    if (href.includes('twitter') || href.includes('x.com')) return 'twitter';
    if (href.includes('discord')) return 'discord';
    if (href.includes('github')) return 'github';
    if (href.includes('linkedin')) return 'linkedin';
    if (href.includes('telegram')) return 'telegram';
    return 'unknown';
}

function getSectionName(sectionId) {
    const sectionNames = {
        'hero': 'Hero',
        'problem': 'Problem Statement',
        'features': 'Features',
        'architecture': 'Architecture',
        'analytics': 'Analytics',
        'use-cases': 'Use Cases',
        'get-started': 'Get Started',
        'faq': 'FAQ'
    };
    return sectionNames[sectionId] || sectionId;
}

// ==================== Initialize All Tracking ====================

function initAnalytics() {
    if (!GA_CONFIG.enabled) {
        console.log('Google Analytics tracking is disabled');
        return;
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupTracking);
    } else {
        setupTracking();
    }
}

function setupTracking() {
    trackPageLoad();
    initButtonTracking();
    initScrollTracking();
    initSectionTracking();
    initFormTracking();
    initOutboundTracking();
    initTimeTracking();
    initAccordionTracking();

    if (GA_CONFIG.debug) {
        console.log('Google Analytics tracking initialized');
    }
}

// Initialize
initAnalytics();
