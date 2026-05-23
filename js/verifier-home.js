const params = new URLSearchParams(window.location.search);
const expiresAt = Number(params.get("expiresAt"));
const timerEl = document.getElementById("homeSessionTimer");

function updateTimer() {
  const remaining = expiresAt - Date.now();

  if (remaining <= 0) {
    timerEl.innerText = "Session expired";
    return;
  }

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  timerEl.innerText = `Session expires in: ${mins}m ${secs}s`;
}

updateTimer();
setInterval(updateTimer, 1000);

function signOutVerifier() {
  fetch("http://localhost:3000/logout", {
    method: "POST",
    credentials: "include",
  }).then(() => {
    window.location.href = "verifier.html";
  });
}