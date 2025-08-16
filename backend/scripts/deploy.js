const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const ethers = hre.ethers;

  console.log("Deploying Matcha contracts with:", deployer.address);

  // Deploy Ticket with dummy EventManager address
  const Ticket = await ethers.getContractFactory("Ticket");
  const AddressZero = "0x0000000000000000000000000000000000000000";
  const ticket = await Ticket.deploy(AddressZero);
  await ticket.deployed();
  console.log("🎟️ Ticket deployed at:", ticket.address);

  // Deploy EventManager with actual Ticket address
  const EventManager = await ethers.getContractFactory("EventManager");
  const eventManager = await EventManager.deploy(ticket.address);
  await eventManager.deployed();
  console.log("🎤 EventManager deployed at:", eventManager.address);

  // Update Ticket with the real EventManager address
  const tx1 = await ticket.updateEventManager(eventManager.address);
  await tx1.wait();
  console.log("🔗 Linked EventManager to Ticket");

  // Deploy Marketplace with EventManager address
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(eventManager.address, ticket.address);
  await marketplace.deployed();
  console.log("🛒 Marketplace deployed at:", marketplace.address);

  // Write ABI + address to frontend/abis/
  const abisDir = path.join(__dirname, "..", "..", "frontend", "src", "abis");
  if (!fs.existsSync(abisDir)) fs.mkdirSync(abisDir, { recursive: true });

  const ticketArtifact = await hre.artifacts.readArtifact("Ticket");
  const eventManagerArtifact = await hre.artifacts.readArtifact("EventManager");
  const marketplaceArtifact = await hre.artifacts.readArtifact("Marketplace");

  fs.writeFileSync(
    path.join(abisDir, "Ticket.json"),
    JSON.stringify({ address: ticket.address, abi: ticketArtifact.abi }, null, 2)
  );

  fs.writeFileSync(
    path.join(abisDir, "EventManager.json"),
    JSON.stringify({ address: eventManager.address, abi: eventManagerArtifact.abi }, null, 2)
  );

  fs.writeFileSync(
    path.join(abisDir, "Marketplace.json"),
    JSON.stringify({ address: marketplace.address, abi: marketplaceArtifact.abi }, null, 2)
  );

  const deployments = {
    TICKET_ADDRESS: ticket.address,
    EVENT_MANAGER_ADDRESS: eventManager.address,
    MARKETPLACE_ADDRESS: marketplace.address,
  };

  const filePath = path.join(__dirname, "..", "deployedContracts.json");
  fs.writeFileSync(filePath, JSON.stringify(deployments, null, 2));
  console.log("✅ Saved deployed addresses to deployedContracts.json");

  console.log("📦 Exported ABIs + addresses to frontend/abis/");
  console.log("✅ Done.");
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});