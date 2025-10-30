# Discord Intro Manager Bot

A Discord bot for the AI Learners India community that automatically validates and formats member introductions with **AI-powered analysis**.

## Features

- ✅ Validates introduction format with required fields
- 🤖 **AI-Enhanced Analysis** - Uses Google Gemini to analyze intros and assign roles/experience levels
- 🎨 **Dynamic Embeds** - Color-coded profiles based on skill level (beginner/intermediate/expert)
- 🖼️ **User Avatars** - Displays member profile pictures in embeds
- 📋 Posts beautifully formatted embeds to the profiles channel
- 🔄 Updates existing profiles when users resubmit
- ⚠️ Provides helpful error messages for incomplete intros
- 💾 Tracks user profiles in a persistent JSON file
- ⚡ **Slash Commands** - `/updateintro` and `/deleteintro` for easy management

## Setup Instructions

### 1. Get Your Channel IDs

You need two Discord channel IDs:

**To get a channel ID:**
1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
2. Right-click on the channel → Copy ID

You'll need:
- `INTRO_CHANNEL_ID` - The channel where users post their intros (e.g., #introductions)
- `PROFILE_CHANNEL_ID` - The channel where formatted profiles are posted (e.g., #profiles)

### 2. Get Your Discord Bot Token

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application (or create a new one)
3. Go to the **Bot** tab
4. Click **Reset Token** or **Copy** to get your bot token
5. Keep this token secure - never share it publicly!

### 3. Get Your Google Gemini API Key (Optional but Recommended)

For AI-powered intro analysis:

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API key"**
4. Copy your API key

**Note:** Gemini API is free with generous rate limits! The bot works without it but provides enhanced features with AI analysis.

### 4. Configure Environment Variables

In Replit, go to the **Secrets** panel (lock icon 🔒) and add these secrets:

| Key | Value | Description |
|-----|-------|-------------|
| `DISCORD_TOKEN` | Your bot token | Token from Discord Developer Portal |
| `INTRO_CHANNEL_ID` | Your channel ID | Channel where users post intros |
| `PROFILE_CHANNEL_ID` | Your channel ID | Channel for formatted profiles |
| `GEMINI_API_KEY` | Your Gemini API key | *(Optional)* For AI-enhanced features |

### 5. Bot Permissions

When inviting your bot to your Discord server, make sure it has these permissions:
- Read Messages/View Channels
- Send Messages
- Embed Links
- Read Message History
- Add Reactions

### 6. Run the Bot

Click the **Run** button in Replit, or use:
```bash
npm start
```

## How It Works

### Valid Introduction Format

Users must post their intro in this format:

```
🎓 Name: Your Name
💼 Role / Study: Your Role or Studies
🤖 Interests: Your Interests
🧠 Skills: Your Skills
🚀 Goal: Your Goal
```

**Example:**
```
🎓 Name: Amit Singh
💼 Role / Study: B.Tech CS Student
🤖 Interests: AI, Automation
🧠 Skills: Python, ChatGPT, n8n
🚀 Goal: Build automation workflows
```

### What Happens

**If the intro is complete (with Gemini AI):**
- 🤖 Bot sends intro to Gemini AI for analysis
- 🎨 AI assigns a role (e.g., "Automation Builder", "AI Researcher")
- 📊 Determines experience level (Beginner/Intermediate/Expert)
- 🌈 Selects appropriate color (Green for beginners, Yellow for intermediate, Red for experts)
- ✨ Creates refined summary of the introduction
- 📋 Posts AI-enhanced embed to #profiles with user's avatar
- ✅ Reacts with a checkmark

**If Gemini is unavailable or fails:**
- 📋 Falls back to standard embed format
- 🎨 Uses random colors
- ✅ Still posts profile successfully

**If the intro is incomplete:**
- ⚠️ Bot replies with missing fields
- 📝 Provides the correct format template

**If a user updates their intro:**
- 🔄 Bot deletes their old profile
- ✨ Posts the new AI-analyzed profile

## Slash Commands

### `/updateintro`
Allows users to update their introduction manually.

**Usage:** `/updateintro intro: [your new intro]`

- Validates the new intro format
- Analyzes with Gemini AI (if available)
- Updates profile in #profiles channel
- Deletes old profile automatically

### `/deleteintro` (Admin Only)
Allows moderators to delete a user's profile.

**Usage:** `/deleteintro user: @username`

- Requires "Manage Messages" permission
- Deletes profile from #profiles channel
- Removes from database

## Project Structure

```
discord-intro-bot/
├── index.js                 # Main bot logic & command handler
├── package.json             # Dependencies
├── .env.example             # Environment variable template
├── commands/
│   ├── updateIntro.js      # /updateintro slash command
│   └── deleteIntro.js      # /deleteintro slash command
├── utils/
│   ├── validateIntro.js    # Validates intro format
│   ├── geminiAnalyze.js    # AI analysis with Gemini
│   ├── formatEmbed.js      # Creates Discord embeds
│   └── updateProfile.js    # Manages user profiles
└── profiles.json           # Stores user profile data (auto-created)
```

## AI-Enhanced Features

When **GEMINI_API_KEY** is configured, the bot provides:

- 🤖 **Smart Role Detection** - AI analyzes skills and assigns appropriate roles
- 📊 **Experience Leveling** - Automatically categorizes as Beginner/Intermediate/Expert
- 🎨 **Intelligent Color Coding** - Dynamic colors based on skill level
- ✨ **Refined Summaries** - AI creates concise, professional intro descriptions
- 🧠 **Fallback Support** - Gracefully handles API failures

**Without Gemini:** Bot still works perfectly with standard embeds and random colors.

## Troubleshooting

### Bot doesn't respond
- Check that the channel IDs are correct
- Verify the bot has the required permissions
- Make sure the bot is online (check console logs)

### "Missing fields" error
- Ensure all 5 fields are included with the exact emojis
- Check for typos in field names (e.g., "Role / Study" not "Role/Study")

### Profile not updating
- Verify the PROFILE_CHANNEL_ID is correct
- Check bot has permission to delete messages in that channel

### Gemini AI not working
- Verify GEMINI_API_KEY is set in Replit Secrets
- Check console logs for API errors
- Bot will automatically fall back to standard embeds if Gemini fails

## Console Logs

The bot logs all important actions:
- ✅ Bot startup and login
- 📨 New messages received
- ✅ Valid intros detected
- ⚠️ Incomplete intros with missing fields
- ✨ Profiles posted successfully
- 🔄 Old profiles deleted
- ❌ Any errors that occur

## Support

Check the console logs for detailed information about what the bot is doing. All actions are logged for easy debugging.
