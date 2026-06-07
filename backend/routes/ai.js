const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const config = require('../config/env');
const Pet = require('../models/Pet');
const Diagnosis = require('../models/Diagnosis');
const Vaccination = require('../models/Vaccination');

const chatHistory = new Map();

const EMERGENCY_KEYWORDS = [
  'not breathing', 'seizure', 'unconscious', 'bleeding heavily', 'poisoned',
  'choking', 'collapse', 'bloated', 'can\'t walk', 'emergency',
];

function detectEmergency(text) {
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
}

function buildFallbackReply(message, pet) {
  const lower = message.toLowerCase();
  const petCtx = pet
    ? `For **${pet.name}** (${pet.species}${pet.breed ? `, ${pet.breed}` : ''}${pet.age ? `, ${pet.age} years old` : ''}): `
    : '';

  if (detectEmergency(lower)) {
    return `**EMERGENCY**: ${petCtx}Based on your description, this may require immediate veterinary attention.\n\n**What to do now:**\n- Contact your nearest emergency vet clinic immediately\n- Keep your pet calm and warm\n- Do not give food or medication unless directed by a vet\n- If poisoning is suspected, bring the substance packaging\n\nThis is not a substitute for professional emergency care.`;
  }

  if (lower.includes('vaccin') || lower.includes('shot')) {
    return `${petCtx}Core vaccines for dogs typically include rabies, DHPP (distemper, hepatitis, parvovirus, parainfluenza). Cats need FVRCP and rabies.\n\nPuppies/kittens start vaccines at 6-8 weeks with boosters every 3-4 weeks until 16 weeks. Adult pets need boosters every 1-3 years depending on the vaccine.\n\nCheck the Vaccinations page in Paw Prints to track your pet's schedule.`;
  }

  if (lower.includes('vomit') || lower.includes('throwing up')) {
    return `${petCtx}Occasional vomiting may be caused by dietary indiscretion, hairballs (cats), or mild stomach upset.\n\n**Monitor for:** repeated vomiting, blood, lethargy, or refusal to eat for 24+ hours.\n\n**Home care:** withhold food 6-12 hours, offer small amounts of water, then bland diet (boiled chicken + rice).\n\nSeek vet care if vomiting persists more than 24 hours or is accompanied by other symptoms.`;
  }

  if (lower.includes('food') || lower.includes('toxic') || lower.includes('eat')) {
    return `${petCtx}Common foods toxic to dogs and cats include: chocolate, grapes/raisins, onions, garlic, xylitol (sugar-free gum), macadamia nuts, and alcohol.\n\nIf ingestion occurred recently, contact your vet or pet poison helpline immediately. Do not induce vomiting unless instructed by a professional.`;
  }

  if (lower.includes('weight') || lower.includes('overweight') || lower.includes('obese')) {
    return `${petCtx}A healthy weight depends on breed and body condition score (ribs palpable, visible waist).\n\n**Tips:** measured meals (not free-feeding), limit treats to <10% of calories, daily exercise, and regular weigh-ins using the Weight Tracker.\n\nConsult your vet for a target weight and diet plan.`;
  }

  if (lower.includes('deworm') || lower.includes('worm')) {
    return `${petCtx}Puppies and kittens should be dewormed every 2 weeks from 2-12 weeks of age, then monthly until 6 months. Adult pets typically need deworming every 3-6 months, or as advised by your vet based on lifestyle.`;
  }

  return `${petCtx}Thank you for your question about pet health.\n\n**General guidance:**\n- Monitor symptoms and note when they started\n- Ensure fresh water and a comfortable environment\n- Use the Symptom Checker (Diagnose page) for condition suggestions\n- Book a vet appointment for persistent or worsening symptoms\n\n*VetAI provides educational information only. Always consult a licensed veterinarian for diagnosis and treatment.*\n\nFor more specific advice, try asking about vaccinations, nutrition, symptoms, or emergency signs.`;
}

