/**
 * ==========================================================================
 * کلینیک دندانپزشکی تخصصی و زیبایی دُرسا (Dorsa Dental Clinic)
 * معماری و توسعه وب‌سایت: آراد وفایی (aradvafaee.ir)
 * ==========================================================================
 */

// --- 1. اسلایدر تعاملی مقایسه قبل و بعد (Before & After Slider) ---
function initBeforeAfterSlider() {
  const container = document.getElementById('ba-slider');
  const afterContainer = document.getElementById('ba-after-container');
  const handle = document.getElementById('ba-handle');

  if (!container || !afterContainer || !handle) return;

  let isDragging = false;

  const updateSlider = (clientX) => {
    const rect = container.getBoundingClientRect();
    let x = clientX - rect.left;
    // محدودسازی بین 0 تا پهنای ظرف
    if (x < 10) x = 10;
    if (x > rect.width - 10) x = rect.width - 10;

    const percentage = (x / rect.width) * 100;
    
    // در چیدمان راست‌چین RTL، بعد از راست شروع می‌شود
    afterContainer.style.width = `${100 - percentage}%`;
    handle.style.left = `${percentage}%`;
  };

  const onPointerDown = (e) => {
    isDragging = true;
    updateSlider(e.clientX || (e.touches && e.touches[0].clientX));
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    updateSlider(e.clientX || (e.touches && e.touches[0].clientX));
  };

  const onPointerUp = () => {
    isDragging = false;
  };

  container.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  container.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('touchend', onPointerUp);
}

// --- 2. محاسبه‌گر هوشمند هزینه و اقساط دندانپزشکی ---
const treatmentPrices = {
  composite: { name: 'ونیر کامپوزیت IPS آلمان', pricePerUnit: 3900000, defaultUnits: 8, unitTitle: 'واحد دندان' },
  laminate: { name: 'لمینت سرامیکی Emax سوئیس', pricePerUnit: 9800000, defaultUnits: 8, unitTitle: 'واحد دندان' },
  implant: { name: 'ایمپلنت دیجیتال اشترومن سوئیس', pricePerUnit: 18500000, defaultUnits: 1, unitTitle: 'واحد پایه' },
  ortho: { name: 'ارتودنسی نامرئی دو فک (Invisalign)', pricePerUnit: 48000000, defaultUnits: 1, unitTitle: 'دوره درمان' },
  bleaching: { name: 'بلیچینگ مطب + کیت هوم', pricePerUnit: 6500000, defaultUnits: 1, unitTitle: 'پکیج کامل' }
};

function initCostCalculator() {
  const treatmentSelect = document.getElementById('calc-treatment');
  const unitsRange = document.getElementById('calc-units');
  const unitsDisplay = document.getElementById('calc-units-display');
  const planRadios = document.querySelectorAll('input[name="calc-plan"]');

  if (!treatmentSelect || !unitsRange) return;

  const calculate = () => {
    const selectedKey = treatmentSelect.value || 'composite';
    const treatment = treatmentPrices[selectedKey] || treatmentPrices.composite;
    const units = parseInt(unitsRange.value, 10);
    if (unitsDisplay) unitsDisplay.innerText = units.toLocaleString('fa-IR');

    let totalRaw = treatment.pricePerUnit * units;
    
    // خواندن طرح پرداخت
    let plan = 'installment6';
    planRadios.forEach(r => { if (r.checked) plan = r.value; });

    let discount = 0;
    let downPayment = 0;
    let monthlyPayment = 0;
    let months = 6;

    if (plan === 'cash') {
      discount = totalRaw * 0.10; // ۱۰ درصد تخفیف نقدی
      totalRaw = totalRaw - discount;
      downPayment = totalRaw;
      monthlyPayment = 0;
      months = 0;
    } else if (plan === 'installment6') {
      downPayment = totalRaw * 0.30; // ۳۰ درصد پیش پرداخت
      const remainder = totalRaw - downPayment;
      monthlyPayment = remainder / 6;
      months = 6;
    } else if (plan === 'installment12') {
      downPayment = totalRaw * 0.35; // ۳۵ درصد پیش پرداخت
      const remainder = totalRaw - downPayment;
      monthlyPayment = remainder / 12;
      months = 12;
    }

    // به‌روزرسانی UI
    const totalElem = document.getElementById('calc-result-total');
    const downElem = document.getElementById('calc-result-down');
    const monthElem = document.getElementById('calc-result-monthly');
    const monthCountElem = document.getElementById('calc-result-months');
    const discountNote = document.getElementById('calc-discount-note');

    if (totalElem) totalElem.innerText = Math.round(totalRaw).toLocaleString('fa-IR');
    if (downElem) downElem.innerText = Math.round(downPayment).toLocaleString('fa-IR');
    if (monthElem) monthElem.innerText = Math.round(monthlyPayment).toLocaleString('fa-IR');
    if (monthCountElem) monthCountElem.innerText = months > 0 ? `${months.toLocaleString('fa-IR')} ماه` : 'تسویه نقدی یکجا';
    if (discountNote) {
      discountNote.innerText = discount > 0 ? `۱۰٪ تخفیف پرداخت نقدی به مبلغ ${Math.round(discount).toLocaleString('fa-IR')} تومان لحاظ شد.` : 'بدون سود و کارمزد با چک صیادی بنفش';
    }
  };

  treatmentSelect.addEventListener('change', () => {
    const selectedKey = treatmentSelect.value;
    const treatment = treatmentPrices[selectedKey];
    if (treatment && treatment.defaultUnits) {
      unitsRange.value = treatment.defaultUnits;
    }
    calculate();
  });

  unitsRange.addEventListener('input', calculate);
  planRadios.forEach(r => r.addEventListener('change', calculate));

  calculate();
}

