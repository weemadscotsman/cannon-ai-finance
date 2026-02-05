
import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";
import { MODEL_PLANNER, MODEL_CHAT, MODEL_MAPS, MODEL_VEO, MODEL_IMAGE_EDIT, MODEL_TTS, MODEL_TRANSCRIPTION } from "../constants";

// Helper for encoding/decoding
export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function createPcmBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}


// --- API FUNCTIONS ---

// 1. Efficient Planner (Gemini 3 Flash - Token Golf Mode + Streaming)
export async function generateFinancialPlanStream(densePrompt: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Using generateContentStream for instant feedback
  const response = await ai.models.generateContentStream({
    model: MODEL_PLANNER,
    contents: densePrompt, 
  });
  return response;
}

// Keep the non-streaming version just in case, or for other uses
export async function generateFinancialPlan(densePrompt: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODEL_PLANNER,
    contents: densePrompt,
  });
  return response.text;
}

// New: Parallel Insight Generation for Fast Audio
export async function generateFastAudioInsight(densePrompt: string): Promise<AudioBuffer | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Step 1: Generate a short, punchy summary (Fast)
    const textResponse = await ai.models.generateContent({
        model: MODEL_PLANNER,
        contents: `${densePrompt} Task:Provide a 2-sentence ruthless executive summary of this plan. Speak directly to the user.`,
    });
    
    const shortText = textResponse.text;
    if (!shortText) return null;

    // Step 2: Convert Short Text to Audio (Fast)
    return await speakText(shortText);
}

// 2. General Chat with Search Grounding
export async function chatWithSearch(message: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODEL_CHAT,
    contents: `Query:${message}. Search and summarize.`, 
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || 'Source',
    uri: chunk.web?.uri || '#'
  })) || [];

  return {
    text: response.text,
    sources
  };
}

// 3. Local Savings Search (Maps Grounding)
export async function searchLocalSavings(query: string, latitude: number, longitude: number) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODEL_MAPS,
    contents: `Cheap/Save: ${query}`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: { latitude, longitude }
        }
      }
    },
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.maps?.title || 'Map Result',
    uri: chunk.maps?.uri || '#'
  })) || [];

  return {
    text: response.text,
    sources
  };
}

// 4. Receipt Parsing (Vision)
export async function parseReceipt(base64Image: string, mimeType: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODEL_CHAT,
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: "JSON: {name, amount, category}. Extract." } 
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          category: { type: Type.STRING }
        },
        required: ["name", "amount", "category"]
      }
    }
  });
  return JSON.parse(response.text);
}

// 5. Image Editing
export async function editImage(base64Image: string, prompt: string, mimeType: string = 'image/jpeg') {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODEL_IMAGE_EDIT,
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: mimeType } },
        { text: prompt },
      ],
    },
  });
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
  }
  return null;
}

// 6. Veo Video Generation
export async function generateVeoVideo(prompt: string, imageBase64?: string) {
  if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
     await window.aistudio.openSelectKey();
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); 
  
  let config: any = {
    numberOfVideos: 1,
    resolution: '720p',
    aspectRatio: '9:16'
  };

  let operation;
  if (imageBase64) {
    operation = await ai.models.generateVideos({
      model: MODEL_VEO,
      prompt: prompt,
      image: { imageBytes: imageBase64, mimeType: 'image/png' },
      config
    });
  } else {
     operation = await ai.models.generateVideos({
      model: MODEL_VEO,
      prompt: prompt,
      config
    });
  }

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (downloadLink) {
    const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }
  return null;
}

// 7. TTS
export async function speakText(text: string): Promise<AudioBuffer | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: MODEL_TTS,
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
         const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
         return await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
    }
    return null;
}

// 8. Transcribe Audio
export async function transcribeAudio(base64Audio: string, mimeType: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: MODEL_TRANSCRIPTION,
        contents: {
            parts: [{ inlineData: { data: base64Audio, mimeType } }]
        }
    });
    return response.text;
}

export async function analyzeVideo(file: File, prompt: string) {
     return "Video analysis requires File API upload. Use Live Session for real-time vision.";
}
