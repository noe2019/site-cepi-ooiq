// Gestion du formulaire de renseignements
document.getElementById("contactForm").addEventListener("submit", function(e) {
  e.preventDefault();
  
  const nom = document.getElementById("nom").value;
  const email = document.getElementById("email").value;
  const telephone = document.getElementById("telephone").value;
  const forfait = document.getElementById("forfait").value;
  const message = document.getElementById("message").value;

  // Simulation d'envoi (à remplacer par un vrai backend, EmailJS, Formspree, etc.)
  alert(`Merci ${nom} !\n\nVotre demande a été envoyée.\nNous vous contacterons à : ${email}`);
  
  // Réinitialiser le formulaire
  document.getElementById("contactForm").reset();
});
