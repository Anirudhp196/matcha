import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { CONTRACTS } from "../contracts/config";
import { useEns } from "../hooks/useEns";
import { useTheme } from "./ThemeContext";
import { useRoleSponsorship } from "../hooks/useRoleSponsorship";
import RoleSelector from "../components/RoleSelector";
import EnsRegistration from "../components/EnsRegistration";
import FundingOptions from "../components/FundingOptions";
import LoadingSpinner from "../components/LoadingSpinner";
import axios from "axios";
import { toast } from "react-hot-toast";


const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const { lookupName, lookupProfile, shortenAddress, testEnsLookup, debugUserEns } = useEns();
  const { setInitialThemeForRole } = useTheme();
  const { sponsorRoleRegistration, checkRelayerHealth } = useRoleSponsorship();

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
  const [showFundingOptions, setShowFundingOptions] = useState(false);
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

  // Helper function to detect if user logged in via social method
  const isSocialLoginUser = () => {
    if (!user?.linkedAccounts) return false;
    
    const accounts = user.linkedAccounts;
    const socialMethods = ['google_oauth', 'twitter_oauth', 'discord_oauth', 'github_oauth', 'email'];
    
    // A user is considered a social login user if any of their linked accounts
    // are of a social type (even if Privy automatically creates an embedded wallet).
    // This ensures that users who primarily logged in via social methods are prompted for funding.
    return accounts.some(acc => socialMethods.includes(acc.type));
  };

  // Helper function to get display name (ENS name or shortened address)
  const getDisplayName = () => {
    // 1. Prioritize Privy's direct email address (for email/password logins)
    if (user?.email?.address) {
      return user.email.address;
    }

    // 2. Prioritize email from a linked social account
    const socialEmailAccount = user?.linkedAccounts?.find(
      (acc) => 
        (acc.type === 'google_oauth' || 
         acc.type === 'twitter_oauth' || 
         acc.type === 'discord_oauth' || 
         acc.type === 'github_oauth') && acc.email
    );
    if (socialEmailAccount?.email) {
      return socialEmailAccount.email;
    }

    // 3. If it's a social login (but no email found above), prioritize the shortened wallet address over ENS.
    // This prevents displaying unrelated ENS names for embedded wallets associated with social logins.
    if (isSocialLoginUser() && address) {
      // The `isSocialLoginUser` check ensures this only applies if the primary login was social.
      return shortenAddress(address);
    }

    // 4. Fallback to ENS name if available (for non-social users or social users without an email/wallet address).
    if (ensName) {
      return ensName;
    }

    // 5. Final fallback to shortened wallet address if no other name is found.
    if (address) {
      return shortenAddress(address);
    }

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
          const res = await fetch(`https://9781005f3657.ngrok-free.app/api/ens-profile/${address}`);
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
          console.log("DEBUG: roleFromContract raw:", roleFromContract);
          const roleNumber = roleFromContract.toNumber ? roleFromContract.toNumber() : Number(roleFromContract);
          console.log("DEBUG: roleNumber:", roleNumber);
          
          let roleName = null;
          switch (roleNumber) {
            case 1: roleName = 'fan'; break;
            case 2: roleName = 'musician'; break;
            default: roleName = null; break;
          }
          console.log("DEBUG: resolved roleName:", roleName);
          
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
          } else { // This is the problematic else block if role exists
            console.log("DEBUG: No role found on contract, proceeding to role selection or funding.");
            setTempUserAddress(_address);
            
            // Check if this is a social login user who needs funding
            if (isSocialLoginUser()) {
              console.log("🏦 Social login user detected, showing funding options first");
              setShowFundingOptions(true);
            } else {
              console.log("💳 Wallet user detected, showing role selector directly");
              setShowRoleSelector(true);
            }
          }
        } catch (error) {
          console.error("Failed to fetch role from contract (likely network issue or contract not deployed correctly):", error);
          // If we can't read from contract, assume no role and proceed to role selection/funding
          setTempUserAddress(_address);
          
          if (isSocialLoginUser()) {
            console.log("🏦 Social login user (contract error path), showing funding options first");
            setShowFundingOptions(true);
          } else {
            setShowRoleSelector(true);
          }
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
      setShowFundingOptions(false);
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
    if (!artistAddress) return "Unknown Artist";

    // Attempt to resolve ENS name via the API for ANY artistAddress.
    try {
      console.log("DEBUG: Attempting ENS lookup for artist:", artistAddress);
      const res = await fetch(`https://9781005f3657.ngrok-free.app/api/ens-name/${artistAddress}`);
      const data = await res.json();

      if (data && data.ensName) {
        console.log("✅ Found ENS name from API for artist:", data.ensName);
        return data.ensName;
      }
    } catch (ensErr) {
      console.log("❌ ENS API lookup failed for artist:", ensErr);
    }

    // Fallback: No ENS name found via API, use shortened address.
    console.log("❌ No ENS found for artist, using shortened address for:", artistAddress);
    return shortenAddress(artistAddress);
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
    if (!address || !signer) return;
    
    try {
      setIsLoading(true);
      setLoadingMessage(`Registering as ${selectedRole}...`);
      
      // Check if relay service is available
      const relayHealth = await checkRelayerHealth();
      console.log("🔍 Relay health:", relayHealth);
      
      let result;
      
      if (relayHealth && relayHealth.status === 'ok') {
        // Use sponsored registration
        console.log("🎯 Using sponsored registration");
        toast.loading("Signing registration request...", { duration: 2000 });
        
        result = await sponsorRoleRegistration(selectedRole, signer, address);
        console.log("✅ Sponsored registration result:", result);
        
        toast.success("Gasless registration successful! 🎉");
      } else {
        // Fallback to regular transaction
        console.log("⚠️ Relay unavailable, falling back to regular transaction");
        toast("Relay unavailable, using regular transaction", { icon: "⚠️" });
        
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
        toast.success("Registration successful!");
      }

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
      toast.error(`Registration failed: ${err.message}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // Helper function to check ENS and potentially show registration
  const handleRoleSelectionWithEnsCheck = async (selectedRole) => {
    console.log("🔍 Checking ENS before role selection...");
    console.log("📍 Current ensName state:", ensName);
    console.log("📍 Current address:", address);
    
    // First check if user already has an ENS name in state
    if (ensName) {
      console.log("✅ User already has ENS name in state:", ensName);
      await completeRoleSelection(selectedRole);
      return;
    }

    // Double-check by doing a fresh ENS lookup
    if (address) {
      try {
        console.log("🔄 Performing fresh ENS lookup for address:", address);
        const freshEnsName = await lookupName(address);
        
        if (freshEnsName) {
          console.log("✅ Found fresh ENS name:", freshEnsName);
          setEnsName(freshEnsName); // Update state
          await completeRoleSelection(selectedRole);
          return;
        } else {
          console.log("❌ No ENS name found for address");
        }
      } catch (err) {
        console.log("❌ ENS lookup failed:", err);
      }
    }

    console.log("📝 No ENS name found, showing registration page");
    // No ENS name found, offer to register one
    setShowRoleSelector(false);
    setShowEnsRegistration(true);
    
    // Store the selected role for after ENS registration
    setPendingRole(selectedRole);
  };

  if (showFundingOptions) {
    const handleFundingComplete = () => {
      // User has funded their wallet, proceed to role selection
      setShowFundingOptions(false);
      setShowRoleSelector(true);
    };

    const handleFundingSkip = () => {
      // User skipped funding, proceed to role selection anyway
      setShowFundingOptions(false);
      setShowRoleSelector(true);
    };

    return (
      <FundingOptions
        address={address}
        onFundingComplete={handleFundingComplete}
        onSkip={handleFundingSkip}
      />
    );
  }

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
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
