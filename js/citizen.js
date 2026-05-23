const BACKEND = "http://localhost:3000";
let provider;
let signer;
let sessionInterval;

async function connectWallet() {
  if (!window.ethereum) { alert("MetaMask is not installed."); return; }

  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();

  const address = await signer.getAddress();
  document.getElementById("walletAddress").innerText = address;

  await siweLogin(address);
}

async function siweLogin(address) {
  // 1. Get pre-built SIWE message from backend
  const { message } = await fetch(`${BACKEND}/message?address=${address}`, {
    credentials: "include"
  }).then(r => r.json());

  // 2. Sign it
  const signature = await signer.signMessage(message);

  // 3. Verify with backend
  const result = await fetch(`${BACKEND}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ message, signature, type: "citizen" })
  }).then(r => r.json());

  if (result.success) {
    startSessionTimer(result.expiresAt);
    document.getElementById("loginStatus").innerText = "Signed in with Ethereum";
  } else {
    alert("SIWE login failed.");
  }
}

function startSessionTimer(expiresAt) {
  const timerEl = document.getElementById("sessionTimer");
  clearInterval(sessionInterval);

  sessionInterval = setInterval(() => {
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      clearInterval(sessionInterval);
      timerEl.innerText = "";
      document.getElementById("walletAddress").innerText = "Not Connected";
      document.getElementById("loginStatus").innerText = "";
      signer = null;
      return;
    }
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    timerEl.innerText = `Session expires in: ${mins}m ${secs}s`;
  }, 1000);
}

async function signIdentity() {
  if (!signer) {
    alert("Please connect your wallet first.");
    return;
  }

  const identityData = document.getElementById("identityData").value.trim();
  if (!identityData) { alert("Please enter your identity data."); return; }

  const signature = await signer.signMessage(identityData);
  document.getElementById("signatureOutput").value = signature;
}

function copySignature() {
  const sig = document.getElementById("signatureOutput").value;
  if (!sig) { alert("No signature to copy."); return; }
  navigator.clipboard.writeText(sig);
  alert("Signature copied to clipboard.");
}

async function logout() {
  await fetch(`${BACKEND}/logout`, { method: "POST", credentials: "include" });
  clearInterval(sessionInterval);
  document.getElementById("walletAddress").innerText = "Not Connected";
  document.getElementById("loginStatus").innerText = "";
  document.getElementById("sessionTimer").innerText = "";
  signer = null;
}

document.getElementById("connectWalletBtn").addEventListener("click", connectWallet);