// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IInstitutionRegistry.sol";

/**
 * @title InstitutionRegistry
 * @notice Manages verified research institutions and their attestations
 * @dev Uses AccessControl for governance
 */
contract InstitutionRegistry is IInstitutionRegistry, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    uint256 private _institutionCounter;
    mapping(uint256 => Institution) private _institutions;
    mapping(address => uint256) private _pubkeyToId;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender);
    }

    /**
     * @inheritdoc IInstitutionRegistry
     */
    function registerInstitution(
        address pubkey,
        string memory name,
        string memory metadata
    ) external override onlyRole(REGISTRAR_ROLE) returns (uint256) {
        require(pubkey != address(0), "Invalid pubkey");
        require(bytes(name).length > 0, "Name required");
        require(_pubkeyToId[pubkey] == 0, "Institution already registered");

        _institutionCounter++;
        uint256 institutionId = _institutionCounter;

        _institutions[institutionId] = Institution({
            id: institutionId,
            name: name,
            pubkey: pubkey,
            metadata: metadata,
            isActive: true,
            registeredAt: block.timestamp,
            attestationCount: 0
        });

        _pubkeyToId[pubkey] = institutionId;

        emit InstitutionRegistered(institutionId, pubkey, name);

        return institutionId;
    }

    /**
     * @inheritdoc IInstitutionRegistry
     */
    function deactivateInstitution(uint256 institutionId) external override onlyRole(ADMIN_ROLE) {
        require(institutionId > 0 && institutionId <= _institutionCounter, "Invalid institution ID");
        require(_institutions[institutionId].isActive, "Already deactivated");

        _institutions[institutionId].isActive = false;

        emit InstitutionDeactivated(institutionId);
    }

    /**
     * @inheritdoc IInstitutionRegistry
     */
    function reactivateInstitution(uint256 institutionId) external override onlyRole(ADMIN_ROLE) {
        require(institutionId > 0 && institutionId <= _institutionCounter, "Invalid institution ID");
        require(!_institutions[institutionId].isActive, "Already active");

        _institutions[institutionId].isActive = true;

        emit InstitutionReactivated(institutionId);
    }

    /**
     * @inheritdoc IInstitutionRegistry
     */
    function getInstitution(uint256 institutionId) external view override returns (Institution memory) {
        require(institutionId > 0 && institutionId <= _institutionCounter, "Invalid institution ID");
        return _institutions[institutionId];
    }

    /**
     * @inheritdoc IInstitutionRegistry
     */
    function isInstitutionActive(uint256 institutionId) external view override returns (bool) {
        if (institutionId == 0 || institutionId > _institutionCounter) {
            return false;
        }
        return _institutions[institutionId].isActive;
    }

    /**
     * @inheritdoc IInstitutionRegistry
     */
    function getTotalInstitutions() external view override returns (uint256) {
        return _institutionCounter;
    }

    /**
     * @inheritdoc IInstitutionRegistry
     */
    function incrementAttestationCount(uint256 institutionId) external override {
        require(institutionId > 0 && institutionId <= _institutionCounter, "Invalid institution ID");
        require(_institutions[institutionId].isActive, "Institution not active");
        
        _institutions[institutionId].attestationCount++;
    }

    /**
     * @notice Get institution ID by public key
     * @param pubkey The institution's public key
     * @return The institution ID (0 if not found)
     */
    function getInstitutionIdByPubkey(address pubkey) external view returns (uint256) {
        return _pubkeyToId[pubkey];
    }
}

