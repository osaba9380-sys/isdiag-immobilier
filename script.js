document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Navbar Sticky & Active State
    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // 2. Animations au Scroll
    const reveals = document.querySelectorAll(".reveal");
    const revealOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
        });
    }, revealOptions);
    reveals.forEach(reveal => revealOnScroll.observe(reveal));

    // 3. Gestion de la Modale de RDV (Le Tunnel)
    const modal = document.getElementById('rdvModal');
    const btnOpenModal = document.getElementById('openRdvModal');
    const btnCloseModal = document.getElementById('closeModal');

    // Etapes de la modale
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const btnNext = document.getElementById('nextStepBtn');
    const btnPrev = document.getElementById('prevStepBtn');

    // Elements calendrier
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const monthYearDisplay = document.getElementById('monthYearDisplay');
    const calendarDaysGrid = document.getElementById('calendarDaysGrid');
    const calendarView = document.getElementById('calendarView');
    const timeView = document.getElementById('timeView');
    const backToCalendarBtn = document.getElementById('backToCalendarBtn');
    const step1Title = document.getElementById('step1Title');
    const step1Subtitle = document.getElementById('step1Subtitle');
    const selectedDateText = document.getElementById('selectedDateText');
    const timeSlotsContainer = document.getElementById('timeSlotsContainer');
    const selectedTimeDisplay = document.getElementById('selectedTimeDisplay');

    const monthNames = [
        'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
    ];
    const hourSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    let currentDate = new Date();
    currentDate.setDate(1);
    let selectedFullDate = null;
    let selectedTime = null;

    function formatLongDate(date) {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    function resetTimeSelection() {
        selectedTime = null;
        if (timeSlotsContainer) {
            timeSlotsContainer.querySelectorAll('.time-btn').forEach((btn) => btn.classList.remove('selected'));
        }
        if (btnNext) btnNext.disabled = true;
    }

    function renderTimeSlots() {
        if (!timeSlotsContainer) return;
        timeSlotsContainer.innerHTML = '';

        hourSlots.forEach((slot) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'time-btn';
            btn.innerText = slot;
            btn.addEventListener('click', () => {
                timeSlotsContainer.querySelectorAll('.time-btn').forEach((b) => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedTime = slot;
                if (btnNext) btnNext.disabled = false;
            });
            timeSlotsContainer.appendChild(btn);
        });
    }

    // Selection d'une date
    function selectDate(dateObj, btnElement) {
        if (calendarDaysGrid) {
            calendarDaysGrid.querySelectorAll('.cal-day-btn').forEach((b) => b.classList.remove('active'));
        }
        btnElement.classList.add('active');

        selectedFullDate = new Date(dateObj);
        selectedFullDate.setHours(0, 0, 0, 0);
        selectedTime = null;
        if (btnNext) btnNext.disabled = true;

        const dateStr = `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
        if (selectedDateText) selectedDateText.innerText = dateStr;

        // BASCULE DES VUES : on cache le calendrier, on montre les heures
        if (calendarView) calendarView.style.display = 'none';
        if (timeView) timeView.style.display = 'block';
        if (step1Title) step1Title.innerText = 'Choisir une heure';
        if (step1Subtitle) step1Subtitle.innerText = 'Selectionnez votre creneau pour le rappel.';
        if (btnNext) btnNext.style.display = 'block';

        renderTimeSlots();
    }

    // Generation du calendrier
    function renderCalendar() {
        if (!calendarDaysGrid || !monthYearDisplay) return;

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        monthYearDisplay.innerText = `${monthNames[month]} ${year}`;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Ajustement pour que Lundi soit le 1er jour (0) au lieu de Dimanche
        const firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        const daysGrid = calendarDaysGrid;
        daysGrid.innerHTML = '';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Cases vides avant le 1er du mois
        for (let i = 0; i < firstDayIndex; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'cal-day-btn empty';
            daysGrid.appendChild(emptyDiv);
        }

        // Jours du mois
        for (let day = 1; day <= daysInMonth; day++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'cal-day-btn';
            btn.innerText = day;

            const iterDate = new Date(year, month, day);
            iterDate.setHours(0, 0, 0, 0);
            const isSunday = iterDate.getDay() === 0;

            if (iterDate < today || isSunday) {
                btn.disabled = true;
            } else {
                btn.addEventListener('click', () => selectDate(iterDate, btn));
            }

            if (selectedFullDate && iterDate.getTime() === selectedFullDate.getTime()) {
                btn.classList.add('active');
            }

            daysGrid.appendChild(btn);
        }
    }

    function resetModalState() {
        selectedFullDate = null;
        resetTimeSelection();

        if (step1) step1.classList.add('active');
        if (step2) step2.classList.remove('active');
        if (calendarView) calendarView.style.display = 'block';
        if (timeView) timeView.style.display = 'none';
        if (step1Title) step1Title.innerText = 'Planifier un appel';
        if (step1Subtitle) step1Subtitle.innerText = 'Selectionnez la date de votre rendez-vous.';
        if (btnNext) btnNext.style.display = 'none';
        if (selectedDateText) selectedDateText.innerText = '--';
        if (selectedTimeDisplay) selectedTimeDisplay.innerText = '...';
        if (timeSlotsContainer) timeSlotsContainer.innerHTML = '';

        currentDate = new Date();
        currentDate.setDate(1);
        renderCalendar();
    }

    // Ouvrir / Fermer Modale
    if (btnOpenModal && modal) {
        btnOpenModal.addEventListener('click', (e) => {
            e.preventDefault();
            currentDate = new Date();
            currentDate.setDate(1);
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            resetModalState();
        });
    }

    // Bouton RDV mobile
    const btnOpenModalMobile = document.getElementById('openRdvModalMobile');
    if (btnOpenModalMobile && modal) {
        btnOpenModalMobile.addEventListener('click', (e) => {
            e.preventDefault();
            currentDate = new Date();
            currentDate.setDate(1);
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            resetModalState();
        });
    }

    // Bouton pour revenir au calendrier
    if (backToCalendarBtn) {
        backToCalendarBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (timeView) timeView.style.display = 'none';
            if (calendarView) calendarView.style.display = 'block';
            if (step1Title) step1Title.innerText = 'Planifier un appel';
            if (step1Subtitle) step1Subtitle.innerText = 'Selectionnez la date de votre rendez-vous.';
            if (btnNext) btnNext.style.display = 'none';
            selectedTime = null;
            if (btnNext) btnNext.disabled = true;
        });
    }

    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    // Passer a l'etape 2
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            if (!selectedFullDate || !selectedTime || !selectedTimeDisplay) return;
            selectedTimeDisplay.innerText = `${formatLongDate(selectedFullDate)} a ${selectedTime}`;

            if (step1) step1.classList.remove('active');
            if (step2) step2.classList.add('active');
        });
    }

    // Retour a l'etape 1
    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (step2) step2.classList.remove('active');
            if (step1) step1.classList.add('active');
        });
    }

    // Soumission du formulaire RDV
    const rdvForm = document.getElementById('rdvForm');
    if (rdvForm) {
        rdvForm.addEventListener('submit', (e) => {
            e.preventDefault();
            closeModal();
            showConfirmation(
                'Rendez-vous confirmé !',
                `Votre rendez-vous a bien été enregistré pour le <strong class="text-primary">${selectedTimeDisplay ? selectedTimeDisplay.innerText : ''}</strong>.<br><br>Un expert ISDIAG vous rappellera à la date et l'heure convenues. Merci de votre confiance !`
            );
        });
    }

    // Soumission du formulaire de contact / devis
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showConfirmation(
                'Devis envoyé !',
                'Votre demande de devis a bien été reçue.<br><br>Notre équipe vous contactera dans les <strong class="text-primary">24 heures</strong> pour vous proposer un devis personnalisé. Merci de faire confiance à ISDIAG !'
            );
            contactForm.reset();
        });
    }

    // Confirmation overlay
    const confirmationOverlay = document.getElementById('confirmationOverlay');
    const closeConfirmationBtn = document.getElementById('closeConfirmation');
    const confirmationTitle = document.getElementById('confirmationTitle');
    const confirmationMessage = document.getElementById('confirmationMessage');

    function showConfirmation(title, message) {
        if (!confirmationOverlay) return;
        if (confirmationTitle) confirmationTitle.innerText = title;
        if (confirmationMessage) confirmationMessage.innerHTML = message;
        confirmationOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    if (closeConfirmationBtn) {
        closeConfirmationBtn.addEventListener('click', () => {
            if (confirmationOverlay) confirmationOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    if (confirmationOverlay) {
        confirmationOverlay.addEventListener('click', (e) => {
            if (e.target === confirmationOverlay) {
                confirmationOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // --- LOGIQUE MENU BURGER MOBILE ---
    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    const mobileBreakpoint = window.matchMedia('(max-width: 991px)');

    const closeMobileMenu = () => {
        if (!menuBtn || !navLinks) return;
        menuBtn.classList.remove('open');
        navLinks.classList.remove('active');
        body.style.overflow = 'auto';
        document.querySelectorAll('.nav-links .dropdown.open').forEach((item) => item.classList.remove('open'));
    };

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('open');
            navLinks.classList.toggle('active');
            
            // Empêche le scroll derrière le menu
            if (navLinks.classList.contains('active')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = 'auto';
            }
        });
    }

    // En mobile, un clic sur la categorie ouvre/ferme les sous-categories
    document.querySelectorAll('.nav-links .dropdown > a').forEach((link) => {
        link.addEventListener('click', (e) => {
            if (!mobileBreakpoint.matches || !navLinks || !navLinks.classList.contains('active')) return;
            e.preventDefault();

            const parentDropdown = link.closest('.dropdown');
            if (!parentDropdown) return;

            document.querySelectorAll('.nav-links .dropdown.open').forEach((item) => {
                if (item !== parentDropdown) item.classList.remove('open');
            });

            parentDropdown.classList.toggle('open');
        });
    });

    // Fermer le menu quand on clique sur un lien (pour les ancres #)
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            const isDropdownParentLink = link.parentElement && link.parentElement.classList.contains('dropdown');
            if (mobileBreakpoint.matches && isDropdownParentLink) {
                e.preventDefault();
                return;
            }
            closeMobileMenu();
        });
    });

    window.addEventListener('resize', () => {
        if (!mobileBreakpoint.matches) {
            closeMobileMenu();
        }
    });

    // --- PRÉ-SÉLECTION DU DIAGNOSTIC DEPUIS LE MENU ---
    const diagnosticSelect = document.getElementById('diagnosticSelect');

    document.querySelectorAll('[data-diagnostic]').forEach(link => {
        link.addEventListener('click', (e) => {
            const value = link.getAttribute('data-diagnostic');
            if (!value || !diagnosticSelect) return;

            // Preselect the diagnostic type
            diagnosticSelect.value = value;

            // Close mobile menu if open
            closeMobileMenu();
        });
    });

    
});