// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ITicket.sol";

contract Ticket is ERC721URIStorage, Ownable, ITicket {
    address public eventManager;
    uint256 public nextTokenId;

    // Mapping from tokenId to eventId
    mapping(uint256 => uint256) public tokenToEvent;

    modifier onlyEventManager() {
        require(msg.sender == eventManager, "Not authorized: not event manager");
        _;
    }

    constructor(address _eventManager) ERC721("MoshTicket", "MTIX") Ownable(msg.sender) {
        eventManager = _eventManager;
    }


    /// @notice Mints a new ticket (NFT) to the given address and links it to an event
    /// @dev Can only be called by the event manager
    function mintTicket(
        address to,
        string memory tokenURI,
        uint256 eventId
    ) external override onlyEventManager returns (uint256) {
        uint256 tokenId = nextTokenId;
        nextTokenId += 1;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        tokenToEvent[tokenId] = eventId;

        return tokenId;
    }

    /// @notice Updates the authorized event manager contract
    /// @dev Can only be called by the contract owner (admin)
    function updateEventManager(address newManager) external override onlyOwner {
        eventManager = newManager;
    }
}
