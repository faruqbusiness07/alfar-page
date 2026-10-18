// ===== 1. Navbar berubah saat di-scroll =====
const navbar = document.getElementById("navbar");

function handleScroll() {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
}
window.addEventListener("scroll", handleScroll);
handleScroll();

// ===== 2. Menu HP (buka/tutup) =====
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen);
});

// Tutup menu setelah salah satu link diklik
navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
    });
});

// ===== 3. Reveal: elemen muncul pelan saat masuk layar =====
const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target); // cukup sekali
            }
        });
    },
    { threshold: 0.15 }
);
revealItems.forEach((item) => revealObserver.observe(item));

// ===== 4. Menu aktif sesuai section yang sedang dilihat =====
const sections = document.querySelectorAll("main section[id]");
const menuLinks = document.querySelectorAll(".nav-links a");

const sectionObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                menuLinks.forEach((link) => {
                    link.classList.toggle(
                        "active",
                        link.getAttribute("href") === "#" + entry.target.id
                    );
                });
            }
        });
    },
    { rootMargin: "-45% 0px -50% 0px" } // aktif saat section ada di tengah layar
);
sections.forEach((section) => sectionObserver.observe(section));

/* ===== PROJECTS: modal + carousel (vanilla JS) ===== */
(() => {
    'use strict';

    /* ---------- DATA PROYEK (edit di sini) ----------
       images : daftar path screenshot (taruh di folder images/).
                Kalau file belum ada, otomatis tampil gambar placeholder.
       github / demo : isi URL asli. Kosongkan ('') kalau tidak ada, tombolnya otomatis hilang. */
    const PROJECTS = {
        veganix: {
            title: 'Veganix',
            status: '2025 - In Progress',
            description: 'Toko sayur online tempat pengguna bisa melihat katalog dan memesan sayur segar. Fokus pada alur pemesanan yang sederhana.',
            stack: ['HTML', 'CSS', 'JavaScript'],
            images: ['images/veganix-1.jpg', 'images/veganix-2.jpg', 'images/veganix-3.jpg'],
            github: '#',
            demo: ''
        },
        sporthub: {
            title: 'SportHub',
            status: '2025 - In Progress',
            description: 'Website e-commerce olahraga untuk perlengkapan dan peralatan olahraga, dengan fitur booking online.',
            stack: ['HTML', 'CSS', 'JavaScript'],
            images: ['images/sporthub-1.jpg', 'images/sporthub-2.jpg', 'images/sporthub-3.jpg'],
            github: '#',
            demo: ''
        },
        laundry: {
            title: 'Laundry App',
            status: '2026 - In Progress',
            description: 'Aplikasi mobile untuk mengelola pesanan dan layanan laundry, terhubung ke Supabase sebagai backend.',
            stack: ['Flutter', 'Supabase'],
            images: ['images/laundry-1.jpg', 'images/laundry-2.jpg', 'images/laundry-3.jpg'],
            github: '#',
            demo: ''
        },
        landingpage: {
            title: 'Personal Landingpage',
            status: '2026 - In Progress',
            description: 'Website yang sedang kamu lihat: ruang pribadiku untuk berbagi siapa aku dan apa yang sedang kubangun.',
            stack: ['HTML', 'CSS', 'JavaScript'],
            images: ['image/landing.page.satu.png', 'images/landing-2.jpg'],
            github: '#',
            demo: 'https://alfar-page.vercel.app/'
        }
    };

    /* ---------- ELEMEN ---------- */
    const modal    = document.getElementById('projectModal');
    if (!modal) return;
    const dialog   = modal.querySelector('.modal-dialog');
    const closeBtn = modal.querySelector('.modal-close');
    const carousel = modal.querySelector('.carousel');
    const track    = document.getElementById('carouselTrack');
    const dotsBox  = document.getElementById('carouselDots');
    const prevBtn  = modal.querySelector('.carousel-btn.prev');
    const nextBtn  = modal.querySelector('.carousel-btn.next');
    const titleEl  = document.getElementById('modalTitle');
    const descEl   = document.getElementById('modalDesc');
    const statusEl = document.getElementById('modalStatus');
    const stackEl  = document.getElementById('modalStack');
    const actionsEl = document.getElementById('modalActions');

    let index = 0;
    let total = 0;
    let lastFocused = null;

    /* ---------- PLACEHOLDER kalau gambar belum ada ---------- */
    function placeholder(title, n) {
        const svg =
            '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">' +
            '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0" stop-color="#eaf6fe"/><stop offset="1" stop-color="#f4f6f8"/></linearGradient></defs>' +
            '<rect width="1280" height="720" fill="url(#g)"/>' +
            '<text x="640" y="350" text-anchor="middle" font-family="Arial, sans-serif" font-size="46" font-weight="700" fill="#1d9bd8">' +
            title.replace(/[<>&]/g, '') + '</text>' +
            '<text x="640" y="405" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="#6b7280">' +
            'Screenshot ' + n + ' belum ditambahkan</text></svg>';
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    /* ---------- CAROUSEL ---------- */
    function goTo(i) {
        index = (i + total) % total;
        track.style.transform = 'translateX(' + (-index * 100) + '%)';
        [...track.children].forEach((slide, n) => slide.setAttribute('aria-hidden', n === index ? 'false' : 'true'));
        [...dotsBox.children].forEach((dot, n) => {
            const active = n === index;
            dot.classList.toggle('is-active', active);
            dot.setAttribute('aria-selected', active ? 'true' : 'false');
        });
    }

    function buildCarousel(project) {
        track.innerHTML = '';
        dotsBox.innerHTML = '';
        total = project.images.length;

        project.images.forEach((src, n) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.setAttribute('role', 'group');
            slide.setAttribute('aria-roledescription', 'slide');
            slide.setAttribute('aria-label', (n + 1) + ' dari ' + total);

            const img = document.createElement('img');
            img.src = src;
            img.alt = project.title + ' - screenshot ' + (n + 1);
            img.draggable = false;
            img.addEventListener('error', () => { img.src = placeholder(project.title, n + 1); }, { once: true });
            slide.appendChild(img);
            track.appendChild(slide);

            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'carousel-dot';
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', 'Screenshot ' + (n + 1));
            dot.addEventListener('click', () => goTo(n));
            dotsBox.appendChild(dot);
        });

        carousel.classList.toggle('is-single', total < 2);

        // reset posisi tanpa animasi saat dibuka
        track.style.transition = 'none';
        goTo(0);
        void track.offsetWidth;
        track.style.transition = '';
    }

    /* ---------- BUKA / TUTUP MODAL ---------- */
    function fillContent(project) {
        titleEl.textContent = project.title;
        descEl.textContent = project.description;
        statusEl.textContent = project.status;

        stackEl.innerHTML = '';
        project.stack.forEach(tech => {
            const li = document.createElement('li');
            li.textContent = tech;
            stackEl.appendChild(li);
        });

        actionsEl.innerHTML = '';
        const links = [
            { url: project.demo,   label: 'Live Demo',   cls: 'btn-primary' },
            { url: project.github, label: 'View GitHub', cls: 'btn-ghost' }
        ];
        links.forEach(({ url, label, cls }) => {
            if (!url) return;
            const a = document.createElement('a');
            a.href = url;
            a.className = cls;
            a.textContent = label;
            if (url !== '#') { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
            actionsEl.appendChild(a);
        });
        actionsEl.hidden = actionsEl.children.length === 0;
    }

    function openModal(key) {
        const project = PROJECTS[key];
        if (!project) return;

        lastFocused = document.activeElement;
        fillContent(project);
        buildCarousel(project);
        dialog.scrollTop = 0;

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        closeBtn.focus({ preventScroll: true });
    }

    function closeModal() {
        if (!modal.classList.contains('is-open')) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        if (lastFocused && lastFocused.focus) lastFocused.focus({ preventScroll: true });
    }

    /* ---------- EVENT: kartu ---------- */
    document.querySelectorAll('.project-card[data-project]').forEach(card => {
        card.addEventListener('click', () => openModal(card.dataset.project));
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(card.dataset.project);
            }
        });
    });

    /* ---------- EVENT: modal ---------- */
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    prevBtn.addEventListener('click', () => goTo(index - 1));
    nextBtn.addEventListener('click', () => goTo(index + 1));

    document.addEventListener('keydown', e => {
        if (!modal.classList.contains('is-open')) return;

        if (e.key === 'Escape') { closeModal(); return; }
        if (e.key === 'ArrowLeft' && total > 1)  { e.preventDefault(); goTo(index - 1); return; }
        if (e.key === 'ArrowRight' && total > 1) { e.preventDefault(); goTo(index + 1); return; }

        // fokus tidak keluar dari modal
        if (e.key === 'Tab') {
            const focusable = dialog.querySelectorAll('button:not([hidden]), a[href]');
            const visible = [...focusable].filter(el => el.offsetParent !== null);
            if (!visible.length) return;
            const first = visible[0];
            const last = visible[visible.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });

    /* ---------- SWIPE di mobile ---------- */
    let startX = 0;
    let startY = 0;
    carousel.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });
    carousel.addEventListener('touchend', e => {
        if (total < 2) return;
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) goTo(dx < 0 ? index + 1 : index - 1);
    }, { passive: true });
})();

// ===== 5. Tombol copy email =====
const copyButton = document.getElementById("copyEmail");
const emailText = document.getElementById("emailLink").textContent.trim();

copyButton.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(emailText);
        copyButton.textContent = "Copied!";
    } catch (error) {
        copyButton.textContent = "Copy failed";
    }
    setTimeout(() => (copyButton.textContent = "Copy email"), 2000);
});