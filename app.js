// Energy Certification Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initScrollAnimations();
    initBackToTop();
    initFormValidation();
    initSmoothScrolling();
});

// Navigation functionality
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu   = document.getElementById('navMenu');
    const navLinks  = document.querySelectorAll('.nav__link');
    const header    = document.querySelector('.header');

    // Mobil: add dropdown class
    function applyMobileClass() {
        if (window.innerWidth <= 768) {
            navMenu.classList.add('nav__menu--mobile-dropdown');
        } else {
            navMenu.classList.remove('nav__menu--mobile-dropdown', 'active');
            navToggle.classList.remove('active');
        }
    }
    applyMobileClass();
    window.addEventListener('resize', applyMobileClass);

    // Igazítja a menü pozícióját a fejléchez
    function alignMenuToHeader() {
        if (window.innerWidth > 768) return;
        const rect = header.getBoundingClientRect();
        navMenu.style.top    = (rect.bottom + 8) + 'px';
        navMenu.style.left   = rect.left + 'px';
        navMenu.style.right  = (window.innerWidth - rect.right) + 'px';
        navMenu.style.width  = 'auto';
        // Lekerekítés: scrolled állapotban kerekített
        const br = window.getComputedStyle(header).borderRadius;
        navMenu.style.borderRadius = (br && br !== '0px') ? br : '12px';
    }

    navToggle.addEventListener('click', function() {
        const isOpen = navMenu.classList.contains('active');
        if (!isOpen) alignMenuToHeader();
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Frissíti pozíciót görgetéskor (ha nyitva van)
    window.addEventListener('scroll', function() {
        if (navMenu.classList.contains('active')) alignMenuToHeader();
    }, { passive: true });

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    document.addEventListener('click', function(event) {
        const isInside = navToggle.contains(event.target) || navMenu.contains(event.target);
        if (!isInside && navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                window.scrollTo({ top: targetSection.offsetTop - headerHeight, behavior: 'smooth' });
            }
        });
    });
}

function initBackToTop() {
    const btn = document.getElementById('backToTop');
    window.addEventListener('scroll', function() {
        btn.classList.toggle('show', window.pageYOffset > 300);
    });
    btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function initScrollAnimations() {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('animate-in');
        });
    }, observerOptions);
    document.querySelectorAll('.service-card, .intro__content, .contact__content, .info-item').forEach(el => observer.observe(el));
    const style = document.createElement('style');
    style.textContent = `
        .service-card,.intro__content,.contact__content,.info-item {
            opacity:0;transform:translateY(30px);transition:all 0.6s ease-out;
        }
        .animate-in{opacity:1!important;transform:translateY(0)!important;}
        .service-card:nth-child(1).animate-in{transition-delay:0.1s;}
        .service-card:nth-child(2).animate-in{transition-delay:0.2s;}
        .service-card:nth-child(3).animate-in{transition-delay:0.3s;}
        .service-card:nth-child(4).animate-in{transition-delay:0.4s;}
    `;
    document.head.appendChild(style);
}

function initFormValidation() {
    const form              = document.getElementById('contactForm');
    const nameField         = document.getElementById('name');
    const emailField        = document.getElementById('email');
    const phoneField        = document.getElementById('phone');
    const propertyTypeField = document.getElementById('propertyType');
    const propertySizeField = document.getElementById('propertySize');

    nameField.addEventListener('blur',         () => validateName(nameField));
    emailField.addEventListener('blur',        () => validateEmail(emailField));
    phoneField.addEventListener('blur',        () => validatePhone(phoneField));
    propertySizeField.addEventListener('blur', () => validatePropertySize(propertySizeField));

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const ok = validateName(nameField) & validateEmail(emailField) & validatePhone(phoneField) & validatePropertySize(propertySizeField);
        if (ok) {
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.textContent = 'Küldés...';
            submitButton.disabled = true;
            const ep = calculateEstimatedPrice();
            if (ep) {
                const h = document.createElement('input');
                h.type = 'hidden'; h.name = 'estimated_price'; h.value = ep;
                form.appendChild(h);
            }
            setTimeout(() => form.submit(), 500);
        } else {
            showMessage('Kérjük, javítsa ki a hibákat a form elküldése előtt.', 'error');
        }
    });

    propertyTypeField.addEventListener('change', function() {
        const t = this.value;
        propertySizeField.placeholder = t === 'Társasházi lakás' ? 'pl. 65 m²' : t === 'Családi ház' ? 'pl. 120 m²' : 'Ingatlan mérete m²-ben';
        updatePriceEstimation();
    });
    propertySizeField.addEventListener('input', debounce(updatePriceEstimation, 500));

    function updatePriceEstimation() {
        const t = propertyTypeField.value;
        const s = parseInt(propertySizeField.value);
        if (t && s && s > 0) { const e = calculateEstimatedPrice(); if (e) showPriceEstimation(e); }
    }
}

