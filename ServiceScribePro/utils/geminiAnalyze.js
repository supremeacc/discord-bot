const { GoogleGenAI } = require('@google/genai');

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function analyzeIntro(introText) {
  if (!process.env.GEMINI_API_KEY) {
    return {
      success: false,
      error: 'Gemini API key not configured'
    };
  }

  try {
    console.log('🤖 Sending intro to Gemini for AI analysis...');
    
    const prompt = `Analyze this user introduction for clarity, skill level, and tone.
Then refine it into a short, clean version for a Discord profile embed.
Based on the content, assign a suitable "Role" title (e.g., Beginner, Intermediate, Expert, AI Researcher, Automation Builder, Student, Developer, etc.).

User Introduction:
${introText}

Respond with JSON containing:
- refined_intro: A short refined summary (2-3 sentences max)
- role: An appropriate role title based on their skills and interests
- experience_level: Either "beginner", "intermediate", or "expert"
- color: A hex color code (e.g., "#3498DB") that matches their experience level`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            refined_intro: { type: 'string' },
            role: { type: 'string' },
            experience_level: { 
              type: 'string',
              enum: ['beginner', 'intermediate', 'expert']
            },
            color: { type: 'string' }
          },
          required: ['refined_intro', 'role', 'experience_level', 'color']
        }
      }
    });
    
    const jsonText = response.text;
    
    console.log('✅ Gemini analysis received');
    console.log(`Raw JSON: ${jsonText}`);
    
    const analysis = JSON.parse(jsonText);
    
    return {
      success: true,
      data: analysis
    };
    
  } catch (error) {
    console.error('❌ Gemini API error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

function getExperienceColor(experienceLevel) {
  const colorMap = {
    'beginner': 0x57F287,
    'intermediate': 0xFEE75C,
    'expert': 0xED4245
  };
  
  return colorMap[experienceLevel.toLowerCase()] || 0x5865F2;
}

module.exports = {
  analyzeIntro,
  getExperienceColor
};
