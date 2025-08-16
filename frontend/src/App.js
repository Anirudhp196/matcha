import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Web3Provider } from "./contexts/Web3Context";
import { ThemeProvider } from "./contexts/ThemeContext";
import DualThemeNavbar from "./components/DualThemeNavbar";
import BrowseEvents from "./pages/BrowseEvents";
import ManageConcerts from "./pages/ManageConcerts";
import ManageTickets from "./pages/ManageTickets";
import MarketplacePage from "./pages/MarketplaceView";
import { Toaster } from "react-hot-toast";
import { PrivyProvider } from "@privy-io/react-auth";
import "./styles/themes.css";

// Import contract configuration
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from "./contracts/config";

function App() {
  return (
    <PrivyProvider
      appId="cmc5nuuwd00rggs0nfmf9umw9"
      config={{
        // Customize login methods
        loginMethods: ["email", "google", "twitter", "discord", "wallet"],
        // Customize appearance
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
        },
        // Automatically create wallets for users
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
          requireUserPasswordOnCreate: false, // No password needed for easier UX
        },
        // Enable Smart Wallet with session keys AND gas sponsorship
        smartWallet: {
          createOnLogin: "users-without-wallets",
                      // Gas sponsorship configuration
            gasSponsorship: {
              enabled: true,
              // Sponsor gas for your contracts (using dynamic addresses)
              sponsorshipPolicies: [
                {
                  // Sponsor all transactions to your contracts
                  contractAddresses: [
                    CONTRACT_ADDRESSES.EVENT_MANAGER,
                    CONTRACT_ADDRESSES.TICKET,
                    CONTRACT_ADDRESSES.MARKETPLACE,
                  ],
                // Sponsor specific methods
                functionSelectors: [
                  "0x67dd74ca", // buyTicket
                  "0x8da5cb5b", // resellTicket (example)
                  "0xa22cb465", // transferFrom
                ],
                // Spending limits per user
                spendingLimits: {
                  perUser: "0.1", // 0.1 DEV per user
                  perTransaction: "0.01", // 0.01 DEV per transaction
                  timeWindow: 3600, // 1 hour window
                },
              },
            ],
          },
          // Session keys for seamless interactions
          sessionKeys: {
            enabled: true,
            // Auto-approve transactions under these limits
            spendLimits: {
              DEV: "1.0", // 1 DEV per session (adjust as needed)
            },
            // Session duration (1 hour)
            sessionDuration: 3600,
            // Your deployed contracts that can use session keys (using dynamic addresses)
            allowedContracts: [
              CONTRACT_ADDRESSES.EVENT_MANAGER,
              CONTRACT_ADDRESSES.TICKET,
              CONTRACT_ADDRESSES.MARKETPLACE,
            ],
            // Specific operations allowed
            allowedMethods: [
              "buyTicket",
              "resellTicket",
              "transferTicket",
              "cancelResale",
            ],
          },
        },
        // Force Chiliz Spicy Testnet network (where your contracts are deployed)
        defaultChain: NETWORK_CONFIG,
        supportedChains: [NETWORK_CONFIG],
      }}
    >
      <Web3Provider>
        <ThemeProvider>
          <div className="App">
            <Toaster position="top-right" />
            <Router>
              <DualThemeNavbar />
              <Routes>
                <Route path="/" element={<BrowseEvents />} />
                <Route path="/manage-tickets" element={<ManageTickets />} />
                <Route path="/manage-concerts" element={<ManageConcerts />} />
                <Route
                  path="/marketplace/:eventId"
                  element={<MarketplacePage />}
                />
              </Routes>
            </Router>
          </div>
        </ThemeProvider>
      </Web3Provider>
    </PrivyProvider>
  );
}

export default App;