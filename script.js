/* =========================
   CEPI Coach - script.js
   - Menu mobile
   - Scroll spy (active link)
   - Header shadow on scroll
   - Bouton "retour en haut"
   - Smooth scroll offset (header)
   - Countdown (prochaine session)
   - Pré-remplissage du forfait (data-forfait)
   - Envoi email via EmailJS (sans ouvrir le client mail)
========================= */

// ── Configuration EmailJS ──────────────────────────────
// 1. Créez un compte sur https://emailjs.com (gratuit)
// 2. Ajoutez un service Gmail  → notez le SERVICE_ID
// 3. Créez un template        → notez le TEMPLATE_ID
// 4. Copiez votre Public Key  → notez la PUBLIC_KEY
// Remplacez les 3 valeurs ci-dessous, puis faites git push.
const EMAILJS_PUBLIC_KEY  = "xnzpy7Xkp0uSR5eaE";
const EMAILJS_SERVICE_ID  = "service_2z0zt6i";
const EMAILJS_TEMPLATE_ID = "template_sk1ss5l";
// Le destinataire (contact@cepicoach.com) est défini dans le champ
// "To Email" du template EmailJS. Les variables envoyées ci-dessous
// correspondent au template "Contact Us" : name, email, title, message, time.
// ──────────────────────────────────────────────────────

