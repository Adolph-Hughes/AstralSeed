// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/ILicenseManager.sol";
import "./BioNFT.sol";

/**
 * @title LicenseManager
 * @notice Manages licensing of bio-data usage rights
 * @dev Supports timed, usage-based, and perpetual licenses
 */
contract LicenseManager is ILicenseManager, Ownable, ReentrancyGuard {
    BioNFT public bioNFT;
    address public revenueSplitter;

    uint256 private _licenseCounter;
    mapping(uint256 => License) private _licenses;
    mapping(uint256 => uint256[]) private _tokenLicenses;
    mapping(address => uint256[]) private _licenseeLicenses;

    modifier onlyTokenOwner(uint256 tokenId) {
        require(bioNFT.ownerOf(tokenId) == msg.sender, "Not token owner");
        _;
    }

    constructor(address _bioNFT, address _revenueSplitter) Ownable(msg.sender) {
        require(_bioNFT != address(0), "Invalid BioNFT address");
        require(_revenueSplitter != address(0), "Invalid splitter address");
        
        bioNFT = BioNFT(_bioNFT);
        revenueSplitter = _revenueSplitter;
    }

    /**
     * @inheritdoc ILicenseManager
     */
    function issueLicense(
        uint256 tokenId,
        address licensee,
        LicenseType licenseType,
        uint256 duration,
        uint256 usageLimit,
        uint256 price
    ) external payable override onlyTokenOwner(tokenId) nonReentrant returns (uint256) {
        require(licensee != address(0), "Invalid licensee");
        require(msg.value >= price, "Insufficient payment");

        _licenseCounter++;
        uint256 licenseId = _licenseCounter;

        uint256 expiresAt = 0;
        if (licenseType == LicenseType.Timed) {
            require(duration > 0, "Duration required for timed license");
            expiresAt = block.timestamp + duration;
        }

        if (licenseType == LicenseType.Usage) {
            require(usageLimit > 0, "Usage limit required");
        }

        _licenses[licenseId] = License({
            licenseId: licenseId,
            tokenId: tokenId,
            licensee: licensee,
            licenseType: licenseType,
            expiresAt: expiresAt,
            usageLimit: usageLimit,
            usageCount: 0,
            price: price,
            isActive: true
        });

        _tokenLicenses[tokenId].push(licenseId);
        _licenseeLicenses[licensee].push(licenseId);

        // Forward payment to revenue splitter
        if (msg.value > 0) {
            (bool success, ) = revenueSplitter.call{value: msg.value}(
                abi.encodeWithSignature("distributeRoyalty(uint256)", tokenId)
            );
            require(success, "Payment transfer failed");
        }

        emit LicenseIssued(licenseId, tokenId, licensee, licenseType);

        return licenseId;
    }

    /**
     * @inheritdoc ILicenseManager
     */
    function revokeLicense(uint256 licenseId) external override {
        License storage license = _licenses[licenseId];
        require(license.licenseId != 0, "License does not exist");
        require(
            bioNFT.ownerOf(license.tokenId) == msg.sender || owner() == msg.sender,
            "Not authorized"
        );
        require(license.isActive, "License already revoked");

        license.isActive = false;

        emit LicenseRevoked(licenseId);
    }

    /**
     * @inheritdoc ILicenseManager
     */
    function recordUsage(uint256 licenseId) external override {
        License storage license = _licenses[licenseId];
        require(license.isActive, "License not active");
        require(isLicenseValid(licenseId), "License expired or limit reached");
        require(
            msg.sender == license.licensee || msg.sender == owner(),
            "Not authorized"
        );

        if (license.licenseType == LicenseType.Usage) {
            license.usageCount++;
        }

        emit LicenseUsed(licenseId, license.usageCount);
    }

    /**
     * @inheritdoc ILicenseManager
     */
    function isLicenseValid(uint256 licenseId) public view override returns (bool) {
        License memory license = _licenses[licenseId];
        
        if (!license.isActive) {
            return false;
        }

        // Check expiration for timed licenses
        if (license.licenseType == LicenseType.Timed) {
            if (block.timestamp > license.expiresAt) {
                return false;
            }
        }

        // Check usage limit for usage-based licenses
        if (license.licenseType == LicenseType.Usage) {
            if (license.usageCount >= license.usageLimit) {
                return false;
            }
        }

        return true;
    }

    /**
     * @inheritdoc ILicenseManager
     */
    function getLicense(uint256 licenseId) external view override returns (License memory) {
        require(_licenses[licenseId].licenseId != 0, "License does not exist");
        return _licenses[licenseId];
    }

    /**
     * @inheritdoc ILicenseManager
     */
    function getLicensesForToken(uint256 tokenId) external view override returns (uint256[] memory) {
        return _tokenLicenses[tokenId];
    }

    /**
     * @notice Get all licenses for a licensee
     * @param licensee The licensee address
     * @return Array of license IDs
     */
    function getLicensesForLicensee(address licensee) external view returns (uint256[] memory) {
        return _licenseeLicenses[licensee];
    }

    /**
     * @notice Update revenue splitter address
     * @param _revenueSplitter New revenue splitter address
     */
    function setRevenueSplitter(address _revenueSplitter) external onlyOwner {
        require(_revenueSplitter != address(0), "Invalid address");
        revenueSplitter = _revenueSplitter;
    }

    /**
     * @notice Get total number of licenses issued
     * @return Total license count
     */
    function getTotalLicenses() external view returns (uint256) {
        return _licenseCounter;
    }
}

