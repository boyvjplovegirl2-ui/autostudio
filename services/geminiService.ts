// FIX: Create content for geminiService.ts to resolve module errors and implement AI functions.
import { GoogleGenAI, Modality, Type, GenerateContentResponse } from "@google/genai";
import { VideoScene, AspectRatio } from "../types";

// Per guidelines, create a new instance for video generation calls.
// A shared instance can be used for other calls.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// --- Text Generation ---

export const generateStory = async (idea: string, style: string, length: string, emotion: string, language: string): Promise<string> => {
    const prompt = `Write a story in ${language} based on the following idea: "${idea}".
    Style: ${style}.
    Length: ${length}.
    Emotion: ${emotion || 'any'}.
    The story should be original, commercially safe, and avoid any copyrighted characters or real people's likenesses.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    return response.text;
};

export const generateStoryMeta = async (storyContent: string, platform: string): Promise<{ title: string; description: string; hashtags: string[] }> => {
    const prompt = `Based on the following story, generate a title, description, and 3-5 relevant hashtags in Vietnamese.
    Crucially, optimize the title, description, and hashtags to be highly effective and engaging for the "${platform}" platform. Consider the conventions, character limits, and audience expectations of ${platform}.
    For example, for YouTube, create a click-worthy title and a detailed description. For TikTok, create a short, punchy title and trending hashtags. For Facebook, make it shareable.
    Story: """${storyContent.substring(0, 4000)}..."""
    Return the result as a JSON object with keys "title", "description", and "hashtags" (an array of strings).`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    hashtags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                }
            }
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

export const generatePromptsFromStory = async (storyContent: string, settings: any): Promise<string> => {
    const prompt = `
    Based on the following story, create a series of detailed video prompts.

    **STORY:**
    """${storyContent}"""

    **VIDEO REQUIREMENTS:**
    - **Total Duration:** Approximately ${settings.videoLength}.
    - **Prompt Language:** ${settings.voiceLanguage === 'Tiếng Việt' ? 'Vietnamese' : 'English'}.
    - **Overall Style:** A blend of ${settings.selectedStyles.join(', ')}.
    - **Genre:** ${settings.selectedGenres.join(', ')}.
    - **Output Format:** ${settings.useJson ? 'JSON format with keys "scene_number", "prompt_text", "camera_shot", "lighting".' : 'A numbered list of text prompts.'}
    - **Prompt Speed/Detail:** ${settings.promptSpeed}.

    **AI BEHAVIOR:**
    ${settings.characterConsistency ? '- Automatically identify main characters and maintain their appearance (names, features, clothing) consistently across all scenes. Start by creating a detailed character sheet for each main character.' : ''}
    ${settings.seamlessScenes ? '- Ensure smooth transitions between scenes. The end of one prompt should logically and visually lead into the beginning of the next, creating a continuous narrative.' : ''}

    **CINEMATOGRAPHY:**
    - **Lens & Framing:** Emphasize shots like ${settings.selectedLens.join(', ')} and ${settings.selectedAngles.join(', ')}.
    - **Lighting:** The mood should be set with lighting such as ${settings.selectedLighting.join(', ')}.

    **IMPORTANT RULES:**
    - The generated content must be commercially safe.
    - Do not use copyrighted characters, brands, or real people's likenesses.
    - Generate the prompts now.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Use a more powerful model for complex instructions
        contents: prompt,
        config: {
            temperature: 0.8, // Add some creativity
        }
    });
    return response.text;
};

export const generatePromptsFromImage = async (
    base64Data: string,
    mimeType: string,
    userPrompt: string,
    style: string,
    duration: string,
    language: string,
    negativePrompt: string,
    styleWeight: number,
    aspectRatio: string
): Promise<string> => {
    const imagePart = {
        inlineData: {
            data: base64Data,
            mimeType: mimeType,
        },
    };

    const textContent = `Based on the provided image and the user's request, create a series of video prompts to visualize it.
    User Request: "${userPrompt}"
    The video should be approximately ${duration} long and have a ${style} style (with a weight of ${styleWeight}/100).
    The final video aspect ratio will be ${aspectRatio}.
    Things to avoid (negative prompt): "${negativePrompt || 'none'}"
    Each prompt should describe a single scene clearly and sequentially. Number each scene (e.g., Scene 1, Scene 2, etc. if English; Cảnh 1, Cảnh 2, etc. if Vietnamese).
    The prompts should be in ${language}. The first scene must describe the provided image as the starting point.`;

    const textPart = { text: textContent };
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });

    return response.text;
}


// --- Image Generation ---

