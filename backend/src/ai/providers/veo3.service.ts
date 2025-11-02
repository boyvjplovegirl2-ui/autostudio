// FILE: /AutoStudio/backend/src/ai/providers/veo3.service.ts
// DESCRIPTION: Google DeepMind Veo 3 video generation integration

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class Veo3Service {
  private apiKey: string;
  private projectId: string;
  private apiUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = configService.get<string>('VEO3_API_KEY');
    this.projectId = configService.get<string>('VEO3_PROJECT_ID');
    this.apiUrl = configService.get<string>('VEO3_API_URL') || 'https://veo.googleapis.com/v1';
  }

  /**
   * Generate video with Veo 3
   */
  async generateVideo(request: {
    prompt: string;
    duration: number;
    resolution: string;
    style?: string;
  }): Promise<{ taskId: string; status: string }> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/projects/${this.projectId}/videos:generate`,
        {
          prompt: request.prompt,
          duration_seconds: request.duration,
          resolution: request.resolution,
          aspect_ratio: '16:9',
          style: request.style || 'realistic',
          quality: 'high',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'x-goog-user-project': this.projectId,
          },
          timeout: 30000,
        },
      );

      return {
        taskId: response.data.name, // Veo uses 'name' as task identifier
        status: 'processing',
      };
    } catch (error) {
      console.error('Veo3 Generation Error:', error);
      throw new Error(`Veo3 API Error: ${error.message}`);
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
    error?: string;
  }> {
    try {
      const response = await axios.get(`${this.apiUrl}/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'x-goog-user-project': this.projectId,
        },
      });

      const data = response.data;

      // Map Veo status to our standard format
      let status = 'processing';
      if (data.done) {
        status = data.error ? 'failed' : 'completed';
      }

      return {
        taskId,
        status,
        videoUrl: data.response?.video_uri,
        progress: data.metadata?.progress_percent,
        error: data.error?.message,
      };
    } catch (error) {
      console.error('Veo3 Status Check Error:', error);
      return {
        taskId,
        status: 'failed',
        error: error.message,
      };
    }
  }

  /**
   * Edit existing video with Veo 3
   */
  async editVideo(
    videoUrl: string,
    editPrompt: string,
  ): Promise<{ taskId: string }> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/projects/${this.projectId}/videos:edit`,
        {
          video_uri: videoUrl,
          edit_prompt: editPrompt,
          preserve_style: true,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'x-goog-user-project': this.projectId,
          },
        },
      );

      return {
        taskId: response.data.name,
      };
    } catch (error) {
      console.error('Veo3 Edit Error:', error);
      throw new Error(`Failed to edit video: ${error.message}`);
    }
  }

  /**
   * Extend video duration
   */
  async extendVideo(
    videoUrl: string,
    additionalSeconds: number,
  ): Promise<{ taskId: string }> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/projects/${this.projectId}/videos:extend`,
        {
          video_uri: videoUrl,
          additional_duration: additionalSeconds,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'x-goog-user-project': this.projectId,
          },
        },
      );

      return {
        taskId: response.data.name,
      };
    } catch (error) {
      console.error('Veo3 Extend Error:', error);
      throw new Error(`Failed to extend video: ${error.message}`);
    }
  }

  /**
   * Image-to-Video with Veo 3
   */
  async imageToVideo(
    imageUrl: string,
    prompt: string,
    duration: number,
  ): Promise<{ taskId: string }> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/projects/${this.projectId}/videos:generateFromImage`,
        {
          image_uri: imageUrl,
          prompt,
          duration_seconds: duration,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'x-goog-user-project': this.projectId,
          },
        },
      );

      return {
        taskId: response.data.name,
      };
    } catch (error) {
      console.error('Veo3 Image-to-Video Error:', error);
      throw new Error(`Failed to generate from image: ${error.message}`);
    }
  }
}