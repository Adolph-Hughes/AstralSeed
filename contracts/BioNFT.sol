// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IBioNFT.sol";

/**
 * @title BioNFT
 * @notice Bio-fingerprint NFT with optional soulbound functionality
 * @dev ERC721 implementation for biological data ownership
 */
contract BioNFT is ERC721, ERC721URIStorage, Ownable, IBioNFT {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // Mapping from token ID to bio-hash
    mapping(uint256 => bytes32) private _bioHashes;
    
    // Mapping from token ID to institution ID
    mapping(uint256 => uint256) private _institutionIds;
    
    // Mapping from token ID to soulbound status
    mapping(uint256 => bool) private _soulboundTokens;
    
    // Mapping from bio-hash to token ID (prevent duplicate minting)
    mapping(bytes32 => uint256) private _bioHashToTokenId;

    // Address authorized to mint (MintGateway)
    address public mintGateway;

    modifier onlyMintGateway() {
        require(msg.sender == mintGateway, "Only mint gateway");
        _;
    }

    constructor() ERC721("AstralSeed BioNFT", "BIONFT") Ownable(msg.sender) {}

    /**
     * @notice Set the mint gateway address
     * @param gateway The mint gateway contract address
     */
    function setMintGateway(address gateway) external onlyOwner {
        require(gateway != address(0), "Invalid gateway address");
        mintGateway = gateway;
    }

    /**
     * @notice Mint a new bio-NFT
     * @param to The address to mint to
     * @param bioHash The biological data hash
     * @param institutionId The attesting institution ID
     * @param uri The token metadata URI
     * @return tokenId The newly minted token ID
     */
    function mint(
        address to,
        bytes32 bioHash,
        uint256 institutionId,
        string memory uri
    ) external onlyMintGateway returns (uint256) {
        require(bioHash != bytes32(0), "Invalid bio-hash");
        require(_bioHashToTokenId[bioHash] == 0, "Bio-hash already minted");

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        _bioHashes[tokenId] = bioHash;
        _institutionIds[tokenId] = institutionId;
        _bioHashToTokenId[bioHash] = tokenId;

        emit BioNFTMinted(tokenId, to, bioHash, institutionId);

        return tokenId;
    }

    /**
     * @notice Toggle soulbound status for a token
     * @param tokenId The token ID
     * @param soulbound Whether to make the token soulbound
     */
    function setSoulbound(uint256 tokenId, bool soulbound) external {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        _soulboundTokens[tokenId] = soulbound;
        emit SoulboundToggled(tokenId, soulbound);
    }

    /**
     * @inheritdoc IBioNFT
     */
    function getBioHash(uint256 tokenId) external view override returns (bytes32) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _bioHashes[tokenId];
    }

    /**
     * @inheritdoc IBioNFT
     */
    function isSoulbound(uint256 tokenId) external view override returns (bool) {
        return _soulboundTokens[tokenId];
    }

    /**
     * @inheritdoc IBioNFT
     */
    function getInstitutionId(uint256 tokenId) external view override returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _institutionIds[tokenId];
    }

    /**
     * @notice Get token ID by bio-hash
     * @param bioHash The bio-hash
     * @return tokenId The token ID (0 if not found)
     */
    function getTokenIdByBioHash(bytes32 bioHash) external view returns (uint256) {
        return _bioHashToTokenId[bioHash];
    }

    /**
     * @notice Get total supply of minted tokens
     * @return The total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Override transfer functions to prevent soulbound transfers
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0))
        if (from != address(0)) {
            require(!_soulboundTokens[tokenId], "Token is soulbound");
        }

        return super._update(to, tokenId, auth);
    }

    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage, IBioNFT)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

