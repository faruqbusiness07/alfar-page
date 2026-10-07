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