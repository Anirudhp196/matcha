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
import GasSponsorship from "../utils/gasSponsorship";

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const { lookupName, lookupProfile, shortenAddress } = useEns();
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
  
  // Gas sponsorship instance
  const [gasSponsorship] = useState(() => new GasSponsorship());

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

  // Lookup ENS name and avatar when address changes
  useEffect(() => {
    if (address) {
      lookupProfile(address)
        .then(profile => {
          setEnsName(profile.ensName);
          setEnsAvatar(profile.avatar);
        })
        .catch(() => {
          setEnsName(null);
          setEnsAvatar(null);
        });
    } else {
      setEnsName(null);
      setEnsAvatar(null);
    }
  }, [address, lookupProfile]);

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

        // Check for existing role
        const savedRole = localStorage.getItem(`mosh-role-${_address}`);
        if (savedRole) {
          setRole(savedRole);
          // Set initial theme based on saved role
          setInitialThemeForRole(savedRole);
          if (savedRole === "musician") {
            try {
              setLoadingMessage("Loading artist profile...");
              const profile = await fetchArtistProfile(_address, _event);
              if (profile && profile.goldRequirement !== undefined) {
                setGoldRequirement(profile.goldRequirement);
              }
            } catch (err) {
              console.error("Failed to load artist profile:", err);
              // No need to show artist form anymore - we use wallet/ENS name
            }
          }
        } else {
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

      const res = await fetch(`http://localhost:4000/api/ens-name/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
`);
      const data = res.await();
      if(data && data.name) return data.name;
      const profile = await fetchArtistProfile(artistAddress, eventContract);
      return profile?.name || "Unknown Artist";
    } catch (err) {
      console.error("Failed to get artist name:", err);
      return "Unknown Artist";
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

  // Execute sponsored transaction
  const executeSponsoredTransaction = async (contract, functionName, args = [], value = 0) => {
    try {
      console.log(`🎯 Attempting sponsored ${functionName} transaction`);
      return await gasSponsorship.executeSponsoredTransaction(contract, functionName, args, value);
    } catch (error) {
      console.error('Sponsored transaction failed, falling back to regular transaction:', error);
      toast.error('Gas sponsorship failed, please ensure you have CHZ for gas fees');
      throw error;
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
          tx = await executeSponsoredTransaction(eventContract, 'registerAsFan');
          break;
        case "musician":
          tx = await executeSponsoredTransaction(eventContract, 'registerAsMusician');
          break;
        case "sportsTeam":
          tx = await executeSponsoredTransaction(eventContract, 'registerAsSportsTeam');
          break;
        default:
          throw new Error("Invalid role");
      }
      
      await tx.wait();

      setRole(selectedRole);
      localStorage.setItem(`mosh-role-${address}`, selectedRole);
      setInitialThemeForRole(selectedRole);
      setShowRoleSelector(false);
      setShowEnsRegistration(false);
      
      const roleDisplayNames = {
        fan: "fan",
        musician: "musician",
        sportsTeam: "sports team"
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
    localStorage.setItem(`mosh-pending-role-${address}`, selectedRole);
  };

  if (showEnsRegistration) {
    const handleEnsRegistrationComplete = async (newEnsName) => {
      // ENS registration completed, update ENS name and proceed with role
      setEnsName(newEnsName);
      setShowEnsRegistration(false);
      
      // Get the pending role and complete registration
      const pendingRole = localStorage.getItem(`mosh-pending-role-${address}`);
      localStorage.removeItem(`mosh-pending-role-${address}`);
      
      if (pendingRole) {
        await completeRoleSelection(pendingRole);
      }
    };

    const handleEnsRegistrationSkip = async () => {
      // User skipped ENS registration, proceed with role only
      setShowEnsRegistration(false);
      
      // Get the pending role and complete registration
      const pendingRole = localStorage.getItem(`mosh-pending-role-${address}`);
      localStorage.removeItem(`mosh-pending-role-${address}`);
      
      if (pendingRole) {
        await completeRoleSelection(pendingRole);
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
    const handleSelectSportsTeam = () => handleRoleSelectionWithEnsCheck("sportsTeam");

    return (
      <RoleSelector
        onSelectFan={handleSelectFan}
        onSelectArtist={handleSelectArtist}
        onSelectSportsTeam={handleSelectSportsTeam}
      />
    );
  }

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
        getArtistName,
        fetchArtistProfile,
        isConnecting,
        user, // Privy user info (email, etc.)
        executeSponsoredTransaction, // Custom gas sponsorship
        gasSponsorship, // Gas sponsorship instance
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
