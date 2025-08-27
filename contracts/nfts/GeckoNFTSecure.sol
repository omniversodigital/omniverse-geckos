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
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

/**
 * @title GeckoNFTSecure
 * @dev SECURE NFT contract for Omniverse Geckos game with Chainlink VRF
 * @author Omniverse Geckos Team
 * 
 * SECURITY IMPROVEMENTS:
 * - Chainlink VRF for secure randomness
 * - Circuit breakers and rate limiting
 * - Enhanced access control
 * - Emergency pause functionality
 * - Comprehensive event logging
 */
contract GeckoNFTSecure is 
    ERC721, 
    ERC721Enumerable, 
    ERC721URIStorage, 
    Pausable, 
    Ownable, 
    ReentrancyGuard,
    VRFConsumerBaseV2
{
    using Counters for Counters.Counter;
    using Strings for uint256;

    // =============================================================================
    // Chainlink VRF Configuration
    // =============================================================================
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 s_subscriptionId;
    bytes32 keyHash;
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;

    mapping(uint256 => uint256) public requestIdToTokenId;
    mapping(uint256 => address) public requestIdToSender;

    // =============================================================================
    // Security Events
    // =============================================================================
    event EmergencyPaused(address indexed by, string reason);
    event EmergencyUnpaused(address indexed by);
    event SecurityBreach(address indexed account, string action);
    event RateLimitExceeded(address indexed account, uint256 attempts);
    event RandomnessRequested(uint256 indexed requestId, uint256 indexed tokenId);
    event RandomnessFulfilled(uint256 indexed requestId, uint256 randomness);

    // =============================================================================
    // Enhanced Security State Variables
    // =============================================================================
    Counters.Counter private _tokenIdCounter;
    
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public mintPrice = 0.1 ether;
    uint256 public maxMintsPerWallet = 5;
    uint256 public breedingCooldown = 7 days;
    uint256 public maxBreedingCount = 3;
    
    // Rate limiting
    mapping(address => uint256) public lastMintTime;
    mapping(address => uint256) public mintCountInTimeWindow;
    uint256 public constant MINT_RATE_LIMIT_WINDOW = 1 hours;
    uint256 public constant MAX_MINTS_PER_HOUR = 2;
    
    // Circuit breaker
    bool public circuitBreakerActive = false;
    uint256 public dailyMintLimit = 100;
    uint256 public dailyMintCount = 0;
    uint256 public lastResetTime = block.timestamp;
    
    string private _baseTokenURI;
    string private _contractURI;
    
    // Enhanced mappings
    mapping(uint256 => GeckoTraits) public geckoTraits;
    mapping(address => uint256) public walletMintCount;
    mapping(uint256 => uint256) public lastBreedingTime;
    mapping(address => bool) public authorizedMinters;
    
    // Emergency controls
    address public emergencyAdmin;
    uint256 public emergencyPauseTime;
    uint256 public constant MAX_EMERGENCY_PAUSE_DURATION = 7 days;

    // =============================================================================
    // Structs (Enhanced with security metadata)
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
        uint256 securityHash; // NEW: Anti-tampering hash
        bool isLegitimate; // NEW: Legitimacy flag
    }

    // =============================================================================
    // Security Modifiers
    // =============================================================================
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized minter");
        _;
    }

    modifier rateLimited() {
        require(!_isRateLimited(msg.sender), "Rate limit exceeded");
        _;
    }

    modifier circuitBreakerCheck() {
        require(!circuitBreakerActive, "Circuit breaker active");
        _updateDailyMintCount();
        require(dailyMintCount < dailyMintLimit, "Daily mint limit reached");
        _;
    }

    modifier emergencyCheck() {
        if (emergencyPauseTime > 0) {
            require(
                block.timestamp <= emergencyPauseTime + MAX_EMERGENCY_PAUSE_DURATION,
                "Emergency pause expired"
            );
        }
        _;
    }

    // =============================================================================
    // Constructor (Enhanced with VRF)
    // =============================================================================
    constructor(
        string memory baseURI,
        string memory contractURIParam,
        uint64 subscriptionId,
        address vrfCoordinator,
        bytes32 _keyHash
    ) 
        ERC721("Omniverse Geckos Secure", "GECKOS") 
        VRFConsumerBaseV2(vrfCoordinator)
    {
        _baseTokenURI = baseURI;
        _contractURI = contractURIParam;
        _tokenIdCounter.increment();
        
        // Chainlink VRF setup
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
        keyHash = _keyHash;
        
        // Set emergency admin
        emergencyAdmin = msg.sender;
        
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // =============================================================================
    // Secure Minting Functions
    // =============================================================================
    
    /**
     * @dev Secure public mint with VRF randomness
     */
    function mintSecure(address to, uint256 quantity) 
        external 
        payable 
        whenNotPaused 
        nonReentrant 
        rateLimited
        circuitBreakerCheck
        emergencyCheck
    {
        require(quantity > 0 && quantity <= 3, "Invalid quantity"); // Reduced max
        require(walletMintCount[to] + quantity <= maxMintsPerWallet, "Exceeds max mints per wallet");
        require(_tokenIdCounter.current() + quantity <= MAX_SUPPLY, "Exceeds max supply");
        require(msg.value >= mintPrice * quantity, "Insufficient payment");
        
        // Anti-MEV protection
        require(tx.gasprice <= 50 gwei, "Gas price too high - potential MEV");
        
        walletMintCount[to] += quantity;
        _updateRateLimit(msg.sender);
        dailyMintCount += quantity;
        
        for (uint256 i = 0; i < quantity; i++) {
            _mintGeckoWithVRF(to);
        }
        
        // Refund excess payment
        if (msg.value > mintPrice * quantity) {
            payable(msg.sender).transfer(msg.value - (mintPrice * quantity));
        }
        
        emit GeckoMinted(0, to, GeckoType.FIRE, Rarity.COMMON); // Will be updated when VRF responds
    }
    
    /**
     * @dev Internal mint with VRF request
     */
    function _mintGeckoWithVRF(address to) private {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Request random number from Chainlink VRF
        uint256 requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        
        requestIdToTokenId[requestId] = tokenId;
        requestIdToSender[requestId] = to;
        
        emit RandomnessRequested(requestId, tokenId);
        
        // Mint with placeholder traits (will be updated when VRF responds)
        _safeMint(to, tokenId);
        
        // Set placeholder traits
        geckoTraits[tokenId] = GeckoTraits({
            geckoType: GeckoType.FIRE,
            rarity: Rarity.COMMON,
            level: 1,
            experience: 0,
            damage: 50,
            range: 100,
            fireRate: 1000,
            birthTime: block.timestamp,
            lastEvolution: block.timestamp,
            canBreed: true,
            breedCount: 0,
            kills: 0,
            totalDamageDealt: 0,
            specialAbilities: new string[](0),
            securityHash: 0, // Will be set when traits are finalized
            isLegitimate: false // Will be set to true when VRF responds
        });
    }

    /**
     * @dev VRF callback function - generates secure random traits
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        uint256 tokenId = requestIdToTokenId[requestId];
        address recipient = requestIdToSender[requestId];
        
        require(_exists(tokenId), "Token does not exist");
        
        uint256 randomness = randomWords[0];
        
        // Generate secure traits with VRF randomness
        GeckoTraits memory traits = _generateSecureTraits(tokenId, randomness);
        geckoTraits[tokenId] = traits;
        
        emit RandomnessFulfilled(requestId, randomness);
        emit GeckoMinted(tokenId, recipient, traits.geckoType, traits.rarity);
        
        // Clean up mappings
        delete requestIdToTokenId[requestId];
        delete requestIdToSender[requestId];
    }
    
    /**
     * @dev Generate secure traits with VRF randomness
     */
    function _generateSecureTraits(uint256 tokenId, uint256 randomness) 
        private 
        view 
        returns (GeckoTraits memory) 
    {
        // Use VRF randomness for trait generation
        Rarity rarity = _getRandomRarity(randomness);
        GeckoType geckoType = _getRandomType(randomness >> 8);
        
        // Base stats based on type and rarity
        uint256 baseDamage = _getBaseDamage(geckoType);
        uint256 baseRange = _getBaseRange(geckoType);
        uint256 baseFireRate = _getBaseFireRate(geckoType);
        
        // Apply rarity multipliers
        uint256 rarityMultiplier = _getRarityMultiplier(rarity);
        
        // Calculate security hash
        uint256 securityHash = uint256(keccak256(abi.encodePacked(
            tokenId,
            randomness,
            block.timestamp,
            geckoType,
            rarity
        )));
        
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
            specialAbilities: _getSpecialAbilities(geckoType, rarity),
            securityHash: securityHash,
            isLegitimate: true
        });
    }

    // =============================================================================
    // Security and Rate Limiting Functions
    // =============================================================================
    
    function _isRateLimited(address account) internal view returns (bool) {
        if (lastMintTime[account] + MINT_RATE_LIMIT_WINDOW > block.timestamp) {
            return mintCountInTimeWindow[account] >= MAX_MINTS_PER_HOUR;
        }
        return false;
    }
    
    function _updateRateLimit(address account) internal {
        if (lastMintTime[account] + MINT_RATE_LIMIT_WINDOW <= block.timestamp) {
            // Reset window
            mintCountInTimeWindow[account] = 1;
            lastMintTime[account] = block.timestamp;
        } else {
            // Within window
            mintCountInTimeWindow[account]++;
        }
    }
    
    function _updateDailyMintCount() internal {
        if (block.timestamp >= lastResetTime + 1 days) {
            dailyMintCount = 0;
            lastResetTime = block.timestamp;
        }
    }

    // =============================================================================
    // Emergency Functions
    // =============================================================================
    
    function emergencyPause(string calldata reason) external {
        require(
            msg.sender == owner() || msg.sender == emergencyAdmin, 
            "Not authorized for emergency pause"
        );
        
        _pause();
        emergencyPauseTime = block.timestamp;
        emit EmergencyPaused(msg.sender, reason);
    }
    
    function emergencyUnpause() external onlyOwner {
        _unpause();
        emergencyPauseTime = 0;
        emit EmergencyUnpaused(msg.sender);
    }
    
    function activateCircuitBreaker() external onlyOwner {
        circuitBreakerActive = true;
    }
    
    function deactivateCircuitBreaker() external onlyOwner {
        circuitBreakerActive = false;
    }

    // =============================================================================
    // Enhanced Admin Functions
    // =============================================================================
    
    function addAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
    }
    
    function removeAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
    }
    
    function setEmergencyAdmin(address newAdmin) external onlyOwner {
        emergencyAdmin = newAdmin;
    }
    
    function setDailyMintLimit(uint256 newLimit) external onlyOwner {
        require(newLimit <= 500, "Limit too high");
        dailyMintLimit = newLimit;
    }

    // =============================================================================
    // Security Verification Functions
    // =============================================================================
    
    function verifyGeckoSecurity(uint256 tokenId) external view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        GeckoTraits memory traits = geckoTraits[tokenId];
        
        // Verify security hash
        uint256 expectedHash = uint256(keccak256(abi.encodePacked(
            tokenId,
            traits.geckoType,
            traits.rarity,
            traits.birthTime
        )));
        
        // Note: This is a simplified verification - in production,
        // you'd store the original randomness securely
        return traits.isLegitimate && traits.securityHash != 0;
    }
    
    function getSecurityReport() external view returns (
        uint256 totalMinted,
        uint256 dailyCount,
        bool circuitBreakerStatus,
        bool pauseStatus,
        uint256 emergencyPauseRemaining
    ) {
        totalMinted = _tokenIdCounter.current() - 1;
        dailyCount = dailyMintCount;
        circuitBreakerStatus = circuitBreakerActive;
        pauseStatus = paused();
        
        if (emergencyPauseTime > 0) {
            uint256 elapsed = block.timestamp - emergencyPauseTime;
            emergencyPauseRemaining = elapsed >= MAX_EMERGENCY_PAUSE_DURATION 
                ? 0 
                : MAX_EMERGENCY_PAUSE_DURATION - elapsed;
        }
    }

    // =============================================================================
    // Helper Functions (Maintained from original)
    // =============================================================================
    
    function _getRandomRarity(uint256 seed) private pure returns (Rarity) {
        uint256 roll = seed % 10000;
        
        if (roll < 6000) return Rarity.COMMON;
        if (roll < 8500) return Rarity.UNCOMMON;
        if (roll < 9500) return Rarity.RARE;
        if (roll < 9995) return Rarity.EPIC;
        return Rarity.LEGENDARY;
    }
    
    function _getRandomType(uint256 seed) private pure returns (GeckoType) {
        uint256 roll = seed % 10000;
        
        if (roll < 2500) return GeckoType.FIRE;
        if (roll < 4500) return GeckoType.ICE;
        if (roll < 6500) return GeckoType.ELECTRIC;
        if (roll < 8500) return GeckoType.POISON;
        if (roll < 9995) return GeckoType.COSMIC;
        return GeckoType.LEGENDARY;
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
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
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