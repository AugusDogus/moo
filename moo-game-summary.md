# Moo - Multiplayer Digital Deduction Puzzler

## Overview
Moo is a multiplayer digital deduction puzzle game where players crack four-emoji codes with bulls and cows feedback, styled with cozy cottage-core aesthetics. It's a modern take on the classic Mastermind game using emojis instead of colored pegs.

## Game Features

### Core Gameplay
- **Two-player multiplayer**: Exactly 2 players per game
- **Emoji-based codes**: Uses 6 cottage-core emojis (🐄 🥛 🍄 🌸 🌿 🧺)
- **Bulls and Cows feedback**: Bulls = correct emoji in correct position, Cows = correct emoji in wrong position
- **Infinite rounds**: Games continue until one player wins
- **Real-time multiplayer**: Live updates using tRPC subscriptions

### Game Flow
1. **Room Creation**: One player creates a room with a 4-letter code
2. **Room Joining**: Another player joins using the room code
3. **Code Selection**: Both players secretly choose their 4-emoji codes
4. **Guessing Phase**: Players take turns making guesses simultaneously
5. **Feedback**: Each guess receives bulls and cows feedback
6. **Victory**: First player to get 4 bulls (crack the code) wins

### UI/UX Features
- **Cottage-core aesthetic**: Cozy, pastoral design with warm colors
- **Wordle-inspired interface**: Familiar grid-based guess history
- **Real-time updates**: Live synchronization between players
- **Responsive design**: Works on desktop and mobile devices
- **Authentication required**: Discord OAuth integration

## Technical Architecture

### Stack
- **Frontend**: Next.js 15 with React 19
- **Backend**: tRPC with Server-Sent Events (SSE)
- **Database**: SQLite with Drizzle ORM
- **Authentication**: Better Auth with Discord provider
- **Styling**: Tailwind CSS with shadcn/ui components
- **Package Manager**: Bun

### Database Schema
- **Users**: Authentication and user data
- **Game Rooms**: 4-letter codes for joining games
- **Games**: Game state, player assignments, codes, and status
- **Game Moves**: Individual guesses with bulls/cows feedback

### Real-time Features
- **tRPC Subscriptions**: Live game updates via SSE
- **Event-driven architecture**: Game state changes trigger real-time updates
- **Automatic reconnection**: Handles connection drops gracefully

## File Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page with room controls
│   ├── game/
│   │   ├── room/[code]/page.tsx    # Room waiting page
│   │   └── play/[gameId]/page.tsx  # Main game interface
├── components/
│   ├── game/
│   │   ├── emoji-picker.tsx        # Code selection interface
│   │   ├── game-board.tsx          # Guess history display
│   │   └── room-controls.tsx       # Room creation/joining
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── auth/                       # Authentication setup
│   └── game-utils.ts               # Game logic utilities
├── server/
│   ├── api/
│   │   └── routers/
│   │       └── game.ts             # Game API endpoints
│   └── db/
│       └── schema.ts               # Database schema
└── trpc/                           # tRPC configuration
```

## Key Components

### Game Router (`src/server/api/routers/game.ts`)
- `createRoom`: Creates new game rooms
- `joinRoom`: Joins existing rooms
- `getGameState`: Retrieves current game state
- `setPlayerCode`: Sets player's secret code
- `makeGuess`: Submits guesses and calculates feedback
- `subscribeToGameUpdates`: Real-time subscription for game events

### UI Components
- **EmojiPicker**: Interactive code selection with visual feedback
- **GameBoard**: Wordle-style guess history with bulls/cows display
- **RoomControls**: Room creation and joining interface

### Game Utils (`src/lib/game-utils.ts`)
- Bulls and cows calculation algorithm
- Emoji-to-index conversion for storage
- Room code generation
- Code validation utilities

## Environment Setup

Required environment variables:
```env
DATABASE_URL="file:./db.sqlite"
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"
```

## Development Commands

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Run linting and type checking
bun check

# Database operations
bun run db:push      # Push schema changes
bun run db:studio    # Open database studio
```

