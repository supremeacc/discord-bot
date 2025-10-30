const { SlashCommandBuilder } = require('discord.js');
const { validateIntro } = require('../utils/validateIntro');
const { analyzeIntro } = require('../utils/geminiAnalyze');
const { formatAIEnhancedEmbed, formatEmbed } = require('../utils/formatEmbed');
const { getUserProfile, saveUserProfile, deleteUserProfile } = require('../utils/updateProfile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('updateintro')
    .setDescription('Update your introduction and profile')
    .addStringOption(option =>
      option.setName('intro')
        .setDescription('Your new introduction following the required format')
        .setRequired(true)
    ),

  async execute(interaction, profileChannelId) {
    await interaction.deferReply({ ephemeral: true });

    const introText = interaction.options.getString('intro');
    const userId = interaction.user.id;
    const username = interaction.user.username;
    const userAvatarUrl = interaction.user.displayAvatarURL();

    console.log(`🔄 /updateintro command from ${username}`);

    const validation = validateIntro(introText);

    if (!validation.isValid) {
      const missingFieldsList = validation.missingFields.join(', ');
      await interaction.editReply({
        content: `⚠️ Your introduction is incomplete.\nMissing fields: **${missingFieldsList}**\n\nPlease use the correct format:\n\n🎓 Name:\n💼 Role / Study:\n🤖 Interests:\n🧠 Skills:\n🚀 Goal:`
      });
      return;
    }

    try {
      const profileChannel = await interaction.client.channels.fetch(profileChannelId);
      
      const existingProfile = await getUserProfile(userId);
      if (existingProfile) {
        try {
          const oldMessage = await profileChannel.messages.fetch(existingProfile.messageId);
          await oldMessage.delete();
          console.log(`🗑️ Deleted old profile for ${username}`);
        } catch (err) {
          console.log(`⚠️  Could not delete old profile (may have been manually deleted)`);
        }
      }

      console.log('🤖 Analyzing intro with Gemini AI...');
      const geminiResult = await analyzeIntro(introText);

      let profileEmbed;
      
      if (geminiResult.success) {
        console.log('✨ Using AI-enhanced embed');
        profileEmbed = formatAIEnhancedEmbed(
          validation.fields,
          geminiResult.data,
          username,
          userAvatarUrl
        );
      } else {
        console.log('⚠️  Gemini failed, using standard embed');
        profileEmbed = formatEmbed(validation.fields, username, userAvatarUrl);
      }

      const profileMessage = await profileChannel.send({ embeds: [profileEmbed] });
      await saveUserProfile(userId, profileMessage.id);

      await interaction.editReply({
        content: `✅ Your profile has been updated successfully! Check <#${profileChannelId}>`
      });

      console.log(`✨ Profile updated for ${username} via slash command`);

    } catch (error) {
      console.error('❌ Error updating profile:', error);
      await interaction.editReply({
        content: '❌ Sorry, there was an error updating your profile. Please try again.'
      });
    }
  }
};
