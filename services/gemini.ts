
import { GoogleGenAI } from "@google/genai";
import { TrendItem, Source, SocialPlatform, UserPersona } from "../types";
import { v4 as uuidv4 } from 'uuid';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to parse the custom text format into objects
const parseTrendsFromText = (text: string, sources: Source[]): TrendItem[] => {
  const trends: TrendItem[] = [];
  const entries = text.split('---').map(e => e.trim()).filter(e => e.length > 0);

  entries.forEach(entry => {
    const lines = entry.split('\n');
    let title = "Untitled Trend";
    let category = "General";
    let summary = "";
    let impactScore = 50;
    let sentiment: 'Positive' | 'Neutral' | 'Mixed' = 'Neutral';
    let advice = "Keep an eye on this trend.";

    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.startsWith('title:')) title = line.substring(6).trim();
      else if (lowerLine.startsWith('category:')) category = line.substring(9).trim();
      else if (lowerLine.startsWith('impact:')) {
        const val = parseInt(line.substring(7).trim());
        if (!isNaN(val)) impactScore = val;
      }
      else if (lowerLine.startsWith('sentiment:')) {
        const s = line.substring(10).trim();
        if (s.includes('Positive')) sentiment = 'Positive';
        else if (s.includes('Mixed')) sentiment = 'Mixed';
        else sentiment = 'Neutral';
      }
      else if (lowerLine.startsWith('summary:')) summary = line.substring(8).trim();
      else if (lowerLine.startsWith('actionable tip:')) advice = line.substring(15).trim();
    });

    if (title !== "Untitled Trend") {
      trends.push({
        id: uuidv4(),
        title: title.replace(/\*\*/g, ''), 
        category: category.replace(/\*\*/g, ''),
        summary: summary.replace(/\*\*/g, ''),
        impactScore,
        sentiment,
        advice: advice.replace(/\*\*/g, ''),
        sources: sources
      });
    }
  });

  return trends;
};

export const fetchTrends = async (topic: string, persona: UserPersona = 'General'): Promise<TrendItem[]> => {
  try {
    const model = 'gemini-3-flash-preview'; 
    
    const formatInstructions = `
      Format each trend EXACTLY like this:
      Title: [Catchy, simple title]
      Category: [Simple Topic Name]
      Impact: [Number 1-100 representing how big this deal is]
      Sentiment: [Positive/Neutral/Mixed]
      Summary: [Concise explanation tailored specifically for a ${persona}]
      Actionable Tip: [One strategic move a ${persona} should make regarding this]
      ---
    `;

    const personaInstruction = `
      You are an expert marketing consultant advising a ${persona}.
      Your explanation (Summary) and advice (Actionable Tip) MUST be highly relevant to their specific goals.
      
      - If Small Business Owner: Focus on budget-friendly, high-ROI, do-it-yourself tactics.
      - If Agency Owner: Focus on how to sell this as a service or upsell clients.
      - If Content Creator: Focus on engagement, virality, and community building.
      - If Enterprise CMO: Focus on scalability, brand safety, and market leadership.
      - If General Reader: Keep it simple and educational.
    `;

    const prompt = `
      Search for the latest digital marketing trends related to "${topic}".
      ${personaInstruction}
      Identify 6 distinct trends.
      ${formatInstructions}
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '';
    
    // Extract sources from grounding chunks
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: Source[] = [];
    
    chunks.forEach(chunk => {
      if (chunk.web?.uri && chunk.web?.title) {
        sources.push({
          title: chunk.web.title,
          uri: chunk.web.uri
        });
      }
    });

    // Deduplicate sources
    const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => t.uri === v.uri) === i);

    return parseTrendsFromText(text, uniqueSources);
  } catch (error) {
    console.error("Error fetching trends:", error);
    return [];
  }
};

export const generateSocialPost = async (trend: TrendItem, platform: SocialPlatform): Promise<string> => {
  try {
    let styleGuide = "";
    
    switch (platform) {
      case 'LinkedIn':
        styleGuide = "Professional, insightful, structured with bullet points. Focus on business impact. Add 3-5 relevant hashtags at the end.";
        break;
      case 'Twitter':
        styleGuide = "Short, punchy, engaging. Under 280 characters if possible, or a short thread hook. Use emojis and 2 hashtags.";
        break;
      case 'Newsletter':
        styleGuide = "Conversational, 'Hey there' tone, educational, value-first. Explain why this matters to the reader.";
        break;
      case 'TikTok':
        styleGuide = "Video Script format. HOOK: (Visual + Audio), BODY: (Explanation), CTA: (What to comment). energetic tone.";
        break;
    }

    const prompt = `
      Act as an expert social media manager.
      Write a post for ${platform} based on this digital marketing trend:
      
      Title: ${trend.title}
      Summary: ${trend.summary}
      Actionable Tip: ${trend.advice}
      
      Style Guide: ${styleGuide}
      
      Only return the content of the post/script. Do not include introductory text like "Here is the post".
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Could not generate content. Please try again.";
  } catch (error) {
    console.error("Error generating post:", error);
    return "Error generating content. Please check your connection.";
  }
};
