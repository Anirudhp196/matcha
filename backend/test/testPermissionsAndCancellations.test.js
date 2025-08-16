const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

describe("EventManager - Permissions & Cancellation Flow", function () {
  let ticket, eventManager;
  let eventId;
  let owner, organizer, buyerOne, buyerTwo;

  const deploymentPath = path.join(__dirname, "..", "deployedContracts.json");
  const { TICKET_ADDRESS, EVENT_MANAGER_ADDRESS } = JSON.parse(
    fs.readFileSync(deploymentPath, "utf8")
  );

  before(async () => {
    const provider = ethers.provider;

    owner = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    organizer = new ethers.Wallet(process.env.ORGANIZER_PRIVATE_KEY, provider);
    buyerOne = new ethers.Wallet(process.env.BUYER_ONE_PRIVATE_KEY, provider);
    buyerTwo = new ethers.Wallet(process.env.BUYER_TWO_PRIVATE_KEY, provider);

    console.log("\n🔍 ETH Balances:");
    console.log(
      `BuyerOne   (${buyerOne.address}): ${ethers.formatEther(
        await provider.getBalance(buyerOne.address)
      )} ETH`
    );
    console.log(
      `BuyerTwo   (${buyerTwo.address}): ${ethers.formatEther(
        await provider.getBalance(buyerTwo.address)
      )} ETH`
    );
    console.log(
      `Organizer  (${organizer.address}): ${ethers.formatEther(
        await provider.getBalance(organizer.address)
      )} ETH`
    );
    console.log(
      `Owner      (${owner.address}): ${ethers.formatEther(
        await provider.getBalance(owner.address)
      )} ETH`
    );

    const eventManagerArtifact = await hre.artifacts.readArtifact(
      "EventManager"
    );
    const ticketArtifact = await hre.artifacts.readArtifact("Ticket");

    eventManager = new ethers.Contract(
      EVENT_MANAGER_ADDRESS,
      eventManagerArtifact.abi,
      provider
    );
    ticket = new ethers.Contract(TICKET_ADDRESS, ticketArtifact.abi, provider);
  });

  it("Organizer creates a valid event with 3 tickets", async () => {
    const metadataURI = "ipfs://permissions_test";
    const price = ethers.parseEther("0.01");
    const futureTimestamp = Math.floor(Date.now() / 1000) + 86400;

    const tx = await eventManager
      .connect(organizer)
      .createEvent(metadataURI, price, 3, futureTimestamp);
    const receipt = await tx.wait();

    const log = receipt.logs.find((l) => l.fragment?.name === "EventCreated");
    eventId = Number(log?.args?.eventId ?? 0);

    const evt = await eventManager.events(eventId);
    expect(evt.organizer).to.equal(organizer.address);
    console.log(`📦 Event ${eventId} created by organizer`);
  });

  it("Organizer cannot buy tickets to their own event", async () => {
    const price = ethers.parseEther("0.01");

    await expect(
      eventManager.connect(organizer).buyTicket(eventId, { value: price })
    ).to.be.revertedWithCustomError(eventManager, "NotAllowedToBuyOwnTicket");

    console.log("✅ Organizer correctly blocked from buying their own ticket");
  });

  it("Buyers cannot edit or cancel the event", async () => {
    await expect(
      eventManager
        .connect(buyerOne)
        .updateEventMetadataURI(eventId, "ipfs://unauthorized")
    ).to.be.revertedWithCustomError(eventManager, "NotOrganizer");

    await expect(
      eventManager.connect(buyerTwo).cancelEvent(eventId)
    ).to.be.revertedWithCustomError(eventManager, "NotOrganizer");

    console.log("✅ Buyers cannot edit or cancel the event");
  });

  it("Organizer can edit and cancel the event", async function () {
    this.timeout(60000); // Increase timeout to 60 seconds (60000ms)

    const newURI = "ipfs://updated_by_organizer";
    const newPrice = ethers.parseEther("0.005");

    console.log("⏳ Starting to update event metadata URI...");
    const updateMetadataTx = await eventManager
      .connect(organizer)
      .updateEventMetadataURI(eventId, newURI);
    console.log("✔️ Metadata URI updated, waiting for confirmation...");
    const metadataReceipt = await updateMetadataTx.wait();
    console.log("📝 Metadata update receipt:", metadataReceipt);

    console.log("⏳ Starting to update ticket price...");
    const updatePriceTx = await eventManager
      .connect(organizer)
      .updateTicketPrice(eventId, newPrice);
    console.log("✔️ Ticket price updated, waiting for confirmation...");
    const priceReceipt = await updatePriceTx.wait();
    console.log("📝 Ticket price update receipt:", priceReceipt);

    console.log("🔍 Fetching event details...");
    const evt = await eventManager.events(eventId);
    console.log(
      `📜 Event details: Metadata URI: ${
        evt.metadataURI
      }, Ticket Price: ${ethers.formatEther(evt.ticketPrice)} ETH`
    );

    expect(evt.metadataURI).to.equal(newURI);
    expect(evt.ticketPrice.toString()).to.equal(newPrice.toString());

    console.log("⏳ Starting to cancel the event...");
    const cancelEventTx = await eventManager
      .connect(organizer)
      .cancelEvent(eventId);
    console.log("✔️ Event cancellation started, waiting for confirmation...");
    const cancelEventReceipt = await cancelEventTx.wait();
    console.log("📝 Event cancellation receipt:", cancelEventReceipt);

    console.log("🔍 Fetching updated event details...");
    const updated = await eventManager.events(eventId);
    console.log(`📛 Event cancelled status: ${updated.cancelled}`);

    expect(updated.cancelled).to.equal(true);

    console.log("✅ Organizer successfully updated and cancelled the event");
  });
});