function validateName(field) {
    if (field.value.trim().length < 2) { showFieldError(field, 'A név legalább 2 karakter hosszú legyen.'); return false; }
    clearFieldError(field); return true;
}
function validateEmail(field) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) { showFieldError(field, 'Kérjük, adjon meg egy érvényes email címet.'); return false; }
    clearFieldError(field); return true;
}
function validatePhone(field) {
    if (field.value.trim() && !/^[\+]?[\d\s\-\(\)]{8,}$/.test(field.value.trim())) { showFieldError(field, 'Kérjük, adjon meg egy érvényes telefonszámot.'); return false; }
    clearFieldError(field); return true;
}
function validatePropertySize(field) {
    const v = parseInt(field.value);
    if (field.value && (isNaN(v) || v < 1 || v > 2000)) { showFieldError(field, 'Az ingatlan mérete 1 és 2000 m² között legyen.'); return false; }
    clearFieldError(field); return true;
}

function showFieldError(field, message) {
    clearFieldError(field);
    field.classList.add('error');
    const d = document.createElement('div');
    d.className = 'field-error';
    d.textContent = message;
    d.style.cssText = 'color:var(--color-error);font-size:var(--font-size-sm);margin-top:var(--space-4)';
    field.parentNode.appendChild(d);
}
function clearFieldError(field) {
    field.classList.remove('error');
    const e = field.parentNode.querySelector('.field-error');
    if (e) e.remove();
}
function showMessage(message, type) {
    const ex = document.querySelector('.form-message');
    if (ex) ex.remove();
    const d = document.createElement('div');
    d.className = 'form-message ' + type;
    d.textContent = message;
    d.style.cssText = 'padding:var(--space-12);border-radius:var(--radius-base);margin-bottom:var(--space-16);font-weight:var(--font-weight-medium);';
    if (type === 'error')   d.style.cssText += 'background:rgba(var(--color-error-rgb),0.1);color:var(--color-error);border:1px solid rgba(var(--color-error-rgb),0.3)';
    if (type === 'success') d.style.cssText += 'background:rgba(var(--color-success-rgb),0.1);color:var(--color-success);border:1px solid rgba(var(--color-success-rgb),0.3)';
    const form = document.getElementById('contactForm');
    form.insertBefore(d, form.firstChild);
    setTimeout(() => { if (d.parentNode) d.remove(); }, 5000);
}

function calculateEstimatedPrice() {
    const t = document.getElementById('propertyType').value;
    const s = parseInt(document.getElementById('propertySize').value);
    if (!t || !s || s <= 0) return null;
    if (t === 'Társasházi lakás') return s < 80 ? '25.000 Ft' : s <= 140 ? '27.000 Ft' : '30.000+ Ft';
    if (t === 'Családi ház')     return s < 150 ? '30.000 Ft' : 'Egyedi árazás';
    return 'Egyedi árazás';
}
function showPriceEstimation(price) {
    const ex = document.querySelector('.price-estimation');
    if (ex) ex.remove();
    const d = document.createElement('div');
    d.className = 'price-estimation';
    d.innerHTML = `<div style="background:rgba(var(--color-success-rgb),0.1);border:1px solid rgba(var(--color-success-rgb),0.3);border-radius:var(--radius-base);padding:var(--space-12);margin-top:var(--space-12);color:var(--color-success);font-weight:var(--font-weight-medium);">💡 Becsült ár: <strong>${price}</strong></div>`;
    document.getElementById('message').parentNode.appendChild(d);
}

function debounce(func, wait) {
    let t;
    return function(...args) { clearTimeout(t); t = setTimeout(() => func(...args), wait); };
}

document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() { this.style.transform = 'translateY(-8px) scale(1.02)'; });
        card.addEventListener('mouseleave', function() {
            this.style.transform = this.classList.contains('service-card--featured') ? 'translateY(-8px) scale(1.05)' : 'translateY(0) scale(1)';
        });
    });
});

window.addEventListener('load', function() {
    const p = new URLSearchParams(window.location.search);
    if (p.get('success') === 'true') {
        showMessage('Köszönjük üzenetét! Hamarosan felvesszük Önnel a kapcsolatot.', 'success');
        const form = document.getElementById('contactForm');
        if (form) form.reset();
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

// Fejléc scroll effekt
(function () {
    var header    = document.querySelector('.header');
    var threshold = 60;
    window.addEventListener('scroll', function() {
        header.classList.toggle('header--scrolled', window.scrollY > threshold);
    }, { passive: true });
})();
