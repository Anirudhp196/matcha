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
            // Sponsor gas for your contracts
            sponsorshipPolicies: [
              {
                // Sponsor all transactions to your contracts
                contractAddresses: [
                  "0xD3C9A8671796da0cB8dDefb16E4773F812613048", // EventManager
                  "0xA7827d4B26A38079B384F3eab098BdEfF58C4BB8", // Ticket
                  "0x416222FC558f92606a43194DEd31C1dB6532298B", // Marketplace
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
            // Your deployed contracts that can use session keys
            allowedContracts: [
              "0x3f41889620F5715f580Bbb764757374b31598462", // EventManager
              "0x1fbEba2468771A6Ee5dBBF72F995A183dA723f5d", // Ticket
              "0x0D3625521bbEF46868B85819eECA1990F31074dC", // Marketplace
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
        defaultChain: {
          id: 88882,
          name: "Chiliz Spicy Testnet",
          network: "chiliz-spicy-testnet",
          nativeCurrency: { name: "CHZ", symbol: "CHZ", decimals: 18 },
          rpcUrls: { default: { http: ["https://spicy-rpc.chiliz.com"] } },
          blockExplorers: {
            default: {
              name: "ChilizScan",
              url: "https://testnet.chiliscan.com",
            },
          },
        },
        supportedChains: [
          {
            id: 88882,
            name: "Chiliz Spicy Testnet",
            network: "chiliz-spicy-testnet",
            nativeCurrency: { name: "CHZ", symbol: "CHZ", decimals: 18 },
            rpcUrls: { default: { http: ["https://spicy-rpc.chiliz.com"] } },
            blockExplorers: {
              default: {
                name: "ChilizScan",
                url: "https://testnet.chiliscan.com",
              },
            },
          },
        ],
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