export const generateImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', // Nano Banana model
        contents: { parts: [{ text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }
    throw new Error("No image was generated.");
};

export const generateFullThumbnail = async (prompt: string, title: string, platform: 'YouTube' | 'Facebook' | 'TikTok'): Promise<string> => {
    const aspectRatioMap = {
        'YouTube': '16:9 aspect ratio',
        'Facebook': '1:1 square aspect ratio',
        'TikTok': '9:16 vertical aspect ratio',
    };
    const finalPrompt = `Act as a professional graphic designer specializing in social media thumbnails.
    Create a complete, ready-to-use, highly engaging ${platform} thumbnail with a ${aspectRatioMap[platform]}, designed for maximum click-through rate (CTR).
    Topic of the image: "${prompt}"
    The thumbnail must be visually stunning, with a clear focal point, vibrant and contrasting colors, and a professional layout.
    Crucially, you MUST integrate this EXACT title text directly and prominently into the image itself: "${title}".
    The text must be large, easily readable at a small size, and use a stylish, impactful font that matches the topic's mood (e.g., bold, clean, modern).
    Do not include any channel logos, watermarks, or subscribe buttons. The final image should be the finished thumbnail product.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: finalPrompt }] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }
    throw new Error("No thumbnail image was generated.");
};


// --- Video Generation ---

interface BaseVideoParams {
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
}
interface GenerateVideoParams extends BaseVideoParams {
  video?: any; // For extending video
}
interface GenerateVideoWithImageParams extends BaseVideoParams {
  image: { imageBytes: string, mimeType: string };
}
interface GenerateVideoWithFramesParams extends BaseVideoParams {
  startImage: { imageBytes: string, mimeType: string };
  endImage: { imageBytes: string, mimeType: string };
}


const pollOperation = async (operation: any): Promise<any> => {
    const videoAI = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await videoAI.operations.getVideosOperation({ operation: operation });
    }
    return operation;
};

const processVideoResult = (operation: any) => {
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation failed or returned no URI.");
    }
    return { videoUrl: downloadLink, operationResult: operation };
};

export const generateVideo = async (params: GenerateVideoParams): Promise<{ videoUrl: string; operationResult: any }> => {
  const videoAI = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  const model = params.video ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview';
  let operation = await videoAI.models.generateVideos({
    model: model, prompt: params.prompt, video: params.video,
    config: { numberOfVideos: 1, resolution: params.resolution, aspectRatio: params.aspectRatio }
  });
  const finalOperation = await pollOperation(operation);
  return processVideoResult(finalOperation);
};

export const generateVideoWithImage = async (params: GenerateVideoWithImageParams): Promise<{ videoUrl: string; operationResult: any }> => {
  const videoAI = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  let operation = await videoAI.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview', prompt: params.prompt, image: params.image,
    config: { numberOfVideos: 1, resolution: params.resolution, aspectRatio: params.aspectRatio }
  });
  const finalOperation = await pollOperation(operation);
  return processVideoResult(finalOperation);
};

export const generateVideoWithFrames = async (params: GenerateVideoWithFramesParams): Promise<{ videoUrl: string; operationResult: any }> => {
  const videoAI = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  let operation = await videoAI.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview', prompt: params.prompt, image: params.startImage,
    config: {
        numberOfVideos: 1, resolution: params.resolution, aspectRatio: params.aspectRatio,
        lastFrame: params.endImage
    }
  });
  const finalOperation = await pollOperation(operation);
  return processVideoResult(finalOperation);
};


// --- Search / Inspiration ---
export const searchForInspiration = async (query: string): Promise<{ text: string; sources: any[] }> => {
    const prompt = `Find inspirational examples, relevant information, and creative ideas about the following topic: "${query}". 
    Provide a detailed and helpful response. The response should be in Vietnamese.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return {
        text: response.text,
        sources: sources,
    };
};


// --- MOCKED SERVICES (due to external dependencies not covered by Gemini SDK) ---

// Mock function to simulate API delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateFromYouTubeURL = async (url: string, request: string): Promise<string> => {
    console.log("Mocking YouTube script generation for", { url, request });
    await sleep(2500);
    // In a real app, this would involve a service to fetch the YouTube transcript,
    // then passing that transcript to Gemini.
    return `Đây là kết quả mock cho yêu cầu "${request}" từ URL: ${url}\n\n1. Điểm chính đầu tiên từ video.\n2. Phân tích chi tiết về một khía cạnh quan trọng.\n3. Một trích dẫn đáng chú ý.\n4. Tóm tắt và kết luận.`;
};


export const generateShortHighlight = async (source: any, prompt: string): Promise<string> => {
    console.log("Mocking short highlight generation for", { source, prompt });
    await sleep(3000);
    // This is a highly complex task involving video analysis and editing.
    // A real implementation would require a dedicated video AI service.
    // Returning a sample video URL.
    return 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4';
};
