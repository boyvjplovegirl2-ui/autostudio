// FILE: /AutoStudio/backend/src/ai/pie/pie.service.ts
// DESCRIPTION: Prompt Intelligence Engine - Optimizes prompts and predicts costs

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface PromptEnhancementResult {
  originalPrompt: string;
  enhancedPrompt: string;
  estimatedCredits: number;
  estimatedQuality: number; // 0-100
  suggestedProvider: 'runway' | 'stability' | 'veo3';
  suggestedResolution: '720p' | '1080p' | '4K';
  warnings: string[];
  optimizations: string[];
}

export interface SceneBreakdown {
  sceneNumber: number;
  description: string;
  duration: number;
  prompt: string;
  estimatedCredits: number;
}

@Injectable()
export class PIEService {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private gemini: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    // Initialize AI clients
    this.openai = new OpenAI({
      apiKey: configService.get<string>('OPENAI_API_KEY'),
    });

    this.anthropic = new Anthropic({
      apiKey: configService.get<string>('CLAUDE_API_KEY'),
    });

    this.gemini = new GoogleGenerativeAI(
      configService.get<string>('GEMINI_API_KEY'),
    );
  }

  /**
   * Enhance user prompt with AI optimization
   */
  async enhancePrompt(
    userPrompt: string,
    videoType: string,
    targetDuration: number,
    userPlan: string,
  ): Promise<PromptEnhancementResult> {
    // Use GPT-4 to enhance the prompt
    const systemPrompt = `You are a video generation prompt expert. Enhance the user's prompt to generate better AI videos.

Rules:
1. Add cinematic details (lighting, camera angles, mood)
2. Specify visual style clearly
3. Break down into clear scenes if needed
4. Add technical terms for better AI understanding
5. Keep it concise but descriptive
6. Remove ambiguous language

Video Type: ${videoType}
Duration: ${targetDuration} seconds
User Plan: ${userPlan}

Return a JSON with:
{
  "enhancedPrompt": "optimized prompt",
  "warnings": ["any issues found"],
  "optimizations": ["improvements made"],
  "suggestedProvider": "runway|stability|veo3",
  "suggestedResolution": "720p|1080p|4K",
  "estimatedQuality": 0-100
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content);

      // Calculate estimated credits
      const estimatedCredits = this.calculateEstimatedCredits(
        targetDuration,
        result.suggestedResolution,
        result.suggestedProvider,
      );

      return {
        originalPrompt: userPrompt,
        enhancedPrompt: result.enhancedPrompt,
        estimatedCredits,
        estimatedQuality: result.estimatedQuality,
        suggestedProvider: result.suggestedProvider,
        suggestedResolution: result.suggestedResolution,
        warnings: result.warnings || [],
        optimizations: result.optimizations || [],
      };
    } catch (error) {
      console.error('PIE Enhancement Error:', error);
      
      // Fallback: return original with basic estimation
      return {
        originalPrompt: userPrompt,
        enhancedPrompt: userPrompt,
        estimatedCredits: this.calculateEstimatedCredits(targetDuration, '1080p', 'runway'),
        estimatedQuality: 70,
        suggestedProvider: 'runway',
        suggestedResolution: '1080p',
        warnings: ['Failed to enhance prompt, using original'],
        optimizations: [],
      };
    }
  }

  /**
   * Generate video script from user idea
   */
  async generateScript(
    idea: string,
    videoType: string,
    targetDuration: number,
    tone: 'professional' | 'casual' | 'energetic' | 'calm',
  ): Promise<{ script: string; scenes: SceneBreakdown[] }> {
    const systemPrompt = `You are a professional video script writer. Create a compelling script for a ${targetDuration}-second ${videoType} video.

Tone: ${tone}
Duration: ${targetDuration} seconds

Requirements:
1. Write engaging narration/dialogue
2. Break into scenes (5-10 seconds each)
3. Include visual descriptions for each scene
4. Add timing cues
5. Make it concise and impactful

Return JSON:
{
  "script": "full narration text",
  "scenes": [
    {
      "sceneNumber": 1,
      "description": "what happens",
      "duration": 8,
      "prompt": "AI video generation prompt",
      "narration": "what to say"
    }
  ]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: idea },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
      });

      const result = JSON.parse(response.choices[0].message.content);

      // Calculate credits for each scene
      const scenesWithCredits = result.scenes.map((scene: any) => ({
        ...scene,
        estimatedCredits: this.calculateEstimatedCredits(scene.duration, '1080p', 'runway'),
      }));

      return {
        script: result.script,
        scenes: scenesWithCredits,
      };
    } catch (error) {
      console.error('Script Generation Error:', error);
      throw error;
    }
  }

  /**
   * Break down long prompt into scenes
   */
  async breakdownIntoScenes(
    prompt: string,
    targetDuration: number,
  ): Promise<SceneBreakdown[]> {
    const systemPrompt = `Break down this video prompt into individual scenes.

Total Duration: ${targetDuration} seconds
Scene Duration: 5-10 seconds each

Return JSON array:
[
  {
    "sceneNumber": 1,
    "description": "brief description",
    "duration": 8,
    "prompt": "detailed prompt for this scene only"
  }
]`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content);
      
      return result.scenes.map((scene: any) => ({
        ...scene,
        estimatedCredits: this.calculateEstimatedCredits(scene.duration, '1080p', 'runway'),
      }));
    } catch (error) {
      console.error('Scene Breakdown Error:', error);
      
      // Fallback: single scene
      return [
        {
          sceneNumber: 1,
          description: 'Full video',
          duration: targetDuration,
          prompt,
          estimatedCredits: this.calculateEstimatedCredits(targetDuration, '1080p', 'runway'),
        },
      ];
    }
  }

  /**
   * Predict video quality based on prompt
   */
  async predictQuality(prompt: string, provider: string): Promise<number> {
    // Simple heuristic-based quality prediction
    let score = 50; // base score

    // Check for descriptive words
    const descriptiveWords = [
      'cinematic', 'detailed', 'professional', 'high-quality',
      'stunning', 'beautiful', 'dramatic', 'dynamic',
    ];
    descriptiveWords.forEach((word) => {
      if (prompt.toLowerCase().includes(word)) score += 5;
    });

    // Check for technical specifications
    if (prompt.includes('4K') || prompt.includes('high resolution')) score += 10;
    if (prompt.includes('lighting')) score += 5;
    if (prompt.includes('camera angle') || prompt.includes('shot')) score += 5;

    // Provider-based adjustment
    const providerBonus = {
      runway: 10,
      veo3: 15,
      stability: 5,
    };
    score += providerBonus[provider] || 0;

    // Cap at 100
    return Math.min(100, score);
  }

  /**
   * Calculate estimated credits for video generation
   */
  private calculateEstimatedCredits(
    durationSeconds: number,
    resolution: string,
    provider: string,
  ): number {
    // Base cost per minute
    const baseCreditsPerMinute = 10;

    // Calculate base cost
    let credits = Math.ceil((durationSeconds / 60) * baseCreditsPerMinute);

    // Resolution multiplier
    const resolutionMultiplier = {
      '720p': 1,
      '1080p': 1.5,
      '4K': 3,
    };
    credits *= resolutionMultiplier[resolution] || 1;

    // Provider multiplier
    const providerMultiplier = {
      runway: 1.2,
      veo3: 1.5,
      stability: 1,
    };
    credits *= providerMultiplier[provider] || 1;

    return Math.ceil(credits);
  }

  /**
   * Analyze prompt for policy violations
   */
  async analyzePolicyCompliance(prompt: string): Promise<{
    passed: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    const systemPrompt = `Analyze this video prompt for policy violations:

Check for:
1. Violence or gore
2. Sexual content
3. Hate speech or discrimination
4. Dangerous activities
5. Misinformation
6. Copyright violations (brand names, characters)

Return JSON:
{
  "passed": true/false,
  "issues": ["list of violations"],
  "suggestions": ["how to fix"]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Policy Analysis Error:', error);
      
      // Fail-safe: allow but warn
      return {
        passed: true,
        issues: [],
        suggestions: ['Could not verify policy compliance'],
      };
    }
  }

  /**
   * Get optimal AI provider for prompt
   */
  selectOptimalProvider(
    prompt: string,
    userPlan: string,
    userCredits: number,
  ): {
    provider: 'runway' | 'stability' | 'veo3';
    reason: string;
  } {
    // Check prompt characteristics
    const isComplex = prompt.length > 200 || prompt.split(',').length > 5;
    const needsHighQuality = prompt.toLowerCase().includes('professional') ||
                           prompt.toLowerCase().includes('cinematic');

    // Plan-based restrictions
    if (userPlan === 'FREE') {
      return {
        provider: 'stability',
        reason: 'Free plan - using cost-effective provider',
      };
    }

    // Credit-based selection
    if (userCredits < 50) {
      return {
        provider: 'stability',
        reason: 'Low credits - using economical provider',
      };
    }

    // Quality-based selection
    if (needsHighQuality && userPlan === 'PRO') {
      return {
        provider: 'veo3',
        reason: 'High quality required - using best provider',
      };
    }

    if (isComplex) {
      return {
        provider: 'runway',
        reason: 'Complex prompt - using balanced provider',
      };
    }

    // Default
    return {
      provider: 'runway',
      reason: 'Standard generation',
    };
  }
}