const { EmbedBuilder } = require('discord.js');

function formatEmbed(fields, username, userAvatarUrl = null) {
  const colors = [
    0x5865F2,
    0x57F287,
    0xFEE75C,
    0xEB459E,
    0xED4245,
    0x3498DB,
    0x9B59B6,
    0x1ABC9C
  ];
  
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const embed = new EmbedBuilder()
    .setTitle('🎓 Member Introduction')
    .setColor(randomColor)
    .addFields(
      { name: '🎓 Name', value: fields['Name'], inline: false },
      { name: '💼 Role / Study', value: fields['Role / Study'], inline: false },
      { name: '🤖 Interests', value: fields['Interests'], inline: false },
      { name: '🧠 Skills', value: fields['Skills'], inline: false },
      { name: '🚀 Goal', value: fields['Goal'], inline: false }
    )
    .setFooter({ text: `👤 Added by ${username}` })
    .setTimestamp();

  if (userAvatarUrl) {
    embed.setThumbnail(userAvatarUrl);
  }

  return embed;
}

function formatAIEnhancedEmbed(fields, geminiAnalysis, username, userAvatarUrl) {
  let embedColor;
  
  if (geminiAnalysis.color && geminiAnalysis.color.startsWith('#')) {
    embedColor = parseInt(geminiAnalysis.color.replace('#', ''), 16);
  } else {
    const experienceColors = {
      'beginner': 0x57F287,
      'intermediate': 0xFEE75C,
      'expert': 0xED4245
    };
    embedColor = experienceColors[geminiAnalysis.experience_level] || 0x5865F2;
  }

  const embed = new EmbedBuilder()
    .setTitle('🎓 Member Introduction')
    .setDescription(geminiAnalysis.refined_intro)
    .setColor(embedColor)
    .addFields(
      { name: '💼 Role', value: geminiAnalysis.role, inline: true },
      { name: '📊 Level', value: geminiAnalysis.experience_level.charAt(0).toUpperCase() + geminiAnalysis.experience_level.slice(1), inline: true },
      { name: '🎓 Name', value: fields['Name'], inline: false },
      { name: '🤖 Interests', value: fields['Interests'], inline: false },
      { name: '🧠 Skills', value: fields['Skills'], inline: false },
      { name: '🚀 Goal', value: fields['Goal'], inline: false }
    )
    .setFooter({ text: `👤 Added by ${username}` })
    .setTimestamp();

  if (userAvatarUrl) {
    embed.setThumbnail(userAvatarUrl);
  }

  return embed;
}

module.exports = { formatEmbed, formatAIEnhancedEmbed };
