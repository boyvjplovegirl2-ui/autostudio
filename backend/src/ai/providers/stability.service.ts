// FILE: /AutoStudio/backend/src/ai/providers/stability.service.ts
// DESCRIPTION: Stability AI (Stable Video Diffusion) integration

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class StabilityService {
  private apiKey: string;
  private apiUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = configService.get<string>('STABILITY_API_KEY');
    this.apiUrl = configService.get<string>('STABILITY_API_URL') || 'https://api.stability.ai/v1';
  }

  /**
   * Generate video with Stable Video Diffusion
   */
  async generateVideo(request: {
    prompt: string;
    duration: number;
    resolution: string;
  }): Promise<{ taskId: string; status: string }> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/generation/stable-video-diffusion`,
        {
          text_prompts: [
            {
              text: request.prompt,
              weight: 1,
            },
          ],
          cfg_scale: 7,
          motion_bucket_id: 127, // Motion intensity
          noise_aug_strength: 0.02,
          seed: Math.floor(Math.random() * 4294967295),
          steps: 25,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'video/mp4',
          },
        },
      );

      return {
        taskId: response.data.id || `stability-${Date.now()}`,
        status: 'processing',
      };
    } catch (error) {
      console.error('Stability Generation Error:', error);
      throw new Error(`Stability API Error: ${error.message}`);
    }
  }

  /**
   * Check generation status
   */
  async checkStatus(taskId: string): Promise<{
    taskId: string;
    status: string;
    videoUrl?: string;
    progress?: number;
  }> {
    try {
      const response = await axios.get(`${this.apiUrl}/generation/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return {
        taskId,
        status: response.data.status || 'completed',
        videoUrl: response.data.artifacts?.[0]?.url,
        progress: response.data.progress || 100,
      };
    } catch (error) {
      console.error('Stability Status Check Error:', error);
      return {
        taskId,
        status: 'failed',
      };
    }
  }

  /**
   * Image-to-Video with Stability
   */
  async imageToVideo(imageUrl: string, motionIntensity: number = 127): Promise<{ taskId: string }> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/generation/image-to-video`,
        {
          image: imageUrl,
          motion_bucket_id: motionIntensity,
          noise_aug_strength: 0.02,
          seed: Math.floor(Math.random() * 4294967295),
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        taskId: response.data.id,
      };
    } catch (error) {
      console.error('Stability Image-to-Video Error:', error);
      throw new Error(`Failed to generate from image: ${error.message}`);
    }
  }
}