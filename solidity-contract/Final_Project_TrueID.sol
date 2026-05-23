// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * TRUEID - Age Verification Credential System
 *
 * This file contains two contracts:
 * 1. CredentialIssuer - manages trusted authorities and issues age credentials.
 * 2. CredentialVerification - checks whether a wallet has a valid credential from a trusted authority.
 *
 * Privacy note:
 * The contract does NOT store name, date of birth, ID number, address, or document images.
 * It only stores whether a wallet has an over-18 credential and who issued it.
 */

 contract CredentialIssuer {
    address public owner;

    struct Credential {
        bool exists;
        bool isOver18;
        address issuedBy;
        address issuedTo;
        uint256 issuedAt;
        bytes32 credentialHash;
    }

    mapping(address => bool) public trustedAuthorities;
    mapping(address => Credential) private credentials;

    event TrustedAuthorityAdded(address indexed authority);
    event TrustedAuthorityRemoved(address indexed authority);
    event CredentialIssued(
        address indexed issuedTo,
        address indexed issuedBy,
        bool isOver18,
        bytes32 credentialHash
    );

    event CredentialRevoked(address indexed issuedTo, address indexed revokedBy);

    modifier onlyTrustedAuthority() {
        require(trustedAuthorities[msg.sender], "Only trusted authority can perform this action");
        _;
    }

    // 1. Constructor to initialise Trusted Authority Wallet
    constructor() {
        owner = msg.sender;
        trustedAuthorities[msg.sender] = true;
        emit TrustedAuthorityAdded(msg.sender);
    }

    // 2. Function to add more Trusted Authority Wallets (onlyTrusted Modifier)
    function addTrustedAuthority(address _authority) external onlyTrustedAuthority {
        require(_authority != address(0), "Invalid authority address");
        trustedAuthorities[_authority] = true;
        emit TrustedAuthorityAdded(_authority);
    }

    function removeTrustedAuthority(address _authority) external onlyTrustedAuthority {
        require(_authority != owner, "Owner cannot be removed as trusted authority");
        trustedAuthorities[_authority] = false;
        emit TrustedAuthorityRemoved(_authority);
    }
    
    // 3. Function to Issue Credential, which includes the trusted authority wallet that issued it
    function issueCredential(
        address _issuedTo,
        bool _isOver18,
        bytes32 _credentialHash
    ) external onlyTrustedAuthority {
        require(_issuedTo != address(0), "Invalid issuedTo address");

        credentials[_issuedTo] = Credential({
            exists: true,
            isOver18: _isOver18,
            issuedBy: msg.sender,
            issuedTo: _issuedTo,
            issuedAt: block.timestamp,
            credentialHash: _credentialHash
        });

        emit CredentialIssued(_issuedTo, msg.sender, _isOver18, _credentialHash);
    }

    
    function revokeCredential(address _issuedTo) external onlyTrustedAuthority {
        require(credentials[_issuedTo].exists, "Credential does not exist");
        delete credentials[_issuedTo];
        emit CredentialRevoked(_issuedTo, msg.sender);
    }

    function getCredential(address _issuedTo)
        external
        view
        returns (
            bool exists,
            bool isOver18,
            address issuedBy,
            address issuedTo,
            uint256 issuedAt,
            bytes32 credentialHash
        )
    {
        Credential memory credential = credentials[_issuedTo];
        return (
            credential.exists,
            credential.isOver18,
            credential.issuedBy,
            credential.issuedTo,
            credential.issuedAt,
            credential.credentialHash
        );
    }
}

contract CredentialVerification {
    CredentialIssuer public credentialIssuer;

    event CredentialVerified(
        address indexed walletAddress,
        bool approved
    );

    constructor(address _credentialIssuerAddress) {
        require(
            _credentialIssuerAddress != address(0),
            "Invalid issuer contract address"
        );

        credentialIssuer = CredentialIssuer(_credentialIssuerAddress);
    }

    // Used for auditable verification trail (With Verification Event Logs)
    function verifyCredentialWithEvent(address _walletAddress)
        external
        returns (bool)
    {
        require(_walletAddress != address(0), "Invalid wallet address");

        (
            bool exists,
            bool isOver18,
            address issuedBy,
            address issuedTo,
            ,
        ) = credentialIssuer.getCredential(_walletAddress);

        bool credentialMatchesWallet = issuedTo == _walletAddress;
        bool authorityIsTrusted =
            credentialIssuer.trustedAuthorities(issuedBy);

        bool approved =
            exists &&
            isOver18 &&
            credentialMatchesWallet &&
            authorityIsTrusted;

        emit CredentialVerified(_walletAddress, approved);

        return approved;
    }

    // Used if no audit trail necessary
    function verifyCredential(address _walletAddress)
        external
        view
        returns (bool)
    {
        require(_walletAddress != address(0), "Invalid wallet address");

        (
            bool exists,
            bool isOver18,
            address issuedBy,
            address issuedTo,
            ,
        ) = credentialIssuer.getCredential(_walletAddress);

        bool credentialMatchesWallet = issuedTo == _walletAddress;
        bool authorityIsTrusted =
            credentialIssuer.trustedAuthorities(issuedBy);

        return
            exists &&
            isOver18 &&
            credentialMatchesWallet &&
            authorityIsTrusted;
    }
}
