import { config } from '../config/env.js';

// If an OpenAI key is provided, real API calls are made.
// Otherwise, detailed mock responses are returned so the app
// runs fully end-to-end without any external dependency.

const USE_REAL_AI = Boolean(config.openaiApiKey);

// ── Waste Classification (text input) ─────────────────────────────────────────
export const classifyWasteFromText = async (text) => {
  if (USE_REAL_AI) return realClassifyText(text);
  return mockClassifyText(text);
};

// ── Waste Classification (image path) ────────────────────────────────────────
export const classifyWasteFromImage = async (imagePath) => {
  if (USE_REAL_AI) return realClassifyImage(imagePath);
  return mockClassifyImage(imagePath);
};

// ── Route Optimization ────────────────────────────────────────────────────────
export const generateRouteOptimization = async (stops) => {
  if (USE_REAL_AI) return realOptimizeRoute(stops);
  return mockOptimizeRoute(stops);
};

// ── Predictive Analytics ──────────────────────────────────────────────────────
export const generatePredictiveAnalytics = async () => {
  if (USE_REAL_AI) return realPredictAnalytics();
  return mockPredictAnalytics();
};

// ═══════════════════════════════════════════════════════
//  REAL AI IMPLEMENTATIONS  (OpenAI)
// ═══════════════════════════════════════════════════════

const realClassifyText = async (text) => {
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey: config.openaiApiKey });

  const prompt = `You are a waste management AI. Classify the following waste description.
Return ONLY valid JSON with these fields:
{
  "classifiedCategory": "general|recyclable|hazardous|organic|electronic|medical|construction|other",
  "isRecyclable": boolean,
  "disposalMethod": "string — 1-2 sentence disposal instruction",
  "tags": ["array", "of", "relevant", "tags"],
  "confidence": number between 0 and 1
}

Waste description: "${text}"`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 300,
  });

  const parsed = JSON.parse(response.choices[0].message.content);
  return { ...parsed, model: 'gpt-4o' };
};

