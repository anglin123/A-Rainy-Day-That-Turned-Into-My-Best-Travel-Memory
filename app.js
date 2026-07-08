/* app.js - A Rainy Day That Turned Into My Best Travel Memory */

document.addEventListener('DOMContentLoaded', () => {
  // --- Sticky Header & Progress Bar ---
  const header = document.querySelector('header');
  const progressBar = document.querySelector('.progress-bar');

  window.addEventListener('scroll', () => {
    // Header shadow toggle
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll reading progress
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = (window.scrollY / totalHeight) * 100;
      progressBar.style.width = `${progress}%`;
    }
  });

  // --- Back to Top Button ---
  const backToTopBtn = document.createElement('button');
  backToTopBtn.className = 'back-to-top';
  backToTopBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>`;
  document.body.appendChild(backToTopBtn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTopBtn.classList.add('active');
    } else {
      backToTopBtn.classList.remove('active');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- Scroll Indicator click handler ---
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const target = document.getElementById('story');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // --- Rain Canvas Overlay (Performance Optimized) ---
  const canvas = document.getElementById('rainCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const drops = [];
    const maxDrops = 120;

    class Drop {
      constructor() {
        this.reset();
        this.y = Math.random() * height; // Start at random height initially
      }

      reset() {
        this.x = Math.random() * width;
        this.y = -20;
        this.length = 15 + Math.random() * 20;
        this.speed = 8 + Math.random() * 8;
        this.opacity = 0.15 + Math.random() * 0.25;
        this.angle = 12 * Math.PI / 180; // Falls at slightly slanted angle
      }

      update() {
        this.y += this.speed;
        this.x += Math.sin(this.angle) * 2;

        if (this.y > height + 20) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(148, 163, 184, ${this.opacity})`;
        ctx.lineWidth = 1.2;
        const endX = this.x + Math.sin(this.angle) * this.length;
        const endY = this.y + this.length;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    }

    // Populate initial drops
    for (let i = 0; i < maxDrops; i++) {
      drops.push(new Drop());
    }

    let animationFrameId;
    let isHeroVisible = true;

    function animate() {
      if (!isHeroVisible) return;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < drops.length; i++) {
        drops[i].update();
        drops[i].draw();
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    // Window Resize support
    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    // IntersectionObserver to pause loop when out of viewport to optimize CPU/Battery
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isHeroVisible = entry.isIntersecting;
          if (isHeroVisible) {
            cancelAnimationFrame(animationFrameId);
            animate();
          } else {
            cancelAnimationFrame(animationFrameId);
          }
        });
      }, { threshold: 0.1 });
      observer.observe(heroSection);
    } else {
      animate();
    }
  }

  // --- Interactive Packing Checklist ---
  const checkboxes = document.querySelectorAll('.checklist-container input[type="checkbox"]');
  const progressFill = document.querySelector('.progress-fill');
  const progressText = document.querySelector('.progress-percentage');

  const checklistStorageKey = 'munnar_rainy_checklist';

  // Load state from localStorage
  const loadChecklistState = () => {
    let savedState = {};
    try {
      savedState = JSON.parse(localStorage.getItem(checklistStorageKey)) || {};
    } catch (e) {
      savedState = {};
    }

    checkboxes.forEach(cb => {
      const itemId = cb.id;
      if (savedState[itemId] !== undefined) {
        cb.checked = savedState[itemId];
      }
    });

    updateProgress();
  };

  const saveChecklistState = () => {
    const state = {};
    checkboxes.forEach(cb => {
      state[cb.id] = cb.checked;
    });
    localStorage.setItem(checklistStorageKey, JSON.stringify(state));
  };

  const updateProgress = () => {
    const total = checkboxes.length;
    if (total === 0) return;
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    const percentage = Math.round((checkedCount / total) * 100);

    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = `${percentage}% Packed`;
  };

  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      saveChecklistState();
      updateProgress();
    });
  });

  loadChecklistState();

  // --- Budget Tab Selector ---
  const budgetTabBtns = document.querySelectorAll('.budget-tab-btn');
  const budgetPanels = document.querySelectorAll('.budget-panel');

  budgetTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons and panels
      budgetTabBtns.forEach(b => b.classList.remove('active'));
      budgetPanels.forEach(p => p.classList.remove('active'));

      // Add active to current button
      btn.classList.add('active');

      // Show corresponding panel
      const targetId = btn.getAttribute('data-target');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // --- FAQ Search and Accordion ---
  const faqSearchInput = document.getElementById('faqSearch');
  const faqItems = document.querySelectorAll('.faq-item');
  const faqNoResults = document.querySelector('.faq-no-results');

  // Accordion Toggle
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    const answer = item.querySelector('.faq-answer');

    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all open FAQs
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-answer').style.maxHeight = null;
      });

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // Live FAQ Search Filter
  if (faqSearchInput) {
    faqSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      let matches = 0;

      faqItems.forEach(item => {
        const questionText = item.querySelector('.faq-question-btn').textContent.toLowerCase();
        const answerText = item.querySelector('.faq-answer-content').textContent.toLowerCase();

        if (questionText.includes(query) || answerText.includes(query)) {
          item.style.display = 'block';
          matches++;
        } else {
          item.style.display = 'none';
          // Ensure it closes if hidden
          item.classList.remove('active');
          item.querySelector('.faq-answer').style.maxHeight = null;
        }
      });

      if (faqNoResults) {
        faqNoResults.style.display = matches === 0 ? 'block' : 'none';
      }
    });
  }

  // --- Lightbox Gallery Implementation ---
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;
  const lightboxCaption = lightbox ? lightbox.querySelector('.lightbox-caption') : null;
  const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
  const lightboxPrev = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
  const lightboxNext = lightbox ? lightbox.querySelector('.lightbox-next') : null;

  let currentGalleryIndex = 0;
  const galleryData = [];

  // Parse images details
  galleryItems.forEach((item, index) => {
    const img = item.querySelector('.gallery-img');
    const title = item.querySelector('.gallery-info h4').textContent;
    const desc = item.querySelector('.gallery-info p').textContent;

    galleryData.push({
      src: img.getAttribute('data-src') || img.src,
      title: title,
      desc: desc
    });

    item.addEventListener('click', () => {
      openLightbox(index);
    });
  });

  const openLightbox = (index) => {
    if (!lightbox) return;
    currentGalleryIndex = index;
    updateLightboxContent();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop background scrolling
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  const updateLightboxContent = () => {
    if (!lightboxImg || !lightboxCaption) return;
    const item = galleryData[currentGalleryIndex];

    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = 'scale(0.95)';

    setTimeout(() => {
      lightboxImg.src = item.src;
      lightboxCaption.innerHTML = `<strong>${item.title}</strong> — ${item.desc}`;
      lightboxImg.style.opacity = '1';
      lightboxImg.style.transform = 'scale(1)';
    }, 150);
  };

  const showNext = () => {
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryData.length;
    updateLightboxContent();
  };

  const showPrev = () => {
    currentGalleryIndex = (currentGalleryIndex - 1 + galleryData.length) % galleryData.length;
    updateLightboxContent();
  };

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', showNext);
  if (lightboxPrev) lightboxPrev.addEventListener('click', showPrev);

  // Close lightbox on clicking dark background overlay
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
        closeLightbox();
      }
    });
  }

  // Keyboard navigation for Lightbox
  window.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev);
  });

  // --- Newsletter Form Submission Handler ---
  const newsletterForm = document.querySelector('.newsletter-form');
  const newsletterMsg = document.querySelector('.newsletter-msg');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('.newsletter-input');
      const email = emailInput.value.trim();

      if (!email) {
        showNewsletterStatus('Please enter an email address.', 'error');
        return;
      }

      if (!validateEmail(email)) {
        showNewsletterStatus('Please enter a valid email address.', 'error');
        return;
      }

      // Mimic an AJAX network request
      showNewsletterStatus('Subscribing...', 'info');

      setTimeout(() => {
        showNewsletterStatus('Thank you for subscribing! Welcome aboard.', 'success');
        emailInput.value = '';
      }, 1000);
    });
  }

  function showNewsletterStatus(text, type) {
    if (!newsletterMsg) return;
    newsletterMsg.textContent = text;
    newsletterMsg.className = 'newsletter-msg'; // reset classes
    newsletterMsg.classList.add(type);
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Lazy loading helper
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  if ('IntersectionObserver' in window) {
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          if (lazyImage.dataset.src) {
            lazyImage.src = lazyImage.dataset.src;
          }
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach((img) => lazyImageObserver.observe(img));
  } else {
    // Fallback for browsers that don't support intersection observer
    lazyImages.forEach((img) => {
      if (img.dataset.src) img.src = img.dataset.src;
    });
  }
});
