// Energy Certification Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initScrollAnimations();
    initBackToTop();
    initFormValidation();
    initSmoothScrolling();
});

// Navigation functionality
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav__link');

    // Mobile menu toggle
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navToggle.contains(event.target) || navMenu.contains(event.target);
        if (!isClickInsideNav && navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // Header background on scroll
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Back to top button functionality
function initBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });
    
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate on scroll
    const animateElements = document.querySelectorAll('.service-card, .intro__content, .contact__content, .info-item');
    animateElements.forEach(el => {
        observer.observe(el);
    });
    
    // Add CSS for animation states
    const style = document.createElement('style');
    style.textContent = `
        .service-card,
        .intro__content,
        .contact__content,
        .info-item {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease-out;
        }
        
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        .service-card:nth-child(1).animate-in { transition-delay: 0.1s; }
        .service-card:nth-child(2).animate-in { transition-delay: 0.2s; }
        .service-card:nth-child(3).animate-in { transition-delay: 0.3s; }
        .service-card:nth-child(4).animate-in { transition-delay: 0.4s; }
    `;
    document.head.appendChild(style);
}

// Form validation and handling
function initFormValidation() {
    const form = document.getElementById('contactForm');
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phone');
    const propertyTypeField = document.getElementById('propertyType');
    const propertySizeField = document.getElementById('propertySize');
    
    // Real-time validation
    nameField.addEventListener('blur', function() {
        validateName(this);
    });
    
    emailField.addEventListener('blur', function() {
        validateEmail(this);
    });
    
    phoneField.addEventListener('blur', function() {
        validatePhone(this);
    });
    
    propertySizeField.addEventListener('blur', function() {
        validatePropertySize(this);
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all fields
        const isNameValid = validateName(nameField);
        const isEmailValid = validateEmail(emailField);
        const isPhoneValid = validatePhone(phoneField);
        const isPropertySizeValid = validatePropertySize(propertySizeField);
        
        if (isNameValid && isEmailValid && isPhoneValid && isPropertySizeValid) {
            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Küldés...';
            submitButton.disabled = true;
            
            // Generate estimated price based on property details
            const estimatedPrice = calculateEstimatedPrice();
            if (estimatedPrice) {
                const hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = 'estimated_price';
                hiddenInput.value = estimatedPrice;
                form.appendChild(hiddenInput);
            }
            
            // Submit the form
            setTimeout(() => {
                form.submit();
            }, 500);
        } else {
            showMessage('Kérjük, javítsa ki a hibákat a form elküldése előtt.', 'error');
        }
    });
    
    // Auto-complete property size suggestion
    propertyTypeField.addEventListener('change', function() {
        const propertyType = this.value;
        const sizeField = propertySizeField;
        
        if (propertyType === 'Társasházi lakás') {
            sizeField.placeholder = 'pl. 65 m²';
        } else if (propertyType === 'Családi ház') {
            sizeField.placeholder = 'pl. 120 m²';
        } else {
            sizeField.placeholder = 'Ingatlan mérete m²-ben';
        }
    });
    
    // Price estimation display
    function updatePriceEstimation() {
        const propertyType = propertyTypeField.value;
        const propertySize = parseInt(propertySizeField.value);
        
        if (propertyType && propertySize && propertySize > 0) {
            const estimation = calculateEstimatedPrice();
            if (estimation) {
                showPriceEstimation(estimation);
            }
        }
    }
    
    propertyTypeField.addEventListener('change', updatePriceEstimation);
    propertySizeField.addEventListener('input', debounce(updatePriceEstimation, 500));
}

// Validation functions
function validateName(field) {
    const value = field.value.trim();
    if (value.length < 2) {
        showFieldError(field, 'A név legalább 2 karakter hosszú legyen.');
        return false;
    }
    clearFieldError(field);
    return true;
}

function validateEmail(field) {
    const value = field.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        showFieldError(field, 'Kérjük, adjon meg egy érvényes email címet.');
        return false;
    }
    clearFieldError(field);
    return true;
}

