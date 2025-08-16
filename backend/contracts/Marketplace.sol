// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/IEventManager.sol";
import "./interfaces/ITicket.sol";

contract Marketplace is ReentrancyGuard, Ownable {
    struct Listing {
        address seller;
        uint256 price;
        uint256 eventId;
    }

    ITicket public ticketNFT;
    IEventManager public eventManager;
    mapping(uint256 => Listing) public listings;

    uint256 public platformFeePercent = 10; // 10%

    event TicketListed(uint256 indexed tokenId, uint256 indexed eventId, address indexed seller, uint256 price);
    event TicketPurchased(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event TicketDelisted(uint256 indexed tokenId);

    constructor(address _eventManager, address _ticketNFT) Ownable(msg.sender) {
        eventManager = IEventManager(_eventManager);
        ticketNFT = ITicket(_ticketNFT);
    }

    function listTicket(uint256 tokenId, uint256 price) external {
        require(IERC721(address(ticketNFT)).ownerOf(tokenId) == msg.sender, "Not owner");
        require(price > 0, "Invalid price");

        uint256 eventId = ticketNFT.tokenToEvent(tokenId);

        // No transfer needed when listing
        listings[tokenId] = Listing({ seller: msg.sender, price: price, eventId: eventId });

        emit TicketListed(tokenId, eventId, msg.sender, price);
    }

    function delistTicket(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];
        require(listing.seller == msg.sender, "Not seller");

        delete listings[tokenId];

        emit TicketDelisted(tokenId);
    }

    function buyTicket(uint256 tokenId) external payable nonReentrant {
        Listing memory listing = listings[tokenId];
        require(listing.price > 0, "Not listed");
        require(msg.value >= listing.price, "Insufficient payment");

        (
            , // id
            address organizer,
            , // metadataURI
            , // ticketPrice
            , // maxTickets
            , // ticketsSold
            , // eventDate
            bool cancelled,
            , // loyaltyStartTimestamp
            , // publicStartTimestamp
            // goldRequirement
        ) = eventManager.events(listing.eventId);

        require(!cancelled, "Event cancelled");

        delete listings[tokenId];

        // Now transfer ticket NFT
        IERC721(address(ticketNFT)).safeTransferFrom(listing.seller, msg.sender, tokenId);

        uint256 platformShare = (msg.value * platformFeePercent) / 100;
        uint256 remaining = msg.value - platformShare;
        uint256 sellerShare = (remaining * 45) / 100;
        uint256 artistShare = remaining - sellerShare;

        (bool sentSeller, ) = payable(listing.seller).call{value: sellerShare}("");
        require(sentSeller, "Seller payment failed");

        (bool sentArtist, ) = payable(organizer).call{value: artistShare}("");
        require(sentArtist, "Artist payment failed");

        // Platform fee stays inside the contract

        emit TicketPurchased(tokenId, msg.sender, msg.value);
    }

    // ✅ NEW FUNCTION: for frontend Marketplace page
    function getListingsByEvent(uint256 eventId) external view returns (uint256[] memory) {
        // First, count how many matching listings
        uint256 count = 0;
        for (uint256 i = 0; i < 10000; i++) {
            if (listings[i].seller != address(0) && listings[i].eventId == eventId) {
                count++;
            }
        }

        // Now create an array of the right size
        uint256[] memory tempTokenIds = new uint256[](count);

        // Fill the array
        uint256 index = 0;
        for (uint256 i = 0; i < 10000; i++) {
            if (listings[i].seller != address(0) && listings[i].eventId == eventId) {
                tempTokenIds[index] = i;
                index++;
            }
        }

        return tempTokenIds;
    }
}
