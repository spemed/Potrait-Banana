// FIX: Implement the Gemini service to handle image generation.
import { GoogleGenAI, Modality } from "@google/genai";
import type { GeneratedImage } from '../types';

// Helper to convert File to a Gemini Part with base64 encoding
async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            // The result includes a data URI prefix, like "data:image/jpeg;base64,"
            // We need to remove this prefix to get just the base64 string.
            resolve(reader.result.split(',')[1]);
        } else {
            reject(new Error('Failed to read file as data URL.'));
        }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
}


let ai: GoogleGenAI | null = null;
function getAiInstance() {
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        return null;
    }
    if (!ai) {
        // FIX: Corrected to use the API key from environment variables instead of a hardcoded placeholder.
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}

export function isApiKeyConfigured(): boolean {
  return !!process.env.API_KEY;
}

const portraitStyles = [
  { name: 'Corporate Headshot', prompt: 'Generate a professional corporate headshot. The subject should be wearing business attire, with a clean, blurred office background. The lighting should be soft and flattering, creating a confident and approachable look.', isPremium: false },
  { name: 'Dramatic Black & White', prompt: 'Create a dramatic, high-contrast black and white portrait. Emphasize shadows and highlights to create a moody and artistic feel, inspired by classic film noir cinematography.', isPremium: false },
  { name: 'Golden Hour Glow', prompt: 'Reimagine this portrait as if it were taken during the golden hour. The lighting should be warm, soft, and coming from the side, creating long shadows and a beautiful, gentle glow on the subject.', isPremium: false },
  { name: 'Futuristic Neon', prompt: 'Transform this into a futuristic portrait with neon lighting. The subject should be bathed in vibrant pink, blue, and purple light, with a dark, cyberpunk-inspired background.', isPremium: true },
  { name: 'Vintage Film Look', prompt: 'Give this photo a vintage film look, reminiscent of a 1970s photograph. Add a subtle grain, slightly faded colors, and a warm tint to evoke a sense of nostalgia.', isPremium: false },
  { name: 'Fantasy Art Style', prompt: 'Turn this portrait into a fantasy-style digital painting. The subject should have ethereal features, perhaps with pointed ears or glowing eyes, set against a magical, enchanted forest background.', isPremium: true },
  { name: 'Van Gogh Style Portrait', prompt: 'Redraw this image in the style of a Vincent van Gogh oil painting. Use thick, swirling brushstrokes throughout, especially in the background. Make the colors intense and the lighting dramatic for an emotional, post-impressionist feel.', isPremium: true },
  { name: 'Surreal 70s Photo Collage', prompt: 'Recreate this image as a surreal 1970s photo collage. Use a grainy, faded color palette and place the subject in an uncanny, dreamlike landscape. The final image should have a vintage, analog feel.', isPremium: true },
  { name: 'Pop Art Stencil Graffiti', prompt: 'Transform this portrait into a bold pop art and stencil graffiti piece. Use thick, high-contrast black outlines like a stencil, with a chaotic, vibrant spray-painted background in multiple colors.', isPremium: true },
  { name: 'Hyper-Realistic Studio Portrait', prompt: 'Generate a hyper-realistic, modern studio portrait. The image should be incredibly sharp and detailed, with clean, soft studio lighting against a plain, neutral background. The final result should look like a high-end professional headshot.', isPremium: true },
  { name: 'Psychedelic Visionary Art', prompt: 'Convert this image into a piece of psychedelic visionary art. The portrait should be at the center of a symmetrical, kaleidoscopic explosion of intricate patterns and mystical symbols, rendered in an intensely vibrant, otherworldly color palette.', isPremium: true },
  { name: 'Warhol Pop Art', prompt: 'Transform this photo into an Andy Warhol-style pop art screenprint. Use a vibrant, high-contrast color palette with flat areas of color, like a silkscreen print. The final image should have the iconic, bold, and slightly off-register look of his celebrity portraits.', isPremium: true },
  { name: 'Minimalist Pop Art', prompt: 'Recreate this portrait in a minimalist pop art style. Use bold, flat blocks of solid color with minimal shading. The subject should be stylized with abstracted features against a vibrant, single-color background, creating a cool and graphic look.', isPremium: true },
  { name: 'Vintage Cartoon Illustration', prompt: 'Reimagine this image in the style of a vintage cartoon illustration, similar to classic European comics. Use clean, bold black outlines and a palette of flat, simple colors with no shading. Place the subject against a solid, vibrant background to create a whimsical and nostalgic feel.', isPremium: true },
  { name: 'Modern Oil Portrait', prompt: 'Recreate this image as a modern oil portrait with a sense of expressive realism. Use visible, textured brushstrokes, especially in the dark, moody background. The lighting on the subject should be soft but dramatic, capturing a contemplative mood. Maintain realism in the face while rendering the rest of the scene with a looser, painterly quality.', isPremium: true },
  { name: 'Mixed-Media Pop Art Collage', prompt: 'Recreate this portrait as a raw, mixed-media pop art piece inspired by Andy Warhol\'s multi-panel works. The image should be divided into a four-panel grid. Each panel should feature a high-contrast, screen-printed version of the portrait on a uniquely textured and colored background (e.g., crumpled green paper, distressed gold leaf, rough silver, and matte black). The entire piece should be set against a heavily textured, abstract painted background with a raw, grungy feel.', isPremium: true },
  { name: 'Satirical Social Realism', prompt: 'Recreate this portrait in a satirical social realist painting style. The subject and any surrounding figures should be rendered with rounded, exaggerated, almost clay-like features. Place the subject in a surreal, allegorical scene, surrounded by a crowd of onlookers. Use a muted, earthy color palette and expressive, visible brushstrokes to give the piece a textured, painterly quality.', isPremium: true },
  { name: 'Conceptual Realism Portrait', prompt: 'Recreate this image as a conceptual realism painting. The scene should be staged like a formal, slightly melancholic family portrait from a past era. Use a muted and slightly desaturated color palette to evoke a sense of memory and stillness. The lighting should be soft and even, and the figures rendered realistically but with a quiet, emotionally detached presence.', isPremium: true },
  { name: 'Cinematic Crowd Scene', prompt: 'Recreate this image as a cinematic, staged narrative photograph. The scene should be viewed from a high-angle, looking down on the subject who is surrounded by a dense crowd. Use dramatic, high-contrast lighting with deep shadows to create a sense of mystery and narrative, as if it were a still from a film. The colors should be rich and saturated.', isPremium: true },
  { name: 'Taped Stencil Portrait', prompt: 'Recreate this image as a raw, two-tone stencil artwork. The portrait should be high-contrast and graphic, as if made with a stencil and screen-printed. Frame the artwork with pieces of torn, bright yellow masking tape for a DIY, street-art feel. The background should be a simple, off-white surface, giving the piece a rough, work-in-progress look.', isPremium: true },
];

