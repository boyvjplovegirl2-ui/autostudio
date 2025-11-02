// FILE: /AutoStudio/backend/src/ai/providers/runway.service.ts
// DESCRIPTION: Runway Gen-2 video generation integration

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface RunwayGenerationRequest {
  prompt: string;
  duration: number;
  resolution: string;
  aspectRatio?: string;
}

export interface RunwayGenerationResponse {
  taskId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  progress?: number;
  error?: string;
}

@Injectable()
export class RunwayService {
  private apiKey: string;
  private apiUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = configService.get<string>('RUNWAY_API_KEY');
    this.apiUrl = configService.get<string>('RUNWAY_API_URL') || 'https://api.runwayml.com/v1';
  }

  /**
   * Generate video with Runway Gen-2
   */
  async generateVideo(request: RunwayGenerationRequest): Promise<RunwayGenerationResponse> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/generate`,
        {
          text_prompt: request.prompt,
          duration: request.duration,
          resolution: request.resolution,
          aspect_ratio: request.aspectRatio || '16:9',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      return {
        taskId: response.data.id,
        status: 'queued',
      };
    } catch (error) {
      console.error('Runway Generation Error:', error);
      throw new Error(`Runway API Error: ${error.message}`);
    }
  }

  /**
   * Check generation status
   */
  async checkStatus(taskId: string): Promise<RunwayGenerationResponse> {
    try {
      const response = await axios.get(`${this.apiUrl}/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      const data = response.data;

      return {
        taskId,
        status: data.status,
        videoUrl: data.output?.video_url,
        progress: data.progress,
        error: data.error,
      };
    } catch (error) {
      console.error('Runway Status Check Error:', error);
      throw new Error(`Failed to check status: ${error.message}`);
    }
  }

  /**
   * Cancel generation
   */
  async cancelGeneration(taskId: string): Promise<void> {
    try {
      await axios.post(
        `${this.apiUrl}/tasks/${taskId}/cancel`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        },
      );
    } catch (error) {
      console.error('Runway Cancel Error:', error);
    }
  }

  /**
   * Extend video (interpolation)
   */
  async extendVideo(videoUrl: string, additionalSeconds: number): Promise<RunwayGenerationResponse> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/extend`,
        {
          video_url: videoUrl,
          duration: additionalSeconds,
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
        status: 'queued',
      };
    } catch (error) {
      console.error('Runway Extend Error:', error);
      throw new Error(`Failed to extend video: ${error.message}`);
    }
  }

  /**
   * Image-to-Video generation
   */
  async imageToVideo(
    imageUrl: string,
    prompt: string,
    duration: number,
  ): Promise<RunwayGenerationResponse> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/image-to-video`,
        {
          image_url: imageUrl,
          text_prompt: prompt,
          duration,
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
        status: 'queued',
      };
    } catch (error) {
      console.error('Runway Image-to-Video Error:', error);
      throw new Error(`Failed to generate from image: ${error.message}`);
    }
  }
}