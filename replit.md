# Discord Intro Manager Bot

## Overview
This is a Discord bot built for the AI Learners India community. It automatically validates member introductions posted in a designated channel, formats them into beautiful embeds, and posts them to a profiles channel. The bot ensures all introductions follow a consistent format and helps maintain a well-organized member directory.

## Project Status
- **Created:** October 30, 2025
- **Status:** Initial implementation complete
- **Framework:** Node.js with discord.js v14
- **Integration:** Replit Discord connector

## Recent Changes
- [2025-10-30] Initial project setup with Discord bot functionality
- [2025-10-30] Implemented intro validation, embed formatting, and profile management
- [2025-10-30] Added persistent profile tracking with JSON storage
- [2025-10-30] Created comprehensive documentation and setup guide
- [2025-10-30] **UPGRADED:** Integrated Google Gemini AI for smart intro analysis
- [2025-10-30] Added AI-powered role detection and experience leveling
- [2025-10-30] Implemented dynamic color-coded embeds based on skill level
- [2025-10-30] Added user avatar thumbnails to profile embeds
- [2025-10-30] Created slash commands: /updateintro and /deleteintro
- [2025-10-30] Implemented graceful fallback when Gemini API is unavailable

## Project Architecture

### File Structure
```
discord-intro-bot/
├── index.js                 # Main bot logic, event handlers, and slash command registration
├── package.json             # Node.js dependencies
├── commands/
│   ├── updateIntro.js      # Slash command for updating user profiles
│   └── deleteIntro.js      # Admin slash command for deleting profiles
├── utils/
│   ├── validateIntro.js    # Validates intro format and extracts fields
│   ├── geminiAnalyze.js    # AI-powered intro analysis with Google Gemini
│   ├── formatEmbed.js      # Creates Discord embeds (standard and AI-enhanced)
│   └── updateProfile.js    # Manages persistent profile storage
└── profiles.json           # User profile database (auto-generated)
```

### Key Components

**Validation System (validateIntro.js)**
- Uses regex to parse intro fields with emojis
- Identifies missing fields
- Returns structured data with extracted fields and validation status

**AI Analysis Module (geminiAnalyze.js)**
- Sends intro text to Google Gemini AI for analysis
- Receives structured JSON with role, experience level, and refined summary
- Implements error handling and fallback support
- Returns analysis results with success/failure status

**Embed Formatter (formatEmbed.js)**
- **Standard embeds:** Random colors and basic formatting
- **AI-enhanced embeds:** Dynamic colors based on experience level
  - Beginner: Green (#57F287)
  - Intermediate: Yellow (#FEE75C)
  - Expert: Red (#ED4245)
- Adds user avatar thumbnails
- Displays AI-refined intro summaries and assigned roles
- Adds footer with username and timestamp

**Profile Manager (updateProfile.js)**
- Stores user profiles in profiles.json
- Tracks message IDs for profile updates
- Handles profile replacement when users resubmit

**Slash Commands (commands/)**
- **/updateintro:** Allows users to update their profile with AI analysis
- **/deleteintro:** Admin-only command to remove user profiles

**Main Bot (index.js)**
- Loads and registers slash commands
- Listens to messages in intro channel
- Integrates Gemini AI analysis with automatic fallback
- Validates format and posts AI-enhanced profiles
- Handles slash command interactions
- Sends helpful error messages for incomplete intros
- Reacts to messages and logs all actions

## Environment Configuration

Required environment variables (add these to Replit Secrets):
- `DISCORD_TOKEN` - Bot token from Discord Developer Portal
- `INTRO_CHANNEL_ID` - Discord channel ID where users post intros
- `PROFILE_CHANNEL_ID` - Discord channel ID for formatted profiles
- `GEMINI_API_KEY` - Google Gemini API key (OPTIONAL but recommended for AI features)

**To get your Discord bot token:**
1. Visit Discord Developer Portal (https://discord.com/developers/applications)
2. Select your application → Bot tab
3. Copy your bot token
4. Add it to Replit Secrets as DISCORD_TOKEN

**To get your Gemini API key:**
1. Visit Google AI Studio (https://aistudio.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API key"
4. Add it to Replit Secrets as GEMINI_API_KEY

**Note:** The bot works without Gemini API but provides enhanced AI features when configured.

## Features

### Core Features
1. **Intro Validation** - Ensures all 5 fields are present (Name, Role/Study, Interests, Skills, Goal)
2. **AI-Powered Analysis** - Google Gemini analyzes intros and assigns roles/experience levels
3. **Dynamic Embeds** - Color-coded embeds based on AI-detected skill level
4. **User Avatars** - Displays member profile pictures in embeds
5. **Profile Updates** - Replaces old profiles when users resubmit
6. **Slash Commands** - /updateintro and /deleteintro for easy management
7. **Error Handling** - Provides helpful messages listing missing fields
8. **Persistent Storage** - Tracks all user profiles in profiles.json
9. **Graceful Fallback** - Works without Gemini API using standard embeds

### Required Intro Format
Users must include all fields with exact emojis:
```
🎓 Name:
💼 Role / Study:
🤖 Interests:
🧠 Skills:
🚀 Goal:
```

## Technical Details

**Dependencies:**
- discord.js v14.14.1 - Discord API wrapper
- dotenv v16.3.1 - Environment variable management
- @google/genai v1.5.1 - Google Gemini AI SDK

**Discord Intents:**
- Guilds - Access server information
- GuildMessages - Read messages in channels
- MessageContent - Access message content

**Bot Permissions Required:**
- Read Messages/View Channels
- Send Messages
- Embed Links
- Read Message History
- Add Reactions

## Implemented Enhancements
- ✅ Slash commands (/updateintro, /deleteintro)
- ✅ AI-powered role detection and assignment
- ✅ Experience level categorization
- ✅ Dynamic color-coded embeds
- ✅ User avatar thumbnails

## Future Enhancements
- Auto role assignment in Discord based on completed intro
- Admin dashboard for intro statistics
- Customizable intro templates
- Multiple intro formats for different member types
- Advanced AI analytics (sentiment, engagement predictions)
