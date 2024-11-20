// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./BioNFT.sol";
import "./InstitutionRegistry.sol";

/**
 * @title RevenueSplitter
 * @notice Manages programmable royalty distribution for bio-NFT licensing
 * @dev ERC-2981 compatible royalty splitter
 */
contract RevenueSplitter is ERC2981, Ownable, ReentrancyGuard {
    BioNFT public bioNFT;
    InstitutionRegistry public institutionRegistry;

    // Default split percentages (in basis points, 10000 = 100%)
    uint96 public constant DEFAULT_ROYALTY_BPS = 1000; // 10%
    uint96 public nftOwnerShare = 7000; // 70% of royalties
    uint96 public institutionShare = 2000; // 20% of royalties
    uint96 public protocolShare = 1000; // 10% of royalties

    // Protocol fee recipient
    address public protocolFeeRecipient;

    // Accumulated balances
    mapping(address => uint256) public pendingWithdrawals;

    event RoyaltyDistributed(
        uint256 indexed tokenId,
        uint256 amount,
        address nftOwner,
        address institution,
        address protocol
    );

    event Withdrawn(address indexed recipient, uint256 amount);

    event SharesUpdated(uint96 nftOwner, uint96 institution, uint96 protocol);

    constructor(
        address _bioNFT,
        address _institutionRegistry,
        address _protocolFeeRecipient
    ) Ownable(msg.sender) {
        require(_bioNFT != address(0), "Invalid BioNFT address");
        require(_institutionRegistry != address(0), "Invalid registry address");
        require(_protocolFeeRecipient != address(0), "Invalid protocol recipient");

        bioNFT = BioNFT(_bioNFT);
        institutionRegistry = InstitutionRegistry(_institutionRegistry);
        protocolFeeRecipient = _protocolFeeRecipient;

        // Set default royalty
        _setDefaultRoyalty(address(this), DEFAULT_ROYALTY_BPS);
    }

    /**
     * @notice Distribute royalty payment for a token
     * @param tokenId The bio-NFT token ID
     */
    function distributeRoyalty(uint256 tokenId) external payable nonReentrant {
        require(msg.value > 0, "No payment provided");

        address nftOwner = bioNFT.ownerOf(tokenId);
        uint256 institutionId = bioNFT.getInstitutionId(tokenId);
        IInstitutionRegistry.Institution memory institution = 
            institutionRegistry.getInstitution(institutionId);

        // Calculate splits
        uint256 ownerAmount = (msg.value * nftOwnerShare) / 10000;
        uint256 institutionAmount = (msg.value * institutionShare) / 10000;
        uint256 protocolAmount = (msg.value * protocolShare) / 10000;

        // Accumulate balances
        pendingWithdrawals[nftOwner] += ownerAmount;
        pendingWithdrawals[institution.pubkey] += institutionAmount;
        pendingWithdrawals[protocolFeeRecipient] += protocolAmount;

        emit RoyaltyDistributed(
            tokenId,
            msg.value,
            nftOwner,
            institution.pubkey,
            protocolFeeRecipient
        );
    }

    /**
     * @notice Withdraw accumulated funds
     */
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds to withdraw");

        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @notice Update revenue split shares
     * @param _nftOwner NFT owner share (basis points)
     * @param _institution Institution share (basis points)
     * @param _protocol Protocol share (basis points)
     */
    function updateShares(
        uint96 _nftOwner,
        uint96 _institution,
        uint96 _protocol
    ) external onlyOwner {
        require(
            _nftOwner + _institution + _protocol == 10000,
            "Shares must sum to 10000"
        );

        nftOwnerShare = _nftOwner;
        institutionShare = _institution;
        protocolShare = _protocol;

        emit SharesUpdated(_nftOwner, _institution, _protocol);
    }

    /**
     * @notice Update protocol fee recipient
     * @param newRecipient New protocol fee recipient address
     */
    function setProtocolFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid address");
        protocolFeeRecipient = newRecipient;
    }

    /**
     * @notice Update default royalty percentage
     * @param royaltyBps New royalty in basis points
     */
    function setDefaultRoyalty(uint96 royaltyBps) external onlyOwner {
        require(royaltyBps <= 10000, "Royalty too high");
        _setDefaultRoyalty(address(this), royaltyBps);
    }

    /**
     * @notice Get pending withdrawal amount for an address
     * @param account The account address
     * @return The pending amount
     */
    function getPendingWithdrawal(address account) external view returns (uint256) {
        return pendingWithdrawals[account];
    }

    /**
     * @notice Get current share configuration
     * @return NFT owner share, institution share, protocol share
     */
    function getShares() external view returns (uint96, uint96, uint96) {
        return (nftOwnerShare, institutionShare, protocolShare);
    }

    // Required override
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

