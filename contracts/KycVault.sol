// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract KycVault {
    struct Credential {
        address issuer;
        uint64 issuedAt;
        bool valid;
        bytes32 hash;
    }

    mapping(address => Credential) public credentials;
    mapping(address => mapping(address => bool)) public consent;

    event Issued(address indexed holder, address indexed issuer, bytes32 hash);
    event ConsentChanged(address indexed holder, address indexed verifier, bool allowed);
    event ValidityChanged(address indexed holder, address indexed issuer, bool valid);

    function issueCredential(address holder, bytes32 documentHash) external {
        credentials[holder] = Credential({
            issuer: msg.sender,
            issuedAt: uint64(block.timestamp),
            valid: true,
            hash: documentHash
        });
        emit Issued(holder, msg.sender, documentHash);
    }

    function setConsent(address verifier, bool allowed) external {
        consent[msg.sender][verifier] = allowed;
        emit ConsentChanged(msg.sender, verifier, allowed);
    }

    function setValidity(address holder, bool isValid) external {
        require(credentials[holder].issuer == msg.sender, "Only issuer");
        credentials[holder].valid = isValid;
        emit ValidityChanged(holder, msg.sender, isValid);
    }

    function verify(address holder, bytes32 documentHash) external view returns (bool) {
        Credential memory c = credentials[holder];
        if (!c.valid) return false;
        if (c.hash != documentHash) return false;
        if (!consent[holder][msg.sender]) return false;
        return true;
    }

    function getCredential(address holder)
        external
        view
        returns (address issuer, uint64 issuedAt, bool valid, bytes32 hash)
    {
        Credential memory c = credentials[holder];
        return (c.issuer, c.issuedAt, c.valid, c.hash);
    }
}