function validatePhone(field) {
    const value = field.value.trim();
    if (value && value.length > 0) {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,}$/;
        if (!phoneRegex.test(value)) {
            showFieldError(field, 'Kérjük, adjon meg egy érvényes telefonszámot.');
            return false;
        }
    }
    clearFieldError(field);
    return true;
}

function validatePropertySize(field) {
    const value = parseInt(field.value);
    if (field.value && (isNaN(value) || value < 1 || value > 2000)) {
        showFieldError(field, 'Az ingatlan mérete 1 és 2000 m² között legyen.');
        return false;
    }
    clearFieldError(field);
    return true;
}

// Error handling functions
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = 'var(--color-error)';
    errorDiv.style.fontSize = 'var(--font-size-sm)';
    errorDiv.style.marginTop = 'var(--space-4)';
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.padding = 'var(--space-12)';
    messageDiv.style.borderRadius = 'var(--radius-base)';
    messageDiv.style.marginBottom = 'var(--space-16)';
    messageDiv.style.fontWeight = 'var(--font-weight-medium)';
    
    if (type === 'error') {
        messageDiv.style.backgroundColor = 'rgba(var(--color-error-rgb), 0.1)';
        messageDiv.style.color = 'var(--color-error)';
        messageDiv.style.border = '1px solid rgba(var(--color-error-rgb), 0.3)';
    } else if (type === 'success') {
        messageDiv.style.backgroundColor = 'rgba(var(--color-success-rgb), 0.1)';
        messageDiv.style.color = 'var(--color-success)';
        messageDiv.style.border = '1px solid rgba(var(--color-success-rgb), 0.3)';
    }
    
    const form = document.getElementById('contactForm');
    form.insertBefore(messageDiv, form.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Price calculation
function calculateEstimatedPrice() {
    const propertyType = document.getElementById('propertyType').value;
    const propertySize = parseInt(document.getElementById('propertySize').value);
    
    if (!propertyType || !propertySize || propertySize <= 0) {
        return null;
    }
    
    let price = '';
    
    if (propertyType === 'Társasházi lakás') {
        if (propertySize < 80) {
            price = '25.000 Ft';
        } else if (propertySize <= 140) {
            price = '27.000 Ft';
        } else {
            price = '30.000+ Ft';
        }
    } else if (propertyType === 'Családi ház') {
        if (propertySize < 150) {
            price = '30.000 Ft';
        } else {
            price = 'Egyedi árazás';
        }
    } else {
        price = 'Egyedi árazás';
    }
    
    return price;
}

function showPriceEstimation(price) {
    // Remove existing estimation
    const existingEstimation = document.querySelector('.price-estimation');
    if (existingEstimation) {
        existingEstimation.remove();
    }
    
    const estimationDiv = document.createElement('div');
    estimationDiv.className = 'price-estimation';
    estimationDiv.innerHTML = `
        <div style="
            background-color: rgba(var(--color-success-rgb), 0.1);
            border: 1px solid rgba(var(--color-success-rgb), 0.3);
            border-radius: var(--radius-base);
            padding: var(--space-12);
            margin-top: var(--space-12);
            color: var(--color-success);
            font-weight: var(--font-weight-medium);
        ">
            💡 Becsült ár: <strong>${price}</strong>
        </div>
    `;
    
    const messageField = document.getElementById('message');
    messageField.parentNode.appendChild(estimationDiv);
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

// Additional interactive features
function initAdditionalFeatures() {
    // Add click-to-call functionality
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Track phone click (could be used for analytics)
            console.log('Phone number clicked:', this.href);
        });
    });
    
    // Add hover effects for service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            if (this.classList.contains('service-card--featured')) {
                this.style.transform = 'translateY(-8px) scale(1.05)';
            } else {
                this.style.transform = 'translateY(0) scale(1)';
            }
        });
    });
}

// Initialize additional features
document.addEventListener('DOMContentLoaded', function() {
    initAdditionalFeatures();
});

// Handle form submission success (if returning from FormSubmit)
window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        showMessage('Köszönjük üzenetét! Hamarosan felvesszük Önnel a kapcsolatot.', 'success');
        
        // Clear the form
        const form = document.getElementById('contactForm');
        if (form) {
            form.reset();
        }
        
        // Remove success parameter from URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});