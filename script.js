/* =========================
   CEPI Coach - script.js
   - Menu mobile
   - Scroll spy (active link)
   - Header shadow on scroll
   - Bouton "retour en haut"
   - Smooth scroll offset (header)
   - Countdown (prochaine session)
   - Pré-remplissage du forfait (data-forfait)
   - Soumission formulaire (démo + fallback mailto)
========================= */

(() => {
  "use strict";

  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------- Elements ----------
  const header = $("#header");
  const menuToggle = $("#menuToggle");
  const navLinks = $("#navLinks");
  const scrollTopBtn = $("#scrollTop");

  // Countdown elements
  const daysEl = $("#days");
  const hoursEl = $("#hours");
  const minutesEl = $("#minutes");

  // Form
  const contactForm = $("#contactForm");
  const forfaitSelect = $("#forfait");

  // Buttons that choose a forfait
  const forfaitButtons = $$("[data-forfait]");

  // ---------- 1) Mobile menu toggle ----------
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      menuToggle.classList.toggle("active");
    });

    // Close menu when clicking a link (mobile)
    $$("#navLinks a").forEach((a) => {
      a.addEventListener("click", () => {
        navLinks.classList.remove("active");
        menuToggle.classList.remove("active");
      });
    });

    // Close menu on outside click
    document.addEventListener("click", (e) => {
      const isClickInside =
        navLinks.contains(e.target) || menuToggle.contains(e.target);
      if (!isClickInside) {
        navLinks.classList.remove("active");
        menuToggle.classList.remove("active");
      }
    });
  }

  // ---------- 2) Smooth scroll with header offset ----------
  // (Only for same-page anchors)
  const getHeaderOffset = () => (header ? header.offsetHeight : 0);

  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    const y =
      target.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset();

    window.scrollTo({ top: y, behavior: "smooth" });
  });

  // ---------- 3) Header shadow + scrollTop button ----------
  const onScrollUI = () => {
    const y = window.scrollY || document.documentElement.scrollTop;

    // Header shadow
    if (header) {
      header.style.boxShadow =
        y > 8 ? "0 8px 24px rgba(0,0,0,.08)" : "none";
    }

    // Scroll to top button
    if (scrollTopBtn) {
      scrollTopBtn.style.opacity = y > 600 ? "1" : "0";
      scrollTopBtn.style.pointerEvents = y > 600 ? "auto" : "none";
    }
  };

  window.addEventListener("scroll", onScrollUI, { passive: true });
  window.addEventListener("load", onScrollUI);

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ---------- 4) Scroll spy (active nav link) ----------
  const sections = $$("section[id]");
  const navAnchors = $$("#navLinks a[href^='#']");
  const setActiveLink = () => {
    const offset = getHeaderOffset() + 20;
    const y = window.scrollY + offset;

    let currentId = null;
    for (const sec of sections) {
      const top = sec.offsetTop;
      const bottom = top + sec.offsetHeight;
      if (y >= top && y < bottom) {
        currentId = sec.id;
        break;
      }
    }

    navAnchors.forEach((a) => {
      const href = a.getAttribute("href");
      const isActive = currentId && href === `#${currentId}`;
      a.classList.toggle("active", !!isActive);
    });
  };

  window.addEventListener("scroll", setActiveLink, { passive: true });
  window.addEventListener("load", setActiveLink);

  // ---------- 5) Countdown ----------
  // IMPORTANT: adapte la date à ta prochaine session réelle (heure locale).
  // Exemple : 2026-06-15 09:00:00
  const EXAM_DATE = new Date("2026-06-15T09:00:00");

  const pad2 = (n) => String(n).padStart(2, "0");

  const updateCountdown = () => {
    if (!daysEl || !hoursEl || !minutesEl) return;

    const now = new Date();
    const diff = EXAM_DATE.getTime() - now.getTime();

    if (diff <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";

      // Optionnel: afficher "En cours !" si tu as un élément dédié
      const countdownCta = $(".countdown-cta");
      if (countdownCta) countdownCta.textContent = "📌 Session en cours ou date passée.";
      return;
    }

    const totalMinutes = Math.floor(diff / (1000 * 60));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    daysEl.textContent = pad2(days);
    hoursEl.textContent = pad2(hours);
    minutesEl.textContent = pad2(minutes);
  };

  updateCountdown();
  setInterval(updateCountdown, 1000 * 30); // mise à jour toutes les 30s

  // ---------- 6) Pré-remplir le forfait au clic ----------
  if (forfaitSelect && forfaitButtons.length) {
    forfaitButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const forfait = btn.getAttribute("data-forfait");
        if (!forfait) return;

        // set select value if exists
        const option = forfaitSelect.querySelector(`option[value="${forfait}"]`);
        if (option) {
          forfaitSelect.value = forfait;
        }
      });
    });
  }

  // ---------- 7) Form submit ----------
  // Par défaut: démo => empêche l'envoi.
  // Si tu as un endpoint (Netlify Forms, Formspree, backend), je te l’intègre.
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const payload = Object.fromEntries(formData.entries());

      // Validation simple
      if (!payload.nom || !payload.email) {
        alert("Merci de remplir au minimum votre nom complet et votre courriel.");
        return;
      }

      // ✅ Option A (recommandée) : envoi vers un endpoint
      // Décommente et remplace l'URL si tu as un backend / Formspree / etc.
      /*
      try {
        const res = await fetch("https://TON-ENDPOINT", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Erreur d'envoi");
        alert("✅ Merci ! Votre demande a été envoyée.");
        contactForm.reset();
        return;
      } catch (err) {
        console.warn(err);
      }
      */

      // ✅ Option B (fallback) : mailto
      const subject = encodeURIComponent("Demande d'information - CEPI Coach");
      const body = encodeURIComponent(
        `Nom: ${payload.nom}\n` +
        `Email: ${payload.email}\n` +
        `Téléphone: ${payload.telephone || "-"}\n` +
        `Forfait: ${payload.forfait || "-"}\n\n` +
        `Message:\n${payload.message || "-"}\n`
      );

      // Remplace l'adresse si besoin
      window.location.href = `mailto:info@cepicoaching.ca?subject=${subject}&body=${body}`;
    });
  }
})();
