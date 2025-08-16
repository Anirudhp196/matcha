// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Ticket.sol";
import "./interfaces/IEventManager.sol";

contract EventManager is Ownable, IEventManager {
    Ticket public ticketNFT;
    uint256 public nextEventId;

    enum Role { None, Fan, Musician }
    enum LoyaltyTier { None, Gold }

    mapping(address => Role) public roles;
    mapping(address => mapping(address => uint256)) public attendanceCount; // fan -> artist -> events attended
    mapping(address => mapping(address => LoyaltyTier)) public loyaltyTiers; // fan -> artist -> loyalty

    struct EventData {
        uint256 id;
        address organizer;
        string metadataURI;
        uint256 ticketPrice;
        uint256 maxTickets;
        uint256 ticketsSold;
        uint256 eventDate;             // Actual concert date
        bool cancelled;
        uint256 loyaltyStartTimestamp; // When Gold fans can start buying
        uint256 publicStartTimestamp;  // When everyone can start buying
        uint256 goldRequirement;       // # of events needed to reach Gold loyalty
    }

    mapping(uint256 => EventData) public events;
    mapping(uint256 => address[]) public eventBuyers;
    mapping(uint256 => mapping(address => uint256)) public payments;
    mapping(uint256 => uint256) public totalReceived;

    // 🔐 Custom Errors
    error NotOrganizer();
    error EventCancelled();
    error AlreadyCancelled();
    error EventInPast();
    error SoldOut();
    error IncorrectPayment();
    error RefundFailed();
    error NotAllowedToBuyOwnTicket();
    error ForwardFailed();
    error AlreadyRegistered();

    // 📢 Events
    event EventCreated(uint256 indexed eventId, address indexed organizer);
    event TicketPurchased(uint256 indexed eventId, uint256 ticketId, address indexed buyer);
    event MetadataUpdated(uint256 indexed eventId, string newURI);
    event TicketPriceUpdated(uint256 indexed eventId, uint256 newPrice);
    event EventWasCancelled(uint256 indexed eventId);
    event RefundIssued(address indexed buyer, uint256 amount);
    event Registered(address indexed user, Role role);

    constructor(address _ticketNFT) Ownable(msg.sender) {
        ticketNFT = Ticket(_ticketNFT);
    }

    // 🚀 Role registration
    function registerAsFan() external {
        if (roles[msg.sender] != Role.None) revert AlreadyRegistered();
        roles[msg.sender] = Role.Fan;
        emit Registered(msg.sender, Role.Fan);
    }

    function registerAsMusician() external {
        if (roles[msg.sender] != Role.None) revert AlreadyRegistered();
        roles[msg.sender] = Role.Musician;
        emit Registered(msg.sender, Role.Musician);
    }

    // 🛠 Create an Event
    function createEvent(
        string memory metadataURI,
        uint256 ticketPrice,
        uint256 maxTickets,
        uint256 eventDate,
        uint256 goldRequirement
    ) external override {
        if (eventDate <= block.timestamp) revert EventInPast();

        uint256 loyaltyStart = block.timestamp;
        uint256 publicStart = loyaltyStart + 7 days;

        uint256 eventId = nextEventId++;
        events[eventId] = EventData({
            id: eventId,
            organizer: msg.sender,
            metadataURI: metadataURI,
            ticketPrice: ticketPrice,
            maxTickets: maxTickets,
            ticketsSold: 0,
            eventDate: eventDate,
            cancelled: false,
            loyaltyStartTimestamp: loyaltyStart,
            publicStartTimestamp: publicStart,
            goldRequirement: goldRequirement
        });

        emit EventCreated(eventId, msg.sender);
    }

    // 🛒 Buy a Ticket
    function buyTicket(uint256 eventId) external payable override {
        EventData storage evt = events[eventId];

        if (evt.cancelled) revert EventCancelled();
        if (block.timestamp >= evt.eventDate) revert EventInPast();
        if (evt.ticketsSold >= evt.maxTickets) revert SoldOut();
        if (msg.value != evt.ticketPrice) revert IncorrectPayment();
        if (msg.sender == evt.organizer) revert NotAllowedToBuyOwnTicket();
        if (msg.sender == address(this)) revert("Contract cannot buy its own ticket");

        // Loyalty gating
        if (block.timestamp < evt.loyaltyStartTimestamp && evt.goldRequirement > 0) {
            revert("Ticket sales not started yet");
        }

        LoyaltyTier fanTier = loyaltyTiers[msg.sender][evt.organizer];
        if (fanTier != LoyaltyTier.Gold && evt.goldRequirement > 0) {
            if (block.timestamp < evt.publicStartTimestamp) {
                revert("Public ticket sales not started yet");
            }
        }

        // Proceed to mint and track
        evt.ticketsSold += 1;
        uint256 ticketId = ticketNFT.mintTicket(msg.sender, evt.metadataURI, eventId);
        emit TicketPurchased(eventId, ticketId, msg.sender);

        totalReceived[eventId] += msg.value;
        payments[eventId][msg.sender] += msg.value;
        eventBuyers[eventId].push(msg.sender);

        (bool sent, ) = payable(evt.organizer).call{value: msg.value}("");
        if (!sent) revert ForwardFailed();

        // Update attendance and loyalty
        attendanceCount[msg.sender][evt.organizer] += 1;
        _checkLoyaltyUpgrade(msg.sender, evt.organizer, evt.goldRequirement);
    }

    function _checkLoyaltyUpgrade(address fan, address artist, uint256 goldRequirement) internal {
        if (loyaltyTiers[fan][artist] == LoyaltyTier.Gold) {
            return; // Already Gold
        }

        uint256 attended = attendanceCount[fan][artist];
        if (attended >= goldRequirement) {
            loyaltyTiers[fan][artist] = LoyaltyTier.Gold;
        }
    }

    function updateEventMetadataURI(uint256 eventId, string calldata newURI) external override {
        EventData storage evt = events[eventId];
        if (msg.sender != evt.organizer) revert NotOrganizer();
        if (evt.cancelled) revert EventCancelled();
        if (block.timestamp >= evt.eventDate) revert EventInPast();

        evt.metadataURI = newURI;
        emit MetadataUpdated(eventId, newURI);
    }

    function updateTicketPrice(uint256 eventId, uint256 newPrice) external override {
        EventData storage evt = events[eventId];
        if (msg.sender != evt.organizer) revert NotOrganizer();
        if (evt.cancelled) revert EventCancelled();
        if (block.timestamp >= evt.eventDate) revert EventInPast();

        evt.ticketPrice = newPrice;
        emit TicketPriceUpdated(eventId, newPrice);
    }

    function getEventBuyers(uint256 eventId) external view returns (address[] memory) {
        return eventBuyers[eventId];
    }

    function cancelEvent(uint256 eventId) external payable {
        EventData storage evt = events[eventId];

        if (msg.sender != evt.organizer) revert NotOrganizer();
        if (evt.cancelled) revert AlreadyCancelled();
        if (block.timestamp >= evt.eventDate) revert EventInPast();

        uint256 expectedRefund = totalReceived[eventId];
        if (msg.value != expectedRefund) revert IncorrectPayment();

        for (uint256 i = 0; i < eventBuyers[eventId].length; i++) {
            address buyer = eventBuyers[eventId][i];
            if (buyer == address(this)) continue;

            uint256 refundAmount = payments[eventId][buyer];
            if (refundAmount > 0) {
                payments[eventId][buyer] = 0;
                (bool sent, ) = payable(buyer).call{value: refundAmount}("");
                if (!sent) revert RefundFailed();
                emit RefundIssued(buyer, refundAmount);
            }
        }

        evt.cancelled = true;
        emit EventWasCancelled(eventId);
    }
}