## Game Logic

### Bulls and Cows Algorithm
```typescript
// Bulls: correct emoji in correct position
// Cows: correct emoji in wrong position
const calculateBullsAndCows = (guess: string, secret: string) => {
  // Implementation handles duplicates correctly
  // Returns { bulls: number, cows: number }
}
```

### Real-time Synchronization
- Uses tRPC subscriptions with Server-Sent Events
- Event-driven updates for all game state changes
- Automatic reconnection with lastEventId tracking

## Cottage-core Design Elements

### Color Palette
- Warm, muted colors inspired by pastoral themes
- Cozy card-based layouts
- Soft hover effects and transitions

### Typography
- Clean, readable fonts
- Proper hierarchy for game information
- Emoji-first design language

### Visual Feedback
- Bulls displayed with 🐂 emoji and red badges
- Cows displayed with 🐄 emoji and secondary badges
- Visual indicators for game state and player actions

## Security Features

### Authentication
- Discord OAuth integration via Better Auth
- Protected routes requiring authentication
- User session management

### Game Security
- Server-side validation of all moves
- Player authorization checks
- Room access control

## Performance Optimizations

### Database
- Proper indexing on frequently queried fields
- Efficient queries with Drizzle ORM
- Automatic cleanup of finished games

### Frontend
- React Server Components for initial page loads
- Optimistic updates for better UX
- Efficient re-renders with proper React patterns

## Future Enhancements

### Potential Features
- **Spectator mode**: Allow observers to watch games
- **Tournament mode**: Multi-round competitions
- **Custom emoji sets**: Different themes beyond cottage-core
- **Game history**: Persistent game statistics
- **Difficulty settings**: Different code lengths or emoji counts
- **Chat system**: In-game communication
- **Mobile app**: Native mobile versions

### Technical Improvements
- **Horizontal scaling**: Redis for session management
- **Push notifications**: Mobile alerts for game updates
- **Analytics**: Game performance tracking
- **Internationalization**: Multi-language support

## Deployment Notes

### Production Considerations
- Set up proper Discord OAuth application
- Configure production database (PostgreSQL recommended)
- Set up monitoring and logging
- Configure CDN for static assets
- Set up SSL/TLS certificates

### Environment Variables
- Use secure secret generation for `BETTER_AUTH_SECRET`
- Configure proper Discord OAuth redirect URLs
- Set up production database URL
- Configure CORS settings if needed

## Testing Strategy

### Unit Tests
- Game logic utilities (bulls/cows calculation)
- Code validation functions
- Emoji conversion utilities

### Integration Tests
- tRPC API endpoints
- Database operations
- Authentication flows

### End-to-End Tests
- Complete game flow
- Real-time synchronization
- Error handling scenarios

## Recent Improvements ✨

### Smart Authentication & Room Sharing
- **🔗 Seamless Link Sharing**: Room links work for unauthenticated users with clear sign-in prompts
- **🚀 Auto-redirect**: After authentication, users are automatically redirected to their intended room
- **🛡️ Role-based UI**: Different interfaces for room creators, existing players, and new visitors
- **⚡ Auto-game-resume**: If users already have an active game, they're automatically redirected to it
- **� Smart Room Entry**: Room creators can enter their own room code from home page to return to their room
- **🔄 Flexible Navigation**: "Enter Room" works for both joining new games and returning to your own rooms

### Enhanced User Experience
- **📱 Better Loading States**: Clear feedback while room info and user roles are loading
- **🎨 Visual Role Indicators**: Color-coded cards showing user's relationship to the room
- **🔄 Smart State Management**: Proper handling of session/room data race conditions
- **✅ Error Prevention**: Multiple layers of validation to prevent invalid actions

This implementation provides a robust foundation for a multiplayer deduction puzzle game with modern web technologies, seamless sharing capabilities, and a delightful cottage-core aesthetic.