const realClassifyImage = async (imagePath) => {
  const { default: OpenAI } = await import('openai');
  const { default: fs } = await import('fs');
  const client = new OpenAI({ apiKey: config.openaiApiKey });

  const imageData = fs.readFileSync(imagePath);
  const base64 = imageData.toString('base64');
  const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${base64}` },
          },
          {
            type: 'text',
            text: `Classify this waste image. Return ONLY valid JSON:
{
  "classifiedCategory": "general|recyclable|hazardous|organic|electronic|medical|construction|other",
  "isRecyclable": boolean,
  "disposalMethod": "1-2 sentence disposal instruction",
  "tags": ["array", "of", "tags"],
  "confidence": number between 0 and 1
}`,
          },
        ],
      },
    ],
    max_tokens: 300,
  });

  const parsed = JSON.parse(response.choices[0].message.content);
  return { ...parsed, model: 'gpt-4o' };
};

const realOptimizeRoute = async (stops) => {
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey: config.openaiApiKey });

  const prompt = `You are a route optimization AI for a waste collection fleet.
Given these pickup stops: ${JSON.stringify(stops)}
Return ONLY valid JSON:
{
  "optimizedOrder": [array of stop indices in optimal order],
  "routeSuggestion": "string — brief explanation of the optimization",
  "savedDistance": estimated km saved as a number,
  "originalDistance": estimated original distance in km,
  "optimizedDistance": estimated optimized distance in km
}`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 400,
  });

  const parsed = JSON.parse(response.choices[0].message.content);
  return { ...parsed, model: 'gpt-4o' };
};

const realPredictAnalytics = async () => {
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey: config.openaiApiKey });

  const prompt = `You are a waste analytics AI. Generate a waste generation forecast.
Return ONLY valid JSON:
{
  "forecastPeriod": "next_7_days",
  "predictedVolume": estimated total kg as number,
  "trend": "increasing|decreasing|stable",
  "recommendedActions": ["array of 3-4 actionable recommendations"],
  "summary": "2-3 sentence executive summary"
}`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 400,
  });

  const parsed = JSON.parse(response.choices[0].message.content);
  return { ...parsed, model: 'gpt-4o' };
};

// ═══════════════════════════════════════════════════════
//  MOCK IMPLEMENTATIONS  (no API key needed)
// ═══════════════════════════════════════════════════════

const MOCK_CATEGORIES = ['recyclable', 'general', 'organic', 'hazardous', 'electronic'];

const mockClassifyText = async (text) => {
  await delay(600); // Simulate network latency
  const lower = text.toLowerCase();
  let category = 'general';
  let isRecyclable = false;
  let disposalMethod = 'Place in the general waste bin for collection.';
  const tags = [];

  if (/plastic|bottle|bag|container|packaging/i.test(lower)) {
    category = 'recyclable'; isRecyclable = true;
    disposalMethod = 'Clean and place in the recycling bin. Remove caps and labels.';
    tags.push('plastic', 'recyclable');
  } else if (/food|vegetable|fruit|organic|compost/i.test(lower)) {
    category = 'organic'; isRecyclable = false;
    disposalMethod = 'Place in the organic/compost bin. Do not mix with other waste.';
    tags.push('organic', 'compostable');
  } else if (/battery|chemical|paint|solvent|hazardous|toxic/i.test(lower)) {
    category = 'hazardous'; isRecyclable = false;
    disposalMethod = 'Do NOT place in regular bins. Take to a certified hazardous waste facility.';
    tags.push('hazardous', 'special-handling');
  } else if (/phone|laptop|computer|tv|electronic|device|battery/i.test(lower)) {
    category = 'electronic'; isRecyclable = true;
    disposalMethod = 'Take to an e-waste collection centre. Never dispose in landfill.';
    tags.push('e-waste', 'recyclable');
  } else if (/paper|cardboard|newspaper|magazine/i.test(lower)) {
    category = 'recyclable'; isRecyclable = true;
    disposalMethod = 'Flatten cardboard and place in the paper recycling bin. Keep dry.';
    tags.push('paper', 'recyclable');
  }

  return {
    classifiedCategory: category,
    isRecyclable,
    disposalMethod,
    tags,
    confidence: parseFloat((0.75 + Math.random() * 0.2).toFixed(2)),
    model: 'mock',
  };
};

const mockClassifyImage = async (imagePath) => {
  await delay(800);
  const categories = ['recyclable', 'organic', 'general', 'electronic'];
  const category = categories[Math.floor(Math.random() * categories.length)];
  return {
    classifiedCategory: category,
    isRecyclable: ['recyclable', 'electronic'].includes(category),
    disposalMethod: `Detected as ${category} waste. Follow standard ${category} disposal protocols.`,
    tags: [category, 'image-scan'],
    confidence: parseFloat((0.70 + Math.random() * 0.25).toFixed(2)),
    model: 'mock',
  };
};

const mockOptimizeRoute = async (stops) => {
  await delay(700);
  const n = stops.length;
  const shuffled = [...Array(n).keys()].sort(() => Math.random() - 0.5);
  const original = 15 + n * 3;
  const optimized = parseFloat((original * 0.78).toFixed(1));
  return {
    optimizedOrder: shuffled,
    routeSuggestion: `Reordering ${n} stops by geographic proximity reduces backtracking and saves fuel. Start from the northernmost point and sweep south.`,
    originalDistance: original,
    optimizedDistance: optimized,
    savedDistance: parseFloat((original - optimized).toFixed(1)),
    model: 'mock',
  };
};

const mockPredictAnalytics = async () => {
  await delay(500);
  const trend = ['increasing', 'stable', 'decreasing'][Math.floor(Math.random() * 3)];
  const volume = Math.floor(800 + Math.random() * 400);
  return {
    forecastPeriod: 'next_7_days',
    predictedVolume: volume,
    trend,
    recommendedActions: [
      'Schedule an additional pickup run on Thursday based on predicted peak volume.',
      'Deploy the compactor truck to the North Zone — highest recyclable concentration expected.',
      'Alert residents in Zone B about organic waste separation ahead of the collection.',
      'Pre-position the hazmat vehicle for the industrial district on Friday.',
    ],
    summary: `Waste generation is expected to be ${trend} over the next 7 days with an estimated ${volume} kg total. Recyclable waste accounts for the largest share. Proactive scheduling adjustments are recommended.`,
    model: 'mock',
  };
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));