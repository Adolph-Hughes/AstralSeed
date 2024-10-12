// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ILicenseManager
 * @notice Interface for managing bio-data usage licenses
 */
interface ILicenseManager {
    enum LicenseType {
        Timed,      // Time-based license
        Usage,      // Usage-based license
        Perpetual   // Perpetual license
    }

    struct License {
        uint256 licenseId;
        uint256 tokenId;
        address licensee;
        LicenseType licenseType;
        uint256 expiresAt;
        uint256 usageLimit;
        uint256 usageCount;
        uint256 price;
        bool isActive;
    }

    /**
     * @notice Emitted when a new license is issued
     * @param licenseId The unique license ID
     * @param tokenId The bio-NFT token ID
     * @param licensee The address receiving the license
     * @param licenseType The type of license
     */
    event LicenseIssued(
        uint256 indexed licenseId,
        uint256 indexed tokenId,
        address indexed licensee,
        LicenseType licenseType
    );

    /**
     * @notice Emitted when a license is revoked
     * @param licenseId The license ID
     */
    event LicenseRevoked(uint256 indexed licenseId);

    /**
     * @notice Emitted when license usage is recorded
     * @param licenseId The license ID
     * @param usageCount The new usage count
     */
    event LicenseUsed(uint256 indexed licenseId, uint256 usageCount);

    /**
     * @notice Issue a new license for a bio-NFT
     * @param tokenId The bio-NFT token ID
     * @param licensee The address to receive the license
     * @param licenseType The type of license
     * @param duration Duration in seconds (for timed licenses)
     * @param usageLimit Maximum usage count (for usage-based licenses)
     * @param price The license price
     * @return licenseId The new license ID
     */
    function issueLicense(
        uint256 tokenId,
        address licensee,
        LicenseType licenseType,
        uint256 duration,
        uint256 usageLimit,
        uint256 price
    ) external payable returns (uint256 licenseId);

    /**
     * @notice Revoke an existing license
     * @param licenseId The license ID to revoke
     */
    function revokeLicense(uint256 licenseId) external;

    /**
     * @notice Record usage of a license
     * @param licenseId The license ID
     */
    function recordUsage(uint256 licenseId) external;

    /**
     * @notice Check if a license is valid
     * @param licenseId The license ID
     * @return Whether the license is valid
     */
    function isLicenseValid(uint256 licenseId) external view returns (bool);

    /**
     * @notice Get license details
     * @param licenseId The license ID
     * @return license The license struct
     */
    function getLicense(uint256 licenseId) external view returns (License memory);

    /**
     * @notice Get all licenses for a token
     * @param tokenId The bio-NFT token ID
     * @return An array of license IDs
     */
    function getLicensesForToken(uint256 tokenId) external view returns (uint256[] memory);
}

