// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IRestakeVault.sol";

/**
 * @title RestakeVault
 * @notice Vault for restaking bio-NFTs to earn rewards from research pools
 * @dev Implements staking mechanism with reward distribution
 */
contract RestakeVault is IRestakeVault, IERC721Receiver, Ownable, ReentrancyGuard {
    struct StakeInfo {
        address staker;
        uint256 stakedAt;
        uint256 lastRewardClaim;
    }

    IERC721 public bioNFT;
    
    // Reward rate per second per staked NFT (in wei)
    uint256 public rewardRate;
    
    // Total rewards pool
    uint256 public rewardsPool;
    
    // Mapping from token ID to stake info
    mapping(uint256 => StakeInfo) private _stakes;
    
    // Mapping from staker to staked token IDs
    mapping(address => uint256[]) private _stakerTokens;
    
    // Mapping from staker to accumulated rewards
    mapping(address => uint256) private _accumulatedRewards;

    constructor(address _bioNFT, uint256 _rewardRate) Ownable(msg.sender) {
        require(_bioNFT != address(0), "Invalid BioNFT address");
        bioNFT = IERC721(_bioNFT);
        rewardRate = _rewardRate;
    }

    /**
     * @inheritdoc IRestakeVault
     */
    function stake(uint256 tokenId) external override nonReentrant {
        require(bioNFT.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(_stakes[tokenId].staker == address(0), "Already staked");

        // Update rewards before staking
        _updateRewards(msg.sender);

        // Transfer NFT to vault
        bioNFT.safeTransferFrom(msg.sender, address(this), tokenId);

        // Record stake
        _stakes[tokenId] = StakeInfo({
            staker: msg.sender,
            stakedAt: block.timestamp,
            lastRewardClaim: block.timestamp
        });

        _stakerTokens[msg.sender].push(tokenId);

        emit Staked(tokenId, msg.sender, block.timestamp);
    }

    /**
     * @inheritdoc IRestakeVault
     */
    function unstake(uint256 tokenId) external override nonReentrant {
        require(_stakes[tokenId].staker == msg.sender, "Not your stake");

        // Update and auto-claim rewards
        _updateRewards(msg.sender);
        _claimRewards(msg.sender);

        // Remove from staker's token list
        _removeTokenFromStaker(msg.sender, tokenId);

        // Clear stake info
        delete _stakes[tokenId];

        // Transfer NFT back to staker
        bioNFT.safeTransferFrom(address(this), msg.sender, tokenId);

        emit Unstaked(tokenId, msg.sender, block.timestamp);
    }

    /**
     * @inheritdoc IRestakeVault
     */
    function claimRewards() external override nonReentrant {
        _updateRewards(msg.sender);
        _claimRewards(msg.sender);
    }

    /**
     * @inheritdoc IRestakeVault
     */
    function getStakeInfo(uint256 tokenId) external view override returns (address, uint256) {
        StakeInfo memory info = _stakes[tokenId];
        return (info.staker, info.stakedAt);
    }

    /**
     * @inheritdoc IRestakeVault
     */
    function pendingRewards(address staker) external view override returns (uint256) {
        return _calculatePendingRewards(staker);
    }

    /**
     * @inheritdoc IRestakeVault
     */
    function isStaked(uint256 tokenId) external view override returns (bool) {
        return _stakes[tokenId].staker != address(0);
    }

    /**
     * @notice Get all staked tokens for a staker
     * @param staker The staker address
     * @return Array of staked token IDs
     */
    function getStakedTokens(address staker) external view returns (uint256[] memory) {
        return _stakerTokens[staker];
    }

    /**
     * @notice Deposit rewards into the pool
     */
    function depositRewards() external payable onlyOwner {
        rewardsPool += msg.value;
    }

    /**
     * @notice Update reward rate
     * @param newRate New reward rate per second
     */
    function setRewardRate(uint256 newRate) external onlyOwner {
        rewardRate = newRate;
    }

    /**
     * @notice Emergency withdraw (owner only)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner()).transfer(amount);
    }

    /**
     * @dev Update accumulated rewards for a staker
     */
    function _updateRewards(address staker) internal {
        uint256 pending = _calculatePendingRewards(staker);
        if (pending > 0) {
            _accumulatedRewards[staker] += pending;
            
            // Update last claim time for all staked tokens
            uint256[] memory tokens = _stakerTokens[staker];
            for (uint256 i = 0; i < tokens.length; i++) {
                _stakes[tokens[i]].lastRewardClaim = block.timestamp;
            }
        }
    }

    /**
     * @dev Calculate pending rewards for a staker
     */
    function _calculatePendingRewards(address staker) internal view returns (uint256) {
        uint256[] memory tokens = _stakerTokens[staker];
        uint256 totalRewards = 0;

        for (uint256 i = 0; i < tokens.length; i++) {
            StakeInfo memory info = _stakes[tokens[i]];
            uint256 duration = block.timestamp - info.lastRewardClaim;
            totalRewards += duration * rewardRate;
        }

        return totalRewards;
    }

    /**
     * @dev Claim accumulated rewards
     */
    function _claimRewards(address staker) internal {
        uint256 amount = _accumulatedRewards[staker];
        if (amount > 0) {
            require(amount <= rewardsPool, "Insufficient rewards pool");
            
            _accumulatedRewards[staker] = 0;
            rewardsPool -= amount;
            
            payable(staker).transfer(amount);
            
            emit RewardsClaimed(staker, amount);
        }
    }

    /**
     * @dev Remove a token from staker's list
     */
    function _removeTokenFromStaker(address staker, uint256 tokenId) internal {
        uint256[] storage tokens = _stakerTokens[staker];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }
    }

    /**
     * @dev Handle NFT reception
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    /**
     * @notice Get rewards pool balance
     */
    function getRewardsPool() external view returns (uint256) {
        return rewardsPool;
    }
}

