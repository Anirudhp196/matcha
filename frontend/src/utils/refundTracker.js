// Refund Tracker Utility
import { ethers } from "ethers";
import { CONTRACTS } from "../contracts/config";

// Use dynamic contract configuration
const EVENT_MANAGER_ADDRESS = CONTRACTS.EventManager.address;
const EVENT_MANAGER_ABI = CONTRACTS.EventManager.abi;

export async function trackRefunds(eventId, provider) {
  if (!provider) {
    alert("Provider (e.g. window.ethereum) not found");
    return;
  }

  const signer = provider.getSigner();
  const contract = new ethers.Contract(EVENT_MANAGER_ADDRESS, EVENT_MANAGER_ABI, signer);

  console.log(`🔍 Tracking refunds for Event ID: ${eventId}...\n`);

  try {
    const buyers = await contract.getEventBuyers(eventId);

    if (buyers.length === 0) {
      console.log("❌ No buyers found for this event.");
      return;
    }

    for (const buyer of buyers) {
      const refundAmount = await contract.payments(eventId, buyer);
      const etherValue = ethers.utils.formatEther(refundAmount);

      console.log(`👤 Buyer: ${buyer}`);
      console.log(`   💰 Refund owed: ${etherValue} FLOW`);
      console.log(`   🔍 ${etherValue === "0.0" ? "✅ Refunded" : "❌ Not refunded"}\n`);
    }

    const eventData = await contract.events(eventId);
    const cancelled = eventData.cancelled;

    console.log(cancelled ? "🚫 Event is marked as cancelled" : "✅ Event is still active");
  } catch (err) {
    console.error("⚠️ Error tracking refunds:", err);
  }
}
