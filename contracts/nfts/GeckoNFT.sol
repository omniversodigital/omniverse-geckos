// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title GeckoNFT
 * @dev NFT contract for Omniverse Geckos game
 * @author Omniverse Geckos Team
 */
contract GeckoNFT is 
    ERC721, 
    ERC721Enumerable, 
    ERC721URIStorage, 
    Pausable, 
    Ownable, 
    ReentrancyGuard 
{
    using Counters for Counters.Counter;
    using Strings for uint256;

    // =============================================================================
    // Events
    // =============================================================================
    event GeckoMinted(uint256 indexed tokenId, address indexed owner, GeckoType geckoType, Rarity rarity);
    event GeckoEvolved(uint256 indexed tokenId, uint256 newLevel, uint256 newExperience);
    event GeckoBred(uint256 indexed parent1, uint256 indexed parent2, uint256 indexed childId);
    event GeckoLeveledUp(uint256 indexed tokenId, uint256 newLevel);
    event BaseURIUpdated(string newBaseURI);
    event MaxSupplyUpdated(uint256 newMaxSupply);
    event MintPriceUpdated(uint256 newPrice);

    // =============================================================================
    // Enums and Structs
    // =============================================================================
    enum GeckoType { FIRE, ICE, ELECTRIC, POISON, COSMIC, LEGENDARY }
    enum Rarity { COMMON, UNCOMMON, RARE, EPIC, LEGENDARY }

    struct GeckoTraits {
        GeckoType geckoType;
        Rarity rarity;
        uint256 level;
        uint256 experience;
        uint256 damage;
        uint256 range;
        uint256 fireRate;
        uint256 birthTime;
        uint256 lastEvolution;
        bool canBreed;
        uint256 breedCount;
        uint256 kills;
        uint256 totalDamageDealt;
        string[] specialAbilities;
    }

    // =============================================================================
    // State Variables
    // =============================================================================
    Counters.Counter private _tokenIdCounter;
    
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public mintPrice = 0.1 ether;
    uint256 public maxMintsPerWallet = 5;
    uint256 public breedingCooldown = 7 days;
    uint256 public maxBreedingCount = 3;
    
    string private _baseTokenURI;
    string private _contractURI;
    
    mapping(uint256 => GeckoTraits) public geckoTraits;
    mapping(address => uint256) public walletMintCount;
    mapping(uint256 => uint256) public lastBreedingTime;
    
    // Rarity distribution (out of 10000)
    uint256[6] public rarityDistribution = [6000, 2500, 1000, 400, 95, 5]; // COMMON, UNCOMMON, RARE, EPIC, LEGENDARY, COSMIC
    
    // Type distribution (out of 10000) 
    uint256[6] public typeDistribution = [2500, 2000, 2000, 2000, 1495, 5]; // FIRE, ICE, ELECTRIC, POISON, COSMIC, LEGENDARY

    // =============================================================================
    // Constructor
    // =============================================================================
    constructor(
        string memory baseURI,
        string memory contractURIParam
    ) ERC721("Omniverse Geckos", "GECKO") {
        _baseTokenURI = baseURI;
        _contractURI = contractURIParam;
        _tokenIdCounter.increment(); // Start from token ID 1
    }

    // =============================================================================
    // Minting Functions
    // =============================================================================
    
    /**
     * @dev Public mint function
     */
    function mint(address to, uint256 quantity) 
        external 
        payable 
        whenNotPaused 
        nonReentrant 
    {
        require(quantity > 0 && quantity <= 10, "Invalid quantity");
        require(walletMintCount[to] + quantity <= maxMintsPerWallet, "Exceeds max mints per wallet");
        require(_tokenIdCounter.current() + quantity <= MAX_SUPPLY, "Exceeds max supply");
        require(msg.value >= mintPrice * quantity, "Insufficient payment");
        
        walletMintCount[to] += quantity;
        
        for (uint256 i = 0; i < quantity; i++) {
            _mintGecko(to);
        }
        
        // Refund excess payment
        if (msg.value > mintPrice * quantity) {
            payable(msg.sender).transfer(msg.value - (mintPrice * quantity));
        }
    }
    
    /**
     * @dev Owner mint function for team/partnerships
     */
    function ownerMint(address to, uint256 quantity) 
        external 
        onlyOwner 
    {
        require(_tokenIdCounter.current() + quantity <= MAX_SUPPLY, "Exceeds max supply");
        
        for (uint256 i = 0; i < quantity; i++) {
            _mintGecko(to);
        }
    }
    
    /**
     * @dev Internal mint function
     */
    function _mintGecko(address to) private {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Generate random traits
        GeckoTraits memory traits = _generateRandomTraits(tokenId);
        geckoTraits[tokenId] = traits;
        
        _safeMint(to, tokenId);
        
        emit GeckoMinted(tokenId, to, traits.geckoType, traits.rarity);
    }
    
    /**
     * @dev Generate random traits for a new gecko
     */
    function _generateRandomTraits(uint256 tokenId) 
        private 
        view 
        returns (GeckoTraits memory) 
    {
        uint256 seed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            tokenId,
            msg.sender
        )));
        
        Rarity rarity = _getRandomRarity(seed);
        GeckoType geckoType = _getRandomType(seed >> 8);
        
        // Base stats based on type and rarity
        uint256 baseDamage = _getBaseDamage(geckoType);
        uint256 baseRange = _getBaseRange(geckoType);
        uint256 baseFireRate = _getBaseFireRate(geckoType);
        
        // Apply rarity multipliers
        uint256 rarityMultiplier = _getRarityMultiplier(rarity);
        
        return GeckoTraits({
            geckoType: geckoType,
            rarity: rarity,
            level: 1,
            experience: 0,
            damage: baseDamage * rarityMultiplier / 100,
            range: baseRange * rarityMultiplier / 100,
            fireRate: baseFireRate,
            birthTime: block.timestamp,
            lastEvolution: block.timestamp,
            canBreed: true,
            breedCount: 0,
            kills: 0,
            totalDamageDealt: 0,
            specialAbilities: _getSpecialAbilities(geckoType, rarity)
        });
    }

    // =============================================================================
    // Game Integration Functions
    // =============================================================================
    
    /**
     * @dev Update gecko stats after battle (only callable by game contract)
     */
    function updateGeckoStats(
        uint256 tokenId,
        uint256 experienceGained,
        uint256 killsAdded,
        uint256 damageDealt
    ) external onlyOwner {
        require(_exists(tokenId), "Gecko does not exist");
        
        GeckoTraits storage gecko = geckoTraits[tokenId];
        gecko.experience += experienceGained;
        gecko.kills += killsAdded;
        gecko.totalDamageDealt += damageDealt;
        
        // Check for level up
        uint256 expRequiredForNextLevel = gecko.level * 100;
        if (gecko.experience >= expRequiredForNextLevel) {
            _levelUpGecko(tokenId);
        }
        
        emit GeckoEvolved(tokenId, gecko.level, gecko.experience);
    }
    
    /**
     * @dev Level up gecko
     */
    function _levelUpGecko(uint256 tokenId) private {
        GeckoTraits storage gecko = geckoTraits[tokenId];
        gecko.level += 1;
        gecko.experience = 0;
        
        // Increase stats
        gecko.damage = gecko.damage * 110 / 100; // 10% increase
        gecko.range = gecko.range * 105 / 100;   // 5% increase
        
        gecko.lastEvolution = block.timestamp;
        
        emit GeckoLeveledUp(tokenId, gecko.level);
    }

    // =============================================================================
    // Breeding System
    // =============================================================================
    
    /**
     * @dev Breed two geckos to create a new one
     */
    function breedGeckos(uint256 parent1Id, uint256 parent2Id) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(ownerOf(parent1Id) == msg.sender, "Not owner of parent1");
        require(ownerOf(parent2Id) == msg.sender, "Not owner of parent2");
        require(parent1Id != parent2Id, "Cannot breed with itself");
        require(_tokenIdCounter.current() < MAX_SUPPLY, "Max supply reached");
        
        GeckoTraits storage parent1 = geckoTraits[parent1Id];
        GeckoTraits storage parent2 = geckoTraits[parent2Id];
        
        require(parent1.canBreed && parent2.canBreed, "One parent cannot breed");
        require(parent1.breedCount < maxBreedingCount, "Parent1 max breeding reached");
        require(parent2.breedCount < maxBreedingCount, "Parent2 max breeding reached");
        require(
            block.timestamp >= lastBreedingTime[parent1Id] + breedingCooldown,
            "Parent1 still in cooldown"
        );
        require(
            block.timestamp >= lastBreedingTime[parent2Id] + breedingCooldown,
            "Parent2 still in cooldown"
        );
        
        // Create child gecko
        uint256 childId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        GeckoTraits memory childTraits = _breedTraits(parent1, parent2, childId);
        geckoTraits[childId] = childTraits;
        
        // Update parent stats
        parent1.breedCount += 1;
        parent2.breedCount += 1;
        lastBreedingTime[parent1Id] = block.timestamp;
        lastBreedingTime[parent2Id] = block.timestamp;
        
        _safeMint(msg.sender, childId);
        
        emit GeckoBred(parent1Id, parent2Id, childId);
        emit GeckoMinted(childId, msg.sender, childTraits.geckoType, childTraits.rarity);
    }
    
    /**
     * @dev Create traits for bred gecko
     */
    function _breedTraits(
        GeckoTraits memory parent1,
        GeckoTraits memory parent2,
        uint256 childId
    ) private view returns (GeckoTraits memory) {
        uint256 seed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            childId,
            parent1.geckoType,
            parent2.geckoType
        )));
        
        // Inherit type (50% chance from each parent, 10% chance for random)
        GeckoType childType;
        uint256 typeRoll = seed % 100;
        if (typeRoll < 45) {
            childType = parent1.geckoType;
        } else if (typeRoll < 90) {
            childType = parent2.geckoType;
        } else {
            childType = _getRandomType(seed >> 16);
        }
        
        // Rarity has chance to be better than parents
        Rarity childRarity = _inheritRarity(parent1.rarity, parent2.rarity, seed >> 24);
        
        // Inherit stats (average of parents + random variation)
        uint256 avgDamage = (parent1.damage + parent2.damage) / 2;
        uint256 avgRange = (parent1.range + parent2.range) / 2;
        uint256 avgFireRate = (parent1.fireRate + parent2.fireRate) / 2;
        
        // Add variation (-10% to +20%)
        uint256 damageVariation = (seed >> 32) % 30;
        uint256 rangeVariation = (seed >> 40) % 30;
        
        return GeckoTraits({
            geckoType: childType,
            rarity: childRarity,
            level: 1,
            experience: 0,
            damage: avgDamage * (90 + damageVariation) / 100,
            range: avgRange * (90 + rangeVariation) / 100,
            fireRate: avgFireRate,
            birthTime: block.timestamp,
            lastEvolution: block.timestamp,
            canBreed: true,
            breedCount: 0,
            kills: 0,
            totalDamageDealt: 0,
            specialAbilities: _getSpecialAbilities(childType, childRarity)
        });
    }

    // =============================================================================
    // Helper Functions
    // =============================================================================
    
    function _getRandomRarity(uint256 seed) private view returns (Rarity) {
        uint256 roll = seed % 10000;
        uint256 cumulative = 0;
        
        for (uint256 i = 0; i < rarityDistribution.length; i++) {
            cumulative += rarityDistribution[i];
            if (roll < cumulative) {
                return Rarity(i);
            }
        }
        return Rarity.COMMON;
    }
    
    function _getRandomType(uint256 seed) private view returns (GeckoType) {
        uint256 roll = seed % 10000;
        uint256 cumulative = 0;
        
        for (uint256 i = 0; i < typeDistribution.length; i++) {
            cumulative += typeDistribution[i];
            if (roll < cumulative) {
                return GeckoType(i);
            }
        }
        return GeckoType.FIRE;
    }
    
    function _getBaseDamage(GeckoType geckoType) private pure returns (uint256) {
        if (geckoType == GeckoType.FIRE) return 50;
        if (geckoType == GeckoType.ICE) return 30;
        if (geckoType == GeckoType.ELECTRIC) return 40;
        if (geckoType == GeckoType.POISON) return 25;
        if (geckoType == GeckoType.COSMIC) return 60;
        if (geckoType == GeckoType.LEGENDARY) return 100;
        return 35;
    }
    
    function _getBaseRange(GeckoType geckoType) private pure returns (uint256) {
        if (geckoType == GeckoType.FIRE) return 100;
        if (geckoType == GeckoType.ICE) return 80;
        if (geckoType == GeckoType.ELECTRIC) return 90;
        if (geckoType == GeckoType.POISON) return 70;
        if (geckoType == GeckoType.COSMIC) return 120;
        if (geckoType == GeckoType.LEGENDARY) return 150;
        return 85;
    }
    
    function _getBaseFireRate(GeckoType geckoType) private pure returns (uint256) {
        if (geckoType == GeckoType.FIRE) return 1000;
        if (geckoType == GeckoType.ICE) return 800;
        if (geckoType == GeckoType.ELECTRIC) return 600;
        if (geckoType == GeckoType.POISON) return 1200;
        if (geckoType == GeckoType.COSMIC) return 700;
        if (geckoType == GeckoType.LEGENDARY) return 500;
        return 900;
    }
    
    function _getRarityMultiplier(Rarity rarity) private pure returns (uint256) {
        if (rarity == Rarity.COMMON) return 100;
        if (rarity == Rarity.UNCOMMON) return 120;
        if (rarity == Rarity.RARE) return 150;
        if (rarity == Rarity.EPIC) return 200;
        if (rarity == Rarity.LEGENDARY) return 300;
        return 100;
    }
    
    function _getSpecialAbilities(GeckoType geckoType, Rarity rarity) 
        private 
        pure 
        returns (string[] memory) 
    {
        string[] memory abilities = new string[](3);
        
        // Base ability based on type
        if (geckoType == GeckoType.FIRE) abilities[0] = "burn_damage";
        else if (geckoType == GeckoType.ICE) abilities[0] = "slow_effect";
        else if (geckoType == GeckoType.ELECTRIC) abilities[0] = "chain_lightning";
        else if (geckoType == GeckoType.POISON) abilities[0] = "poison_dot";
        else if (geckoType == GeckoType.COSMIC) abilities[0] = "area_damage";
        else if (geckoType == GeckoType.LEGENDARY) abilities[0] = "ultimate_power";
        
        // Additional abilities based on rarity
        if (rarity >= Rarity.RARE) {
            abilities[1] = "critical_strike";
        }
        if (rarity >= Rarity.LEGENDARY) {
            abilities[2] = "multi_target";
        }
        
        return abilities;
    }
    
    function _inheritRarity(Rarity parent1Rarity, Rarity parent2Rarity, uint256 seed) 
        private 
        pure 
        returns (Rarity) 
    {
        // 60% chance to inherit best parent rarity
        // 30% chance to inherit worst parent rarity  
        // 10% chance to get one tier higher than best parent
        
        Rarity bestRarity = parent1Rarity > parent2Rarity ? parent1Rarity : parent2Rarity;
        Rarity worstRarity = parent1Rarity < parent2Rarity ? parent1Rarity : parent2Rarity;
        
        uint256 roll = seed % 100;
        
        if (roll < 60) {
            return bestRarity;
        } else if (roll < 90) {
            return worstRarity;
        } else {
            // Chance to upgrade
            if (bestRarity == Rarity.LEGENDARY) return Rarity.LEGENDARY;
            return Rarity(uint256(bestRarity) + 1);
        }
    }

    // =============================================================================
    // View Functions
    // =============================================================================
    
    function getGeckoTraits(uint256 tokenId) 
        external 
        view 
        returns (GeckoTraits memory) 
    {
        require(_exists(tokenId), "Gecko does not exist");
        return geckoTraits[tokenId];
    }
    
    function getGeckosByOwner(address owner) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 ownerBalance = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](ownerBalance);
        
        for (uint256 i = 0; i < ownerBalance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokenIds;
    }
    
    function totalSupply() public view override returns (uint256) {
        return _tokenIdCounter.current() - 1;
    }

    // =============================================================================
    // URI Functions
    // =============================================================================
    
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        require(_exists(tokenId), "URI query for nonexistent token");
        
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 
            ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
            : "";
    }
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    // =============================================================================
    // Admin Functions
    // =============================================================================
    
    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
    }
    
    function setContractURI(string calldata contractURIParam) external onlyOwner {
        _contractURI = contractURIParam;
    }
    
    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
        emit MintPriceUpdated(newPrice);
    }
    
    function setMaxMintsPerWallet(uint256 newMax) external onlyOwner {
        maxMintsPerWallet = newMax;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }

    // =============================================================================
    // Required Overrides
    // =============================================================================
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}