// Initialisation EmailJS (dès que le script est chargé)
if (typeof emailjs !== "undefined") {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

(() => {
  "use strict";

  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

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
    const setMenu = (open) => {
      navLinks.classList.toggle("active", open);
      menuToggle.classList.toggle("active", open);
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    };

    menuToggle.addEventListener("click", () => {
      setMenu(!navLinks.classList.contains("active"));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenu(false);
    });

    // Close menu when clicking a link (mobile)
    $$("#navLinks a").forEach((a) => {
      a.addEventListener("click", () => setMenu(false));
    });

    // Close menu on outside click
    document.addEventListener("click", (e) => {
      const isClickInside =
        navLinks.contains(e.target) || menuToggle.contains(e.target);
      if (!isClickInside) setMenu(false);
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
  // Dates des prochaines sessions de l'examen de l'OIIQ (format AAAA-MM-JJ).
  // Le compte à rebours vise automatiquement la prochaine date à venir, puis
  // passe à la suivante. Quand toutes les dates sont passées, il se masque :
  // il suffit d'ajouter une date à la liste pour qu'il réapparaisse.
  const EXAM_DATES = [
    "2027-03-31",
    "2027-09-27",
  ];
  const EXAM_START_HOUR = "09:00"; // heure indicative de début

  const nextExamDate = () =>
    EXAM_DATES
      .map((d) => new Date(`${d}T${EXAM_START_HOUR}:00`))
      .sort((a, b) => a - b)
      .find((d) => d.getTime() > Date.now()) || null;

  const examDateLabel = $("#examDateLabel");

  const pad2 = (n) => String(n).padStart(2, "0");

  const updateCountdown = () => {
    if (!daysEl || !hoursEl || !minutesEl) return;

    const countdownSection = $("#countdown");
    const examDate = nextExamDate();

    if (!examDate) {
      if (countdownSection) countdownSection.hidden = true;
      return;
    }
    if (countdownSection) countdownSection.hidden = false;

    if (examDateLabel) {
      examDateLabel.textContent = examDate.toLocaleDateString("fr-CA", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      });
    }

    const diff = examDate.getTime() - Date.now();

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

  // Labels lisibles pour les forfaits et les sources
  const FORFAIT_LABELS = {
    "option-a" : "Option A — Révisions intensives (300 $)",
    "option-b" : "Option B — Simulations d'examen (200 $)",
    "option-c" : "Option C — Coaching individuel (400 $)",
    "a-b"      : "Option A + B — Révisions intensives + Simulations (400 $)",
    "b-c"      : "Option B + C — Simulations + Coaching individuel (500 $)",
    "a-b-c"    : "Option A + B + C — Formule complète (700 $)"
  };

  const SOURCE_LABELS = {
    "ami"       : "Par un(e) ami(e)",
    "internet"  : "En naviguant sur Internet",
    "reseaux"   : "Réseaux sociaux",
    "reference" : "Référence professionnelle",
    "autre"     : "Autre"
  };

  if (inscriptionForm) {
    inscriptionForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(inscriptionForm);
      const payload = Object.fromEntries(formData.entries());

      // Récupérer le forfait du select principal
      if (forfaitSelect) payload.forfait = forfaitSelect.value;

      // Validation
      if (!payload.forfait) {
        alert("Veuillez sélectionner un forfait à l'étape 1 avant de continuer.");
        $("#step-1").scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (!payload.prenom || !payload.nom || !payload.email || !payload.telephone) {
        alert("Veuillez remplir tous les champs obligatoires (prénom, nom, courriel, téléphone).");
        return;
      }
      if (!payload.source) {
        alert("Veuillez indiquer comment vous avez entendu parler de la formation.");
        return;
      }

      // Labels lisibles
      const forfaitLabel = FORFAIT_LABELS[payload.forfait] || payload.forfait || "Non précisé";
      const sourceLabel  = SOURCE_LABELS[payload.source]  || payload.source;

      // Bouton : état confirmé
      const submitBtn = inscriptionForm.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.textContent = "Inscription confirmée ✓";
        submitBtn.disabled = true;
      }

      // ── Afficher l'étape 3 Interac immédiatement ──
      const step3 = $("#step-3");
      if (step3) {
        step3.style.display = "block";
        setTimeout(() => step3.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      }

      // ── Envoi silencieux via EmailJS ──
      const templateParams = {
        name    : `${payload.prenom} ${payload.nom}`,
        email   : payload.email,
        title   : `Inscription — ${forfaitLabel}`,
        time    : new Date().toLocaleString("fr-CA"),
        message :
          `Nouvelle inscription :\n` +
          `Prénom : ${payload.prenom}\n` +
          `Nom : ${payload.nom}\n` +
          `Courriel : ${payload.email}\n` +
          `Téléphone : ${payload.telephone}\n` +
          `Forfait : ${forfaitLabel}\n` +
          `Comment nous a connu : ${sourceLabel}`,
      };

      if (typeof emailjs !== "undefined" && EMAILJS_PUBLIC_KEY !== "VOTRE_PUBLIC_KEY") {
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
          .catch(() => {
            // Échec silencieux : l'utilisateur ne voit rien, l'étape 3 est déjà affichée
            console.warn("EmailJS : échec de l'envoi.");
          });
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

      // Afficher la confirmation immédiatement
      const nomVal = escapeHtml(payload.nom);
      contactForm.innerHTML = `
        <div style="text-align:center;padding:40px 20px;">
          <p style="font-size:48px;margin:0 0 12px;">✅</p>
          <h3 style="font-size:1.2rem;font-weight:800;margin:0 0 10px;">Message envoyé !</h3>
          <p style="color:#6b7280;">Merci <strong>${nomVal}</strong>, nous vous répondrons dans les plus brefs délais.</p>
        </div>`;

      // Envoi silencieux via EmailJS
      if (typeof emailjs !== "undefined" && EMAILJS_PUBLIC_KEY !== "VOTRE_PUBLIC_KEY") {
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          name    : payload.nom,
          email   : payload.email,
          title   : "Demande d'information",
          time    : new Date().toLocaleString("fr-CA"),
          message : payload.message,
        }).catch(() => console.warn("EmailJS : échec demande d'info."));
      }
    });
  }

  // ---------- 9) Avis : affichage des avis approuvés (avis.js) ----------
  const listeAvis = $("#listeAvis");
  const avisApprouves = Array.isArray(window.AVIS_APPROUVES) ? window.AVIS_APPROUVES : [];

  if (listeAvis) {
    avisApprouves.forEach((avis) => {
      if (!avis || !avis.texte || !avis.nom) return;
      const note = Math.min(5, Math.max(1, parseInt(avis.note, 10) || 5));

      const card = document.createElement("div");
      card.className = "testimonial";

      const stars = document.createElement("div");
      stars.className = "stars";
      stars.setAttribute("aria-label", `${note} sur 5`);
      stars.textContent = "★".repeat(note) + "☆".repeat(5 - note);

      const texte = document.createElement("p");
      texte.textContent = `"${String(avis.texte).trim()}"`;

      const author = document.createElement("div");
      author.className = "author";
      const nom = document.createElement("strong");
      nom.textContent = avis.nom;
      author.appendChild(nom);
      if (avis.statut) {
        const statut = document.createElement("span");
        statut.textContent = avis.statut;
        author.appendChild(statut);
      }

      card.append(stars, texte, author);
      listeAvis.appendChild(card);
    });
  }

  // ---------- 9 bis) Note moyenne, calculée à partir des avis publiés ----------
  // Elle se met à jour toute seule à chaque avis ajouté dans avis.js.
  if (listeAvis) {
    const notes = $$(".testimonial .stars", listeAvis)
      .map((el) => (el.textContent.match(/★/g) || []).length)
      .filter((n) => n >= 1 && n <= 5);

    if (notes.length) {
      const moyenne = notes.reduce((a, b) => a + b, 0) / notes.length;
      const moyenneTxt = moyenne.toLocaleString("fr-CA", {
        minimumFractionDigits: 1, maximumFractionDigits: 1,
      });
      const nbTxt = `${notes.length} avis`;

      const noteEl = $("#noteMoyenne");
      const noteLabel = $("#noteLabel");
      if (noteEl) noteEl.textContent = `${moyenneTxt}/5`;
      if (noteLabel) noteLabel.textContent = `Note moyenne (${nbTxt})`;

      const resume = $("#resumeAvis");
      if (resume) {
        const pleines = Math.round(moyenne);
        resume.innerHTML =
          `<span class="stars" aria-hidden="true">${"★".repeat(pleines)}${"☆".repeat(5 - pleines)}</span>` +
          `<strong>${moyenneTxt} sur 5</strong> — ${nbTxt}`;
        resume.hidden = false;
      }
    }
  }

  // ---------- 10) Avis : formulaire de dépôt ----------
  // L'avis est envoyé par courriel (EmailJS) pour validation. Rien n'est
  // publié automatiquement : voir avis.js pour publier un avis approuvé.
  const reviewForm = $("#reviewForm");

  if (reviewForm) {
    const ratingLabels = $$("#avisRating label");
    const ratingInputs = $$("#avisRating input");
    const texteEl = $("#avis-texte");
    const countEl = $("#avisCount");
    const statusEl = $("#avisStatus");
    const submitBtn = reviewForm.querySelector("button[type='submit']");

    const paintStars = () => {
      const checked = ratingInputs.find((i) => i.checked);
      const value = checked ? Number(checked.value) : 0;
      ratingLabels.forEach((label, idx) => label.classList.toggle("on", idx < value));
    };
    ratingInputs.forEach((input) => input.addEventListener("change", paintStars));

    if (texteEl && countEl) {
      texteEl.addEventListener("input", () => { countEl.textContent = texteEl.value.length; });
    }

    const showError = (msg) => {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.hidden = false;
    };

    const showThanks = (prenom) => {
      reviewForm.innerHTML = `
        <div class="review-thanks">
          <h4>Merci ${escapeHtml(prenom)} !</h4>
          <p>Votre avis a bien été envoyé. Il sera publié sur le site après validation.</p>
        </div>`;
    };

    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (statusEl) statusEl.hidden = true;

      const data = Object.fromEntries(new FormData(reviewForm).entries());
      const nom = (data.nom || "").trim();
      const email = (data.email || "").trim();
      const texte = (data.texte || "").trim();
      const note = parseInt(data.note, 10);

      if (!nom || !email || !texte) {
        showError("Veuillez remplir votre prénom, votre courriel et votre avis.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError("Veuillez entrer une adresse courriel valide.");
        return;
      }
      if (!note) {
        showError("Veuillez choisir une note de 1 à 5 étoiles.");
        return;
      }
      if (texte.length < 10) {
        showError("Votre avis est un peu court : ajoutez quelques mots.");
        return;
      }
      if (!data.accord) {
        showError("Veuillez cocher la case d'accord pour la publication de votre avis.");
        return;
      }

      // Champ piège rempli = robot : on fait comme si l'envoi avait réussi.
      if (data.site_web) {
        showThanks(nom);
        return;
      }

      if (typeof emailjs === "undefined") {
        showError("L'envoi est momentanément indisponible. Vous pouvez nous écrire à contact@cepicoach.com.");
        return;
      }

      const original = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) { submitBtn.textContent = "Envoi en cours…"; submitBtn.disabled = true; }

      // Ligne prête à copier dans avis.js pour publier l'avis.
      const ligne = "  " + JSON.stringify({ nom, statut: data.statut || "", note, texte }) + ",";

      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        name    : nom,
        email   : email,
        title   : `Nouvel avis à approuver — ${note}/5`,
        time    : new Date().toLocaleString("fr-CA"),
        message :
          `NOUVEL AVIS À APPROUVER\n\n` +
          `Prénom affiché : ${nom}\n` +
          `Courriel (non publié) : ${email}\n` +
          `Situation : ${data.statut || "Non précisée"}\n` +
          `Note : ${note}/5\n\n` +
          `Avis :\n${texte}\n\n` +
          `----------------------------------------\n` +
          `Pour le publier : copiez la ligne ci-dessous dans le fichier avis.js du site, ` +
          `entre les crochets [ ], puis mettez le site en ligne. ` +
          `Pour le refuser, ne faites rien.\n\n` +
          ligne,
      }).then(
        () => showThanks(nom),
        () => {
          if (submitBtn) { submitBtn.textContent = original; submitBtn.disabled = false; }
          showError("L'envoi n'a pas fonctionné. Réessayez dans un instant ou écrivez-nous à contact@cepicoach.com.");
        }
      );
    });
  }

})();
