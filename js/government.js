let provider;
let signer;
let issuerContract;

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask is not installed.");
    return;
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);

  signer = await provider.getSigner();
  const walletAddress = await signer.getAddress();

  document.getElementById("walletAddress").innerText = walletAddress;

  issuerContract = new ethers.Contract(
    CREDENTIAL_ISSUER_ADDRESS,
    CREDENTIAL_ISSUER_ABI,
    signer
  );
}

async function verifyAndGenerate() {
  const issuedTo = document.getElementById("issueAddress").value.trim();
  const identityData = document.getElementById("identityData").value.trim();
  const citizenSignature = document.getElementById("citizenSignature").value.trim();

  if (!ethers.isAddress(issuedTo)) { alert("Invalid wallet address."); return; }
  if (!identityData) { alert("Please enter identity data."); return; }
  if (!citizenSignature) { alert("Please enter the citizen's signature."); return; }

  // Verify the signature matches the wallet address
  const recoveredAddress = ethers.verifyMessage(identityData, citizenSignature);

  if (recoveredAddress.toLowerCase() !== issuedTo.toLowerCase()) {
    alert("Signature does not match wallet address. Do not issue credential.");
    return;
  }

  alert("Citizen verified. Generating credential hash...");

  // Authority signs the identity data to generate the hash
  const authoritySignature = await signer.signMessage(identityData);
  const credentialHash = ethers.id(authoritySignature);
  document.getElementById("credentialHash").value = credentialHash;
}

async function issueCredential() {
  const issuedTo = document.getElementById("issueAddress").value;
  const credentialHashRaw = document.getElementById("credentialHash").value.trim();
  const credentialHash = ethers.zeroPadValue(credentialHashRaw, 32);
  if (!ethers.isAddress(issuedTo)) {
    alert("Invalid wallet address.");
    return;
  }

  try {
    const tx = await issuerContract.issueCredential(
      issuedTo,
      true,
      credentialHash
    );

    alert("Transaction submitted. Waiting for confirmation...");
    await tx.wait();

    alert("Credential issued successfully.");
  } catch (error) {
    console.error(error);
    alert("Failed to issue credential.");
  }
}

async function revokeCredential() {
  const issuedTo = document.getElementById("revokeAddress").value;

  if (!ethers.isAddress(issuedTo)) {
    alert("Invalid wallet address.");
    return;
  }

  try {
    const tx = await issuerContract.revokeCredential(issuedTo);

    alert("Transaction submitted. Waiting for confirmation...");
    await tx.wait();

    alert("Credential revoked successfully.");
  } catch (error) {
    console.error(error);
    alert("Failed to revoke credential.");
  }
}

async function addTrustedAuthority() {
  const authority = document.getElementById("addAuthorityAddress").value;

  if (!ethers.isAddress(authority)) {
    alert("Invalid authority address.");
    return;
  }

  try {
    const tx = await issuerContract.addTrustedAuthority(authority);

    alert("Transaction submitted. Waiting for confirmation...");
    await tx.wait();

    alert("Trusted authority added successfully.");
  } catch (error) {
    console.error(error);
    alert("Failed to add trusted authority.");
  }
}

async function removeTrustedAuthority() {
  const authority = document.getElementById("removeAuthorityAddress").value;

  if (!ethers.isAddress(authority)) {
    alert("Invalid authority address.");
    return;
  }

  try {
    const tx = await issuerContract.removeTrustedAuthority(authority);

    alert("Transaction submitted. Waiting for confirmation...");
    await tx.wait();

    alert("Trusted authority removed successfully.");
  } catch (error) {
    console.error(error);
    alert("Failed to remove trusted authority.");
  }
}

async function viewTrustedAuthority() {
  const authority = document.getElementById("authorityCheckAddress").value.trim();
  const resultBox = document.getElementById("authorityResult");

  if (!ethers.isAddress(authority)) {
    alert("Invalid authority address.");
    return;
  }

  try {
    const isTrusted = await issuerContract.trustedAuthorities(authority);
    resultBox.innerText = `Trusted Authority: ${isTrusted}`;
  } catch (error) {
    console.error(error);
    alert("Failed to check trusted authority.");
  }
}

async function viewCredential() {
  const issuedTo = document.getElementById("viewAddress").value;
  const resultBox = document.getElementById("credentialResult");

  if (!ethers.isAddress(issuedTo)) {
    alert("Invalid wallet address.");
    return;
  }

  try {
    const credential = await issuerContract.getCredential(issuedTo);

    resultBox.innerText =
      `Exists: ${credential[0]}\n` +
      `Is Over 18: ${credential[1]}\n` +
      `Issued By: ${credential[2]}\n` +
      `Issued To: ${credential[3]}\n` +
      `Issued At: ${new Date(Number(credential[4]) * 1000).toLocaleString()}\n` +
      `Credential Hash: ${credential[5]}`;
  } catch (error) {
    console.error(error);
    alert("Failed to view credential.");
  }
}

document
  .getElementById("connectWalletBtn")
  .addEventListener("click", connectWallet);