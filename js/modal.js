/* =====================================================
   0G Storage - Contact Modal & HubSpot Integration
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initContactModal();
});

/* ==================== HubSpot Configuration ==================== */
// Replace these with your actual HubSpot portal ID and form GUID
const HUBSPOT_CONFIG = {
    portalId: 'YOUR_PORTAL_ID',      // e.g., '12345678'
    formGuid: 'YOUR_FORM_GUID',      // e.g., 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
    enabled: false                    // Set to true when HubSpot is configured
};

/* ==================== Initialize Modal ==================== */
function initContactModal() {
    const modal = document.getElementById('contactModal');
    const openBtn = document.getElementById('openContactModal');
    const closeBtn = document.getElementById('closeContactModal');
    const closeSuccessBtn = document.getElementById('closeSuccessModal');
    const form = document.getElementById('contactForm');

    if (!modal || !openBtn) return;

    // Open modal
    openBtn.addEventListener('click', () => {
        openModal(modal);
    });

    // Close modal - close button
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeModal(modal);
        });
    }

    // Close modal - success button
    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', () => {
            closeModal(modal);
            resetForm();
        });
    }

    // Close modal - click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });

    // Close modal - escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal(modal);
        }
    });

    // Form submission
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

/* ==================== Open Modal ==================== */
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus first input
    setTimeout(() => {
        const firstInput = modal.querySelector('input');
        if (firstInput) firstInput.focus();
    }, 100);
}

/* ==================== Close Modal ==================== */
function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

/* ==================== Reset Form ==================== */
function resetForm() {
    const form = document.getElementById('contactForm');
    const successEl = document.getElementById('contactSuccess');

    if (form) {
        form.reset();
        form.style.display = '';
    }

    if (successEl) {
        successEl.style.display = 'none';
    }

    // Remove any error states
    document.querySelectorAll('.form-group.error').forEach(el => {
        el.classList.remove('error');
    });
    document.querySelectorAll('.form-error').forEach(el => {
        el.remove();
    });
}

/* ==================== Handle Form Submit ==================== */
async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = document.getElementById('contactSubmit');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    // Validate form
    if (!validateForm(form)) {
        return;
    }

    // Show loading state
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
    submitBtn.disabled = true;

    // Collect form data
    const formData = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        company: form.company.value.trim(),
        role: form.role.value,
        interest: form.interest.value,
        message: form.message.value.trim()
    };

    try {
        if (HUBSPOT_CONFIG.enabled) {
            // Submit to HubSpot
            await submitToHubSpot(formData);
        } else {
            // Simulate API call for demo
            await simulateSubmission();
        }

        // Show success state
        showSuccess();

    } catch (error) {
        console.error('Form submission error:', error);
        showError('Something went wrong. Please try again or email us directly.');
    } finally {
        // Reset button state
        btnText.style.display = '';
        btnLoading.style.display = 'none';
        submitBtn.disabled = false;
    }
}

/* ==================== Validate Form ==================== */
function validateForm(form) {
    let isValid = true;

    // Clear previous errors
    document.querySelectorAll('.form-group.error').forEach(el => {
        el.classList.remove('error');
    });
    document.querySelectorAll('.form-error').forEach(el => {
        el.remove();
    });

    // Required fields
    const requiredFields = ['name', 'email', 'company', 'message'];

    requiredFields.forEach(fieldName => {
        const field = form[fieldName];
        if (!field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
        }
    });

    // Email validation
    const emailField = form.email;
    if (emailField.value && !isValidEmail(emailField.value)) {
        showFieldError(emailField, 'Please enter a valid email address');
        isValid = false;
    }

    return isValid;
}

/* ==================== Show Field Error ==================== */
function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    formGroup.classList.add('error');

    const errorEl = document.createElement('span');
    errorEl.className = 'form-error';
    errorEl.textContent = message;
    formGroup.appendChild(errorEl);
}

/* ==================== Email Validation ==================== */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ==================== Submit to HubSpot ==================== */
async function submitToHubSpot(formData) {
    const hubspotData = {
        fields: [
            { name: 'firstname', value: formData.name.split(' ')[0] },
            { name: 'lastname', value: formData.name.split(' ').slice(1).join(' ') || '' },
            { name: 'email', value: formData.email },
            { name: 'company', value: formData.company },
            { name: 'jobtitle', value: formData.role },
            { name: 'interest_area', value: formData.interest },  // Custom property
            { name: 'message', value: formData.message }
        ],
        context: {
            pageUri: window.location.href,
            pageName: document.title
        }
    };

    const response = await fetch(
        `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_CONFIG.portalId}/${HUBSPOT_CONFIG.formGuid}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(hubspotData)
        }
    );

    if (!response.ok) {
        throw new Error('HubSpot submission failed');
    }

    return response.json();
}

/* ==================== Simulate Submission (Demo) ==================== */
function simulateSubmission() {
    return new Promise((resolve) => {
        setTimeout(resolve, 1500);
    });
}

/* ==================== Show Success ==================== */
function showSuccess() {
    const form = document.getElementById('contactForm');
    const successEl = document.getElementById('contactSuccess');

    if (form) form.style.display = 'none';
    if (successEl) successEl.style.display = 'block';
}

/* ==================== Show Error ==================== */
function showError(message) {
    // You could show a toast notification here
    alert(message);
}

// Export for external use
window.contactModal = {
    open: () => openModal(document.getElementById('contactModal')),
    close: () => closeModal(document.getElementById('contactModal')),
    reset: resetForm
};
