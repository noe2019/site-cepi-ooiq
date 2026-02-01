const examDate = new Date("2024-09-15T08:00:00").getTime();

const timer = setInterval(() => {
  const now = new Date().getTime();
  const distance = examDate - now;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

  document.getElementById("timer").innerHTML = `${days} j ${hours} h ${minutes} min`;

  if (distance < 0) {
    clearInterval(timer);
    document.getElementById("timer").innerHTML = "En cours !";
  }
}, 1000);
