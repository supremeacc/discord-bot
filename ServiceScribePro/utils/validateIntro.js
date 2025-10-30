const requiredFields = [
  { emoji: '🎓', name: 'Name' },
  { emoji: '💼', name: 'Role / Study' },
  { emoji: '🤖', name: 'Interests' },
  { emoji: '🧠', name: 'Skills' },
  { emoji: '🚀', name: 'Goal' }
];

function validateIntro(message) {
  const content = message.trim();
  const extractedFields = {};
  const missingFields = [];

  for (const field of requiredFields) {
    const regex = new RegExp(`${field.emoji}\\s*${field.name}\\s*:\\s*(.+?)(?=\\n|$)`, 'i');
    const match = content.match(regex);
    
    if (match && match[1].trim()) {
      extractedFields[field.name] = match[1].trim();
    } else {
      missingFields.push(field.name);
    }
  }

  return {
    isValid: missingFields.length === 0,
    fields: extractedFields,
    missingFields: missingFields
  };
}

module.exports = { validateIntro, requiredFields };
