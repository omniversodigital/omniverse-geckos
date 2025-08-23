// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title GeckoToken ($GECKO)
 * @dev ERC20 token for Omniverse Geckos ecosystem
 * @author Omniverse Geckos Team
 */
contract GeckoToken is 
    ERC20, 
    ERC20Burnable, 
    ERC20Permit, 
    Pausable, 
    Ownable, 
    ReentrancyGuard 
{
    // =============================================================================
    // Events
    // =============================================================================
    event RewardsDistributed(address indexed recipient, uint256 amount, string reason);
    event StakingRewardClaimed(address indexed staker, uint256 amount);
    event GameRewardClaimed(address indexed player, uint256 amount, uint256 gameSession);
    event TokensBurned(address indexed burner, uint256 amount, string reason);
    event MaxSupplyUpdated(uint256 newMaxSupply);
    event MintingRoleGranted(address indexed account);
    event MintingRoleRevoked(address indexed account);

    // =============================================================================
    // Constants
    // =============================================================================
    uint256 public constant INITIAL_SUPPLY = 400_000_000 * 10**18; // 400M tokens for initial mint
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;   // 1B tokens max supply
    uint256 public constant PLAY_TO_EARN_ALLOCATION = 400_000_000 * 10**18; // 40%
    uint256 public constant DEVELOPMENT_ALLOCATION = 250_000_000 * 10**18;  // 25%
    uint256 public constant COMMUNITY_ALLOCATION = 150_000_000 * 10**18;    // 15%
    uint256 public constant TEAM_ALLOCATION = 100_000_000 * 10**18;         // 10%
    uint256 public constant PARTNERSHIP_ALLOCATION = 100_000_000 * 10**18;  // 10%

    // =============================================================================
    // State Variables
    // =============================================================================
    mapping(address => bool) public minters;
    mapping(address => bool) public gameContracts;
    mapping(address => uint256) public lastRewardClaim;
    mapping(address => uint256) public totalRewardsEarned;
    
    uint256 public totalMinted;
    uint256 public totalBurned;
    uint256 public totalRewardsDistributed;
    
    // Reward rate limits (per day)
    uint256 public maxDailyRewardPerPlayer = 1000 * 10**18; // 1000 GECKO per day max
    uint256 public dailyRewardPool = 10000 * 10**18; // 10k GECKO daily pool
    uint256 public lastRewardPoolReset;
    uint256 public dailyRewardsDistributed;

    // Team vesting
    mapping(address => VestingSchedule) public teamVesting;
    struct VestingSchedule {
        uint256 totalAmount;
        uint256 startTime;
        uint256 vestingDuration;
        uint256 claimedAmount;
        bool active;
    }

    // =============================================================================
    // Modifiers
    // =============================================================================
    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }

    modifier onlyGameContract() {
        require(gameContracts[msg.sender], "Not authorized game contract");
        _;
    }

    modifier validAmount(uint256 amount) {
        require(amount > 0, "Amount must be greater than 0");
        _;
    }

    // =============================================================================
    // Constructor
    // =============================================================================
    constructor(
        address developmentWallet,
        address communityTreasury,
        address teamWallet,
        address partnershipWallet
    ) ERC20("Gecko Token", "GECKO") ERC20Permit("Gecko Token") {
        // Initial distribution
        _mint(developmentWallet, DEVELOPMENT_ALLOCATION);
        _mint(communityTreasury, COMMUNITY_ALLOCATION);
        _mint(partnershipWallet, PARTNERSHIP_ALLOCATION);
        
        // Setup team vesting (4 years linear vesting)
        _setupTeamVesting(teamWallet, TEAM_ALLOCATION);
        
        totalMinted = DEVELOPMENT_ALLOCATION + COMMUNITY_ALLOCATION + PARTNERSHIP_ALLOCATION;
        lastRewardPoolReset = block.timestamp;
    }

    // =============================================================================
    // Minting Functions
    // =============================================================================
    
    /**
     * @dev Mint tokens for play-to-earn rewards
     */
    function mintPlayToEarnReward(address to, uint256 amount) 
        external 
        onlyGameContract 
        validAmount(amount) 
        nonReentrant 
    {
        require(totalMinted + amount <= MAX_SUPPLY, "Exceeds max supply");
        require(_canReceiveDailyReward(to, amount), "Exceeds daily reward limit");
        
        _resetDailyPoolIfNeeded();
        require(dailyRewardsDistributed + amount <= dailyRewardPool, "Daily reward pool exhausted");
        
        _mint(to, amount);
        
        totalMinted += amount;
        totalRewardsDistributed += amount;
        dailyRewardsDistributed += amount;
        lastRewardClaim[to] = block.timestamp;
        totalRewardsEarned[to] += amount;
        
        emit RewardsDistributed(to, amount, "PlayToEarn");
    }

    /**
     * @dev Mint tokens for staking rewards
     */
    function mintStakingReward(address to, uint256 amount) 
        external 
        onlyMinter 
        validAmount(amount) 
        nonReentrant 
    {
        require(totalMinted + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        _mint(to, amount);
        
        totalMinted += amount;
        totalRewardsDistributed += amount;
        totalRewardsEarned[to] += amount;
        
        emit StakingRewardClaimed(to, amount);
        emit RewardsDistributed(to, amount, "Staking");
    }

    /**
     * @dev Mint tokens for special events/airdrops
     */
    function mintSpecialReward(
        address to, 
        uint256 amount, 
        string calldata reason
    ) external onlyOwner validAmount(amount) nonReentrant {
        require(totalMinted + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        _mint(to, amount);
        totalMinted += amount;
        
        emit RewardsDistributed(to, amount, reason);
    }

    /**
     * @dev Batch mint for multiple recipients
     */
    function batchMint(
        address[] calldata recipients, 
        uint256[] calldata amounts,
        string calldata reason
    ) external onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length <= 100, "Too many recipients");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(totalMinted + totalAmount <= MAX_SUPPLY, "Exceeds max supply");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            if (amounts[i] > 0) {
                _mint(recipients[i], amounts[i]);
                totalMinted += amounts[i];
                emit RewardsDistributed(recipients[i], amounts[i], reason);
            }
        }
    }

    // =============================================================================
    // Team Vesting Functions
    // =============================================================================
    
    function _setupTeamVesting(address teamWallet, uint256 amount) internal {
        teamVesting[teamWallet] = VestingSchedule({
            totalAmount: amount,
            startTime: block.timestamp,
            vestingDuration: 4 * 365 days, // 4 years
            claimedAmount: 0,
            active: true
        });
    }
    
    function claimVestedTokens() external nonReentrant {
        VestingSchedule storage vesting = teamVesting[msg.sender];
        require(vesting.active, "No vesting schedule");
        
        uint256 vestedAmount = calculateVestedAmount(msg.sender);
        uint256 claimableAmount = vestedAmount - vesting.claimedAmount;
        
        require(claimableAmount > 0, "No tokens to claim");
        require(totalMinted + claimableAmount <= MAX_SUPPLY, "Exceeds max supply");
        
        vesting.claimedAmount += claimableAmount;
        totalMinted += claimableAmount;
        
        _mint(msg.sender, claimableAmount);
        
        emit RewardsDistributed(msg.sender, claimableAmount, "TeamVesting");
    }
    
    function calculateVestedAmount(address account) public view returns (uint256) {
        VestingSchedule memory vesting = teamVesting[account];
        if (!vesting.active) return 0;
        
        if (block.timestamp < vesting.startTime) return 0;
        
        uint256 elapsedTime = block.timestamp - vesting.startTime;
        if (elapsedTime >= vesting.vestingDuration) {
            return vesting.totalAmount;
        }
        
        return (vesting.totalAmount * elapsedTime) / vesting.vestingDuration;
    }

    // =============================================================================
    // Burning Functions
    // =============================================================================
    
    /**
     * @dev Burn tokens for in-game purchases
     */
    function burnForPurchase(address from, uint256 amount, string calldata item) 
        external 
        onlyGameContract 
        validAmount(amount) 
    {
        _burn(from, amount);
        totalBurned += amount;
        
        emit TokensBurned(from, amount, string(abi.encodePacked("Purchase: ", item)));
    }

    /**
     * @dev Burn tokens for breeding
     */
    function burnForBreeding(address from, uint256 amount) 
        external 
        onlyGameContract 
        validAmount(amount) 
    {
        _burn(from, amount);
        totalBurned += amount;
        
        emit TokensBurned(from, amount, "Breeding");
    }

    /**
     * @dev Override burn function to track total burned
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
        totalBurned += amount;
        emit TokensBurned(msg.sender, amount, "Manual");
    }

    /**
     * @dev Override burnFrom function to track total burned
     */
    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
        totalBurned += amount;
        emit TokensBurned(account, amount, "Manual");
    }

    // =============================================================================
    // Reward Management
    // =============================================================================
    
    function _canReceiveDailyReward(address player, uint256 amount) internal view returns (bool) {
        if (block.timestamp - lastRewardClaim[player] < 1 days) {
            return false; // Already claimed today
        }
        return amount <= maxDailyRewardPerPlayer;
    }
    
    function _resetDailyPoolIfNeeded() internal {
        if (block.timestamp - lastRewardPoolReset >= 1 days) {
            dailyRewardsDistributed = 0;
            lastRewardPoolReset = block.timestamp;
        }
    }
    
    function getRemainingDailyRewardPool() external view returns (uint256) {
        if (block.timestamp - lastRewardPoolReset >= 1 days) {
            return dailyRewardPool;
        }
        return dailyRewardPool - dailyRewardsDistributed;
    }
    
    function getPlayerDailyRewardStatus(address player) 
        external 
        view 
        returns (bool canClaim, uint256 maxAmount, uint256 timeUntilReset) 
    {
        canClaim = block.timestamp - lastRewardClaim[player] >= 1 days;
        maxAmount = maxDailyRewardPerPlayer;
        
        if (!canClaim) {
            timeUntilReset = 1 days - (block.timestamp - lastRewardClaim[player]);
        } else {
            timeUntilReset = 0;
        }
    }

    // =============================================================================
    // Admin Functions
    // =============================================================================
    
    function addMinter(address account) external onlyOwner {
        minters[account] = true;
        emit MintingRoleGranted(account);
    }
    
    function removeMinter(address account) external onlyOwner {
        minters[account] = false;
        emit MintingRoleRevoked(account);
    }
    
    function addGameContract(address gameContract) external onlyOwner {
        gameContracts[gameContract] = true;
    }
    
    function removeGameContract(address gameContract) external onlyOwner {
        gameContracts[gameContract] = false;
    }
    
    function setMaxDailyRewardPerPlayer(uint256 newMax) external onlyOwner {
        maxDailyRewardPerPlayer = newMax;
    }
    
    function setDailyRewardPool(uint256 newPool) external onlyOwner {
        dailyRewardPool = newPool;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }

    // =============================================================================
    // View Functions
    // =============================================================================
    
    function getTokenInfo() 
        external 
        view 
        returns (
            uint256 _totalSupply,
            uint256 _maxSupply,
            uint256 _totalMinted,
            uint256 _totalBurned,
            uint256 _totalRewardsDistributed,
            uint256 _circulatingSupply
        ) 
    {
        return (
            totalSupply(),
            MAX_SUPPLY,
            totalMinted,
            totalBurned,
            totalRewardsDistributed,
            totalSupply() - balanceOf(address(this))
        );
    }
    
    function getUserStats(address user) 
        external 
        view 
        returns (
            uint256 balance,
            uint256 totalEarned,
            uint256 lastClaim,
            bool canClaimDaily,
            uint256 vestedAmount,
            uint256 claimableVested
        ) 
    {
        balance = balanceOf(user);
        totalEarned = totalRewardsEarned[user];
        lastClaim = lastRewardClaim[user];
        canClaimDaily = block.timestamp - lastRewardClaim[user] >= 1 days;
        
        VestingSchedule memory vesting = teamVesting[user];
        if (vesting.active) {
            vestedAmount = calculateVestedAmount(user);
            claimableVested = vestedAmount - vesting.claimedAmount;
        }
    }

    // =============================================================================
    // Required Overrides
    // =============================================================================
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    // =============================================================================
    // Utility Functions
    // =============================================================================
    
    /**
     * @dev Convert amount to display format (with decimals)
     */
    function toDisplayAmount(uint256 amount) external pure returns (uint256) {
        return amount / 10**18;
    }
    
    /**
     * @dev Convert from display format to contract format
     */
    function fromDisplayAmount(uint256 displayAmount) external pure returns (uint256) {
        return displayAmount * 10**18;
    }
    
    /**
     * @dev Check if address is a contract
     */
    function isContract(address account) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }
    
    /**
     * @dev Get current timestamp
     */
    function getCurrentTimestamp() external view returns (uint256) {
        return block.timestamp;
    }
}