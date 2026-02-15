// Menu mobile toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  menuToggle.classList.toggle('active');
});

// Fermer le menu au clic sur un lien
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    menuToggle.classList.remove('active');
  });
});

// Countdown timer
const examDate = new Date("2025-09-15T08:00:00").getTime();

const updateCountdown = () => {
  const now = new Date().getTime();
  const distance = examDate - now;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

  document.getElementById("days").textContent = String(days).padStart(2, '0');
  document.getElementById("hours").textContent = String(hours).padStart(2, '0');
  document.getElementById("minutes").textContent = String(minutes).padStart(2, '0');

  if (distance < 0) {
    clearInterval(timerInterval);
    document.getElementById("timer").innerHTML = "<p>L'examen est en cours !</p>";
  }
};

const timerInterval = setInterval(updateCountdown, 1000);
updateCountdown();

// Pré-remplir le formulaire selon le forfait choisi
document.querySelectorAll('[data-forfait]').forEach(button => {
  button.addEventListener('click', function(e) {
    const forfaitValue = this.getAttribute('data-forfait');
    
    setTimeout(() => {
      const selectForfait = document.getElementById('forfait');
      if (selectForfait && forfaitValue) {
        selectForfait.value = forfaitValue;
      }
    }, 100);
  });
});

// Gestion du formulaire
document.getElementById("contactForm").addEventListener("submit", function(e) {
  e.preventDefault();
  
  const formData = {
    nom: document.getElementById("nom").value,
    email: document.getElementById("email").value,
    telephone: document.getElementById("telephone").value,
    forfait: document.getElementById("forfait").value,
    message: document.getElementById("message").value
  };

  // Simulation d'envoi (à remplacer par vraie intégration backend/EmailJS)
  console.log("Formulaire soumis:", formData);
  
  alert(`Merci ${formData.nom} !\n\nVotre demande a été reçue.\nNous vous contacterons à : ${formData.email}`);
  
  this.reset();
});

// Scroll to top button
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
  if (window.pageYOffset > 300) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }
});

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Header shadow on scroll
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  if (window.pageYOffset > 100) {
    header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  } else {
    header.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
  }
});

// Lazy loading images (si pas supporté nativement)
if ('loading' in HTMLImageElement.prototype) {
  const images = document.querySelectorAll('img[loading="lazy"]');
  images.forEach(img => {
    img.src = img.dataset.src || img.src;
  });
} else {
  // Fallback pour navigateurs anciens
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
  document.body.appendChild(script);
}

// Animations au scroll (optionnel - nécessite Intersection Observer)
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.card, .testimonial, .blog-card').forEach(el => {
  el.style.opacity = '0';
  observer.observe(el);
});
