require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts",
    cache: "./cache",
  },
  networks: {
    // Chiliz Mainnet
    chiliz: {
      url: "https://rpc.chiliz.com",
      chainId: 88888,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // Chiliz Testnet (Spicy) - Default for development
    chilizTestnet: {
      url: "https://spicy-rpc.chiliz.com",
      chainId: 88882,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  defaultNetwork: "chilizTestnet",
};