// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PlayerNFT
 * @notice Footballers as ERC-721s on X Layer. Each token carries on-chain
 *         attributes that can be upgraded by "training" — the GameFi loop.
 */
contract PlayerNFT is ERC721, Ownable {
    enum Rarity {
        Common,
        Rare,
        Epic,
        Legendary,
        Icon
    }

    struct Attributes {
        Rarity rarity;
        uint16 rating; // overall, 70..99
        uint32 level;
        uint32 xp; // resets each level
    }

    uint256 public nextId = 1;
    uint32 public constant XP_PER_LEVEL = 500;
    uint256 public trainPrice = 0.02 ether; // OKB

    // mint price per rarity tier (OKB)
    uint256[5] public mintPrice = [
        0.05 ether,
        0.12 ether,
        0.3 ether,
        0.7 ether,
        1.5 ether
    ];

    mapping(uint256 => Attributes) public attributes;

    event Minted(address indexed to, uint256 indexed tokenId, Rarity rarity);
    event Trained(uint256 indexed tokenId, uint32 xpGained, uint32 newLevel, uint16 newRating);

    constructor() ERC721("Fantasy Player", "FPLAYER") Ownable(msg.sender) {}

    /// @notice Mint a new Player NFT of a given rarity, paying the tier price.
    function mint(uint8 rarity) external payable returns (uint256 tokenId) {
        require(rarity < 5, "bad rarity");
        require(msg.value >= mintPrice[rarity], "insufficient OKB");
        tokenId = nextId++;
        uint16 base = uint16(70 + uint256(rarity) * 5); // 70/75/80/85/90
        attributes[tokenId] = Attributes(Rarity(rarity), base, 1, 0);
        _safeMint(msg.sender, tokenId);
        emit Minted(msg.sender, tokenId, Rarity(rarity));
    }

    /// @notice Train a player — adds XP, levels up and bumps rating at thresholds.
    function train(uint256 tokenId) external payable {
        require(ownerOf(tokenId) == msg.sender, "not owner");
        require(msg.value >= trainPrice, "insufficient OKB");
        Attributes storage a = attributes[tokenId];
        uint32 gained = 80;
        a.xp += gained;
        while (a.xp >= XP_PER_LEVEL) {
            a.xp -= XP_PER_LEVEL;
            a.level += 1;
            if (a.rating < 99) a.rating += 1;
        }
        emit Trained(tokenId, gained, a.level, a.rating);
    }

    function levelOf(uint256 tokenId) external view returns (uint256) {
        return attributes[tokenId].level;
    }

    function ratingOf(uint256 tokenId) external view returns (uint256) {
        return attributes[tokenId].rating;
    }

    function setTrainPrice(uint256 p) external onlyOwner {
        trainPrice = p;
    }

    function withdraw(address to) external onlyOwner {
        (bool ok, ) = to.call{value: address(this).balance}("");
        require(ok, "withdraw failed");
    }
}
