import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Web3Provider } from "./contexts/Web3Context";
import { ThemeProvider } from "./contexts/ThemeContext";
import DualThemeNavbar from "./components/DualThemeNavbar";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
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
        // Disable Privy smart wallets - using custom gas sponsorship
        // smartWallet: {
        //   createOnLogin: "users-without-wallets",
        // },
        // Force Chiliz Spicy Testnet network (where your contracts are deployed)
        defaultChain: NETWORK_CONFIG,
        supportedChains: [NETWORK_CONFIG],
      }}
    >
      <ThemeProvider>
        <Web3Provider>
          <div className="App">
            <Toaster position="top-right" />
            <Router>
              <DualThemeNavbar />
              <RoleProtectedRoute>
                <Routes>
                  <Route path="/" element={<BrowseEvents />} />
                  <Route path="/manage-tickets" element={<ManageTickets />} />
                  <Route path="/manage-concerts" element={<ManageConcerts />} />
                  <Route
                    path="/marketplace/:eventId"
                    element={<MarketplacePage />}
                  />
                </Routes>
              </RoleProtectedRoute>
            </Router>
          </div>
        </Web3Provider>
      </ThemeProvider>
    </PrivyProvider>
  );
}

export default App;