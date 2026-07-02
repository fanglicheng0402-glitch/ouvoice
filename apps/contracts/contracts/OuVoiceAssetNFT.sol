// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title OuVoiceAssetNFT
/// @notice ERC-721 registry for voice-asset ownership and owner-controlled usage permissions.
contract OuVoiceAssetNFT is ERC721URIStorage, Ownable2Step, ReentrancyGuard {
    struct SovereigntySettings {
        bool privateStorage;
        bool culturalHeritage;
        bool academicUse;
        bool commercialTraining;
    }

    mapping(uint256 => SovereigntySettings) public assetSettings;

    uint256 private _nextTokenId = 1;

    event VoiceAssetMinted(uint256 indexed tokenId, address indexed creator, string tokenURI);
    event SovereigntyUpdated(
        uint256 indexed tokenId,
        bool privateStorage,
        bool culturalHeritage,
        bool academicUse,
        bool commercialTraining
    );
    event SovereigntyRevoked(uint256 indexed tokenId);

    error InvalidCreator();
    error EmptyTokenURI();
    error NotTokenOwner(address caller, uint256 tokenId);

    modifier onlyTokenOwner(uint256 tokenId) {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner(msg.sender, tokenId);
        _;
    }

    constructor(address initialAdmin)
        ERC721("OuVoice Voice Asset", "OUVOICE")
        Ownable(initialAdmin)
    {}

    /// @notice Mints a unique voice asset. Only the current platform admin may call this function.
    function mintVoiceAsset(
        address user,
        string memory tokenURI_,
        SovereigntySettings memory settings
    ) external onlyOwner nonReentrant returns (uint256 tokenId) {
        if (user == address(0)) revert InvalidCreator();
        if (bytes(tokenURI_).length == 0) revert EmptyTokenURI();

        tokenId = _nextTokenId++;
        _safeMint(user, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        assetSettings[tokenId] = settings;

        emit VoiceAssetMinted(tokenId, user, tokenURI_);
        emit SovereigntyUpdated(
            tokenId,
            settings.privateStorage,
            settings.culturalHeritage,
            settings.academicUse,
            settings.commercialTraining
        );
    }

    /// @notice Replaces every sovereignty toggle. ERC-721 approvals do not grant this authority.
    function updateSovereignty(
        uint256 tokenId,
        SovereigntySettings memory newSettings
    ) external onlyTokenOwner(tokenId) {
        assetSettings[tokenId] = newSettings;
        emit SovereigntyUpdated(
            tokenId,
            newSettings.privateStorage,
            newSettings.culturalHeritage,
            newSettings.academicUse,
            newSettings.commercialTraining
        );
    }

    /// @notice Immediately isolates the token from every public, research, and commercial channel.
    function masterRecall(uint256 tokenId) external onlyTokenOwner(tokenId) {
        SovereigntySettings memory recalledSettings = SovereigntySettings({
            privateStorage: true,
            culturalHeritage: false,
            academicUse: false,
            commercialTraining: false
        });
        assetSettings[tokenId] = recalledSettings;

        emit SovereigntyUpdated(tokenId, true, false, false, false);
        emit SovereigntyRevoked(tokenId);
    }
}
