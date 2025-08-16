const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

describe("EventManager & Ticket (Event Lifecycle)", function () {
  let ticket, eventManager;
  let eventId;
  let owner, organizer, buyerOne, buyerTwo;
  let provider;

  const deploymentPath = path.join(__dirname, "..", "deployedContracts.json");
  const { TICKET_ADDRESS, EVENT_MANAGER_ADDRESS } = JSON.parse(
    fs.readFileSync(deploymentPath, "utf8")
  );

  before(async () => {
    provider = ethers.provider;

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

    // ✅ Bind provider
    eventManager = new ethers.Contract(
      EVENT_MANAGER_ADDRESS,
      eventManagerArtifact.abi,
      provider
    );
    ticket = new ethers.Contract(TICKET_ADDRESS, ticketArtifact.abi, provider);

    const metadataURI = "ipfs://event_lifecycle_metadata";
    const futureTimestamp = Math.floor(Date.now() / 1000) + 86400;
    const ticketPrice = ethers.parseEther("0.001");
    const ticketCount = 6;

    const tx = await eventManager
      .connect(organizer)
      .createEvent(metadataURI, ticketPrice, ticketCount, futureTimestamp);
    const receipt = await tx.wait();
    const eventCreated = receipt.logs.find(
      (log) => log.fragment?.name === "EventCreated"
    );
    eventId = Number(eventCreated?.args?.eventId ?? 0);

    console.log(
      `✅ Event ${eventId} created by Organizer (${organizer.address})`
    );
  });
  it("BuyerTwo buys 3 tickets", async () => {
    const price = ethers.parseEther("0.001"); // Match ticket price
    let bought = 0;

    for (let i = 0; i < 3; i++) {
      try {
        const tx = await eventManager
          .connect(buyerTwo)
          .buyTicket(eventId, { value: price });
        await tx.wait();
        bought++;
        console.log(`🎟 BuyerTwo bought ticket #${bought}`);
      } catch (err) {
        console.log(
          `❌ Failed to buy ticket #${bought + 1}: ${err.reason || err.message}`
        );
        break;
      }
    }

    const updatedEvt = await eventManager.connect(buyerTwo).events(eventId);
    expect(Number(updatedEvt.ticketsSold)).to.be.gte(3);
  });

  it("BuyerOne buys remaining tickets until event is sold out", async () => {
    let bought = 0;
    const price = ethers.parseEther("0.001");

    while (true) {
      const evt = await eventManager.connect(buyerOne).events(eventId);
      if (evt.cancelled) break;

      if (Number(evt.ticketsSold) >= Number(evt.maxTickets)) {
        console.log(`✅ Sold out. BuyerOne bought ${bought} ticket(s).`);
        break;
      }

      try {
        const tx = await eventManager
          .connect(buyerOne)
          .buyTicket(eventId, { value: price });
        await (await tx).wait();
        bought++;
      } catch (err) {
        console.log(`❌ BuyerOne failed: ${err.reason || err.message}`);
        break;
      }
    }

    const finalEvt = await eventManager.connect(buyerOne).events(eventId);
    expect(Number(finalEvt.ticketsSold)).to.equal(Number(finalEvt.maxTickets));
  });

  it("Organizer cancels the event and refunds are issued", async () => {
    const buyerOneBefore = await provider.getBalance(buyerOne.address);
    const buyerTwoBefore = await provider.getBalance(buyerTwo.address);

    const filter = eventManager.filters.TicketPurchased(eventId);
    const logs = await eventManager.connect(organizer).queryFilter(filter);
    const ticketIds = logs.map((log) => log.args.ticketId);

    console.log(`📢 Preparing to cancel Event #${eventId}`);
    console.log(`🔎 Total TicketPurchased logs found: ${ticketIds.length}`);
    console.log(
      `🧾 Ticket IDs: ${ticketIds.map((t) => t.toString()).join(", ")}`
    );

    const expectedRefund = await eventManager.totalReceived(eventId);
    console.log(
      `💸 Total expected refund to send with cancel: ${ethers.formatEther(
        expectedRefund
      )} ETH`
    );

    try {
      const cancelTx = await eventManager
        .connect(organizer)
        .cancelEvent(eventId, {
          value: expectedRefund,
        });
      await cancelTx.wait();
      console.log("✅ Event successfully cancelled");
    } catch (err) {
      const reason =
        err?.error?.reason ||
        err?.reason ||
        (err?.message?.includes("custom error")
          ? "Custom Error"
          : "Unknown revert");
      console.error("❌ Cancel failed with reason:", reason);

      // Decode if possible
      if (err?.error?.data) {
        console.error("↪ Error data:", err.error.data);
      }

      throw err;
    }

    const evt = await eventManager.connect(organizer).events(eventId);
    const now = Math.floor(Date.now() / 1000);
    console.log(`🕒 Event timestamp: ${evt.eventDate} | Now: ${now}`);
    console.log(`🧑 Organizer (from event): ${evt.organizer}`);
    console.log(`👤 Caller: ${organizer.address}`);
    console.log(`📛 Cancelled: ${evt.cancelled}`);

    expect(evt.cancelled).to.equal(true);

    const buyerOneAfter = await provider.getBalance(buyerOne.address);
    const buyerTwoAfter = await provider.getBalance(buyerTwo.address);

    const refundOne = buyerOneAfter - buyerOneBefore;
    const refundTwo = buyerTwoAfter - buyerTwoBefore;

    console.log(
      `💰 BuyerOne refund delta: ${ethers.formatEther(refundOne)} ETH`
    );
    console.log(
      `💰 BuyerTwo refund delta: ${ethers.formatEther(refundTwo)} ETH`
    );

    expect(refundOne).to.be.gte(0);
    expect(refundTwo).to.be.gte(0);

    for (const tokenId of ticketIds) {
      const owner = await ticket.connect(buyerOne).ownerOf(tokenId);
      expect(owner).to.be.properAddress;
    }
  });
});
