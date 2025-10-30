require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const { validateIntro, requiredFields } = require('./utils/validateIntro');
const { formatEmbed, formatAIEnhancedEmbed } = require('./utils/formatEmbed');
const { getUserProfile, saveUserProfile, deleteUserProfile } = require('./utils/updateProfile');
const { analyzeIntro } = require('./utils/geminiAnalyze');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    console.log(`📌 Loaded command: ${command.data.name}`);
  }
}

const INTRO_CHANNEL_ID = process.env.INTRO_CHANNEL_ID;
const PROFILE_CHANNEL_ID = process.env.PROFILE_CHANNEL_ID;
const GEMINI_ENABLED = !!process.env.GEMINI_API_KEY;

client.once('clientReady', async () => {
  console.log('✅ Bot is online!');
  console.log(`📝 Logged in as ${client.user.tag}`);
  console.log(`🎯 Listening to introductions in channel: ${INTRO_CHANNEL_ID}`);
  console.log(`📋 Posting profiles to channel: ${PROFILE_CHANNEL_ID}`);
  console.log(`🤖 Gemini AI: ${GEMINI_ENABLED ? 'Enabled ✅' : 'Disabled ⚠️'}`);
  
  const commands = [];
  for (const command of client.commands.values()) {
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN || process.env.TOKEN);

  try {
    console.log('🔄 Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('✅ Slash commands registered successfully!');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
  
  console.log('-----------------------------------');
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  if (message.channel.id !== INTRO_CHANNEL_ID) return;

  console.log(`📨 New message from ${message.author.tag}`);

  const validation = validateIntro(message.content);

  if (validation.isValid) {
    console.log(`✅ Valid intro detected from ${message.author.tag}`);
    
    try {
      const profileChannel = await client.channels.fetch(PROFILE_CHANNEL_ID);
      const userAvatarUrl = message.author.displayAvatarURL();
      
      const existingProfile = await getUserProfile(message.author.id);
      if (existingProfile) {
        try {
          const oldMessage = await profileChannel.messages.fetch(existingProfile.messageId);
          await oldMessage.delete();
          console.log(`🔄 Deleted old profile for ${message.author.tag}`);
        } catch (err) {
          console.log(`⚠️  Could not delete old profile message (may have been manually deleted)`);
        }
      }

      let profileEmbed;
      
      if (GEMINI_ENABLED) {
        console.log('🤖 Analyzing intro with Gemini AI...');
        const geminiResult = await analyzeIntro(message.content);
        
        if (geminiResult.success) {
          console.log('✨ Using AI-enhanced embed');
          profileEmbed = formatAIEnhancedEmbed(
            validation.fields,
            geminiResult.data,
            message.author.username,
            userAvatarUrl
          );
        } else {
          console.log('⚠️  Gemini analysis failed, using standard embed');
          profileEmbed = formatEmbed(validation.fields, message.author.username, userAvatarUrl);
        }
      } else {
        console.log('📋 Using standard embed (Gemini not configured)');
        profileEmbed = formatEmbed(validation.fields, message.author.username, userAvatarUrl);
      }

      const profileMessage = await profileChannel.send({ embeds: [profileEmbed] });
      
      await saveUserProfile(message.author.id, profileMessage.id);
      
      console.log(`✨ Posted profile for ${message.author.tag} to #profiles`);
      
      await message.react('✅');
      
    } catch (error) {
      console.error('❌ Error posting profile:', error);
      await message.reply('⚠️ Sorry, there was an error processing your introduction. Please try again.');
    }
    
  } else {
    console.log(`⚠️  Incomplete intro from ${message.author.tag}`);
    console.log(`   Missing: ${validation.missingFields.join(', ')}`);
    
    const missingFieldsList = validation.missingFields.join(', ');
    const helpMessage = `⚠️ Your introduction seems incomplete.
Missing fields: **${missingFieldsList}**

Please resend your intro in this format:

🎓 Name:  
💼 Role / Study:  
🤖 Interests:  
🧠 Skills:  
🚀 Goal:`;

    await message.reply(helpMessage);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`❌ No command matching ${interaction.commandName} found.`);
    return;
  }

  try {
    await command.execute(interaction, PROFILE_CHANNEL_ID);
  } catch (error) {
    console.error('❌ Error executing command:', error);
    const replyMethod = interaction.replied || interaction.deferred ? 'editReply' : 'reply';
    await interaction[replyMethod]({
      content: '❌ There was an error executing this command!',
      ephemeral: true
    });
  }
});

const token = process.env.DISCORD_TOKEN || process.env.TOKEN;

if (!token) {
  console.error('❌ ERROR: No Discord token found!');
  console.error('Please add DISCORD_TOKEN or TOKEN to your environment secrets.');
  process.exit(1);
}

if (!INTRO_CHANNEL_ID || !PROFILE_CHANNEL_ID) {
  console.error('❌ ERROR: Channel IDs not configured!');
  console.error('Please add INTRO_CHANNEL_ID and PROFILE_CHANNEL_ID to your environment.');
  process.exit(1);
}

client.login(token).catch(error => {
  console.error('❌ Failed to login to Discord:', error.message);
  process.exit(1);
});
