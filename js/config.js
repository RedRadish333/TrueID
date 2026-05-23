// Replace these after deploying in Remix
const CREDENTIAL_ISSUER_ADDRESS = "0xbA8FfCc8D92B4492929A1BD3579303606d1594b7";
const CREDENTIAL_VERIFICATION_ADDRESS = "0xd4eE9CcaFc2599988E0D34cAE516f44711e93c4F";

const CREDENTIAL_VERIFICATION_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_walletAddress",
        "type": "address"
      }
    ],
    "name": "verifyCredential",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const CREDENTIAL_ISSUER_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_authority", "type": "address" }
    ],
    "name": "addTrustedAuthority",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_authority", "type": "address" }
    ],
    "name": "removeTrustedAuthority",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_issuedTo", "type": "address" },
      { "internalType": "bool", "name": "_isOver18", "type": "bool" },
      { "internalType": "bytes32", "name": "_credentialHash", "type": "bytes32" }
    ],
    "name": "issueCredential",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_issuedTo", "type": "address" }
    ],
    "name": "revokeCredential",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "trustedAuthorities",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_issuedTo", "type": "address" }
    ],
    "name": "getCredential",
    "outputs": [
      { "internalType": "bool", "name": "exists", "type": "bool" },
      { "internalType": "bool", "name": "isOver18", "type": "bool" },
      { "internalType": "address", "name": "issuedBy", "type": "address" },
      { "internalType": "address", "name": "issuedTo", "type": "address" },
      { "internalType": "uint256", "name": "issuedAt", "type": "uint256" },
      { "internalType": "bytes32", "name": "credentialHash", "type": "bytes32" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

