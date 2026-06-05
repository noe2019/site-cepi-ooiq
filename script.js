/* =========================
   CEPI Coach - script.js
   - Menu mobile
   - Scroll spy (active link)
   - Header shadow on scroll
   - Bouton "retour en haut"
   - Smooth scroll offset (header)
   - Countdown (prochaine session)
   - Pré-remplissage du forfait (data-forfait)
   - Soumission formulaire via Formspree
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

  // Forms
  const inscriptionForm = $("#inscriptionForm");
  const contactForm = $("#contactForm");
  const forfaitSelect = $("#forfait-inscription");

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

    if (header) {
      header.style.boxShadow =
        y > 8 ? "0 8px 24px rgba(0,0,0,.08)" : "none";
    }

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
  // Prochaine session OIIQ — septembre 2026 (date exacte à confirmer sur oiiq.org)
  // L'OIIQ tient généralement ses examens le 3e jeudi de septembre.
  const EXAM_DATE = new Date("2026-09-17T09:00:00");

  const pad2 = (n) => String(n).padStart(2, "0");

  const updateCountdown = () => {
    if (!daysEl || !hoursEl || !minutesEl) return;

    const now = new Date();
    const diff = EXAM_DATE.getTime() - now.getTime();

    if (diff <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
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
  setInterval(updateCountdown, 1000 * 30);

  // ---------- 6) Pré-remplir le forfait au clic sur les cartes ----------
  if (forfaitButtons.length) {
    forfaitButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const forfait = btn.getAttribute("data-forfait");
        if (!forfait) return;

        // Remplir le select #forfait-inscription
        if (forfaitSelect) {
          const option = forfaitSelect.querySelector(`option[value="${forfait}"]`);
          if (option) forfaitSelect.value = forfait;
        }
      });
    });
  }

  // ---------- 7) Formulaire d'inscription ----------
  if (inscriptionForm) {
    inscriptionForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(inscriptionForm);
      const payload = Object.fromEntries(formData.entries());

      // Récupérer le forfait du select principal
      if (forfaitSelect) {
        payload.forfait = forfaitSelect.value;
      }

      // Validation
      if (!payload.prenom || !payload.nom || !payload.email || !payload.telephone) {
        alert("Veuillez remplir tous les champs obligatoires (prénom, nom, courriel, téléphone).");
        return;
      }
      if (!payload.source) {
        alert("Veuillez indiquer comment vous avez entendu parler de la formation.");
        return;
      }

      // Bouton : état chargement
      const submitBtn = inscriptionForm.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.textContent = "Inscription confirmée ✓";
        submitBtn.disabled = true;
      }

      // Envoyer par mailto (fallback simple)
      const subject = encodeURIComponent("Nouvelle inscription — CEPI Coach");
      const body = encodeURIComponent(
        `Prénom : ${payload.prenom}\n` +
        `Nom : ${payload.nom}\n` +
        `Courriel : ${payload.email}\n` +
        `Téléphone : ${payload.telephone}\n` +
        `Forfait : ${payload.forfait || "Non précisé"}\n` +
        `Source : ${payload.source}\n`
      );
      window.open(`mailto:blessing.pk123@gmail.com?subject=${subject}&body=${body}`);

      // Afficher l'étape 3 (Interac)
      const step3 = $("#step-3");
      if (step3) {
        step3.style.display = "block";
        step3.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  // ---------- 8) Formulaire demande d'info ----------
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const payload = Object.fromEntries(formData.entries());

      if (!payload.nom || !payload.email || !payload.message) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
      }

      const submitBtn = contactForm.querySelector("button[type='submit']");
      if (submitBtn) { submitBtn.textContent = "Envoi en cours…"; submitBtn.disabled = true; }

      const subject = encodeURIComponent("Demande d'information — CEPI Coach");
      const body = encodeURIComponent(
        `Nom : ${payload.nom}\nCourriel : ${payload.email}\n\nMessage :\n${payload.message}`
      );
      window.open(`mailto:blessing.pk123@gmail.com?subject=${subject}&body=${body}`);

      contactForm.innerHTML = `
        <div style="text-align:center;padding:40px 20px;">
          <p style="font-size:48px;margin:0 0 12px;">✅</p>
          <h3 style="font-size:1.2rem;font-weight:800;margin:0 0 10px;">Message envoyé !</h3>
          <p style="color:#6b7280;">Merci <strong>${payload.nom}</strong>, nous vous répondrons dans les plus brefs délais.</p>
        </div>`;
    });
  }

})();
