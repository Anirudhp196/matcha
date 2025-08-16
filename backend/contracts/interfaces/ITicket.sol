// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ITicket {
    function mintTicket(address to, string memory tokenURI, uint256 eventId) external returns (uint256);
    function updateEventManager(address newManager) external;

    function tokenToEvent(uint256 tokenId) external view returns (uint256);
}
