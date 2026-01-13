/* =====================================================
   0G Storage - FAQ Accordion
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initAccordion();
});

/* ==================== Initialize Accordion ==================== */
function initAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (!question || !answer) return;

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other items (single open mode)
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    closeAccordionItem(otherItem);
                }
            });

            // Toggle current item
            if (isActive) {
                closeAccordionItem(item);
            } else {
                openAccordionItem(item);
            }
        });

        // Keyboard accessibility
        question.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            }
        });
    });
}

/* ==================== Open Accordion Item ==================== */
function openAccordionItem(item) {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = question.querySelector('i');

    item.classList.add('active');
    question.setAttribute('aria-expanded', 'true');

    // Animate height
    answer.style.maxHeight = answer.scrollHeight + 'px';

    // Change icon
    if (icon) {
        icon.classList.remove('fa-plus');
        icon.classList.add('fa-minus');
    }
}

/* ==================== Close Accordion Item ==================== */
function closeAccordionItem(item) {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = question.querySelector('i');

    item.classList.remove('active');
    question.setAttribute('aria-expanded', 'false');

    // Animate height
    answer.style.maxHeight = '0';

    // Change icon
    if (icon) {
        icon.classList.remove('fa-minus');
        icon.classList.add('fa-plus');
    }
}

/* ==================== Open All (Optional) ==================== */
function openAllAccordions() {
    document.querySelectorAll('.faq-item').forEach(item => {
        openAccordionItem(item);
    });
}

/* ==================== Close All (Optional) ==================== */
function closeAllAccordions() {
    document.querySelectorAll('.faq-item').forEach(item => {
        closeAccordionItem(item);
    });
}

// Export for external use
window.accordion = {
    openAll: openAllAccordions,
    closeAll: closeAllAccordions
};