/**
 * Generates portraits by processing styles in batches to avoid API rate limits.
 * @param imageFile The user-uploaded image file.
 * @param onProgress A callback function that is called with each newly generated image.
 */
export async function generatePortraits(
  imageFile: File,
  onProgress: (image: GeneratedImage) => void
): Promise<void> {
  const ai = getAiInstance();
  if (!ai) {
    throw new Error("Gemini AI client is not initialized. Check API Key configuration.");
  }
  
  const imagePart = await fileToGenerativePart(imageFile);
  const BATCH_SIZE = 4; // Process 4 requests at a time

  for (let i = 0; i < portraitStyles.length; i += BATCH_SIZE) {
    const batch = portraitStyles.slice(i, i + BATCH_SIZE);

    const generationPromises = batch.map(async (style): Promise<GeneratedImage | null> => {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image-preview',
          contents: {
            parts: [
              imagePart,
              { text: style.prompt },
            ],
          },
          config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
          },
        });

        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            // FIX: Explicitly type the return value to satisfy the promise.
            const newImage: GeneratedImage = {
              id: crypto.randomUUID(),
              src: imageUrl,
              prompt: style.prompt,
              name: style.name,
              isPremium: style.isPremium,
            };
            return newImage;
          }
        }
        return null; // Return null if no image part is found
      } catch (error) {
        console.error(`Error generating style "${style.name}":`, error);
        return null; // Return null on error for this specific style
      }
    });

    const results = await Promise.all(generationPromises);
    
    // Call the onProgress callback for each successful result in the batch
    results.forEach(result => {
        if (result) {
            onProgress(result);
        }
    });
  }
}
