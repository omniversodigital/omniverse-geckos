// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title GeckoMarketplace
 * @dev Decentralized marketplace for trading Gecko NFTs
 * @author Omniverse Geckos Team
 */
contract GeckoMarketplace is 
    IERC721Receiver,
    ReentrancyGuard, 
    Pausable, 
    Ownable 
{
    using Counters for Counters.Counter;

    // =============================================================================
    // Events
    // =============================================================================
    event ItemListed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price,
        PaymentType paymentType
    );

    event ItemSold(
        uint256 indexed listingId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        PaymentType paymentType
    );

    event ItemDelisted(
        uint256 indexed listingId,
        address indexed seller
    );

    event OfferMade(
        uint256 indexed offerId,
        uint256 indexed listingId,
        address indexed buyer,
        uint256 amount,
        PaymentType paymentType,
        uint256 expiration
    );

    event OfferAccepted(
        uint256 indexed offerId,
        uint256 indexed listingId,
        address indexed seller,
        address buyer,
        uint256 amount
    );

    event OfferCancelled(
        uint256 indexed offerId,
        address indexed buyer
    );

    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed seller,
        address nftContract,
        uint256 tokenId,
        uint256 startingPrice,
        uint256 duration
    );

    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );

    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 winningBid
    );

    event RoyaltyPaid(
        address indexed collection,
        address indexed recipient,
        uint256 amount
    );

    // =============================================================================
    // Enums and Structs
    // =============================================================================
    enum ListingStatus { ACTIVE, SOLD, CANCELLED }
    enum PaymentType { ETH, GECKO_TOKEN }
    enum OfferStatus { ACTIVE, ACCEPTED, CANCELLED, EXPIRED }
    enum AuctionStatus { ACTIVE, ENDED, CANCELLED }

    struct Listing {
        uint256 listingId;
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        PaymentType paymentType;
        ListingStatus status;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct Offer {
        uint256 offerId;
        uint256 listingId;
        address buyer;
        uint256 amount;
        PaymentType paymentType;
        uint256 expiration;
        OfferStatus status;
        uint256 createdAt;
    }

    struct Auction {
        uint256 auctionId;
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 startingPrice;
        uint256 currentBid;
        address currentBidder;
        uint256 endTime;
        AuctionStatus status;
        PaymentType paymentType;
        uint256 createdAt;
    }

    struct RoyaltyInfo {
        address recipient;
        uint256 percentage; // Out of 10000 (basis points)
    }

    // =============================================================================
    // State Variables
    // =============================================================================
    Counters.Counter private _listingIdCounter;
    Counters.Counter private _offerIdCounter;
    Counters.Counter private _auctionIdCounter;

    IERC20 public geckoToken;
    
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Offer) public offers;
    mapping(uint256 => Auction) public auctions;
    mapping(address => RoyaltyInfo) public collectionRoyalties;
    
    // Listing mappings
    mapping(address => uint256[]) public userListings;
    mapping(address => mapping(uint256 => uint256)) public nftToListingId;
    
    // Offer mappings
    mapping(uint256 => uint256[]) public listingOffers;
    mapping(address => uint256[]) public userOffers;
    
    // Auction mappings
    mapping(address => uint256[]) public userAuctions;
    mapping(uint256 => uint256[]) public auctionBids;
    
    // Fee structure
    uint256 public marketplaceFee = 250; // 2.5% in basis points
    address public feeRecipient;
    
    // Minimum prices
    uint256 public minimumListingPrice = 0.001 ether;
    uint256 public minimumOfferAmount = 0.001 ether;
    
    // Auction settings
    uint256 public minimumAuctionDuration = 1 hours;
    uint256 public maximumAuctionDuration = 30 days;
    uint256 public bidIncrement = 50; // 0.5% minimum increase

    // =============================================================================
    // Modifiers
    // =============================================================================
    modifier validNFTContract(address nftContract) {
        require(nftContract != address(0), "Invalid NFT contract");
        require(IERC721(nftContract).supportsInterface(type(IERC721).interfaceId), "Not an ERC721 contract");
        _;
    }

    modifier onlyTokenOwner(address nftContract, uint256 tokenId) {
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not the token owner");
        _;
    }

    modifier validListingId(uint256 listingId) {
        require(listingId > 0 && listingId <= _listingIdCounter.current(), "Invalid listing ID");
        _;
    }

    modifier validOfferId(uint256 offerId) {
        require(offerId > 0 && offerId <= _offerIdCounter.current(), "Invalid offer ID");
        _;
    }

    modifier validAuctionId(uint256 auctionId) {
        require(auctionId > 0 && auctionId <= _auctionIdCounter.current(), "Invalid auction ID");
        _;
    }

    // =============================================================================
    // Constructor
    // =============================================================================
    constructor(address _geckoToken, address _feeRecipient) {
        geckoToken = IERC20(_geckoToken);
        feeRecipient = _feeRecipient;
        _listingIdCounter.increment(); // Start from 1
        _offerIdCounter.increment();
        _auctionIdCounter.increment();
    }

    // =============================================================================
    // Listing Functions
    // =============================================================================
    
    function listItem(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        PaymentType paymentType
    ) 
        external 
        nonReentrant 
        whenNotPaused 
        validNFTContract(nftContract)
        onlyTokenOwner(nftContract, tokenId)
    {
        require(price >= minimumListingPrice, "Price below minimum");
        require(nftToListingId[nftContract][tokenId] == 0, "Item already listed");
        
        // Transfer NFT to marketplace
        IERC721(nftContract).safeTransferFrom(msg.sender, address(this), tokenId);
        
        uint256 listingId = _listingIdCounter.current();
        _listingIdCounter.increment();
        
        listings[listingId] = Listing({
            listingId: listingId,
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            paymentType: paymentType,
            status: ListingStatus.ACTIVE,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        nftToListingId[nftContract][tokenId] = listingId;
        userListings[msg.sender].push(listingId);
        
        emit ItemListed(listingId, msg.sender, nftContract, tokenId, price, paymentType);
    }

    function buyItem(uint256 listingId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        validListingId(listingId)
    {
        Listing storage listing = listings[listingId];
        require(listing.status == ListingStatus.ACTIVE, "Item not available");
        require(msg.sender != listing.seller, "Cannot buy your own item");
        
        uint256 totalPrice = listing.price;
        
        if (listing.paymentType == PaymentType.ETH) {
            require(msg.value >= totalPrice, "Insufficient ETH");
        } else {
            require(geckoToken.transferFrom(msg.sender, address(this), totalPrice), "Token transfer failed");
        }
        
        // Calculate fees and royalties
        (uint256 royaltyAmount, address royaltyRecipient) = _calculateRoyalty(listing.nftContract, totalPrice);
        uint256 marketplaceFeeAmount = (totalPrice * marketplaceFee) / 10000;
        uint256 sellerAmount = totalPrice - royaltyAmount - marketplaceFeeAmount;
        
        // Transfer payments
        if (listing.paymentType == PaymentType.ETH) {
            if (royaltyAmount > 0) {
                payable(royaltyRecipient).transfer(royaltyAmount);
                emit RoyaltyPaid(listing.nftContract, royaltyRecipient, royaltyAmount);
            }
            payable(feeRecipient).transfer(marketplaceFeeAmount);
            payable(listing.seller).transfer(sellerAmount);
            
            // Refund excess
            if (msg.value > totalPrice) {
                payable(msg.sender).transfer(msg.value - totalPrice);
            }
        } else {
            if (royaltyAmount > 0) {
                geckoToken.transfer(royaltyRecipient, royaltyAmount);
                emit RoyaltyPaid(listing.nftContract, royaltyRecipient, royaltyAmount);
            }
            geckoToken.transfer(feeRecipient, marketplaceFeeAmount);
            geckoToken.transfer(listing.seller, sellerAmount);
        }
        
        // Transfer NFT to buyer
        IERC721(listing.nftContract).safeTransferFrom(address(this), msg.sender, listing.tokenId);
        
        // Update listing status
        listing.status = ListingStatus.SOLD;
        listing.updatedAt = block.timestamp;
        nftToListingId[listing.nftContract][listing.tokenId] = 0;
        
        emit ItemSold(listingId, listing.seller, msg.sender, totalPrice, listing.paymentType);
    }

    function delistItem(uint256 listingId) 
        external 
        nonReentrant 
        validListingId(listingId)
    {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.status == ListingStatus.ACTIVE, "Item not active");
        
        // Return NFT to seller
        IERC721(listing.nftContract).safeTransferFrom(address(this), msg.sender, listing.tokenId);
        
        // Update listing status
        listing.status = ListingStatus.CANCELLED;
        listing.updatedAt = block.timestamp;
        nftToListingId[listing.nftContract][listing.tokenId] = 0;
        
        // Cancel all offers for this listing
        _cancelAllOffersForListing(listingId);
        
        emit ItemDelisted(listingId, msg.sender);
    }

    function updateListingPrice(uint256 listingId, uint256 newPrice) 
        external 
        validListingId(listingId)
    {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.status == ListingStatus.ACTIVE, "Item not active");
        require(newPrice >= minimumListingPrice, "Price below minimum");
        
        listing.price = newPrice;
        listing.updatedAt = block.timestamp;
        
        emit ItemListed(listingId, msg.sender, listing.nftContract, listing.tokenId, newPrice, listing.paymentType);
    }

    // =============================================================================
    // Offer Functions
    // =============================================================================
    
    function makeOffer(
        uint256 listingId,
        uint256 amount,
        PaymentType paymentType,
        uint256 duration
    ) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        validListingId(listingId)
    {
        Listing storage listing = listings[listingId];
        require(listing.status == ListingStatus.ACTIVE, "Item not available");
        require(msg.sender != listing.seller, "Cannot make offer on your own item");
        require(amount >= minimumOfferAmount, "Offer too low");
        require(duration >= 1 hours && duration <= 30 days, "Invalid offer duration");
        
        uint256 offerId = _offerIdCounter.current();
        _offerIdCounter.increment();
        
        // Lock payment
        if (paymentType == PaymentType.ETH) {
            require(msg.value >= amount, "Insufficient ETH");
        } else {
            require(geckoToken.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        }
        
        offers[offerId] = Offer({
            offerId: offerId,
            listingId: listingId,
            buyer: msg.sender,
            amount: amount,
            paymentType: paymentType,
            expiration: block.timestamp + duration,
            status: OfferStatus.ACTIVE,
            createdAt: block.timestamp
        });
        
        listingOffers[listingId].push(offerId);
        userOffers[msg.sender].push(offerId);
        
        // Refund excess ETH
        if (paymentType == PaymentType.ETH && msg.value > amount) {
            payable(msg.sender).transfer(msg.value - amount);
        }
        
        emit OfferMade(offerId, listingId, msg.sender, amount, paymentType, block.timestamp + duration);
    }

    function acceptOffer(uint256 offerId) 
        external 
        nonReentrant 
        validOfferId(offerId)
    {
        Offer storage offer = offers[offerId];
        require(offer.status == OfferStatus.ACTIVE, "Offer not active");
        require(block.timestamp <= offer.expiration, "Offer expired");
        
        Listing storage listing = listings[offer.listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.status == ListingStatus.ACTIVE, "Item not available");
        
        uint256 totalAmount = offer.amount;
        
        // Calculate fees and royalties
        (uint256 royaltyAmount, address royaltyRecipient) = _calculateRoyalty(listing.nftContract, totalAmount);
        uint256 marketplaceFeeAmount = (totalAmount * marketplaceFee) / 10000;
        uint256 sellerAmount = totalAmount - royaltyAmount - marketplaceFeeAmount;
        
        // Transfer payments
        if (offer.paymentType == PaymentType.ETH) {
            if (royaltyAmount > 0) {
                payable(royaltyRecipient).transfer(royaltyAmount);
                emit RoyaltyPaid(listing.nftContract, royaltyRecipient, royaltyAmount);
            }
            payable(feeRecipient).transfer(marketplaceFeeAmount);
            payable(listing.seller).transfer(sellerAmount);
        } else {
            if (royaltyAmount > 0) {
                geckoToken.transfer(royaltyRecipient, royaltyAmount);
                emit RoyaltyPaid(listing.nftContract, royaltyRecipient, royaltyAmount);
            }
            geckoToken.transfer(feeRecipient, marketplaceFeeAmount);
            geckoToken.transfer(listing.seller, sellerAmount);
        }
        
        // Transfer NFT
        IERC721(listing.nftContract).safeTransferFrom(address(this), offer.buyer, listing.tokenId);
        
        // Update statuses
        offer.status = OfferStatus.ACCEPTED;
        listing.status = ListingStatus.SOLD;
        listing.updatedAt = block.timestamp;
        nftToListingId[listing.nftContract][listing.tokenId] = 0;
        
        // Cancel other offers for this listing
        _cancelOtherOffersForListing(offer.listingId, offerId);
        
        emit OfferAccepted(offerId, offer.listingId, msg.sender, offer.buyer, totalAmount);
        emit ItemSold(offer.listingId, listing.seller, offer.buyer, totalAmount, offer.paymentType);
    }

    function cancelOffer(uint256 offerId) 
        external 
        nonReentrant 
        validOfferId(offerId)
    {
        Offer storage offer = offers[offerId];
        require(offer.buyer == msg.sender, "Not the offer maker");
        require(offer.status == OfferStatus.ACTIVE, "Offer not active");
        
        // Refund payment
        if (offer.paymentType == PaymentType.ETH) {
            payable(msg.sender).transfer(offer.amount);
        } else {
            geckoToken.transfer(msg.sender, offer.amount);
        }
        
        offer.status = OfferStatus.CANCELLED;
        
        emit OfferCancelled(offerId, msg.sender);
    }

    // =============================================================================
    // Auction Functions
    // =============================================================================
    
    function createAuction(
        address nftContract,
        uint256 tokenId,
        uint256 startingPrice,
        uint256 duration,
        PaymentType paymentType
    ) 
        external 
        nonReentrant 
        whenNotPaused 
        validNFTContract(nftContract)
        onlyTokenOwner(nftContract, tokenId)
    {
        require(startingPrice >= minimumListingPrice, "Starting price too low");
        require(duration >= minimumAuctionDuration && duration <= maximumAuctionDuration, "Invalid duration");
        require(nftToListingId[nftContract][tokenId] == 0, "Item already listed");
        
        // Transfer NFT to marketplace
        IERC721(nftContract).safeTransferFrom(msg.sender, address(this), tokenId);
        
        uint256 auctionId = _auctionIdCounter.current();
        _auctionIdCounter.increment();
        
        auctions[auctionId] = Auction({
            auctionId: auctionId,
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            startingPrice: startingPrice,
            currentBid: 0,
            currentBidder: address(0),
            endTime: block.timestamp + duration,
            status: AuctionStatus.ACTIVE,
            paymentType: paymentType,
            createdAt: block.timestamp
        });
        
        userAuctions[msg.sender].push(auctionId);
        
        emit AuctionCreated(auctionId, msg.sender, nftContract, tokenId, startingPrice, duration);
    }

    function placeBid(uint256 auctionId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        validAuctionId(auctionId)
    {
        Auction storage auction = auctions[auctionId];
        require(auction.status == AuctionStatus.ACTIVE, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.sender != auction.seller, "Cannot bid on your own auction");
        
        uint256 bidAmount;
        if (auction.paymentType == PaymentType.ETH) {
            bidAmount = msg.value;
        } else {
            // For token bids, we need to get amount from function parameters
            // This would need to be modified to accept amount parameter
            revert("Token bids not implemented in this function");
        }
        
        uint256 minimumBid = auction.currentBid == 0 
            ? auction.startingPrice 
            : auction.currentBid + ((auction.currentBid * bidIncrement) / 10000);
            
        require(bidAmount >= minimumBid, "Bid too low");
        
        // Refund previous bidder
        if (auction.currentBidder != address(0)) {
            if (auction.paymentType == PaymentType.ETH) {
                payable(auction.currentBidder).transfer(auction.currentBid);
            } else {
                geckoToken.transfer(auction.currentBidder, auction.currentBid);
            }
        }
        
        auction.currentBid = bidAmount;
        auction.currentBidder = msg.sender;
        
        // Extend auction if bid is placed in last 10 minutes
        if (auction.endTime - block.timestamp < 10 minutes) {
            auction.endTime = block.timestamp + 10 minutes;
        }
        
        auctionBids[auctionId].push(bidAmount);
        
        emit BidPlaced(auctionId, msg.sender, bidAmount);
    }

    function endAuction(uint256 auctionId) 
        external 
        nonReentrant 
        validAuctionId(auctionId)
    {
        Auction storage auction = auctions[auctionId];
        require(auction.status == AuctionStatus.ACTIVE, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction still ongoing");
        
        auction.status = AuctionStatus.ENDED;
        
        if (auction.currentBidder != address(0)) {
            // Calculate fees and royalties
            (uint256 royaltyAmount, address royaltyRecipient) = _calculateRoyalty(auction.nftContract, auction.currentBid);
            uint256 marketplaceFeeAmount = (auction.currentBid * marketplaceFee) / 10000;
            uint256 sellerAmount = auction.currentBid - royaltyAmount - marketplaceFeeAmount;
            
            // Transfer payments
            if (auction.paymentType == PaymentType.ETH) {
                if (royaltyAmount > 0) {
                    payable(royaltyRecipient).transfer(royaltyAmount);
                    emit RoyaltyPaid(auction.nftContract, royaltyRecipient, royaltyAmount);
                }
                payable(feeRecipient).transfer(marketplaceFeeAmount);
                payable(auction.seller).transfer(sellerAmount);
            } else {
                if (royaltyAmount > 0) {
                    geckoToken.transfer(royaltyRecipient, royaltyAmount);
                    emit RoyaltyPaid(auction.nftContract, royaltyRecipient, royaltyAmount);
                }
                geckoToken.transfer(feeRecipient, marketplaceFeeAmount);
                geckoToken.transfer(auction.seller, sellerAmount);
            }
            
            // Transfer NFT to winner
            IERC721(auction.nftContract).safeTransferFrom(address(this), auction.currentBidder, auction.tokenId);
            
            emit AuctionEnded(auctionId, auction.currentBidder, auction.currentBid);
        } else {
            // No bids - return NFT to seller
            IERC721(auction.nftContract).safeTransferFrom(address(this), auction.seller, auction.tokenId);
            
            emit AuctionEnded(auctionId, address(0), 0);
        }
    }

    // =============================================================================
    // Admin Functions
    // =============================================================================
    
    function setMarketplaceFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee too high"); // Max 10%
        marketplaceFee = _fee;
    }
    
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid address");
        feeRecipient = _feeRecipient;
    }
    
    function setCollectionRoyalty(address collection, address recipient, uint256 percentage) 
        external 
        onlyOwner 
    {
        require(percentage <= 1000, "Royalty too high"); // Max 10%
        collectionRoyalties[collection] = RoyaltyInfo(recipient, percentage);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }

    // =============================================================================
    // View Functions
    // =============================================================================
    
    function getActiveListings(uint256 offset, uint256 limit) 
        external 
        view 
        returns (Listing[] memory) 
    {
        uint256 totalActive = 0;
        uint256 currentId = _listingIdCounter.current();
        
        // Count active listings
        for (uint256 i = 1; i < currentId; i++) {
            if (listings[i].status == ListingStatus.ACTIVE) {
                totalActive++;
            }
        }
        
        uint256 end = offset + limit;
        if (end > totalActive) end = totalActive;
        uint256 resultLength = end > offset ? end - offset : 0;
        
        Listing[] memory result = new Listing[](resultLength);
        uint256 resultIndex = 0;
        uint256 activeIndex = 0;
        
        for (uint256 i = 1; i < currentId && resultIndex < resultLength; i++) {
            if (listings[i].status == ListingStatus.ACTIVE) {
                if (activeIndex >= offset) {
                    result[resultIndex] = listings[i];
                    resultIndex++;
                }
                activeIndex++;
            }
        }
        
        return result;
    }
    
    function getUserListings(address user) external view returns (uint256[] memory) {
        return userListings[user];
    }
    
    function getUserOffers(address user) external view returns (uint256[] memory) {
        return userOffers[user];
    }
    
    function getListingOffers(uint256 listingId) external view returns (uint256[] memory) {
        return listingOffers[listingId];
    }

    // =============================================================================
    // Internal Functions
    // =============================================================================
    
    function _calculateRoyalty(address nftContract, uint256 amount) 
        internal 
        view 
        returns (uint256 royaltyAmount, address recipient) 
    {
        RoyaltyInfo memory royalty = collectionRoyalties[nftContract];
        if (royalty.recipient != address(0)) {
            royaltyAmount = (amount * royalty.percentage) / 10000;
            recipient = royalty.recipient;
        }
    }
    
    function _cancelAllOffersForListing(uint256 listingId) internal {
        uint256[] memory offerIds = listingOffers[listingId];
        for (uint256 i = 0; i < offerIds.length; i++) {
            Offer storage offer = offers[offerIds[i]];
            if (offer.status == OfferStatus.ACTIVE) {
                offer.status = OfferStatus.CANCELLED;
                
                // Refund offer
                if (offer.paymentType == PaymentType.ETH) {
                    payable(offer.buyer).transfer(offer.amount);
                } else {
                    geckoToken.transfer(offer.buyer, offer.amount);
                }
                
                emit OfferCancelled(offerIds[i], offer.buyer);
            }
        }
    }
    
    function _cancelOtherOffersForListing(uint256 listingId, uint256 acceptedOfferId) internal {
        uint256[] memory offerIds = listingOffers[listingId];
        for (uint256 i = 0; i < offerIds.length; i++) {
            if (offerIds[i] != acceptedOfferId) {
                Offer storage offer = offers[offerIds[i]];
                if (offer.status == OfferStatus.ACTIVE) {
                    offer.status = OfferStatus.CANCELLED;
                    
                    // Refund offer
                    if (offer.paymentType == PaymentType.ETH) {
                        payable(offer.buyer).transfer(offer.amount);
                    } else {
                        geckoToken.transfer(offer.buyer, offer.amount);
                    }
                    
                    emit OfferCancelled(offerIds[i], offer.buyer);
                }
            }
        }
    }

    // =============================================================================
    // Required Functions
    // =============================================================================
    
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
    
    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function emergencyTokenWithdraw(address token) external onlyOwner {
        IERC20(token).transfer(owner(), IERC20(token).balanceOf(address(this)));
    }
}