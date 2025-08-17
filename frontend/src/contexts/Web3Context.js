import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { CONTRACTS } from "../contracts/config";
import { useEns } from "../hooks/useEns";
import { useTheme } from "./ThemeContext";
import RoleSelector from "../components/RoleSelector";
import EnsRegistration from "../components/EnsRegistration";
import LoadingSpinner from "../components/LoadingSpinner";
import axios from "axios";
import { toast } from "react-hot-toast";


const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const { lookupName, lookupProfile, shortenAddress, testEnsLookup, debugUserEns } = useEns();
  const { setInitialThemeForRole } = useTheme();

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [ticketContract, setTicketContract] = useState(null);
  const [eventContract, setEventContract] = useState(null);
  const [marketplaceContract, setMarketplaceContract] = useState(null);
  const [network, setNetwork] = useState(null);
  const [role, setRole] = useState(null);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showEnsRegistration, setShowEnsRegistration] = useState(false);
  const [tempUserAddress, setTempUserAddress] = useState(null);
  const [ensName, setEnsName] = useState(null);
  const [ensAvatar, setEnsAvatar] = useState(null);
  const [goldRequirement, setGoldRequirement] = useState(0);
  const [artistProfiles, setArtistProfiles] = useState({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [pendingRole, setPendingRole] = useState(null);
  


  const PINATA_API_KEY = "3bf4164172fae7b68de3";
  const PINATA_SECRET =
    "32288745dd22dabdcc87653918e33841ccfcfbd45c43a89709f873aedcc7c9fe";

  // Helper function to get display name (ENS name or shortened address)
  const getDisplayName = () => {
    if (user?.email?.address) return user.email.address;
    if (ensName) return ensName;
    if (address) return shortenAddress(address);
    return "Unknown Artist";
  };

  // Lookup ENS name and avatar when address changes (using API server)
  useEffect(() => {
    console.log("🎯 Web3Context: Address changed, checking ENS:", address);
    if (address) {
      console.log("🔍 Web3Context: Starting ENS lookup via API for:", address);
      
      // Use your ENS API server for profile lookup
      const fetchEnsProfile = async () => {
        try {
          const res = await fetch(`http://localhost:4000/api/ens-profile/${address}`);
          const profile = await res.json();
          
          console.log("✅ Web3Context: ENS API profile result:", profile);
          
          if (profile && profile.name) {
            setEnsName(profile.name);
            setEnsAvatar(profile.avatar);
            console.log("📝 Web3Context: Set ENS name:", profile.name);
            console.log("🖼️ Web3Context: Set ENS avatar:", profile.avatar);
          } else {
            console.log("❌ Web3Context: No ENS profile found");
            setEnsName(null);
            setEnsAvatar(null);
          }
        } catch (err) {
          console.log("❌ Web3Context: ENS API lookup error:", err);
          console.log("🔧 Make sure to run: node scripts/ensApi.js");
          setEnsName(null);
          setEnsAvatar(null);
        }
      };
      
      fetchEnsProfile();
    } else {
      console.log("🚫 Web3Context: No address, clearing ENS data");
      setEnsName(null);
      setEnsAvatar(null);
    }
  }, [address]);

  // Initialize Web3 when user is authenticated and has wallet
  useEffect(() => {
    const initializeWeb3 = async () => {
      if (!ready || !authenticated || wallets.length === 0) return;

      try {
        setIsConnecting(true);
        setLoadingMessage("Setting up wallet...");

        const wallet = wallets[0]; // Get first wallet
        const ethereumProvider = await wallet.getEthereumProvider();
        const ethersProvider = new ethers.providers.Web3Provider(
          ethereumProvider
        );

        // Check current network
        const currentNetwork = await ethersProvider.getNetwork();
        console.log("Current network:", currentNetwork);

        // Check if we're on Flow EVM Testnet (chainId: 545)
        if (currentNetwork.chainId !== 545) {
          console.log("Wrong network, switching to Flow EVM Testnet...");
          try {
            await ethereumProvider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x221" }], // 545 in hex
            });
          } catch (switchError) {
            console.error("Failed to switch network:", switchError);

            if (switchError.code === 4902) {
              try {
                await ethereumProvider.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: "0x221", // 545
                      chainName: "Flow EVM Testnet",
                      nativeCurrency: {
                        name: "FLOW",
                        symbol: "FLOW",
                        decimals: 18,
                      },
                      rpcUrls: ["https://testnet.evm.nodes.onflow.org"],
                      blockExplorerUrls: ["https://testnet.evm.nodes.onflow.org"],
                    },
                  ],
                });
              } catch (addError) {
                console.error("Failed to add network:", addError);
                toast.error("Please manually switch to Flow EVM Testnet");
                return;
              }
            } else {
              toast.error("Please switch to Flow EVM Testnet");
              return;
            }
          }
        }

        const ethersSigner = ethersProvider.getSigner();
        const _address = await ethersSigner.getAddress();
        const _network = await ethersProvider.getNetwork();

        // DEBUG: Log network and contract info
        console.log("=== DEBUG INFO ===");
        console.log("Connected to network:", _network.chainId, _network.name);
        console.log("EventManager address:", CONTRACTS.EventManager.address);
        console.log("Ticket address:", CONTRACTS.Ticket.address);
        console.log("Marketplace address:", CONTRACTS.Marketplace.address);
        console.log("User address:", _address);

        // Try to check if contract exists
        try {
          const code = await ethersProvider.getCode(CONTRACTS.EventManager.address);
          console.log("Contract code exists:", code !== "0x");
          if (code === "0x") {
            console.log(
              "⚠️ Contract not found at",
              CONTRACTS.EventManager.address,
              "on network",
              _network.chainId
            );
          }
        } catch (err) {
          console.log("Failed to get contract code:", err.message);
        }

        const _ticket = new ethers.Contract(
          CONTRACTS.Ticket.address,
          CONTRACTS.Ticket.abi,
          ethersSigner
        );
        const _event = new ethers.Contract(
          CONTRACTS.EventManager.address,
          CONTRACTS.EventManager.abi,
          ethersSigner
        );
        const _marketplace = new ethers.Contract(
          CONTRACTS.Marketplace.address,
          CONTRACTS.Marketplace.abi,
          ethersSigner
        );

        setProvider(ethersProvider);
        setSigner(ethersSigner);
        setAddress(_address);
        setNetwork(_network);
        setTicketContract(_ticket);
        setEventContract(_event);
        setMarketplaceContract(_marketplace);

        // Check for existing role from blockchain
        try {
          const roleFromContract = await _event.roles(_address);
          const roleNumber = roleFromContract.toNumber ? roleFromContract.toNumber() : Number(roleFromContract);
          
          let roleName = null;
          switch (roleNumber) {
            case 1: roleName = 'fan'; break;
            case 2: roleName = 'musician'; break;
            default: roleName = null; break;
          }
          
          if (roleName) {
            setRole(roleName);
            // Set initial theme based on blockchain role
            setInitialThemeForRole(roleName);
            if (roleName === "musician") {
              try {
                setLoadingMessage("Loading artist profile...");
                const profile = await fetchArtistProfile(_address, _event);
                if (profile && profile.goldRequirement !== undefined) {
                  setGoldRequirement(profile.goldRequirement);
                }
              } catch (err) {
                console.error("Failed to load artist profile:", err);
              }
            }
            
            // Look up ENS name and avatar for the connected user
            try {
              const ensName = await lookupName(_address);
              if (ensName) {
                setEnsName(ensName);
                const profile = await lookupProfile(_address);
                if (profile && profile.avatar) {
                  setEnsAvatar(profile.avatar);
                }
              }
            } catch (err) {
              console.log("No ENS name found for user");
            }
          } else {
            // No role registered on blockchain
            setTempUserAddress(_address);
            setShowRoleSelector(true);
          }
        } catch (error) {
          console.error("Failed to fetch role from contract:", error);
          // If we can't read from contract, show role selector
          setTempUserAddress(_address);
          setShowRoleSelector(true);
        }
      } catch (error) {
        console.error("Web3 initialization failed:", error);
        toast.error("Failed to initialize wallet");
      } finally {
        setIsConnecting(false);
        setLoadingMessage("");
      }
    };

    initializeWeb3();
  }, [ready, authenticated, wallets]);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setLoadingMessage("Connecting...");
      await login();
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Failed to connect");
    } finally {
      setIsConnecting(false);
      setLoadingMessage("");
    }
  };

  const disconnectWallet = async () => {
    try {
      await logout();
      // Clear all state
      setProvider(null);
      setSigner(null);
      setAddress(null);
      setNetwork(null);
      setTicketContract(null);
      setEventContract(null);
      setMarketplaceContract(null);
      setRole(null);
      setEnsName(null);
      setEnsAvatar(null);
      setGoldRequirement(0);
      setShowRoleSelector(false);
      setShowEnsRegistration(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const fetchArtistProfile = async (artistAddress, eventContract) => {
    if (artistProfiles[artistAddress]) return artistProfiles[artistAddress];

    try {
      const totalEvents = await eventContract.nextEventId();

      for (let i = totalEvents - 1; i >= 0; i--) {
        const event = await eventContract.events(i);
        if (event.organizer.toLowerCase() === artistAddress.toLowerCase()) {
          const metadataURI = event.metadataURI.replace(
            "ipfs://",
            "https://ipfs.io/ipfs/"
          );
          const response = await axios.get(metadataURI);

          const artistAttr = response.data.attributes.find(
            (attr) => attr.trait_type === "Artist Name"
          );

          if (artistAttr) {
            const profile = {
              name: artistAttr.value,
              goldRequirement: event.goldRequirement.toNumber(),
            };
            setArtistProfiles((prev) => ({
              ...prev,
              [artistAddress]: profile,
            }));
            return profile;
          }
        }
      }
    } catch (err) {
      console.error("Error fetching artist profile:", err);
    }

    return null;
  };

  const getArtistName = async (artistAddress) => {
    if (!artistAddress || !eventContract) return "Unknown Artist";
    try {
      console.log("🎵 Getting artist name from ENS API for:", artistAddress);
      
      // Try to get ENS name first from your API server
      try {
        const res = await fetch(`http://localhost:4000/api/ens-name/${artistAddress}`);
        const data = await res.json();
        
        if (data && data.ensName) {
          console.log("✅ Found ENS name from API:", data.ensName);
          return data.ensName;
        }
      } catch (ensErr) {
        console.log("❌ ENS API lookup failed:", ensErr);
      }
      
      console.log("❌ No ENS found, trying artist profile...");
      // Fallback to artist profile
      const profile = await fetchArtistProfile(artistAddress, eventContract);
      return profile?.name || shortenAddress(artistAddress);
    } catch (err) {
      console.error("Failed to get artist name:", err);
      return shortenAddress(artistAddress);
    }
  };

  const uploadArtistProfile = async (name, goldReq) => {
    if (!address) return null;

    try {
      const artistProfile = {
        name,
        goldRequirement: goldReq,
        address,
        createdAt: new Date().toISOString(),
      };

      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        artistProfile,
        {
          headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET,
          },
        }
      );

      return `ipfs://${response.data.IpfsHash}`;
    } catch (err) {
      console.error("IPFS upload failed:", err);
      return null;
    }
  };



  const updateGoldRequirement = (value) => {
    setGoldRequirement(value);
    if (address) {
      setArtistProfiles((prev) => ({
        ...prev,
        [address]: { ...prev[address], name: getDisplayName(), goldRequirement: value },
      }));
      localStorage.setItem(`mosh-gold-req-${address}`, value.toString());
    }
  };







  // Load saved gold requirement
  useEffect(() => {
    if (address && role === "musician") {
      const saved = localStorage.getItem(`mosh-gold-req-${address}`);
      const parsed = parseInt(saved);
      if (!isNaN(parsed)) {
        setGoldRequirement(parsed);
        setArtistProfiles((prev) => ({
          ...prev,
          [address]: {
            ...prev[address],
            name: getDisplayName(),
            goldRequirement: parsed,
          },
        }));
      }
    }
  }, [address, role, ensName]);

  // Show loading while Privy initializes
  if (!ready || isConnecting || isLoading) {
    return <LoadingSpinner fullscreen text={loadingMessage || "Loading..."} />;
  }

  // Helper function to complete role selection after ENS check/registration
  const completeRoleSelection = async (selectedRole) => {
    if (!address || !eventContract) return;
    
    try {
      setIsLoading(true);
      setLoadingMessage(`Registering as ${selectedRole}...`);
      
      let tx;
      switch (selectedRole) {
        case "fan":
          tx = await eventContract.registerAsFan();
          break;
        case "musician":
          tx = await eventContract.registerAsMusician();
          break;

        default:
          throw new Error("Invalid role");
      }
      
      await tx.wait();

      setRole(selectedRole);
      setInitialThemeForRole(selectedRole);
      setShowRoleSelector(false);
      setShowEnsRegistration(false);
      
      const roleDisplayNames = {
        fan: "fan",
        musician: "musician"
      };
      
      toast.success(`Welcome, ${roleDisplayNames[selectedRole]}!`);
    } catch (err) {
      console.error("Registration failed:", err);
      toast.error("Registration failed.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // Helper function to check ENS and potentially show registration
  const handleRoleSelectionWithEnsCheck = async (selectedRole) => {
    // First check if user already has an ENS name
    if (ensName) {
      // User already has ENS, proceed directly to role registration
      await completeRoleSelection(selectedRole);
      return;
    }

    // No ENS name, offer to register one
    setShowRoleSelector(false);
    setShowEnsRegistration(true);
    
    // Store the selected role for after ENS registration
    setPendingRole(selectedRole);
  };

  if (showEnsRegistration) {
    const handleEnsRegistrationComplete = async (newEnsName) => {
      // ENS registration completed, update ENS name and proceed with role
      setEnsName(newEnsName);
      setShowEnsRegistration(false);
      
      // Get the pending role and complete registration
      if (pendingRole) {
        await completeRoleSelection(pendingRole);
        setPendingRole(null);
      }
    };

    const handleEnsRegistrationSkip = async () => {
      // User skipped ENS registration, proceed with role only
      setShowEnsRegistration(false);
      
      // Get the pending role and complete registration
      if (pendingRole) {
        await completeRoleSelection(pendingRole);
        setPendingRole(null);
      }
    };

    return (
      <EnsRegistration
        address={address}
        signer={signer}
        onRegistrationComplete={handleEnsRegistrationComplete}
        onSkip={handleEnsRegistrationSkip}
      />
    );
  }

  if (showRoleSelector) {
    const handleSelectFan = () => handleRoleSelectionWithEnsCheck("fan");
    const handleSelectArtist = () => handleRoleSelectionWithEnsCheck("musician");
    return (
      <RoleSelector
        onSelectFan={handleSelectFan}
        onSelectArtist={handleSelectArtist}
      />
    );
  }

  // Function to force role selector (for testing/debugging)
  const forceRoleSelection = () => {
    setRole(null);
    setShowRoleSelector(true);
    setShowEnsRegistration(false);
  };

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        address,
        network,
        connectWallet,
        disconnectWallet,
        ticketContract,
        eventContract,
        marketplaceContract,
        isConnected: authenticated && !!signer,
        role,
        artistName: getDisplayName(), // For backward compatibility
        getDisplayName,
        ensName,
        ensAvatar,
        goldRequirement,
        setGoldRequirement: updateGoldRequirement,
        testEnsLookup, // Test function for debugging
        debugUserEns, // Debug function for user's specific address
        getArtistName,
        fetchArtistProfile,
        isConnecting,
        user, // Privy user info (email, etc.)

        forceRoleSelection, // Allow manual role selection
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
