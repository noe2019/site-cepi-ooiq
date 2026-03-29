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

  // ---------- 6) Pré-remplir le forfait au clic ----------
  if (forfaitSelect && forfaitButtons.length) {
    forfaitButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const forfait = btn.getAttribute("data-forfait");
        if (!forfait) return;
        const option = forfaitSelect.querySelector(`option[value="${forfait}"]`);
        if (option) forfaitSelect.value = forfait;

        // Synchroniser aussi le sélecteur de la section paiement
        const forfaitPaiement = $("#forfait-paiement");
        if (forfaitPaiement) {
          const optPaiement = forfaitPaiement.querySelector(`option[value="${forfait}"]`);
          if (optPaiement) {
            forfaitPaiement.value = forfait;
            forfaitPaiement.dispatchEvent(new Event("change"));
          }
        }
      });
    });
  }

  // ---------- 7) Formulaire — Formspree ----------
  // 🔧 CONFIGURATION REQUISE :
  //   1. Créez un compte gratuit sur https://formspree.io
  //   2. Cliquez "+ New Form", nommez-le "CEPI Coach Contact"
  //   3. Copiez votre Form ID (ex: xpwzgkla) et remplacez VOTRE_FORM_ID ci-dessous
  const FORMSPREE_ID = "VOTRE_FORM_ID";
  const FORMSPREE_URL = `https://formspree.io/f/${FORMSPREE_ID}`;

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

      // Bouton : état chargement
      const submitBtn = contactForm.querySelector("button[type='submit']");
      const originalText = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.textContent = "Envoi en cours…";
        submitBtn.disabled = true;
      }

      // Si Formspree non encore configuré → fallback mailto
      if (FORMSPREE_ID === "VOTRE_FORM_ID") {
        const subject = encodeURIComponent("Demande d'information - CEPI Coach");
        const body = encodeURIComponent(
          `Nom: ${payload.nom}\n` +
          `Email: ${payload.email}\n` +
          `Téléphone: ${payload.telephone || "-"}\n` +
          `Forfait: ${payload.forfait || "-"}\n\n` +
          `Message:\n${payload.message || "-"}\n`
        );
        window.location.href = `mailto:info@cepicoaching.ca?subject=${subject}&body=${body}`;
        if (submitBtn) { submitBtn.textContent = originalText; submitBtn.disabled = false; }
        return;
      }

      // Envoi Formspree
      try {
        const res = await fetch(FORMSPREE_URL, {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: formData,
        });

        if (res.ok) {
          contactForm.innerHTML = `
            <div style="text-align:center;padding:40px 20px;">
              <p style="font-size:48px;margin:0 0 12px;">✅</p>
              <h3 style="font-size:22px;font-weight:800;margin:0 0 10px;">Message envoyé !</h3>
              <p style="color:#6b7280;">Merci <strong>${payload.nom}</strong>, nous vous répondrons dans les plus brefs délais à <strong>${payload.email}</strong>.</p>
            </div>`;
        } else {
          throw new Error("Erreur serveur");
        }
      } catch (err) {
        alert("Une erreur est survenue. Veuillez nous écrire directement à info@cepicoaching.ca");
        if (submitBtn) { submitBtn.textContent = originalText; submitBtn.disabled = false; }
      }
    });
  }

})();
