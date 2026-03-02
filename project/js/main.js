/**
 * Миркли — Визитка бригады #247
 * Vanilla JS — all interactive features
 */

(function () {
  'use strict';

  /* ============================================================
     IMAGE DATA
     ============================================================ */

  const technicianImages = {
    main: [
      'assets/images/project-office.png',
      'assets/images/project-mall.png',
      'assets/images/project-residential.png',
      'assets/images/project-warehouse.png'
    ],
    second: [
      'assets/images/project-residential.png',
      'assets/images/project-office.png',
      'assets/images/project-warehouse.png'
    ]
  };

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
     TECHNICIAN ACCORDION (mobile only)
     ============================================================ */

  /**
   * Toggle expanded/collapsed state of a technician card on mobile.
   * @param {string} id - 'main' or 'second'
   */
  window.toggleTechnician = function (id) {
    if (window.innerWidth >= 768) return;

    const expanded = $(`#${id}-expanded`);
    const chevron  = $(`#${id}-chevron`);
    const toggle   = $(`#${id}-toggle`);
    const isHidden = expanded.classList.contains('technician-card__body--hidden');

    if (isHidden) {
      expanded.classList.remove('technician-card__body--hidden');
      chevron.classList.remove('fa-chevron-down');
      chevron.classList.add('fa-chevron-up');
      toggle.setAttribute('aria-expanded', 'true');
    } else {
      expanded.classList.add('technician-card__body--hidden');
      chevron.classList.remove('fa-chevron-up');
      chevron.classList.add('fa-chevron-down');
      toggle.setAttribute('aria-expanded', 'false');
    }
  };

  /* Keep all cards expanded on desktop resize */
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) {
      ['main', 'second'].forEach(function (id) {
        const expanded = $(`#${id}-expanded`);
        const chevron  = $(`#${id}-chevron`);
        const toggle   = $(`#${id}-toggle`);
        if (expanded) {
          expanded.classList.remove('technician-card__body--hidden');
          if (chevron) {
            chevron.classList.remove('fa-chevron-down');
            chevron.classList.add('fa-chevron-up');
          }
          if (toggle) toggle.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  /* On first load — desktop shows both expanded */
  (function initAccordion() {
    if (window.innerWidth >= 768) {
      ['main', 'second'].forEach(function (id) {
        const expanded = $(`#${id}-expanded`);
        if (expanded) expanded.classList.remove('technician-card__body--hidden');
      });
    }
  })();

  /* ============================================================
     CAROUSEL DOTS
     ============================================================ */

  function initCarouselDots(scrollId, dotsId) {
    const scroll = $(`#${scrollId}`);
    const dotsEl = $(`#${dotsId}`);
    if (!scroll || !dotsEl) return;

    const dots = dotsEl.querySelectorAll('.carousel-dots__dot');

    scroll.addEventListener('scroll', function () {
      const cards = scroll.querySelectorAll('.project-card');
      if (!cards.length) return;

      const cardWidth = cards[0].offsetWidth + 16; // gap ≈ 16px
      const index = Math.round(scroll.scrollLeft / cardWidth);
      const capped = Math.min(index, dots.length - 1);

      dots.forEach(function (dot, i) {
        dot.classList.toggle('carousel-dots__dot--active', i === capped);
      });
    }, { passive: true });
  }

  /* ============================================================
     CAROUSEL DRAG-TO-SCROLL (desktop mouse)
     ============================================================ */

  function initCarouselDrag(scrollId) {
    const el = $(`#${scrollId}`);
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
      /* Отключаем snap — иначе браузер дёргает карточки во время движения */
      el.style.scrollSnapType = 'none';
      clearTimeout(snapResumeTimer);
    }

    function endDrag() {
      if (!isDown) return;
      isDown = false;
      el.style.userSelect = '';
      /* Восстанавливаем snap после небольшой задержки — браузер плавно защёлкнет ближайшую карточку */
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

    /* Block click on cards if the user was dragging */
    el.addEventListener('click', function (e) {
      if (hasDragged) {
        e.stopPropagation();
        e.preventDefault();
        hasDragged = false;
      }
    }, true);
  }

  /* ============================================================
     CAROUSEL TOUCH SCROLL (horizontal only, native vertical passthrough)
     CSS touch-action: pan-y tells the browser to handle vertical natively.
     We only intercept horizontal movement and drive scrollLeft ourselves.
     All listeners are passive — no preventDefault, no JS vertical scroll.
     ============================================================ */

  function initCarouselTouchScroll(scrollId) {
    var el = document.getElementById(scrollId);
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
      /* direction === 'v': do nothing — browser handles via touch-action: pan-y */
    }, { passive: true });

    el.addEventListener('touchend', function () {
      if (direction === 'h') {
        var v   = velX * 120;
        var pos = el.scrollLeft;
        var max = el.scrollWidth - el.clientWidth;

        rafId = requestAnimationFrame(function momentum() {
          if (Math.abs(v) < 0.8) {
            snapTimer = setTimeout(function () {
              el.style.scrollSnapType = '';
            }, 40);
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

  window.openGalleryForTechnician = function (techId, index) {
    galleryImages = technicianImages[techId] || [];
    currentImageIndex = index;
    _openGallery();
  };

  function _openGallery() {
    const modal = $(`#gallery-modal`);
    const img   = $(`#gallery-image`);
    if (!modal || !img) return;

    img.src = galleryImages[currentImageIndex] || '';
    img.alt = '';
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    _updateGalleryDots();
  }

  function closeGallery() {
    const modal = $(`#gallery-modal`);
    if (!modal) return;
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  function nextGalleryImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    $(`#gallery-image`).src = galleryImages[currentImageIndex];
    _updateGalleryDots();
  }

  function prevGalleryImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    $(`#gallery-image`).src = galleryImages[currentImageIndex];
    _updateGalleryDots();
  }

  function _updateGalleryDots() {
    const dots = $$(`#gallery-dots .gallery-modal__dot`);
    dots.forEach(function (dot, i) {
      dot.classList.toggle('gallery-modal__dot--active', i === currentImageIndex);
    });
  }

  /* Rebuild gallery dots to match current image set */
  function _rebuildGalleryDots() {
    const dotsEl = $(`#gallery-dots`);
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    galleryImages.forEach(function (_, i) {
      const dot = document.createElement('span');
      dot.className = 'gallery-modal__dot';
      if (i === currentImageIndex) dot.classList.add('gallery-modal__dot--active');
      dotsEl.appendChild(dot);
    });
  }

  window.openGalleryForTechnician = function (techId, index) {
    galleryImages = technicianImages[techId] || [];
    currentImageIndex = Math.min(index, galleryImages.length - 1);
    _rebuildGalleryDots();
    _openGallery();
  };

  /* ============================================================
     CERTIFICATE MODAL
     ============================================================ */

  window.openCertificate = function (imagePath) {
    const modal = $(`#certificate-modal`);
    const img   = $(`#certificate-image`);
    if (!modal || !img) return;

    img.src = imagePath;
    img.alt = 'Сертификат';
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  };

  function closeCertificate() {
    const modal = $(`#certificate-modal`);
    if (!modal) return;
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  /* ============================================================
     CALLBACK MODAL
     ============================================================ */

  function openCallbackModal() {
    const modal          = $(`#callback-modal`);
    const formContent    = $(`#callback-form-content`);
    const successContent = $(`#callback-success-content`);
    if (!modal) return;

    formContent.classList.remove('hidden');
    successContent.classList.add('hidden');
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';

    // Reset form values
    const nameInput  = $(`#callback-name`);
    const phoneInput = $(`#callback-phone`);
    if (nameInput)  nameInput.value  = '';
    if (phoneInput) phoneInput.value = '';
    if (nameInput)  nameInput.classList.remove('is-invalid');
    if (phoneInput) phoneInput.classList.remove('is-invalid');

    // Focus first field for a11y
    setTimeout(function () {
      if (nameInput) nameInput.focus();
    }, 100);
  }

  function closeCallbackModal() {
    const modal = $(`#callback-modal`);
    if (!modal) return;
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  function submitCallback(e) {
    e.preventDefault();
    const nameInput  = $(`#callback-name`);
    const phoneInput = $(`#callback-phone`);
    let valid = true;

    if (!nameInput.value.trim()) {
      nameInput.classList.add('is-invalid');
      valid = false;
    } else {
      nameInput.classList.remove('is-invalid');
    }

    if (!phoneInput.value.trim()) {
      phoneInput.classList.add('is-invalid');
      valid = false;
    } else {
      phoneInput.classList.remove('is-invalid');
    }

    if (!valid) {
      const firstInvalid = $$(`.form-field__input.is-invalid`)[0];
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    $(`#callback-form-content`).classList.add('hidden');
    $(`#callback-success-content`).classList.remove('hidden');
  }

  /* ============================================================
     RATING
     ============================================================ */

  function selectRating(value) {
    selectedRating = value;
    $$('.rating-star').forEach(function (star, index) {
      const active = index < value;
      star.classList.toggle('is-active', active);
    });
  }

  function submitRating() {
    if (selectedRating === 0) return;

    const form    = $(`#rating-form`);
    const success = $(`#rating-success`);

    form.classList.add('hidden');
    success.classList.remove('hidden');
  }

  /* ============================================================
     PHONE MASK
     ============================================================ */

  function applyPhoneMask(input) {
    input.addEventListener('input', function (e) {
      let val = input.value.replace(/\D/g, '');

      if (val.startsWith('8')) {
        val = '7' + val.slice(1);
      }
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
      if (e.key === 'Backspace' && input.value.length <= 3) {
        input.value = '';
      }
    });
  }

  /* ============================================================
     KEYBOARD NAVIGATION
     ============================================================ */

  function handleGlobalKeydown(e) {
    const galleryModal  = $(`#gallery-modal`);
    const certModal     = $(`#certificate-modal`);
    const callbackModal = $(`#callback-modal`);

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
     TOUCH SWIPE (gallery)
     ============================================================ */

  function initGallerySwipe() {
    const modal = $(`#gallery-modal`);
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

    /* Carousel dots */
    initCarouselDots('main-projects-scroll', 'main-dots');
    initCarouselDots('second-projects-scroll', 'second-dots');

    /* Carousel drag-to-scroll */
    initCarouselDrag('main-projects-scroll');
    initCarouselDrag('second-projects-scroll');

    /* Carousel touch scroll — horizontal handled in JS, vertical is native */
    initCarouselTouchScroll('main-projects-scroll');
    initCarouselTouchScroll('second-projects-scroll');

    /* Callback modal triggers */
    const openCallbackBtn   = $(`#open-callback-btn`);
    const closCallbackBtn   = $(`#close-callback-btn`);
    const closeSuccessBtn   = $(`#close-success-btn`);
    const callbackBackdrop  = $(`#callback-backdrop`);
    const contactBrigadeBtn = $(`#contact-brigade-btn`);
    const callbackForm      = $(`#callback-form`);

    if (openCallbackBtn)   openCallbackBtn.addEventListener('click', openCallbackModal);
    if (closCallbackBtn)   closCallbackBtn.addEventListener('click', closeCallbackModal);
    if (closeSuccessBtn)   closeSuccessBtn.addEventListener('click', closeCallbackModal);
    if (callbackBackdrop)  callbackBackdrop.addEventListener('click', closeCallbackModal);
    if (contactBrigadeBtn) contactBrigadeBtn.addEventListener('click', openCallbackModal);
    if (callbackForm)      callbackForm.addEventListener('submit', submitCallback);

    /* Phone mask */
    const phoneInput = $(`#callback-phone`);
    if (phoneInput) applyPhoneMask(phoneInput);

    /* Gallery controls */
    const closeGalleryBtn = $(`#close-gallery-btn`);
    const galleryPrev     = $(`#gallery-prev`);
    const galleryNext     = $(`#gallery-next`);
    const galleryModal    = $(`#gallery-modal`);

    if (closeGalleryBtn) closeGalleryBtn.addEventListener('click', closeGallery);
    if (galleryPrev)     galleryPrev.addEventListener('click', prevGalleryImage);
    if (galleryNext)     galleryNext.addEventListener('click', nextGalleryImage);
    if (galleryModal)    galleryModal.addEventListener('click', function (e) {
      if (e.target === galleryModal) closeGallery();
    });

    /* Certificate controls */
    const closeCertBtn = $(`#close-cert-btn`);
    const certModal    = $(`#certificate-modal`);
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

    const submitRatingBtn = $(`#submit-rating`);
    if (submitRatingBtn) submitRatingBtn.addEventListener('click', submitRating);

    /* "Show more certificates" button — toggle hidden certs */
    const showMoreBtn = $(`.certs-section__show-more`);
    if (showMoreBtn) {
      showMoreBtn.addEventListener('click', function () {
        const isExpanded = showMoreBtn.getAttribute('aria-expanded') === 'true';
        const hiddenCerts = document.querySelectorAll('.certs-list__item--hidden');
        hiddenCerts.forEach(function (item) {
          if (isExpanded) {
            item.classList.remove('certs-list__item--visible');
          } else {
            item.classList.add('certs-list__item--visible');
          }
        });
        showMoreBtn.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
        showMoreBtn.textContent = isExpanded ? 'Показать ещё 2 сертификата' : 'Скрыть';
      });
    }

    /* Keyboard */
    document.addEventListener('keydown', handleGlobalKeydown);

    /* Touch swipe */
    initGallerySwipe();
  });

})();
