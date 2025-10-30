const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

async function analyzeTeammateMatches(profiles, roleOrInterest) {
  const { GoogleGenAI } = require('@google/genai');
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  if (!process.env.GEMINI_API_KEY) {
    return {
      success: false,
      error: 'Gemini API key not configured'
    };
  }

  try {
    const profilesText = profiles.map((p, idx) => 
      `Profile ${idx + 1}:\nUsername: ${p.username}\nName: ${p.name}\nRole: ${p.role}\nInstitution: ${p.institution}\nInterests: ${p.interests}\nSkills: ${p.skills}\nGoal: ${p.goal}`
    ).join('\n\n');

    const prompt = `You are an AI teammate matching assistant. Based on the following user profiles from an AI community, find the top 3 members who would be great teammates for someone looking for "${roleOrInterest}".

Consider:
- Complementarity in skills (do they have skills that match the need?)
- Shared interests and alignment with the request
- Experience level and goals
- Potential for collaboration

User Profiles:
${profilesText}

Return a JSON array with exactly 3 matches (or fewer if less than 3 suitable candidates exist). Each match should have:
- username: The person's username
- reason_for_match: A brief, specific reason why they're a good match (1-2 sentences)
- compatibility_score: A number from 1-10 indicating match quality

Format: Return ONLY valid JSON array, nothing else.`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              username: { type: 'string' },
              reason_for_match: { type: 'string' },
              compatibility_score: { type: 'number' }
            },
            required: ['username', 'reason_for_match', 'compatibility_score']
          }
        }
      }
    });

    let jsonText = response.text;
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let firstBracket = jsonText.indexOf('[');
    let lastBracket = jsonText.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      jsonText = jsonText.substring(firstBracket, lastBracket + 1);
    }

    const matches = JSON.parse(jsonText);
    
    return {
      success: true,
      data: matches
    };

  } catch (error) {
    console.error('❌ Gemini teammate matching error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('find_teammate')
    .setDescription('Find suitable teammates based on skills and interests')
    .addStringOption(option =>
      option.setName('role_or_interest')
        .setDescription('What kind of teammate are you looking for? (e.g., "UI designer", "data scientist")')
        .setRequired(true)
    ),

  async execute(interaction, profileChannelId) {
    await interaction.deferReply();

    const roleOrInterest = interaction.options.getString('role_or_interest');
    const username = interaction.user.username;

    console.log(`🔍 /find_teammate command from ${username} looking for: ${roleOrInterest}`);

    try {
      const profileChannel = await interaction.client.channels.fetch(profileChannelId);
      
      const messages = await profileChannel.messages.fetch({ limit: 100 });
      
      const profiles = [];
      messages.forEach(msg => {
        if (msg.embeds.length > 0) {
          const embed = msg.embeds[0];
          
          if (embed.title && embed.title.includes('Member Introduction')) {
            const profile = {
              username: '',
              name: '',
              role: '',
              institution: '',
              interests: '',
              skills: '',
              goal: '',
              userId: null
            };

            const description = embed.description || '';
            const mentionMatch = description.match(/<@(\d+)>/);
            if (mentionMatch) {
              profile.userId = mentionMatch[1];
              const user = interaction.client.users.cache.get(mentionMatch[1]);
              if (user) {
                profile.username = user.username;
              }
            }

            embed.fields.forEach(field => {
              const fieldName = field.name.toLowerCase();
              if (fieldName.includes('name')) {
                profile.name = field.value;
              } else if (fieldName.includes('role')) {
                profile.role = field.value;
              } else if (fieldName.includes('institution')) {
                profile.institution = field.value;
              } else if (fieldName.includes('interests')) {
                profile.interests = field.value;
              } else if (fieldName.includes('skills')) {
                profile.skills = field.value;
              } else if (fieldName.includes('goal')) {
                profile.goal = field.value;
              }
            });

            if (profile.name && profile.skills) {
              profiles.push(profile);
            }
          }
        }
      });

      if (profiles.length === 0) {
        await interaction.editReply({
          content: '⚠️ No introductions found in the profiles channel.'
        });
        return;
      }

      console.log(`📊 Found ${profiles.length} profiles, analyzing with AI...`);

      const analysisResult = await analyzeTeammateMatches(profiles, roleOrInterest);

      if (!analysisResult.success) {
        await interaction.editReply({
          content: '⚠️ Sorry, there was an error analyzing teammate matches. Please try again.'
        });
        return;
      }

      const matches = analysisResult.data;

      if (!matches || matches.length === 0) {
        await interaction.editReply({
          content: `😔 No suitable matches found for "${roleOrInterest}". Try broadening your search criteria.`
        });
        return;
      }

      const maxScore = Math.max(...matches.map(m => m.compatibility_score));
      let embedColor;
      if (maxScore >= 9) {
        embedColor = 0x00FF7F;
      } else if (maxScore >= 7) {
        embedColor = 0xFFD700;
      } else {
        embedColor = 0x1E90FF;
      }

      const matchFields = matches.slice(0, 3).map(match => {
        const profile = profiles.find(p => 
          p.name.toLowerCase().includes(match.username.toLowerCase()) ||
          p.username.toLowerCase().includes(match.username.toLowerCase())
        );

        const userTag = profile && profile.userId ? `<@${profile.userId}>` : match.username;
        
        return {
          name: `🧑 ${match.username}`,
          value: `💬 ${match.reason_for_match}\n💯 Compatibility: **${match.compatibility_score}/10**`,
          inline: false
        };
      });

      const resultEmbed = new EmbedBuilder()
        .setTitle(`🤝 Best Teammate Matches for "${roleOrInterest}"`)
        .setDescription(`AI Learners Bot analyzed ${profiles.length} profiles and found your top teammate matches!`)
        .setColor(embedColor)
        .addFields(matchFields)
        .setFooter({ text: '🧩 Powered by AI Learners India Bot 🤖' })
        .setTimestamp();

      const taggedUsers = matches.slice(0, 3)
        .map(match => {
          const profile = profiles.find(p => 
            p.name.toLowerCase().includes(match.username.toLowerCase()) ||
            p.username.toLowerCase().includes(match.username.toLowerCase())
          );
          return profile && profile.userId ? `<@${profile.userId}>` : null;
        })
        .filter(tag => tag !== null)
        .join(' ');

      const responseContent = taggedUsers 
        ? `${taggedUsers}\n👋 You've been matched as potential teammates for **${roleOrInterest}**!`
        : '';

      await interaction.editReply({
        content: responseContent || undefined,
        embeds: [resultEmbed]
      });

      console.log(`✅ Teammate matches sent for "${roleOrInterest}"`);

    } catch (error) {
      console.error('❌ Error in find_teammate command:', error);
      await interaction.editReply({
        content: '❌ Sorry, there was an error finding teammates. Please try again.'
      });
    }
  }
};
