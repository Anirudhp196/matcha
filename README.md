# 🎫 Matcha - Decentralized Event Ticketing Platform

> **Revolutionizing event ticketing through blockchain technology, dual themes, and innovative loyalty systems**

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-green.svg)](https://soliditylang.org/)
[![Flow](https://img.shields.io/badge/Flow-EVM%20BaseNet-purple.svg)](https://flow.com/)
Flow smart contracts address:

{
  "TICKET_ADDRESS": "0x503a6BF8297B28d5844e8472105E5e0cB834D809",
  "EVENT_MANAGER_ADDRESS": "0x680429B3527B344A6C90F990F2a96212Dbd48E1d",
  "MARKETPLACE_ADDRESS": "0x112Ea6E41Aa03096Ea949D3b62b8c6c3e26f26EC"
}

[![ENS](https://img.shields.io/badge/ENS-Integration-blue.svg)](https://ens.domains/)
[![Privy](https://img.shields.io/badge/Privy-Auth%20v2-yellow.svg)](https://privy.io/)
[![Hardhat](https://img.shields.io/badge/Hardhat-Development-orange.svg)](https://hardhat.org/)

## 🚀 Overview

**Matcha** is a cutting-edge decentralized event ticketing platform that solves real-world problems faced by students and communities in organizing and attending events. Built on Flow blockchain using the innovative "FEP" stack (Flow, ENS, Privy), Matcha eliminates ticket scalping, prevents scams, creates sustainable revenue models for artists, and provides a seamless dual-theme experience for both sports and performance events.

### 🎯 **Problem We Solve**

Born from personal experiences of concert-going students at UPenn, Matcha addresses critical issues in the ticketing industry:

- **Ticket Scams**: Friends getting scammed buying fake tickets from unauthorized sellers
- **Excessive Scalping**: Studies show resellers charge 203% over face value on average
- **Artist Revenue Loss**: Artists missing out on secondary market profits
- **Global Scale Issues**: From Taylor Swift Eras Tour protests to ₹85,000 Coldplay tickets in Mumbai
- **User Experience**: Complex crypto onboarding preventing mainstream adoption

### ✨ **Key Features**

- 🎭 **Dual Theme System**: Match-a (sports) and Performative (concerts) with distinct visual identities
- 🔐 **Role-Based Access Control**: Fans, Musicians, and Sports Teams with specific permissions
- 🏆 **Gamified Loyalty Program**: Gold-tier fans get early access through "proof-of-fanness"
- 🎫 **NFT Tickets**: Transparent, verifiable tickets preventing scams
- 🛒 **Fair Secondary Marketplace**: Automated revenue sharing for artists on resales
- 🌐 **ENS Integration**: Human-readable identities replacing wallet addresses
- ⛽ **Gasless Transactions**: Privy + Gelato Relay for seamless Web2-like experience
- 🤖 **Anti-Bot Measures**: ENS verification and Privy authentication to prevent scalping

## 🏗️ Architecture - The "FEP" Stack

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Blockchain    │
│   (React 19)    │◄──►│  (Node.js)      │◄──►│  (Flow EVM)     │
│                 │    │                 │    │                 │
│ • Dual Themes   │    │ • ENS API       │    │ • EventManager  │
│ • Privy Auth    │    │ • IPFS Storage  │    │ • Ticket NFTs   │
│ • Gasless UX    │    │ • Gelato Relay  │    │ • Marketplace   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Technology Stack

### **Frontend**
- **React 19.1.0** - Modern React with hooks and context
- **Privy v2** - Web3 authentication with embedded wallets and gasless transactions
- **ethers.js** - Blockchain interaction and ENS integration
- **CSS Variables** - Dynamic theming system for dual themes
- **React Router v7** - Client-side routing

### **Backend**
- **Node.js + Express** - RESTful API server
- **IPFS Integration** - Decentralized metadata storage
- **ENS Resolution** - Ethereum Name Service integration with reverse/forward lookup
- **Gelato Relay** - Gasless transaction sponsorship on Flow

### **Blockchain**
- **Flow EVM BaseNet** - Primary deployment leveraging consumer-grade scalability
- **Solidity 0.8.20** - Smart contract development
- **Hardhat** - Development, testing, and deployment framework
- **OpenZeppelin** - Security libraries and standards
- **Nora AI** - Solidity development acceleration and debugging

### **Smart Contracts**
- **EventManager** - Core event lifecycle and role management
- **Ticket** - ERC-721 NFT ticket implementation with anti-scalping logic
- **Marketplace** - Secondary ticket sales with automatic artist revenue sharing (45% seller, 45% artist, 10% platform)

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet (optional with Privy embedded wallets)
- No native tokens required (gasless transactions supported)

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/your-username/matcha.git
cd matcha
```

2. **Install dependencies**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. **Environment Setup**
```bash
# Backend
cd backend
cp .env.example .env
# Configure Flow RPC, Privy keys, ENS providers, IPFS settings

# Frontend
cd ../frontend
cp .env.example .env
# Configure Privy App ID, Flow network settings
```

4. **Deploy Smart Contracts**
```bash
cd backend
npx hardhat compile
npx hardhat deploy --network flow-testnet
```

5. **Start Services**
```bash
# Terminal 1: Backend ENS API
cd backend
npm run ens-api

# Terminal 2: Frontend
cd frontend
npm start
```

6. **Access the Platform**
- Frontend: http://localhost:3000
- ENS API: http://localhost:4000

## 🎨 Dual Theme System

### **Match-a Theme (Sports)**
- **Colors**: Calming pastels, soft greens, earth tones
- **Experience**: Tranquil, focused, athletic atmosphere
- **Access**: Fans and Sports Teams only
- **Target**: Sports events, tournaments, athletic competitions

### **Performative Theme (Concerts)**
- **Colors**: Vibrant neons, dramatic gradients, bold contrasts
- **Experience**: Energetic, exciting, artistic atmosphere
- **Access**: Fans and Musicians only
- **Target**: Concerts, raves, music festivals, DJ sets

*Themes are dynamically applied based on user role and event type, creating immersive experiences tailored to each domain.*

## 🔐 Role-Based System

### **Fan**
- ✅ Purchase tickets for any event type
- ✅ Access both Match-a and Performative themes
- ✅ Build loyalty with artists/teams for gold-tier benefits
- ✅ Resell tickets on secondary market
- ✅ Web2-style onboarding with email/social login

### **Musician**
- ✅ Create and manage concert events
- ✅ Set ticket prices, limits (max 10 per user), and loyalty requirements
- ✅ Access Performative theme only
- ✅ Receive 45% revenue from secondary market sales
- ✅ Define gold-tier fan requirements

### **Sports Team**
- ✅ Create and manage sports events
- ✅ Set ticket prices, limits, and loyalty requirements
- ✅ Access Match-a theme only
- ✅ Receive 45% revenue from secondary market sales
- ✅ Build fan loyalty programs

## 🏆 Gamified Loyalty Program - "Proof-of-Fanness"

### **Gold Tier Benefits**
- 🕐 **Early Access**: Priority ticket purchasing before general sales
- 🎯 **Exclusive Events**: Access to limited VIP experiences
- 📊 **Progress Tracking**: Visual progress bars toward next tier
- 🎁 **Artist Recognition**: Verified fan status in the community

### **How to Achieve Gold Tier**
- Attend a specified number of events from the same artist/team
- Meet artist-defined loyalty thresholds
- Automatic on-chain verification and tier progression
- Gamified competition among fans

*This system rewards genuine fans while making it harder for scalpers to access premium tickets.*

## 🎫 Anti-Scalping Ticket System

### **Primary Sales**
- **Role Validation**: Automatic verification of user permissions
- **Purchase Limits**: Maximum 10 tickets per user per event
- **Loyalty Gating**: Gold-tier early access periods
- **Real-time Availability**: Live inventory updates

### **Secondary Market with Artist Revenue**
- **Automated Revenue Sharing**: 45% seller, 45% artist/organizer, 10% platform
- **Event Validation**: Cancelled events cannot be resold
- **Transparent Pricing**: Clear market dynamics
- **No Gas Fees**: Seamless resale experience

### **Bot Prevention Measures**
- **ENS Integration**: Verified identity through human-readable names
- **Privy Authentication**: Email/SMS verification required
- **Purchase Pattern Analysis**: Smart contract logic to detect suspicious activity
- **Web2 Onboarding**: Familiar login methods reduce bot effectiveness

## 🌐 ENS Integration - Digital Identity Layer

### **Identity Features**
- **Reverse Resolution**: Display ENS names instead of wallet addresses
- **Forward Resolution**: Verify name-to-address mapping to prevent spoofing
- **Rich Profiles**: Avatars, bios, and social links from ENS text records
- **Branded Personas**: Artists and teams with recognizable identities

### **Implementation**
- **Backend (ensUtils.js)**: ethers.js with Infura for resolution
- **Frontend (Web3Context)**: Global ENS data availability
- **UI Components**: WalletButton.js and EventCard.js display names/avatars
- **Graceful Fallbacks**: IPFS metadata when ENS unavailable

## ⛽ Gasless Experience with Privy + Gelato

### **Seamless Onboarding**
- **Web2 Login Methods**: Email, Google, Twitter authentication
- **Embedded Wallets**: Automatic wallet creation, no seed phrases
- **Network Abstraction**: Auto-configured for Flow EVM BaseNet
- **Zero Friction**: No need to hold native FLOW tokens

### **Gas Sponsorship**
- **Gelato Relay Integration**: Off-chain message signing, on-chain submission
- **Platform-Sponsored**: Matcha covers all transaction costs
- **Beta Access**: Exclusive Privy Gas Sponsorship features
- **Maintained Security**: Self-custodial wallets with sponsored execution

## 🧪 Development with Nora AI

### **AI-Accelerated Development**
- **Solidity Co-pilot**: Rapid prototyping and debugging assistance
- **Cross-Contract Flow Analysis**: Understanding complex interactions
- **Low-Level Semantics**: Deep blockchain implementation guidance
- **Faster Iteration**: Focus on architecture while AI handles implementation

### **Smart Contract Testing**
```bash
cd backend

# Compile contracts
npx hardhat compile

# Run comprehensive tests
npm test

# Deploy with verification
npx hardhat deploy --network flow-testnet --verify

# Debug contract interactions
npx hardhat console --network flow-testnet
```

## 📱 User Experience Flow

### **New User Onboarding**
1. **Social Login** - Email, Google, or Twitter authentication via Privy
2. **Role Selection** - Choose Fan, Musician, or Sports Team
3. **ENS Setup** - Optional Web3 identity creation with cost estimation
4. **Theme Access** - Automatic theme selection based on role
5. **Explore Events** - Browse upcoming concerts and sports events

### **Artist/Team Event Creation**
1. **Role Verification** - Confirm Musician or Sports Team permissions
2. **Event Configuration** - Details, pricing, loyalty requirements
3. **IPFS Metadata** - Decentralized storage of event information
4. **Smart Contract Deployment** - On-chain event creation
5. **Launch Sales** - Automatic loyalty gating and anti-scalping measures

### **Fan Ticket Purchase**
1. **Event Discovery** - Browse events by theme and artist
2. **Loyalty Check** - Verify gold-tier early access eligibility
3. **Gasless Payment** - Seamless transaction via Privy + Gelato
4. **NFT Minting** - Unique, verifiable ticket creation
5. **Instant Access** - Ticket stored in embedded wallet

## 🌟 Real-World Impact

### **Personal Connection**
Built by UPenn students who are passionate concert-goers and have experienced ticketing frustrations firsthand. The team has direct connections with:
- **Local Music Scene**: Philadelphia raves and indie venues
- **Artist Network**: Musicians expressing ticketing platform frustrations
- **Student Community**: University events and campus entertainment

### **Market Validation**
- **Global Problem**: From Taylor Swift protests to Mumbai Coldplay scalping
- **Student Focus**: Addressing university and local community event needs
- **Artist Support**: Direct revenue sharing incentivizes platform adoption
- **Business Case**: Sustainable revenue model with built-in growth incentives

## 🔒 Security & Performance

### **Smart Contract Security**
- **OpenZeppelin Standards**: Battle-tested security libraries
- **Role-Based Access Control**: Granular permission management
- **Reentrancy Protection**: Comprehensive attack prevention
- **Input Validation**: Sanitized data and error handling
- **Audit-Ready Code**: Clean, documented contract architecture

### **Platform Optimizations**
- **Flow EVM Benefits**: High throughput, low fees, account abstraction
- **Solidity Optimizer**: 200 runs for gas efficiency
- **IPFS Content Addressing**: Decentralized, immutable metadata
- **React Query**: Efficient data fetching and caching
- **CSS Variables**: Performance-optimized theming

## 🤝 Contributing

We welcome contributions from students, developers, and the broader community!

### **Development Setup**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with tests
4. Submit a pull request with detailed description

### **Areas for Contribution**
- **Smart Contract Enhancements**: Gas optimization, new features
- **Frontend Development**: UI/UX improvements, accessibility
- **Backend Services**: API enhancements, performance improvements
- **Testing**: Unit tests, integration tests, security audits
- **Documentation**: Tutorials, guides, API documentation

## 📞 Support & Community

- **Documentation**: [Wiki](https://github.com/your-username/matcha/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/matcha/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/matcha/discussions)
- **UPenn FranklinDAO**: Student blockchain organization
- **Email**: support@matcha.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **UPenn FranklinDAO Club** - Student organization and community support
- **Flow** - Consumer-focused blockchain infrastructure and EVM compatibility
- **ENS** - Ethereum Name Service for digital identity
- **Privy** - Web3 authentication and embedded wallet technology
- **Gelato** - Gas sponsorship and relay infrastructure
- **OpenZeppelin** - Smart contract security standards
- **Hardhat** - Solidity development framework
- **Nora AI** - AI-powered Solidity development acceleration

---

**Built with ❤️ by UPenn Students Who Love Concerts**

*Combining Computer Science, Electrical Engineering, and Business to solve real-world problems through blockchain innovation*

**"Mixing beats, code, and blockchain to fix ticketing for everyone"** 🎵⚡🔗
