/**
 * Master's Warehouse — Main script
 * Cart: hidden by default, opens on Add to Cart; single-product limit; per-item image, description, remove.
 * Hero video: plays with audio (muted removed in HTML; browsers may require user gesture for sound).
 */

(function () {
    'use strict';

    // ----- Hero video: keep playing silently -----
    const heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
        heroVideo.muted = true;
        heroVideo.playsInline = true;
        heroVideo.volume = 0; // strictly muted
        function playHeroVideo() { heroVideo.play().catch(function () {}); }
        heroVideo.addEventListener('loadeddata', playHeroVideo);
        heroVideo.addEventListener('canplay', playHeroVideo);
        if (heroVideo.paused) playHeroVideo();
    }

    // ----- Background Music (Original Song Pack) -----
    // "start with the century song and end with all the ones that come"
    const BGM_TRACKS = [
        'Songs/EsDeeKid_-_Century_-_smarienn.wav',
        'Songs/EsDeeKid_-_Panic_-_smarienn.wav',
        'Songs/EsDeeKid_-_Rottweiler_-_Slowed_-_smarienn.wav',
        'Songs/EsDeeKid_-_LV_Sandals_-_smarienn.wav',
        'Songs/EsDeeKid_-_Rottweiler_-_intro_-_smarienn.wav'
    ];
    let currentBgmIndex = 0;
    const bgmAudio = new Audio(BGM_TRACKS[currentBgmIndex]);
    bgmAudio.volume = 1; // "when it starts it has full volume"

    // Advance to next track when one ends
    bgmAudio.addEventListener('ended', () => {
        currentBgmIndex = (currentBgmIndex + 1) % BGM_TRACKS.length;
        bgmAudio.src = BGM_TRACKS[currentBgmIndex];
        bgmAudio.play().catch(function(){});
    });

    // Attempt to play music immediately. Browsers require a user gesture first,
    // so we fallback to waiting for the user's first click anywhere on the page.
    function startBgm() {
        bgmAudio.play().catch(() => {
            const onFirstInteraction = () => {
                bgmAudio.play().catch(function(){});
                document.removeEventListener('click', onFirstInteraction);
                document.removeEventListener('keydown', onFirstInteraction);
            };
            document.addEventListener('click', onFirstInteraction);
            document.addEventListener('keydown', onFirstInteraction);
        });
    }
    startBgm();

    // ----- Wire up the hero-sound-btn and slider to the BGM -----
    const heroSoundBtn = document.getElementById('hero-sound-btn');
    const heroSoundSlider = document.getElementById('hero-sound-slider');

    function updateBgmSoundUI() {
        if (!heroSoundBtn) return;
        var isMuted = bgmAudio.muted || bgmAudio.volume === 0;
        var mutedIcon = heroSoundBtn.querySelector('.hero-sound-muted');
        var unmutedIcon = heroSoundBtn.querySelector('.hero-sound-unmuted');
        
        heroSoundBtn.setAttribute('aria-label', isMuted ? 'Unmute' : 'Mute');
        heroSoundBtn.setAttribute('title', isMuted ? 'Unmute' : 'Mute');
        
        if (mutedIcon) mutedIcon.hidden = !isMuted;
        if (unmutedIcon) unmutedIcon.hidden = isMuted;

        if (heroSoundSlider && !isMuted) {
            heroSoundSlider.value = bgmAudio.volume * 100;
        } else if (heroSoundSlider && isMuted) {
            heroSoundSlider.value = 0;
        }
    }

    if (heroSoundBtn) {
        updateBgmSoundUI();
        heroSoundBtn.addEventListener('click', function () {
            bgmAudio.muted = !bgmAudio.muted;
            if (!bgmAudio.muted && bgmAudio.paused) {
                bgmAudio.play().catch(function(){});
            }
            updateBgmSoundUI();
        });
    }

    if (heroSoundSlider) {
        heroSoundSlider.value = 100;
        heroSoundSlider.addEventListener('input', function () {
            var pct = Number(heroSoundSlider.value);
            bgmAudio.volume = pct / 100;
            if (pct > 0) {
                bgmAudio.muted = false;
                if (bgmAudio.paused) bgmAudio.play().catch(function(){});
            } else {
                bgmAudio.muted = true;
            }
            updateBgmSoundUI();
        });
    }

    // ----- Cart state (persisted to localStorage) -----
    let cartItems = [];
    try {
        const stored = localStorage.getItem('master_warehouse_cart');
        if (stored) cartItems = JSON.parse(stored);
    } catch (e) {
        console.error('Could not load cart from localStorage', e);
    }
    
    function saveCart() {
        try {
            localStorage.setItem('master_warehouse_cart', JSON.stringify(cartItems));
        } catch (e) {
            console.error('Could not save cart to localStorage', e);
        }
    }
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
        saveCart();
        renderCart();
        openCart();
    }

    function removeFromCart(index) {
        cartItems.splice(index, 1);
        saveCart();
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
        const topbarCount = document.getElementById('topbar-cart-count');
        if (floatBtn) {
            if (total > 0) floatBtn.classList.add('has-items');
            else floatBtn.classList.remove('has-items');
        }
        if (floatCount) floatCount.textContent = total;
        if (topbarCount) topbarCount.textContent = total;
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

    // Expose for external use (product.html)
    window.masterWarehouse = {
        addToCart: addToCart
    };

    // Add to Cart: read name, description, image from product card; single-product limit
    document.querySelectorAll('.btn-cart').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent triggering the product card click
            const card = btn.closest('.product-card');
            const name = btn.getAttribute('data-product-name') ||
                (card && card.querySelector('h3')?.textContent) || 'Product';
            const description = card ? (card.querySelector('.product-desc')?.textContent || card.querySelector('p')?.textContent || '') : '';
            const img = card ? card.querySelector('.product-image-wrap img') : null;
            const imageSrc = img ? img.src || img.getAttribute('src') || '' : '';
            addToCart({ name, description, imageSrc });
        });
    });

    // Product card click -> redirect to product landing page
    document.querySelectorAll('.product-card').forEach((card) => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            if (e.target.closest('.btn-cart') || e.target.closest('.hot-badge')) return;
            
            const btn = card.querySelector('.btn-cart');
            const name = btn ? btn.getAttribute('data-product-name') : (card.querySelector('h3')?.textContent || 'Product');
            const description = card.querySelector('.product-desc')?.textContent || card.querySelector('p')?.textContent || '';
            const img = card.querySelector('.product-image-wrap img');
            const imageSrc = img ? img.src || img.getAttribute('src') || '' : '';

            const url = new URL('product.html', window.location.href);
            url.searchParams.set('name', name);
            url.searchParams.set('desc', description);
            url.searchParams.set('img', imageSrc);
            window.location.href = url.href;
        });
    });

    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);

    const cartFloatBtn = document.getElementById('cart-float-btn');
    if (cartFloatBtn) {
        cartFloatBtn.addEventListener('click', openCart);
    }

    document.querySelectorAll('.topbar-cart-btn').forEach(btn => {
        btn.addEventListener('click', openCart);
    });

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