// انتقال نتیجه محاسبه‌گر به فرم رزرو نوبت
function transferCalcToBooking() {
  const treatmentSelect = document.getElementById('calc-treatment');
  const totalElem = document.getElementById('calc-result-total')?.innerText || '';
  const monthElem = document.getElementById('calc-result-monthly')?.innerText || '';
  
  const serviceName = treatmentSelect?.options[treatmentSelect.selectedIndex]?.text || 'خدمات دندانپزشکی';
  openBookingModal(`درخواست مشاوره و ویزیت برای: ${serviceName} - برآورد تقریبی: ${totalElem} تومان (ماهانه ${monthElem} تومان)`);
}

// --- 3. سیستم رزرو آنلاین نوبت دندانپزشکی (Appointment Booking) ---
function openBookingModal(prefillNotes = '') {
  const modal = document.getElementById('booking-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';

    if (prefillNotes) {
      const modalNotes = document.getElementById('modal-book-notes');
      const bookNotes = document.getElementById('book-notes');
      if (modalNotes) modalNotes.value = prefillNotes;
      if (bookNotes) bookNotes.value = prefillNotes;
    }
  }
}

function closeBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }
}

function submitBookingForm(e) {
  if (e && e.preventDefault) e.preventDefault();

  const name = document.getElementById('modal-book-name')?.value.trim() || document.getElementById('book-name')?.value.trim();
  const phone = document.getElementById('modal-book-phone')?.value.trim() || document.getElementById('book-phone')?.value.trim();
  const service = document.getElementById('book-service')?.value || 'مشاوره دندانپزشکی';
  const doctor = document.getElementById('book-doctor')?.value || 'اولین پزشک متخصص در دسترس';
  const shift = document.getElementById('book-shift')?.value || 'عصر (۱۶ الی ۲۱)';
  const notes = document.getElementById('modal-book-notes')?.value.trim() || document.getElementById('book-notes')?.value.trim() || 'معاینه و طرح درمان اولیه';

  if (!name || !phone) {
    showToast('لطفاً نام و شماره همراه خود را وارد فرمایید.', 'error');
    return;
  }

  // ایجاد متن رزرو
  const message = `درخواست رزرو نوبت کلینیک دندانپزشکی دُرسا:
نام بیمار: ${name}
شماره تماس: ${phone}
نوع درمان: ${service}
پزشک معالج: ${doctor}
زمان ترجیحی: ${shift}
توضیحات تکمیلی: ${notes}`;

  // ارسال به واتساپ پذیرش کلینیک
  const waUrl = `https://wa.me/989394606013?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');

  closeBookingModal();
  showToast('درخواست نوبت شما با موفقیت ثبت شد و به واحد پذیرش منتقل گردید.', 'success');
}

// --- 4. فیلتر خدمات در کاتالوگ ---
function initServiceFilters() {
  const filterBtns = document.querySelectorAll('.service-filter-btn');
  const cards = document.querySelectorAll('.service-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active', 'bg-cyan-500', 'text-white', 'shadow-md'));
      btn.classList.add('active', 'bg-cyan-500', 'text-white', 'shadow-md');

      const filter = btn.getAttribute('data-filter') || 'all';

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.classList.remove('hidden');
          card.classList.add('animate-fadeIn');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

// --- 5. آکاردئون سوالات متداول ---
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');
    const arrow = item.querySelector('.faq-arrow');

    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isOpen = !content.classList.contains('hidden');

        items.forEach(i => {
          i.querySelector('.faq-content')?.classList.add('hidden');
          i.querySelector('.faq-arrow')?.classList.remove('rotate-180');
        });

        if (!isOpen) {
          content.classList.remove('hidden');
          arrow?.classList.add('rotate-180');
        }
      });
    }
  });
}

// --- 6. شمارنده‌های آماری با IntersectionObserver ---
function initStatCounters() {
  const counters = document.querySelectorAll('.stat-counter');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counters.forEach(counter => {
          const target = parseInt(counter.getAttribute('data-target') || '0', 10);
          const duration = 2000;
          const stepTime = 25;
          const steps = duration / stepTime;
          const increment = target / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.innerText = target.toLocaleString('fa-IR');
              clearInterval(timer);
            } else {
              counter.innerText = Math.floor(current).toLocaleString('fa-IR');
            }
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.getElementById('stats-section');
  if (statsSection) observer.observe(statsSection);
}

// --- 7. سوئیچ تم کلینیک (Light Clean / Dark VIP) ---
function initThemeToggle() {
  const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
  const savedTheme = localStorage.getItem('dorsa-theme') || 'light';

  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcons(savedTheme);

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('dorsa-theme', next);
      updateThemeIcons(next);
      showToast(`تم به حالت ${next === 'dark' ? 'تیره VIP' : 'روشن پزشکی'} تغییر یافت.`);
    });
  });
}

function updateThemeIcons(theme) {
  const icons = document.querySelectorAll('.theme-icon');
  icons.forEach(icon => {
    icon.innerHTML = theme === 'dark'
      ? `<svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
      : `<svg class="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>`;
  });
}

