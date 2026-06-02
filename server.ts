import express from 'express';
import path from 'path';
import 'dotenv/config'; // loads .env automatically, but in AI Studio we get it via process.env anyway
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import { GoogleGenAI, Type } from '@google/genai';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const FOOD_ANALYSIS_SYSTEM_INSTRUCTION = `Analyze the food in this image.

If additional context is provided by the user, you MUST use that context to refine your analysis (e.g., if they mention "homemade", "extra cheese", or specific ingredients, factor that into your ingredient list and portion sizing).

Follow this reasoning sequence before producing numbers:
1. List every distinct food component you can see.
2. Estimate the portion weight of each item in grams.
   Use the plate as your reference — a standard dinner plate is 27cm (10.5 inches) across.
   If no plate is visible, state your reference object.
3. Identify inferred ingredients not directly visible: cooking oils, dressings, marinades, salt.
   Mark these as is_inferred: true. Estimate them conservatively.
4. Calculate total nutrition by summing each component.
5. Assign a health score from 1 to 10 based on: macronutrient balance, fiber content,
   sodium level, degree of processing, and vegetable-to-protein-to-carb ratio.
   Score 8-10 is reserved for meals that are genuinely balanced across all five factors.
6. Assign a Nutri-Score grade A through E consistent with the European Nutri-Score algorithm.
7. List applicable dietary flags. Only apply flags you are confident about.

If you cannot identify the food with reasonable confidence, return confidence: "Low"
and explain in coaching_tip what additional information would help.

The disclaimer field must always be: "Nutritional values are estimates for informational purposes only and not a substitute for professional dietary advice."`;

const COACH_SYSTEM_INSTRUCTION = `You are a direct, evidence-based, and warm nutrition coach.
Reference specific items from the user's data when helpful.
Never say "Great question" or use hollow affirmations.
Responses should be 3-5 sentences max unless the user asks for a detailed breakdown.
You cannot diagnose or prescribe.`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  app.post('/api/analyze-v2', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
      }

      const imagePart = {
        inlineData: {
          mimeType: req.file.mimetype,
          data: req.file.buffer.toString('base64'),
        },
      };

      const parts: any[] = [];
      const userContext = req.body.context;
      if (userContext && typeof userContext === 'string') {
        parts.push({ text: `User provided context for this meal: "${userContext}". Please thoroughly incorporate this context into your analysis.` });
      }
      parts.push(imagePart);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
          systemInstruction: FOOD_ANALYSIS_SYSTEM_INSTRUCTION,
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            required: [
              'meal_name',
              'confidence',
              'visual_breakdown',
              'nutrition',
              'health_score',
              'nutri_grade',
              'dietary_flags',
              'coaching_tip',
              'healthier_swaps',
              'disclaimer',
            ],
            properties: {
              meal_name: { type: Type.STRING },
              confidence: { type: Type.STRING },
              cuisine_type: { type: Type.STRING },
              visual_breakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item: { type: Type.STRING },
                    estimated_weight_grams: { type: Type.NUMBER },
                    is_inferred: { type: Type.BOOLEAN },
                  },
                  required: ['item', 'estimated_weight_grams', 'is_inferred'],
                },
              },
              nutrition: {
                type: Type.OBJECT,
                properties: {
                  calories: { type: Type.NUMBER },
                  protein_g: { type: Type.NUMBER },
                  carbohydrates_g: { type: Type.NUMBER },
                  fat_g: { type: Type.NUMBER },
                  fiber_g: { type: Type.NUMBER },
                  sugar_g: { type: Type.NUMBER },
                  sodium_mg: { type: Type.NUMBER },
                  saturated_fat_g: { type: Type.NUMBER },
                },
                required: ['calories', 'protein_g', 'carbohydrates_g', 'fat_g'],
              },
              health_score: { type: Type.NUMBER },
              nutri_grade: { type: Type.STRING },
              dietary_flags: { type: Type.ARRAY, items: { type: Type.STRING } },
              coaching_tip: { type: Type.STRING },
              healthier_swaps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    original: { type: Type.STRING },
                    swap_with: { type: Type.STRING },
                    benefit: { type: Type.STRING },
                  },
                },
              },
              disclaimer: { type: Type.STRING },
            },
          },
        },
      });

      const parsedJSON = JSON.parse(response.text || '{}');
      return res.json(parsedJSON);
    } catch (error: any) {
      console.error('Analysis error:', error);
      
      let errorMessage = error?.message || 'Unknown error during analysis.';
      
      // Specifically handle overloaded Gemini service
      if (errorMessage.includes('503') || errorMessage.includes('high demand') || errorMessage.includes('UNAVAILABLE')) {
        errorMessage = "Gemini model is currently experiencing high demand. Please try again in a moment.";
      }
      
      return res.status(500).json({ error: errorMessage });
    }
  });

  app.post('/api/coach/chat', async (req, res) => {
    try {
      const { message, mealHistory = [], userGoals = {} } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
      }

      const contextStr = `
User's Recent Meals:
${JSON.stringify(mealHistory, null, 2)}

User's Daily Goals:
${JSON.stringify(userGoals, null, 2)}
      `.trim();

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: COACH_SYSTEM_INSTRUCTION,
          temperature: 0.65,
        },
      });

      // Send the initial context silently inside the message if it's the first interaction
      const prompt = `Context data for this session:\n${contextStr}\n\nUser Message:\n${message}`;

      const response = await chat.sendMessage({ message: prompt });
      return res.json({ reply: response.text });
    } catch (error: any) {
      console.error('Coach chat error:', error);
      let errorMessage = error?.message || 'Unknown error';
      if (errorMessage.includes('503') || errorMessage.includes('high demand') || errorMessage.includes('UNAVAILABLE')) {
        errorMessage = "Gemini coach is currently experiencing high demand. Please try again in a moment.";
      }
      return res.status(500).json({ error: errorMessage });
    }
  });

  // --- Vite Middleware ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global error handler so any middleware errors (like PayloadTooLarge) return JSON
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Express Error:', err);
    if (!res.headersSent) {
      if (req.path.startsWith('/api/')) {
        res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
      } else {
        next(err);
      }
    } else {
      next(err);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
