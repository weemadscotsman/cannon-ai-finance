import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Credit costs for different operations
const CREDIT_COSTS = {
  briefing: 1,
  planning: 5,
  planning_audio: 1,
  live_session: 20,
  receipt_scan: 2,
};

// Middleware to check AI credits
async function checkCredits(req: any, res: any, next: any) {
  const clerkId = req.auth.userId;
  const operation = req.body.operation || 'briefing';
  const cost = CREDIT_COSTS[operation as keyof typeof CREDIT_COSTS] || 1;

  const user = await prisma.user.findUnique({ where: { clerkId } });
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Pro/Business users have unlimited credits
  if (user.plan !== 'free') {
    req.user = user;
    return next();
  }

  // Check if user has enough credits
  if (user.aiCreditsUsed + cost > user.aiCreditsLimit) {
    return res.status(403).json({
      error: 'AI credit limit reached',
      used: user.aiCreditsUsed,
      limit: user.aiCreditsLimit,
      upgradeUrl: '/pricing'
    });
  }

  // Deduct credits
  await prisma.user.update({
    where: { id: user.id },
    data: { aiCreditsUsed: user.aiCreditsUsed + cost }
  });

  req.user = user;
  next();
}

// Generate financial plan
router.post('/plan', checkCredits, async (req: any, res) => {
  try {
    const { prompt } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'AI generation failed' });
  }
});

// Text-to-speech
router.post('/speak', checkCredits, async (req: any, res) => {
  try {
    const { text } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } }
        }
      }
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    res.json({ audio: audioData });
  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({ error: 'Text-to-speech failed' });
  }
});

// Parse receipt
router.post('/receipt', checkCredits, async (req: any, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType } },
          { text: 'Extract: {name, amount, category}. JSON only.' }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Receipt Error:', error);
    res.status(500).json({ error: 'Receipt parsing failed' });
  }
});

// Get user's AI usage
router.get('/usage', async (req: any, res) => {
  try {
    const clerkId = req.auth.userId;
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { aiCreditsUsed: true, aiCreditsLimit: true, plan: true }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch usage' });
  }
});

export { router as aiRouter };
