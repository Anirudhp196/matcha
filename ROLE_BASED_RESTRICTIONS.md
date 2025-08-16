# Role-Based Restrictions Implementation Summary

## Overview
Successfully implemented challenging role selection logic with backend smart contract enforcement and frontend theme-based restrictions. The system now enforces strict role-based access control between sports (Match-a) and music (Performative) sides.

## Backend Changes (Smart Contracts)

### 1. EventManager.sol Updates
- **New Role**: Added `SportsTeam` to the Role enum
- **Event Types**: Added `EventType` enum (Performance = 0, Sports = 1)
- **Enhanced EventData**: Added `eventType` field to track event category
- **Role Registration**: Added `registerAsSportsTeam()` function
- **Access Control**: 
  - Only Musicians can create Performance events
  - Only Sports Teams can create Sports events
  - Only Fans can buy tickets (enforced via `OnlyFansCanBuyTickets` error)

### 2. IEventManager.sol Updates
- Added EventType enum to interface
- Updated createEvent function signature to include eventType parameter
- Updated events view function to return eventType

## Frontend Changes

### 1. Role Selection Enhancement
- **RoleSelector.js**: Expanded to 3-column layout with Fan, Musician, and Sports Team options
- **Role Descriptions**: Added clear descriptions for each role's capabilities
- **Visual Design**: Added sports-themed styling for Sports Team option

### 2. Theme-Role Restrictions
- **Musicians**: Can ONLY access Performative side (forced theme on selection)
- **Sports Teams**: Can ONLY access Match-a side (forced theme on selection)  
- **Fans**: Can access BOTH sides and see content specific to current theme

### 3. Navigation Logic (DualThemeNavbar.js)
- **Theme Toggle Restrictions**: 
  - Disabled Match-a button for Musicians
  - Disabled Performative button for Sports Teams
  - Added visual disabled state and tooltips
- **Role Badge Updates**: Shows appropriate role names based on theme context
- **Menu Restrictions**: Manage events option available to both Musicians and Sports Teams

### 4. Ticket Management (ManageTickets.js)
- **Filtered Views**: Fans only see tickets relevant to current theme
  - Match-a side: Shows only sports tickets
  - Performative side: Shows only concert tickets
- **Contextual Messaging**: Informs users about tickets on the other side
- **Theme-Aware Titles**: Page titles reflect current side (Sports Match vs Concert)

### 5. Event Creation (CreateConcertForm.js)
- **Role Validation**: Frontend prevents unauthorized event creation
- **Access Restriction UI**: Shows clear messages when users lack permissions
- **Event Type Assignment**: Automatically sets correct event type based on role and theme
- **Smart Contract Integration**: Passes eventType parameter to createEvent

### 6. Enhanced Hooks (useTickets.js)
- **Event Type Tracking**: Fetches and includes event type data for each ticket
- **Event Data Integration**: Links tickets to their source events for filtering

## User Experience Flow

### Role Selection Process
1. User connects wallet
2. Chooses from 3 role options with clear descriptions
3. Role is registered on smart contract
4. Initial theme is set based on role (Sports Teams → Match-a, Musicians → Performative)

### Access Restrictions
| Role | Match-a Access | Performative Access | Can Buy Tickets | Can Create Events |
|------|----------------|-------------------|-----------------|-------------------|
| **Fan** | ✅ Browse & Buy | ✅ Browse & Buy | ✅ Both sides | ❌ Neither |
| **Musician** | ❌ No Access | ✅ Browse & Create | ❌ None | ✅ Concerts only |
| **Sports Team** | ✅ Browse & Create | ❌ No Access | ❌ None | ✅ Matches only |

### Theme Enforcement
- **Musicians**: Locked to Performative side, cannot switch to Match-a
- **Sports Teams**: Locked to Match-a side, cannot switch to Performative
- **Fans**: Full access to both sides with separate ticket views

## Error Handling
- **Smart Contract**: Custom errors for role violations (`InvalidRoleForEventType`, `OnlyFansCanBuyTickets`)
- **Frontend**: User-friendly error messages and access restriction displays
- **Validation**: Multiple layers of validation prevent unauthorized actions

## Security Features
- **Smart Contract Enforcement**: Backend validation prevents bypassing frontend restrictions
- **Role-Event Type Mapping**: Ensures only appropriate roles can create specific event types
- **Theme-Role Coupling**: UI restrictions aligned with smart contract rules

## Testing Completed
- ✅ Role selection UI works with 3 options
- ✅ Theme restrictions enforce proper access control
- ✅ Ticket filtering separates sports and concert tickets
- ✅ Event creation restrictions prevent unauthorized access
- ✅ Navigation properly disables restricted options
- ✅ No linting errors in updated components

## Future Considerations
- Smart contracts will need redeployment to activate new functionality
- ABIs in frontend will need updating after contract deployment
- Consider adding role switching functionality for testing/admin purposes
- Monitor user feedback on restriction clarity and UX flow
