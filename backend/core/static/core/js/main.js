/**
 * Миркли — Визитка бригады
 * Vanilla JS — all interactive features
 */

(function () {
  'use strict';

  /* ============================================================
     STATE
     ============================================================ */

  let selectedRating = 0;
  let galleryImages = [];
  let currentImageIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;

  /* ============================================================
     DOM HELPERS
     ============================================================ */

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  /* ============================================================
     TECHNICIAN ACCORDION
     Works with any ID — reads data-installer-id from card or
     uses the id passed directly via onclick="toggleTechnician(id)"
     ============================================================ */

  window.toggleTechnician = function (id) {
    if (window.innerWidth >= 768) return;

    const body    = document.getElementById('expanded-' + id);
    const chevron = document.getElementById('chevron-' + id);
    const toggle  = document.getElementById('toggle-' + id);
    if (!body) return;

    const isHidden = body.classList.contains('technician-card__body--hidden');

    body.classList.toggle('technician-card__body--hidden', !isHidden);
    if (chevron) {
      chevron.classList.toggle('fa-chevron-down',  isHidden);
      chevron.classList.toggle('fa-chevron-up',   !isHidden);
    }
    if (toggle) toggle.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
  };

  /* Keep all cards expanded on desktop resize */
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) {
      $$('.technician-card__body').forEach(function (body) {
        body.classList.remove('technician-card__body--hidden');
      });
      $$('.technician-card__chevron').forEach(function (chevron) {
        chevron.classList.remove('fa-chevron-down');
        chevron.classList.add('fa-chevron-up');
      });
      $$('.technician-card__header').forEach(function (toggle) {
        toggle.setAttribute('aria-expanded', 'true');
      });
    }
  });

  /* On first load — desktop shows all expanded */
  (function initAccordion() {
    if (window.innerWidth >= 768) {
      $$('.technician-card__body').forEach(function (body) {
        body.classList.remove('technician-card__body--hidden');
      });
    }
  })();

  /* ============================================================
     CAROUSEL DOTS
     ============================================================ */

  function initCarouselDots(scrollEl, dotsEl) {
    if (!scrollEl || !dotsEl) return;
    const dots = dotsEl.querySelectorAll('.carousel-dots__dot');

    scrollEl.addEventListener('scroll', function () {
      const cards = scrollEl.querySelectorAll('.project-card');
      if (!cards.length) return;
      const cardWidth = cards[0].offsetWidth + 16;
      const index = Math.round(scrollEl.scrollLeft / cardWidth);
      const capped = Math.min(index, dots.length - 1);
      dots.forEach(function (dot, i) {
        dot.classList.toggle('carousel-dots__dot--active', i === capped);
      });
    }, { passive: true });
  }

  /* ============================================================
     CAROUSEL DRAG-TO-SCROLL (desktop mouse)
     ============================================================ */

  function initCarouselDrag(el) {
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let startScrollLeft = 0;
    let hasDragged = false;
    let snapResumeTimer = null;

    function startDrag(e) {
      isDown = true;
      hasDragged = false;
      startX = e.pageX - el.offsetLeft;
      startScrollLeft = el.scrollLeft;
      el.style.userSelect = 'none';
      el.style.scrollSnapType = 'none';
      clearTimeout(snapResumeTimer);
    }

    function endDrag() {
      if (!isDown) return;
      isDown = false;
      el.style.userSelect = '';
      snapResumeTimer = setTimeout(function () {
        el.style.scrollSnapType = '';
      }, 80);
    }

    el.addEventListener('mousedown', startDrag);
    el.addEventListener('mouseleave', endDrag);
    el.addEventListener('mouseup', endDrag);
    el.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const delta = x - startX;
      if (Math.abs(delta) > 4) hasDragged = true;
      el.scrollLeft = startScrollLeft - delta;
    });

    el.addEventListener('click', function (e) {
      if (hasDragged) {
        e.stopPropagation();
        e.preventDefault();
        hasDragged = false;
      }
    }, true);
  }

  /* ============================================================
     CAROUSEL TOUCH SCROLL
     ============================================================ */

  function initCarouselTouchScroll(el) {
    if (!el) return;

    var startX = 0, startY = 0, startScrollLeft = 0;
    var lastX = 0, lastTime = 0, velX = 0;
    var direction = null, snapTimer = null, rafId = null;

    el.addEventListener('touchstart', function (e) {
      cancelAnimationFrame(rafId);
      clearTimeout(snapTimer);
      startX          = e.touches[0].clientX;
      startY          = e.touches[0].clientY;
      startScrollLeft = el.scrollLeft;
      lastX           = startX;
      lastTime        = Date.now();
      velX            = 0;
      direction       = null;
      el.style.scrollSnapType = 'none';
    }, { passive: true });

    el.addEventListener('touchmove', function (e) {
      var cx = e.touches[0].clientX;
      var cy = e.touches[0].clientY;
      if (direction === null) {
        var dx = Math.abs(cx - startX);
        var dy = Math.abs(cy - startY);
        if (dx < 4 && dy < 4) return;
        direction = dx >= dy ? 'h' : 'v';
      }
      if (direction === 'h') {
        var now  = Date.now();
        var dt   = Math.max(now - lastTime, 1);
        var step = lastX - cx;
        velX     = step / dt;
        el.scrollLeft = startScrollLeft + (startX - cx);
        lastX    = cx;
        lastTime = now;
      }
    }, { passive: true });

    el.addEventListener('touchend', function () {
      if (direction === 'h') {
        var v   = velX * 120;
        var pos = el.scrollLeft;
        var max = el.scrollWidth - el.clientWidth;
        rafId = requestAnimationFrame(function momentum() {
          if (Math.abs(v) < 0.8) {
            snapTimer = setTimeout(function () { el.style.scrollSnapType = ''; }, 40);
            return;
          }
          pos = Math.max(0, Math.min(max, pos + v));
          el.scrollLeft = pos;
          v *= 0.90;
          rafId = requestAnimationFrame(momentum);
        });
      } else {
        el.style.scrollSnapType = '';
      }
      direction = null;
    }, { passive: true });
  }

  /* ============================================================
     GALLERY MODAL
     ============================================================ */

  function _openGallery() {
    const modal = $('#gallery-modal');
    const img   = $('#gallery-image');
    if (!modal || !img) return;
    img.src = galleryImages[currentImageIndex] || '';
    img.alt = '';
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    _rebuildGalleryDots();
  }

  function closeGallery() {
    const modal = $('#gallery-modal');
    if (!modal) return;
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  function nextGalleryImage() {
    if (!galleryImages.length) return;
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    $('#gallery-image').src = galleryImages[currentImageIndex];
    _updateGalleryDots();
  }

  function prevGalleryImage() {
    if (!galleryImages.length) return;
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    $('#gallery-image').src = galleryImages[currentImageIndex];
    _updateGalleryDots();
  }

  function _updateGalleryDots() {
    const dots = $$('#gallery-dots .gallery-modal__dot');
    dots.forEach(function (dot, i) {
      dot.classList.toggle('gallery-modal__dot--active', i === currentImageIndex);
    });
  }

  function _rebuildGalleryDots() {
    const dotsEl = $('#gallery-dots');
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    galleryImages.forEach(function (_, i) {
      const dot = document.createElement('span');
      dot.className = 'gallery-modal__dot';
      if (i === currentImageIndex) dot.classList.add('gallery-modal__dot--active');
      dotsEl.appendChild(dot);
    });
  }

  /* Открыть галерею для конкретного проекта — вызывается из шаблона */
  window.openProjectGallery = function (images, index) {
    galleryImages = (images || []).filter(Boolean);
    if (!galleryImages.length) return;
    currentImageIndex = Math.min(index || 0, galleryImages.length - 1);
    _openGallery();
  };

  /* ============================================================
     CERTIFICATE MODAL
     ============================================================ */

  window.openCertificate = function (imagePath) {
    const modal = $('#certificate-modal');
    const img   = $('#certificate-image');
    if (!modal || !img) return;
    img.src = imagePath;
    img.alt = 'Сертификат';
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  };

  function closeCertificate() {
    const modal = $('#certificate-modal');
    if (!modal) return;
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  /* ============================================================
     CALLBACK MODAL
     ============================================================ */

  function openCallbackModal() {
    const modal          = $('#callback-modal');
    const formContent    = $('#callback-form-content');
    const successContent = $('#callback-success-content');
    if (!modal) return;
    formContent.classList.remove('hidden');
    successContent.classList.add('hidden');
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    const nameInput  = $('#callback-name');
    const phoneInput = $('#callback-phone');
    if (nameInput)  { nameInput.value  = ''; nameInput.classList.remove('is-invalid'); }
    if (phoneInput) { phoneInput.value = ''; phoneInput.classList.remove('is-invalid'); }
    setTimeout(function () { if (nameInput) nameInput.focus(); }, 100);
  }

  function closeCallbackModal() {
    const modal = $('#callback-modal');
    if (!modal) return;
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  function submitCallback(e) {
    e.preventDefault();
    const nameInput  = $('#callback-name');
    const phoneInput = $('#callback-phone');
    let valid = true;
    if (!nameInput.value.trim())  { nameInput.classList.add('is-invalid');  valid = false; }
    else nameInput.classList.remove('is-invalid');
    if (!phoneInput.value.trim()) { phoneInput.classList.add('is-invalid'); valid = false; }
    else phoneInput.classList.remove('is-invalid');
    if (!valid) {
      const firstInvalid = $$('.form-field__input.is-invalid')[0];
      if (firstInvalid) firstInvalid.focus();
      return;
    }
    $('#callback-form-content').classList.add('hidden');
    $('#callback-success-content').classList.remove('hidden');
  }

  /* ============================================================
     RATING
     ============================================================ */

  function selectRating(value) {
    selectedRating = value;
    $$('.rating-star').forEach(function (star, index) {
      star.classList.toggle('is-active', index < value);
    });
  }

  function submitRating() {
    if (selectedRating === 0) return;
    $('#rating-form').classList.add('hidden');
    $('#rating-success').classList.remove('hidden');
  }

  /* ============================================================
     PHONE MASK
     ============================================================ */

  function applyPhoneMask(input) {
    input.addEventListener('input', function () {
      let val = input.value.replace(/\D/g, '');
      if (val.startsWith('8')) val = '7' + val.slice(1);
      if (val.startsWith('7')) {
        val = val.slice(0, 11);
        let result = '+7';
        if (val.length > 1)  result += ' (' + val.slice(1, 4);
        if (val.length >= 4) result += ') ' + val.slice(4, 7);
        if (val.length >= 7) result += '-' + val.slice(7, 9);
        if (val.length >= 9) result += '-' + val.slice(9, 11);
        input.value = result;
      } else if (val.length > 0) {
        input.value = '+' + val.slice(0, 15);
      }
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && input.value.length <= 3) input.value = '';
    });
  }

  /* ============================================================
     KEYBOARD NAVIGATION
     ============================================================ */

  function handleGlobalKeydown(e) {
    const galleryModal  = $('#gallery-modal');
    const certModal     = $('#certificate-modal');
    const callbackModal = $('#callback-modal');
    if (e.key === 'Escape') {
      if (galleryModal  && !galleryModal.hasAttribute('hidden'))  closeGallery();
      if (certModal     && !certModal.hasAttribute('hidden'))     closeCertificate();
      if (callbackModal && !callbackModal.hasAttribute('hidden')) closeCallbackModal();
    }
    if (galleryModal && !galleryModal.hasAttribute('hidden')) {
      if (e.key === 'ArrowRight') nextGalleryImage();
      if (e.key === 'ArrowLeft')  prevGalleryImage();
    }
  }

  /* ============================================================
     TOUCH SWIPE (gallery modal)
     ============================================================ */

  function initGallerySwipe() {
    const modal = $('#gallery-modal');
    if (!modal) return;
    modal.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    modal.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      const delta = touchEndX - touchStartX;
      if (Math.abs(delta) > 50) {
        if (delta < 0) nextGalleryImage();
        else prevGalleryImage();
      }
    }, { passive: true });
  }

  /* ============================================================
     INIT
     ============================================================ */

  document.addEventListener('DOMContentLoaded', function () {

    /* Auto-init ALL carousels found on the page */
    $$('.projects-carousel').forEach(function (scrollEl) {
      const card   = scrollEl.closest('.technician-card');
      const dotsEl = card ? card.querySelector('.carousel-dots') : null;
      initCarouselDots(scrollEl, dotsEl);
      initCarouselDrag(scrollEl);
      initCarouselTouchScroll(scrollEl);
    });

    /* Callback modal */
    const openCallbackBtn   = $('#open-callback-btn');
    const closeCallbackBtn  = $('#close-callback-btn');
    const closeSuccessBtn   = $('#close-success-btn');
    const callbackBackdrop  = $('#callback-backdrop');
    const contactBrigadeBtn = $('#contact-brigade-btn');
    const callbackForm      = $('#callback-form');
    if (openCallbackBtn)   openCallbackBtn.addEventListener('click', openCallbackModal);
    if (closeCallbackBtn)  closeCallbackBtn.addEventListener('click', closeCallbackModal);
    if (closeSuccessBtn)   closeSuccessBtn.addEventListener('click', closeCallbackModal);
    if (callbackBackdrop)  callbackBackdrop.addEventListener('click', closeCallbackModal);
    if (contactBrigadeBtn) contactBrigadeBtn.addEventListener('click', openCallbackModal);
    if (callbackForm)      callbackForm.addEventListener('submit', submitCallback);

    /* Phone mask */
    const phoneInput = $('#callback-phone');
    if (phoneInput) applyPhoneMask(phoneInput);

    /* Gallery controls */
    const closeGalleryBtn = $('#close-gallery-btn');
    const galleryPrev     = $('#gallery-prev');
    const galleryNext     = $('#gallery-next');
    const galleryModal    = $('#gallery-modal');
    if (closeGalleryBtn) closeGalleryBtn.addEventListener('click', closeGallery);
    if (galleryPrev)     galleryPrev.addEventListener('click', prevGalleryImage);
    if (galleryNext)     galleryNext.addEventListener('click', nextGalleryImage);
    if (galleryModal)    galleryModal.addEventListener('click', function (e) {
      if (e.target === galleryModal) closeGallery();
    });

    /* Certificate controls */
    const closeCertBtn = $('#close-cert-btn');
    const certModal    = $('#certificate-modal');
    if (closeCertBtn) closeCertBtn.addEventListener('click', closeCertificate);
    if (certModal)    certModal.addEventListener('click', function (e) {
      if (e.target === certModal) closeCertificate();
    });

    /* Rating */
    $$('.rating-star').forEach(function (star) {
      const value = parseInt(star.dataset.value, 10);
      star.addEventListener('click', function () { selectRating(value); });
      star.addEventListener('mouseenter', function () {
        $$('.rating-star').forEach(function (s, i) {
          s.style.color = i < value ? 'var(--color-yellow)' : '';
        });
      });
      star.addEventListener('mouseleave', function () {
        $$('.rating-star').forEach(function (s, i) {
          s.style.color = i < selectedRating ? 'var(--color-yellow)' : '';
        });
      });
    });
    const submitRatingBtn = $('#submit-rating');
    if (submitRatingBtn) submitRatingBtn.addEventListener('click', submitRating);

    /* "Show more certificates" — работает для нескольких секций */
    $$('.certs-section__show-more').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const section    = btn.closest('.certs-section');
        const hiddenCerts = section ? section.querySelectorAll('.certs-list__item--hidden') : [];
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        hiddenCerts.forEach(function (item) {
          item.classList.toggle('certs-list__item--visible', !isExpanded);
        });
        btn.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
        btn.textContent = isExpanded ? btn.dataset.showText || 'Показать ещё' : 'Скрыть';
      });
    });

    /* Keyboard */
    document.addEventListener('keydown', handleGlobalKeydown);

    /* Touch swipe in gallery */
    initGallerySwipe();
  });

})();
