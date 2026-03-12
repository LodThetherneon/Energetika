document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initScrollAnimations();
    initBackToTop();
    initFormValidation();
    initSmoothScrolling();
});

function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu   = document.getElementById('navMenu');
    const navLinks  = document.querySelectorAll('.nav__link');
    const header    = document.querySelector('.header');

    // --- Menu position alignment (rAF-based, no layout thrash) ---
    let rafPending = false;
    function alignMenu() {
        if (window.innerWidth > 768) return;
        const rect = header.getBoundingClientRect();
        navMenu.style.top          = (rect.bottom + 8) + 'px';
        navMenu.style.left         = rect.left + 'px';
        navMenu.style.right        = (window.innerWidth - rect.right) + 'px';
        navMenu.style.width        = 'auto';
        const br = window.getComputedStyle(header).borderRadius;
        navMenu.style.borderRadius = (br && br !== '0px') ? br : '12px';
    }
    function scheduleAlign() {
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(function() {
            rafPending = false;
            alignMenu();
        });
    }

    // --- Mobile class ---
    function applyMobileClass() {
        if (window.innerWidth <= 768) {
            navMenu.classList.add('nav__menu--mobile-dropdown');
        } else {
            navMenu.classList.remove('nav__menu--mobile-dropdown', 'active');
            navToggle.classList.remove('active');
        }
    }
    applyMobileClass();

    // Resize: disable transitions briefly so header + menu move instantly together
    let resizeTimer;
    window.addEventListener('resize', function() {
        document.body.classList.add('no-transition');
        applyMobileClass();
        scheduleAlign();
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            document.body.classList.remove('no-transition');
        }, 150);
    }, { passive: true });

    // Scroll: csak ha nyitva van
    window.addEventListener('scroll', function() {
        if (navMenu.classList.contains('active')) scheduleAlign();
    }, { passive: true });

    // Toggle
    navToggle.addEventListener('click', function() {
        const isOpen = navMenu.classList.contains('active');
        if (!isOpen) alignMenu();
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    document.addEventListener('click', function(e) {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const h = document.querySelector('.header').offsetHeight;
                window.scrollTo({ top: target.offsetTop - h, behavior: 'smooth' });
            }
        });
    });
}

function initBackToTop() {
    const btn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => btn.classList.toggle('show', window.pageYOffset > 300));
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function initScrollAnimations() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('animate-in'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.service-card, .intro__content, .contact__content, .info-item').forEach(el => observer.observe(el));
    const s = document.createElement('style');
    s.textContent = `
        .service-card,.intro__content,.contact__content,.info-item{
            opacity:0;transform:translateY(30px);transition:all 0.6s ease-out;
        }
        .animate-in{opacity:1!important;transform:translateY(0)!important;}
        .service-card:nth-child(1).animate-in{transition-delay:.1s;}
        .service-card:nth-child(2).animate-in{transition-delay:.2s;}
        .service-card:nth-child(3).animate-in{transition-delay:.3s;}
        .service-card:nth-child(4).animate-in{transition-delay:.4s;}
    `;
    document.head.appendChild(s);
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
            const btn = form.querySelector('button[type="submit"]');
            btn.textContent = 'Küldés...'; btn.disabled = true;
            const ep = calculateEstimatedPrice();
            if (ep) { const h = document.createElement('input'); h.type='hidden'; h.name='estimated_price'; h.value=ep; form.appendChild(h); }
            setTimeout(() => form.submit(), 500);
        } else {
            showMessage('Kérjük, javítsa ki a hibákat a form elküldése előtt.', 'error');
        }
    });

    propertyTypeField.addEventListener('change', function() {
        propertySizeField.placeholder = this.value === 'Társasházi lakás' ? 'pl. 65 m²' : this.value === 'Családi ház' ? 'pl. 120 m²' : 'Ingatlan mérete m²-ben';
        updatePriceEstimation();
    });
    propertySizeField.addEventListener('input', debounce(updatePriceEstimation, 500));

    function updatePriceEstimation() {
        const s = parseInt(propertySizeField.value);
        if (propertyTypeField.value && s > 0) { const ep = calculateEstimatedPrice(); if (ep) showPriceEstimation(ep); }
    }
}

