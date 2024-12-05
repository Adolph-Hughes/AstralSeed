// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IMetadataVault.sol";
import "./BioNFT.sol";

/**
 * @title MetadataVault
 * @notice Manages encrypted metadata storage and access control
 * @dev Stores IPFS CIDs and encrypted access keys
 */
contract MetadataVault is IMetadataVault, Ownable {
    struct MetadataRecord {
        string metadataCID;
        bytes encryptionKey;
        bool exists;
    }

    BioNFT public bioNFT;

    // Mapping from token ID to metadata record
    mapping(uint256 => MetadataRecord) private _metadata;
    
    // Mapping from token ID to accessor to access key
    mapping(uint256 => mapping(address => bytes)) private _accessKeys;
    
    // Mapping from token ID to list of authorized accessors
    mapping(uint256 => address[]) private _authorizedAccessors;

    modifier onlyTokenOwner(uint256 tokenId) {
        require(bioNFT.ownerOf(tokenId) == msg.sender, "Not token owner");
        _;
    }

    constructor(address _bioNFT) Ownable(msg.sender) {
        require(_bioNFT != address(0), "Invalid BioNFT address");
        bioNFT = BioNFT(_bioNFT);
    }

    /**
     * @inheritdoc IMetadataVault
     */
    function storeMetadata(
        uint256 tokenId,
        string memory metadataCID,
        bytes memory encryptionKey
    ) external override onlyTokenOwner(tokenId) {
        require(bytes(metadataCID).length > 0, "Invalid CID");

        _metadata[tokenId] = MetadataRecord({
            metadataCID: metadataCID,
            encryptionKey: encryptionKey,
            exists: true
        });

        emit MetadataStored(tokenId, metadataCID);
    }

    /**
     * @inheritdoc IMetadataVault
     */
    function grantAccess(
        uint256 tokenId,
        address accessor,
        bytes memory accessKey
    ) external override onlyTokenOwner(tokenId) {
        require(accessor != address(0), "Invalid accessor");
        require(_metadata[tokenId].exists, "Metadata not stored");
        require(_accessKeys[tokenId][accessor].length == 0, "Access already granted");

        _accessKeys[tokenId][accessor] = accessKey;
        _authorizedAccessors[tokenId].push(accessor);

        emit AccessGranted(tokenId, accessor);
    }

    /**
     * @inheritdoc IMetadataVault
     */
    function revokeAccess(
        uint256 tokenId,
        address accessor
    ) external override onlyTokenOwner(tokenId) {
        require(_accessKeys[tokenId][accessor].length > 0, "No access to revoke");

        delete _accessKeys[tokenId][accessor];
        _removeAccessor(tokenId, accessor);

        emit AccessRevoked(tokenId, accessor);
    }

    /**
     * @inheritdoc IMetadataVault
     */
    function getMetadataCID(uint256 tokenId) external view override returns (string memory) {
        address owner = bioNFT.ownerOf(tokenId);
        require(
            msg.sender == owner || _accessKeys[tokenId][msg.sender].length > 0,
            "Not authorized"
        );
        require(_metadata[tokenId].exists, "Metadata not stored");

        return _metadata[tokenId].metadataCID;
    }

    /**
     * @inheritdoc IMetadataVault
     */
    function hasAccess(uint256 tokenId, address accessor) external view override returns (bool) {
        address owner = bioNFT.ownerOf(tokenId);
        if (accessor == owner) {
            return true;
        }
        return _accessKeys[tokenId][accessor].length > 0;
    }

    /**
     * @inheritdoc IMetadataVault
     */
    function getAccessKey(uint256 tokenId, address accessor) external view override returns (bytes memory) {
        require(
            msg.sender == accessor || msg.sender == bioNFT.ownerOf(tokenId),
            "Not authorized"
        );
        require(_accessKeys[tokenId][accessor].length > 0, "No access granted");

        return _accessKeys[tokenId][accessor];
    }

    /**
     * @notice Get all authorized accessors for a token
     * @param tokenId The bio-NFT token ID
     * @return Array of accessor addresses
     */
    function getAuthorizedAccessors(uint256 tokenId) external view returns (address[] memory) {
        require(msg.sender == bioNFT.ownerOf(tokenId), "Not token owner");
        return _authorizedAccessors[tokenId];
    }

    /**
     * @notice Update metadata CID (owner only)
     * @param tokenId The bio-NFT token ID
     * @param newCID The new IPFS CID
     */
    function updateMetadataCID(uint256 tokenId, string memory newCID) external onlyTokenOwner(tokenId) {
        require(_metadata[tokenId].exists, "Metadata not stored");
        require(bytes(newCID).length > 0, "Invalid CID");

        _metadata[tokenId].metadataCID = newCID;

        emit MetadataStored(tokenId, newCID);
    }

    /**
     * @notice Check if metadata exists for a token
     * @param tokenId The bio-NFT token ID
     * @return Whether metadata exists
     */
    function metadataExists(uint256 tokenId) external view returns (bool) {
        return _metadata[tokenId].exists;
    }

    /**
     * @dev Remove an accessor from the authorized list
     */
    function _removeAccessor(uint256 tokenId, address accessor) internal {
        address[] storage accessors = _authorizedAccessors[tokenId];
        for (uint256 i = 0; i < accessors.length; i++) {
            if (accessors[i] == accessor) {
                accessors[i] = accessors[accessors.length - 1];
                accessors.pop();
                break;
            }
        }
    }

    /**
     * @notice Update BioNFT contract address
     * @param _bioNFT New BioNFT address
     */
    function setBioNFT(address _bioNFT) external onlyOwner {
        require(_bioNFT != address(0), "Invalid address");
        bioNFT = BioNFT(_bioNFT);
    }
}