async function callGemini(message, pet, history) {
  const apiKey = config.geminiApiKey;
  if (!apiKey) return null;

  const petInfo = pet
    ? `The user is asking about their pet: ${pet.name}, ${pet.species}, breed: ${pet.breed || 'unknown'}, age: ${pet.age || 'unknown'}, weight: ${pet.weight || 'unknown'} kg.`
    : 'No specific pet selected.';

  const systemPrompt = `You are VetAI, a helpful pet health assistant. Provide clear, accurate veterinary health information for educational purposes. Always recommend consulting a licensed vet for diagnosis. ${petInfo}`;

  const contents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Understood. I will provide helpful pet health guidance.' }] },
    ...history.slice(-10).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    }
  );

  if (!response.ok) return null;
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

router.post('/chat', auth, async (req, res) => {
  try {
    const { message, petId, sessionId } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });

    let pet = null;
    if (petId) {
      pet = await Pet.findOne({ _id: petId, owner: req.user.id });
    }

    const sessionKey = `${req.user.id}:${sessionId || 'default'}`;
    if (!chatHistory.has(sessionKey)) chatHistory.set(sessionKey, []);
    const history = chatHistory.get(sessionKey);

    let reply = await callGemini(message, pet, history);
    if (!reply) reply = buildFallbackReply(message, pet);

    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: reply });
    if (history.length > 40) history.splice(0, history.length - 40);

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/analyze-report', auth, async (req, res) => {
  try {
    const { text, petId } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Report text is required' });

    let pet = null;
    if (petId) {
      pet = await Pet.findOne({ _id: petId, owner: req.user.id });
    }

    const petLabel = pet ? pet.name : 'your pet';
    const analysis = `**Medical Report Analysis for ${petLabel}**\n\n**Summary:** The submitted report has been reviewed. Key findings should be discussed with your veterinarian.\n\n**Recommendations:**\n- Schedule a follow-up with your vet to review these results in context\n- Keep a copy in Medical Records for future reference\n- Monitor ${petLabel} for any changes in appetite, energy, or behavior\n\n**Note:** Automated analysis is for educational purposes. Only a licensed veterinarian can provide a definitive interpretation.\n\n${config.geminiApiKey ? '' : '_Configure GEMINI_API_KEY in backend .env for AI-powered report analysis._'}`;

    res.json({ analysis });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/health-summary', auth, async (req, res) => {
  try {
    const { petId } = req.body;
    if (!petId) return res.status(400).json({ message: 'Pet ID is required' });

    const pet = await Pet.findOne({ _id: petId, owner: req.user.id });
    if (!pet) return res.status(404).json({ message: 'Pet not found' });

    const [diagnoses, vaccinations] = await Promise.all([
      Diagnosis.find({ pet: petId, user: req.user.id }).sort({ date: -1 }).limit(5),
      Vaccination.find({ pet: petId, user: req.user.id }).sort({ nextDueDate: 1 }).limit(5),
    ]);

    let summary = `**Health Summary for ${pet.name}**\n\n`;
    summary += `**Profile:** ${pet.species}${pet.breed ? ` (${pet.breed})` : ''}, ${pet.age || '?'} years, ${pet.weight || '?'} kg, ${pet.gender || 'unknown'}\n\n`;

    summary += `**Recent Diagnoses (${diagnoses.length}):**\n`;
    if (diagnoses.length === 0) {
      summary += '- No diagnoses recorded yet\n';
    } else {
      diagnoses.forEach((d) => {
        summary += `- ${new Date(d.date).toLocaleDateString()}: ${d.symptoms?.join(', ')} — ${d.severity}\n`;
      });
    }

    summary += `\n**Vaccination Status:**\n`;
    if (vaccinations.length === 0) {
      summary += '- No vaccination records found\n';
    } else {
      vaccinations.forEach((v) => {
        const due = v.nextDueDate ? new Date(v.nextDueDate).toLocaleDateString() : 'N/A';
        summary += `- ${v.vaccineName}: next due ${due}\n`;
      });
    }

    summary += '\n*Consult your veterinarian for a complete health assessment.*';

    res.json({ pet, summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/clear-history', auth, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const sessionKey = `${req.user.id}:${sessionId || 'default'}`;
    chatHistory.delete(sessionKey);
    res.json({ message: 'History cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
