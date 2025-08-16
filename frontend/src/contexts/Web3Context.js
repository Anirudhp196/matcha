import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { CONTRACTS } from "../contracts/config";
import { useEns } from "../hooks/useEns";
import RoleSelector from "../components/RoleSelector";
import LoadingSpinner from "../components/LoadingSpinner";
import axios from "axios";
import { toast } from "react-hot-toast";

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const { lookupName, lookupProfile, shortenAddress } = useEns();

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [ticketContract, setTicketContract] = useState(null);
  const [eventContract, setEventContract] = useState(null);
  const [marketplaceContract, setMarketplaceContract] = useState(null);
  const [network, setNetwork] = useState(null);
  const [role, setRole] = useState(null);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [tempUserAddress, setTempUserAddress] = useState(null);
  const [ensName, setEnsName] = useState(null);
  const [ensAvatar, setEnsAvatar] = useState(null);
  const [goldRequirement, setGoldRequirement] = useState(0);
  const [artistProfiles, setArtistProfiles] = useState({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

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

        // Check if we're on Chiliz Spicy Testnet (chainId: 88882)
        if (currentNetwork.chainId !== 88882) {
          console.log("Wrong network, switching to Chiliz Spicy Testnet...");
          try {
            await ethereumProvider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x15b32" }], // 88882 in hex
            });
          } catch (switchError) {
            console.error("Failed to switch network:", switchError);

            if (switchError.code === 4902) {
              try {
                await ethereumProvider.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: "0x15b32", // 88882
                      chainName: "Chiliz Spicy Testnet",
                      nativeCurrency: {
                        name: "CHZ",
                        symbol: "CHZ",
                        decimals: 18,
                      },
                      rpcUrls: ["https://spicy-rpc.chiliz.com/"],
                      blockExplorerUrls: ["https://testnet.chiliscan.com/"],
                    },
                  ],
                });
              } catch (addError) {
                console.error("Failed to add network:", addError);
                toast.error("Please manually switch to Chiliz Spicy Testnet");
                return;
              }
            } else {
              toast.error("Please switch to Chiliz Spicy Testnet");
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

        // Check for existing role
        const savedRole = localStorage.getItem(`mosh-role-${_address}`);
        if (savedRole) {
          setRole(savedRole);
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

  if (showRoleSelector) {
    const handleSelectFan = () => {
      setRole("fan");
      localStorage.setItem(`mosh-role-${address}`, "fan");
      setShowRoleSelector(false);
      toast.success("Welcome, fan!");
    };

    const handleSelectArtist = async () => {
      if (!address || !eventContract) return;
      try {
        setIsLoading(true);
        setLoadingMessage("Registering as musician...");
        
        const tx = await eventContract.registerAsMusician();
        await tx.wait();

        setRole("musician");
        localStorage.setItem(`mosh-role-${address}`, "musician");
        setShowRoleSelector(false);
        toast.success(`Welcome, ${getDisplayName()}!`);
      } catch (err) {
        console.error("Registration failed:", err);
        toast.error("Registration failed.");
      } finally {
        setIsLoading(false);
        setLoadingMessage("");
      }
    };

    return (
      <RoleSelector
        onSelectFan={handleSelectFan}
        onSelectArtist={handleSelectArtist}
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
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