function validateName(f)  { if (f.value.trim().length < 2) { showFieldError(f,'A név legalább 2 karakter hosszú legyen.'); return false; } clearFieldError(f); return true; }
function validateEmail(f) { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim())) { showFieldError(f,'Kérjük, adjon meg egy érvényes email címet.'); return false; } clearFieldError(f); return true; }
function validatePhone(f) { if (f.value.trim() && !/^[\+]?[\d\s\-\(\)]{8,}$/.test(f.value.trim())) { showFieldError(f,'Kérjük, adjon meg egy érvényes telefonszámot.'); return false; } clearFieldError(f); return true; }
function validatePropertySize(f) { const v=parseInt(f.value); if (f.value&&(isNaN(v)||v<1||v>2000)) { showFieldError(f,'Az ingatlan mérete 1 és 2000 m² között legyen.'); return false; } clearFieldError(f); return true; }

function showFieldError(field, msg) {
    clearFieldError(field); field.classList.add('error');
    const d = document.createElement('div');
    d.className='field-error'; d.textContent=msg;
    d.style.cssText='color:var(--color-error);font-size:var(--font-size-sm);margin-top:var(--space-4)';
    field.parentNode.appendChild(d);
}
function clearFieldError(field) {
    field.classList.remove('error');
    const e = field.parentNode.querySelector('.field-error'); if (e) e.remove();
}
function showMessage(msg, type) {
    const ex = document.querySelector('.form-message'); if (ex) ex.remove();
    const d = document.createElement('div'); d.className='form-message '+type; d.textContent=msg;
    d.style.cssText='padding:var(--space-12);border-radius:var(--radius-base);margin-bottom:var(--space-16);font-weight:var(--font-weight-medium);';
    if (type==='error')   d.style.cssText+='background:rgba(var(--color-error-rgb),.1);color:var(--color-error);border:1px solid rgba(var(--color-error-rgb),.3)';
    if (type==='success') d.style.cssText+='background:rgba(var(--color-success-rgb),.1);color:var(--color-success);border:1px solid rgba(var(--color-success-rgb),.3)';
    const form=document.getElementById('contactForm'); form.insertBefore(d,form.firstChild);
    setTimeout(()=>{ if(d.parentNode) d.remove(); },5000);
}

function calculateEstimatedPrice() {
    const t=document.getElementById('propertyType').value;
    const s=parseInt(document.getElementById('propertySize').value);
    if (!t||!s||s<=0) return null;
    if (t==='Társasházi lakás') return s<80?'25.000 Ft':s<=140?'27.000 Ft':'30.000+ Ft';
    if (t==='Családi ház')     return s<150?'30.000 Ft':'Egyedi árazás';
    return 'Egyedi árazás';
}
function showPriceEstimation(price) {
    const ex=document.querySelector('.price-estimation'); if(ex) ex.remove();
    const d=document.createElement('div'); d.className='price-estimation';
    d.innerHTML=`<div style="background:rgba(var(--color-success-rgb),.1);border:1px solid rgba(var(--color-success-rgb),.3);border-radius:var(--radius-base);padding:var(--space-12);margin-top:var(--space-12);color:var(--color-success);font-weight:var(--font-weight-medium);">💡 Becsült ár: <strong>${price}</strong></div>`;
    document.getElementById('message').parentNode.appendChild(d);
}

function debounce(fn, wait) {
    let t; return function(...a){ clearTimeout(t); t=setTimeout(()=>fn(...a),wait); };
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mouseenter', function() { this.style.transform='translateY(-8px) scale(1.02)'; });
        card.addEventListener('mouseleave', function() {
            this.style.transform = this.classList.contains('service-card--featured') ? 'translateY(-8px) scale(1.05)' : 'translateY(0) scale(1)';
        });
    });
});

window.addEventListener('load', function() {
    const p=new URLSearchParams(window.location.search);
    if (p.get('success')==='true') {
        showMessage('Köszönjük üzenetét! Hamarosan felvesszük Önnel a kapcsolatot.','success');
        const form=document.getElementById('contactForm'); if(form) form.reset();
        window.history.replaceState({},document.title,window.location.pathname);
    }
});

// Fejléc scroll effekt
(function(){
    const header=document.querySelector('.header');
    window.addEventListener('scroll',function(){
        header.classList.toggle('header--scrolled', window.scrollY > 60);
    },{ passive:true });
})();
