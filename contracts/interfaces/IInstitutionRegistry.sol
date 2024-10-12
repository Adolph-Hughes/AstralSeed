// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IInstitutionRegistry
 * @notice Interface for managing verified research institutions
 */
interface IInstitutionRegistry {
    struct Institution {
        uint256 id;
        string name;
        address pubkey;
        string metadata;
        bool isActive;
        uint256 registeredAt;
        uint256 attestationCount;
    }

    /**
     * @notice Emitted when a new institution is registered
     * @param institutionId The unique institution ID
     * @param pubkey The institution's public key address
     * @param name The institution name
     */
    event InstitutionRegistered(
        uint256 indexed institutionId,
        address indexed pubkey,
        string name
    );

    /**
     * @notice Emitted when an institution is deactivated
     * @param institutionId The institution ID
     */
    event InstitutionDeactivated(uint256 indexed institutionId);

    /**
     * @notice Emitted when an institution is reactivated
     * @param institutionId The institution ID
     */
    event InstitutionReactivated(uint256 indexed institutionId);

    /**
     * @notice Register a new institution
     * @param pubkey The institution's public key address
     * @param name The institution name
     * @param metadata Additional metadata (IPFS CID or JSON)
     * @return institutionId The assigned institution ID
     */
    function registerInstitution(
        address pubkey,
        string memory name,
        string memory metadata
    ) external returns (uint256 institutionId);

    /**
     * @notice Deactivate an institution
     * @param institutionId The institution ID to deactivate
     */
    function deactivateInstitution(uint256 institutionId) external;

    /**
     * @notice Reactivate an institution
     * @param institutionId The institution ID to reactivate
     */
    function reactivateInstitution(uint256 institutionId) external;

    /**
     * @notice Get institution details
     * @param institutionId The institution ID
     * @return institution The institution struct
     */
    function getInstitution(uint256 institutionId) external view returns (Institution memory);

    /**
     * @notice Check if an institution is active
     * @param institutionId The institution ID
     * @return Whether the institution is active
     */
    function isInstitutionActive(uint256 institutionId) external view returns (bool);

    /**
     * @notice Get the total number of registered institutions
     * @return The total count
     */
    function getTotalInstitutions() external view returns (uint256);

    /**
     * @notice Increment attestation count for an institution
     * @param institutionId The institution ID
     */
    function incrementAttestationCount(uint256 institutionId) external;
}