// --- 8. اعلان‌های توست پویا ---
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  const iconColor = type === 'success' ? 'text-emerald-500' : type === 'error' ? 'text-rose-500' : 'text-cyan-500';

  toast.innerHTML = `
    <span class="font-bold text-lg ${iconColor}">${icon}</span>
    <span class="font-medium">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// --- 9. منوی واکنش‌گرای موبایل ---
function initMobileMenu() {
  const openBtn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('mobile-menu-close');
  const drawer = document.getElementById('mobile-menu-drawer');
  const links = document.querySelectorAll('.mobile-nav-link');

  if (openBtn && drawer) {
    openBtn.addEventListener('click', () => {
      drawer.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });

    const close = () => {
      drawer.classList.add('hidden');
      document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', close);
    links.forEach(l => l.addEventListener('click', close));
  }
}

// --- 10. دکمه بازگشت به بالا و هدر چسبنده ---
function initScrollBehaviors() {
  const backToTop = document.getElementById('back-to-top-btn');
  const header = document.getElementById('main-header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      backToTop?.classList.remove('opacity-0', 'pointer-events-none');
      backToTop?.classList.add('opacity-100');
    } else {
      backToTop?.classList.add('opacity-0', 'pointer-events-none');
      backToTop?.classList.remove('opacity-100');
    }

    if (window.scrollY > 40) {
      header?.classList.add('shadow-md', 'backdrop-blur-xl', 'border-b');
    } else {
      header?.classList.remove('shadow-md');
    }
  });

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// راه‌اندازی پس از بارگذاری DOM
document.addEventListener('DOMContentLoaded', () => {
  initBeforeAfterSlider();
  initCostCalculator();
  initServiceFilters();
  initFaqAccordion();
  initStatCounters();
  initThemeToggle();
  initMobileMenu();
  initScrollBehaviors();

  // بستن مودال با کلید Esc یا کلیک روی بک‌دراپ
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeBookingModal();
  });
  const bookingModal = document.getElementById('booking-modal');
  if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) closeBookingModal();
    });
  }
});
