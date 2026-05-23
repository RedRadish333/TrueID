const BACKEND = "http://localhost:3000";

let provider;
let signer;
let verificationContract;

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask is not installed.");
    return;
  }

  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();

    const address = await signer.getAddress();

    verificationContract = new ethers.Contract(
      CREDENTIAL_VERIFICATION_ADDRESS,
      CREDENTIAL_VERIFICATION_ABI,
      signer
    );

    await siweLogin(address);
  } catch (error) {
    console.error(error);
    alert("Wallet connection failed.");
  }
}

async function siweLogin(address) {
  try {
    const nonceResponse = await fetch(`${BACKEND}/message?address=${address}`, {
      credentials: "include"
    });

    const { message } = await nonceResponse.json();

    const signature = await signer.signMessage(message);

    const verifyResponse = await fetch(`${BACKEND}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        message,
        signature,
        type: "verifier"
      })
    });

    const result = await verifyResponse.json();

    if (result.success) {
      await checkCredential(address, result.expiresAt);
    } else {
      alert("SIWE login failed.");
    }
  } catch (error) {
    console.error(error);
    alert("SIWE login failed.");
  }
}

async function checkCredential(address, expiresAt) {
  const resultBox = document.getElementById("verificationResult");

  try {
    resultBox.innerText = "Checking credential...";
    resultBox.className = "result-box";

    const approved = await verificationContract.verifyCredential(address);

    if (approved) {
      window.location.href = `verifier-home.html?address=${address}&expiresAt=${expiresAt}`;
    } else {
      resultBox.innerText = "Rejected: No valid over-18 credential found.";
      resultBox.className = "result-box result-rejected";

      await fetch(`${BACKEND}/logout`, {
        method: "POST",
        credentials: "include"
      });

      signer = null;
    }
  } catch (error) {
    console.error(error);
    resultBox.innerText = "Failed to check credential.";
    resultBox.className = "result-box result-rejected";
  }
}