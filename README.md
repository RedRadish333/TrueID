# TRUEID — Blockchain-Based Age Verification System

TRUEID is a decentralised age verification credential system built on Ethereum. It allows government authorities to issue tamper-proof age credentials to citizens, which can then be verified by third-party services (such as age-restricted platforms) without exposing any personally identifiable information.

---

## How It Works

```
Citizen → signs identity data with their wallet
Government → verifies signature, issues on-chain credential
Third-Party → checks wallet for a valid credential before granting access
```

The smart contracts store **only** whether a wallet holds a valid over-18 credential and who issued it. No name, date of birth, ID number, or document images are ever stored on-chain.

---

## Project Structure

```
trueid/
├── contracts/
│   └── Final_Project_TrueID.sol   # Solidity smart contracts
├── public/
│   ├── index.html                 # Landing page
│   ├── citizen.html               # Citizen portal
│   ├── government.html            # Government portal
│   ├── verifier.html              # Third-party verifier login
│   └── verifier-home.html         # Post-verification demo page
├── js/
│   ├── config.js                  # Contract addresses & ABIs
│   ├── citizen.js                 # Citizen portal logic
│   ├── government.js              # Government portal logic
│   ├── verifier.js                # Verifier login & credential check
│   └── verifier-home.js           # Session timer & sign-out
├── css/
│   └── style.css                  # Shared stylesheet
├── server.js                      # Express backend (SIWE auth)
└── package.json
```

---

## Smart Contracts

Two contracts are deployed on the **Sepolia testnet**.

### `CredentialIssuer`
Manages trusted authorities and issues/revokes credentials.

| Function | Access | Description |
|---|---|---|
| `addTrustedAuthority(address)` | Trusted authority | Grants another wallet authority to issue credentials |
| `removeTrustedAuthority(address)` | Trusted authority | Revokes an authority (owner cannot be removed) |
| `issueCredential(address, bool, bytes32)` | Trusted authority | Issues an over-18 credential to a citizen wallet |
| `revokeCredential(address)` | Trusted authority | Deletes a citizen's credential |
| `getCredential(address)` | Public (view) | Returns full credential details for a wallet |
| `trustedAuthorities(address)` | Public (view) | Returns whether an address is a trusted authority |

### `CredentialVerification`
Read-only contract used by third parties to check credentials.

| Function | Access | Description |
|---|---|---|
| `verifyCredential(address)` | Public (view) | Returns `true` if wallet has a valid over-18 credential |
| `verifyCredentialWithEvent(address)` | Public | Same as above but emits a `CredentialVerified` event for audit trail |

**Deployed addresses (Sepolia):**
- `CredentialIssuer`: `0xe6cfB9fc3e1c3b10E1cb1EE2146797c076c01D89`
- `CredentialVerification`: `0x4Aa78463496bA845Cdf589E54eADC2873b217F60`

---

## Portals

### Citizen Portal (`citizen.html`)
- Connect MetaMask wallet via Sign-In with Ethereum (SIWE)
- Sign your identity data (full name + DOB) with your wallet to produce a signature
- Copy the signature and provide it to the government authority for verification
- Session expires after **5 minutes**

### Government Portal (`government.html`)
- Connect MetaMask wallet (must be a trusted authority)
- **Verify & Issue**: Enter the citizen's wallet address, identity data, and their signature; the portal verifies the signature matches the wallet, then generates a credential hash and issues it on-chain
- **Revoke**: Remove a credential from any wallet
- **Manage Authorities**: Add or remove trusted authority wallets
- **View**: Inspect any wallet's credential details or authority status

### Third-Party Verifier (`verifier.html`)
- Connect MetaMask wallet via SIWE
- Automatically checks on-chain whether the wallet holds a valid over-18 credential
- If approved → redirected to the demo page with a **30-minute** session
- If rejected → shown an error and session is cleared

### Demo Page (`verifier-home.html`)
- Displays a mock age-restricted website (sports betting demo)
- Shows a green approval banner with a live session countdown
- Sign-out button clears the session and redirects back to the verifier

---

## Backend (Express + SIWE)

The Node.js backend handles wallet authentication using the [Sign-In with Ethereum (EIP-4361)](https://eips.ethereum.org/EIPS/eip-4361) standard.

| Endpoint | Method | Description |
|---|---|---|
| `/nonce` | GET | Returns a random nonce |
| `/message` | GET | Generates a SIWE message for a given wallet address |
| `/verify` | POST | Verifies a signed SIWE message and creates a session |
| `/session` | GET | Returns current session status and remaining time |
| `/logout` | POST | Destroys the session |

Sessions are scoped by role:
- **Citizen**: 5 minutes
- **Verifier**: 30 minutes

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MetaMask](https://metamask.io/) browser extension
- Wallet funded with Sepolia ETH (for government transactions)
- A local static file server (e.g. VS Code Live Server on port `5500`)

---

## Getting Started

**1. Install dependencies**
```bash
npm install
```

**2. Start the backend**
```bash
npm start
```
The server runs at `http://localhost:3000`.

**3. Serve the frontend**

Open the project in VS Code and start Live Server, or use any static file server pointed at the project root. The frontend expects to be served from `http://127.0.0.1:5500`.

**4. Open the app**

Navigate to `http://127.0.0.1:5500/index.html` in your browser.

---

## Credential Issuance Flow

1. **Citizen** connects their wallet on the Citizen Portal and signs their identity data (e.g. `John Smith 01/01/1990`). They copy the resulting signature.

2. **Government authority** opens the Government Portal, enters the citizen's wallet address, the same identity data, and the citizen's signature. Clicking **Verify Citizen & Generate Hash** recovers the signer address from the signature and confirms it matches the wallet. The authority then signs the identity data themselves to produce a unique credential hash.

3. The authority clicks **Issue Credential**, which calls `issueCredential()` on the smart contract and records the credential on-chain.

4. **Third-party verifier** connects their wallet on the Verifier Portal. The app calls `verifyCredential()` on-chain. If a valid credential exists, they are admitted.

---

## Privacy Design

- No personal data is stored on-chain or on the server.
- The credential hash is derived from signatures and cannot be reverse-engineered to reveal identity data.
- The blockchain only records: wallet address, issuing authority address, over-18 boolean, timestamp, and a hash.
- SIWE sessions are server-side only and expire automatically.

---

## Dependencies

| Package | Version | Purpose |
|---|---|---|
| `express` | ^4.18.2 | HTTP server |
| `express-session` | ^1.17.3 | Server-side session management |
| `siwe` | ^2.3.2 | Sign-In with Ethereum message parsing & verification |
| `cors` | ^2.8.5 | Cross-origin requests between frontend and backend |
| `ethers` | ^6.13.1 | Ethereum wallet interaction (frontend & backend) |

---

## License

MIT
