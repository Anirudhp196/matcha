# ENS Registration Integration Guide

## Overview

Your Matcha app now includes ENS (Ethereum Name Service) registration functionality that allows users to create an ENS name directly after connecting their wallet and selecting a role. This provides a seamless onboarding experience where users can establish their Web3 identity without leaving your platform.

## How It Works

### User Flow
1. **Connect Wallet** - User connects their wallet using Privy
2. **Role Selection** - User chooses their role (Fan, Musician, or Sports Team)
3. **ENS Check** - System automatically checks if user has an existing ENS name
4. **ENS Registration** (if no existing name):
   - User is presented with ENS registration interface
   - They can search for available names
   - Choose registration duration (1-5 years)
   - Complete registration with ETH payment
   - Or skip to proceed without ENS
5. **Complete Onboarding** - User proceeds to app with their role and optional ENS name

### Technical Implementation

#### Frontend Components
- **`EnsRegistration.js`** - Main registration interface with name search, availability checking, and registration flow
- **`EnsRegistration.css`** - Responsive styling that adapts to your theme system
- **Modified `Web3Context.js`** - Integrates ENS flow into existing role selection
- **Enhanced `useEns.js` hook** - Added availability checking and cost estimation

#### Backend Integration
- **Enhanced `ensUtils.js`** - Added ENS availability and cost functions
- **Enhanced `ensApi.js`** - Added API endpoints for availability and cost checking

## Features

### ENS Registration Interface
- **Name Availability Search** - Real-time checking of ENS name availability
- **Cost Estimation** - Shows registration cost in ETH before proceeding
- **Duration Selection** - Choose registration period (1-5 years)
- **Commit-Reveal Registration** - Secure ENS registration process
- **Progress Tracking** - Visual feedback during the registration process
- **Skip Option** - Users can skip ENS registration and proceed

### Integration Features
- **Automatic Detection** - Checks if user already has ENS before showing registration
- **Theme Integration** - Matches your existing light/dark theme system
- **Role-Based Theming** - Adapts colors based on selected role
- **Error Handling** - Comprehensive error handling and user feedback
- **Mobile Responsive** - Works on all device sizes

## Testing the Feature

### Prerequisites
1. Ensure your backend ENS API is running (`node backend/scripts/ensApi.js`)
2. Have test ETH on mainnet (or modify contracts for testnet)
3. Connect with a wallet that doesn't have an ENS name

### Test Steps
1. Connect wallet to your app
2. Select any role (Fan, Musician, Sports Team)
3. If wallet has no ENS name, you'll see the ENS registration interface
4. Try searching for names (most 3-4 letter names are taken)
5. Test the registration flow or skip option

### Expected Behavior
- **User with existing ENS**: Goes directly to role registration
- **User without ENS**: Sees registration interface after role selection
- **After registration**: ENS name appears throughout the app
- **After skipping**: User proceeds without ENS name

## Network Configuration

### Current Setup (Mainnet)
The integration is currently configured for Ethereum mainnet:
- ENS Registry: `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e`
- ENS Registrar: `0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5`
- ENS Resolver: `0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41`

### Cost Considerations
- ENS registration costs vary (typically $5-20+ USD worth of ETH per year)
- Shorter names cost more
- Registration requires two transactions (commit + reveal)
- Gas fees apply to both transactions

## Customization Options

### Theme Integration
The component automatically adapts to your theme system:
- Light/Dark mode support
- Role-based color schemes (fan: green, musician: purple, sports: orange)
- Matches existing component styling

### Modifying the Flow
You can customize the integration by:
- Changing when ENS registration is offered
- Modifying the skip behavior
- Adjusting the duration options
- Customizing the messaging

### Error Handling
The system handles various scenarios:
- Network connectivity issues
- Transaction failures
- Invalid names
- Insufficient funds
- User cancellation

## Security Considerations

### Commit-Reveal Process
The ENS registration uses the secure commit-reveal scheme:
1. **Commit Phase**: Submit a commitment hash (prevents front-running)
2. **Wait Period**: 60-second minimum wait (security requirement)
3. **Reveal Phase**: Complete registration with actual parameters

### Contract Interactions
- Uses official ENS contracts on mainnet
- All transactions are signed by user's wallet
- No private keys or sensitive data stored
- Follows ENS best practices

## Troubleshooting

### Common Issues
1. **"Name not available"**: Try longer or more unique names
2. **"Transaction failed"**: Check ETH balance and gas settings
3. **"Network error"**: Ensure backend API is running
4. **"Invalid name"**: Names must be 3+ characters, alphanumeric only

### Backend API Endpoints
- `GET /api/ens-available/:name` - Check name availability
- `GET /api/ens-cost/:name/:duration` - Get registration cost
- `GET /api/ens-name/:address` - Lookup existing ENS name
- `GET /api/ens-profile/:address` - Get full ENS profile

## Future Enhancements

### Potential Improvements
- **Testnet Support**: Add support for ENS testing on Goerli/Sepolia
- **Batch Registration**: Allow registering multiple names
- **Subdomain Creation**: Create subdomains under a main domain
- **Profile Setup**: Set ENS records (avatar, social links) during registration
- **Name Suggestions**: Suggest available alternatives
- **Price Alerts**: Notify when preferred names become available

### Integration Extensions
- **Profile Pages**: Show ENS information on user profiles
- **Search**: Allow finding users by ENS name
- **Messaging**: Use ENS names for user-to-user communication
- **Events**: Display organizer ENS names on events

## Support

If you encounter any issues:
1. Check browser console for error messages
2. Verify backend API is running and accessible
3. Ensure wallet has sufficient ETH for registration
4. Check network connectivity and RPC endpoints

The ENS integration provides a seamless way for users to establish their Web3 identity directly within your app, improving the onboarding experience and creating a more professional, user-friendly platform.
