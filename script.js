/**
 * Master's Warehouse — Main script
 * Cart: hidden by default, opens on Add to Cart; single-product limit; per-item image, description, remove.
 * Hero video: plays with audio (muted removed in HTML; browsers may require user gesture for sound).
 */

(function () {
    'use strict';

    // ----- Cart state (each item: { name, description, imageSrc }) -----
    const cartItems = [];
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartBackdrop = document.getElementById('cart-backdrop');
    const cartCountEl = document.getElementById('cart-count');
    const cartListEl = document.getElementById('cart-items');
    const cartEmptyEl = document.getElementById('cart-empty');
    const cartCloseBtn = document.getElementById('cart-close');
    const cartPurchaseBtn = document.getElementById('cart-purchase');

    function openCart() {
        if (cartSidebar) cartSidebar.classList.add('is-open');
        if (cartBackdrop) {
            cartBackdrop.classList.add('is-open');
            cartBackdrop.setAttribute('aria-hidden', 'false');
        }
    }

    function closeCart() {
        if (cartSidebar) cartSidebar.classList.remove('is-open');
        if (cartBackdrop) {
            cartBackdrop.classList.remove('is-open');
            cartBackdrop.setAttribute('aria-hidden', 'true');
        }
    }

    function addToCart(product) {
        const alreadyInCart = cartItems.some((item) => item.name === product.name);
        if (alreadyInCart) {
            openCart();
            return;
        }
        cartItems.push({ name: product.name, description: product.description, imageSrc: product.imageSrc });
        renderCart();
        openCart();
    }

    function removeFromCart(index) {
        cartItems.splice(index, 1);
        renderCart();
    }

    function renderCart() {
        const total = cartItems.length;
        if (cartCountEl) cartCountEl.textContent = total;
        if (cartSidebar) {
            if (total > 0) cartSidebar.classList.add('has-items');
            else cartSidebar.classList.remove('has-items');
        }
        const floatBtn = document.getElementById('cart-float-btn');
        const floatCount = document.getElementById('cart-float-count');
        if (floatBtn) {
            if (total > 0) floatBtn.classList.add('has-items');
            else floatBtn.classList.remove('has-items');
        }
        if (floatCount) floatCount.textContent = total;
        if (cartListEl) {
            cartListEl.innerHTML = '';
            cartItems.forEach((item, index) => {
                const li = document.createElement('li');
                li.className = 'cart-item';
                li.innerHTML = `
                    <div class="cart-item-thumb">
                        <img src="${item.imageSrc || ''}" alt="" loading="lazy">
                    </div>
                    <div class="cart-item-body">
                        <div class="cart-item-name">${escapeHtml(item.name)}</div>
                        <div class="cart-item-desc">${escapeHtml(item.description || '')}</div>
                    </div>
                    <button type="button" class="cart-item-remove" data-index="${index}" aria-label="Remove ${escapeHtml(item.name)}">×</button>
                `;
                const removeBtn = li.querySelector('.cart-item-remove');
                removeBtn.addEventListener('click', () => removeFromCart(index));
                cartListEl.appendChild(li);
            });
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Add to Cart: read name, description, image from product card; single-product limit
    document.querySelectorAll('.btn-cart').forEach((btn) => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.product-card');
            const name = btn.getAttribute('data-product-name') ||
                (card && card.querySelector('h3')?.textContent) || 'Product';
            const description = card ? (card.querySelector('.product-desc')?.textContent || card.querySelector('p')?.textContent || '') : '';
            const img = card ? card.querySelector('.product-image-wrap img') : null;
            const imageSrc = img ? img.src || img.getAttribute('src') || '' : '';
            addToCart({ name, description, imageSrc });
        });
    });

    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
    // Cart closes only when top cross is pressed (backdrop click does not close)

    const cartFloatBtn = document.getElementById('cart-float-btn');
    if (cartFloatBtn) cartFloatBtn.addEventListener('click', openCart);

    if (cartPurchaseBtn) {
        cartPurchaseBtn.addEventListener('click', () => {
            const code = document.getElementById('cart-discount');
            console.log('Purchase clicked', { itemCount: cartItems.length, discountCode: code?.value });
            alert('Purchase flow would go here. Cart: ' + cartItems.length + ' item(s).');
        });
    }

    renderCart();

    // ----- Category tabs: switch panel (smooth slide/fade) -----
    const categoryTabs = document.querySelectorAll('.category-tab');
    const panels = document.querySelectorAll('.panel');
    categoryTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const panelId = tab.getAttribute('data-panel');
            if (!panelId) return;
            categoryTabs.forEach((t) => t.classList.remove('is-active'));
            panels.forEach((p) => p.classList.remove('is-active'));
            tab.classList.add('is-active');
            const targetPanel = document.getElementById('panel-' + panelId);
            if (targetPanel) targetPanel.classList.add('is-active');
        });
    });

    // ----- Outros sub-tabs: Plugins | Scripts -----
    const outrosTabs = document.querySelectorAll('.outros-tab');
    const outrosSubpanels = document.querySelectorAll('.outros-subpanel');
    outrosTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const panelId = tab.getAttribute('data-outros-panel');
            if (!panelId) return;
            outrosTabs.forEach((t) => t.classList.remove('is-active'));
            outrosSubpanels.forEach((p) => p.classList.remove('is-active'));
            tab.classList.add('is-active');
            const target = document.getElementById('outros-' + panelId);
            if (target) target.classList.add('is-active');
        });
    });

    // ----- Scroll-triggered animations -----
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section-title').forEach((el) => observer.observe(el));

    document.querySelectorAll('.faq-item').forEach((item, i) => {
        item.style.animationDelay = `${0.05 * i}s`;
        observer.observe(item);
    });

    // ----- Review slider -----
    const reviewItems = document.querySelectorAll('.review-item');
    const prevBtn = document.getElementById('review-prev');
    const nextBtn = document.getElementById('review-next');
    const dotsContainer = document.getElementById('review-dots');
    let currentReview = 0;
    const totalReviews = reviewItems.length;

    function showReview(index) {
        reviewItems[currentReview].classList.remove('active');
        currentReview = (index + totalReviews) % totalReviews;
        reviewItems[currentReview].classList.add('active');
        updateDots();
    }

    function updateDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalReviews; i++) {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'dot' + (i === currentReview ? ' active' : '');
            dot.setAttribute('aria-label', `Go to review ${i + 1}`);
            dot.addEventListener('click', () => showReview(i));
            dotsContainer.appendChild(dot);
        }
    }

    if (prevBtn) prevBtn.addEventListener('click', () => showReview(currentReview - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => showReview(currentReview + 1));

    updateDots();

    // ----- Contact form -----
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = form.querySelector('[name="name"]').value;
            const email = form.querySelector('[name="email"]').value;
            const message = form.querySelector('[name="message"]').value;
            console.log('Contact form:', { name, email, message });
            alert('Thanks for your message! We\'ll get back to you soon.');
            form.reset();
        });
    }
})();
