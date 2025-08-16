// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IEventManager {
    function createEvent(
        string memory metadataURI,
        uint256 ticketPrice,
        uint256 maxTickets,
        uint256 eventDate,
        uint256 goldRequirement
    ) external;

    function buyTicket(uint256 eventId) external payable;

    function updateEventMetadataURI(uint256 eventId, string calldata newURI) external;

    function updateTicketPrice(uint256 eventId, uint256 newPrice) external;

    function cancelEvent(uint256 eventId) external payable;

    function getEventBuyers(uint256 eventId) external view returns (address[] memory);

    function events(uint256 eventId) external view returns (
        uint256 id,
        address organizer,
        string memory metadataURI,
        uint256 ticketPrice,
        uint256 maxTickets,
        uint256 ticketsSold,
        uint256 eventDate,
        bool cancelled,
        uint256 loyaltyStartTimestamp,
        uint256 publicStartTimestamp,
        uint256 goldRequirement
    );
}