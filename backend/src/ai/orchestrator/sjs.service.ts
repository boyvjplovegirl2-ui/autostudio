// FILE: /AutoStudio/backend/src/ai/orchestrator/sjs.service.ts
// DESCRIPTION: Smart Job Scheduler - Routes tasks to optimal AI providers

import { Injectable } from '@nestjs/common';
import { RunwayService } from '../providers/runway.service';
import { StabilityService } from '../providers/stability.service';
import { Veo3Service } from '../providers/veo3.service';
import { PIEService } from '../pie/pie.service';

export interface VideoGenerationJob {
  id: string;
  userId: string;
  prompt: string;
  enhancedPrompt?: string;
  duration: number;
  resolution: string;
  provider?: 'runway' | 'stability' | 'veo3';
  priority: 'low' | 'normal' | 'high';
  userPlan: string;
  userCredits: number;
}

export interface JobResult {
  jobId: string;
  provider: string;
  taskId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  progress?: number;
  error?: string;
  creditsUsed?: number;
}

@Injectable()
export class SJSService {
  // Provider health tracking
  private providerHealth: Map<string, {
    successRate: number;
    avgResponseTime: number;
    lastChecked: Date;
    available: boolean;
  }> = new Map();

  constructor(
    private runwayService: RunwayService,
    private stabilityService: StabilityService,
    private veo3Service: Veo3Service,
    private pieService: PIEService,
  ) {
    // Initialize provider health
    this.initializeProviderHealth();
    
    // Update health every 5 minutes
    setInterval(() => this.updateProviderHealth(), 5 * 60 * 1000);
  }

  /**
   * Schedule video generation job
   */
  async scheduleJob(job: VideoGenerationJob): Promise<JobResult> {
    try {
      // Step 1: Select optimal provider if not specified
      const provider = job.provider || this.selectProvider(job);

      console.log(`[SJS] Scheduling job ${job.id} with provider: ${provider}`);

      // Step 2: Enhance prompt if not already enhanced
      let enhancedPrompt = job.enhancedPrompt;
      if (!enhancedPrompt) {
        const enhancement = await this.pieService.enhancePrompt(
          job.prompt,
          'standard',
          job.duration,
          job.userPlan,
        );
        enhancedPrompt = enhancement.enhancedPrompt;
      }

      // Step 3: Route to provider
      const result = await this.routeToProvider(provider, {
        prompt: enhancedPrompt,
        duration: job.duration,
        resolution: job.resolution,
      });

      // Step 4: Track provider performance
      this.recordProviderMetric(provider, 'success', Date.now());

      return {
        jobId: job.id,
        provider,
        taskId: result.taskId,
        status: result.status,
      };
    } catch (error) {
      console.error(`[SJS] Job scheduling failed:`, error);
      
      // Try fallback provider
      return this.handleFailure(job, error);
    }
  }

  /**
   * Check job status across all providers
   */
  async checkJobStatus(
    jobId: string,
    provider: string,
    taskId: string,
  ): Promise<JobResult> {
    try {
      let result;

      switch (provider) {
        case 'runway':
          result = await this.runwayService.checkStatus(taskId);
          break;
        case 'stability':
          result = await this.stabilityService.checkStatus(taskId);
          break;
        case 'veo3':
          result = await this.veo3Service.checkStatus(taskId);
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }

      return {
        jobId,
        provider,
        taskId,
        status: result.status as any,
        videoUrl: result.videoUrl,
        progress: result.progress,
        error: result.error,
      };
    } catch (error) {
      console.error(`[SJS] Status check failed:`, error);
      return {
        jobId,
        provider,
        taskId,
        status: 'failed',
        error: error.message,
      };
    }
  }

  /**
   * Cancel job
   */
  async cancelJob(provider: string, taskId: string): Promise<void> {
    try {
      switch (provider) {
        case 'runway':
          await this.runwayService.cancelGeneration(taskId);
          break;
        // Other providers don't support cancellation in basic implementation
      }
    } catch (error) {
      console.error(`[SJS] Cancel failed:`, error);
    }
  }

  /**
   * Select optimal provider based on multiple factors
   */
  private selectProvider(job: VideoGenerationJob): 'runway' | 'stability' | 'veo3' {
    // Priority 1: User plan restrictions
    if (job.userPlan === 'FREE') {
      return 'stability'; // Cheapest option
    }

    // Priority 2: Credits available
    if (job.userCredits < 50) {
      return 'stability';
    }

    // Priority 3: Job priority
    if (job.priority === 'high' && job.userPlan === 'ENTERPRISE') {
      return 'veo3'; // Best quality
    }

    // Priority 4: Provider health
    const availableProviders = ['runway', 'stability', 'veo3'].filter((p) => {
      const health = this.providerHealth.get(p);
      return health?.available && health?.successRate > 0.8;
    });

    if (availableProviders.length === 0) {
      // All providers unhealthy, fallback to stability
      return 'stability';
    }

    // Priority 5: Load balancing - select provider with best health
    let bestProvider = availableProviders[0];
    let bestScore = 0;

    for (const provider of availableProviders) {
      const health = this.providerHealth.get(provider);
      const score = health.successRate * (1 / (health.avgResponseTime + 1));
      
      if (score > bestScore) {
        bestScore = score;
        bestProvider = provider;
      }
    }

    return bestProvider as any;
  }

  /**
   * Route job to specific provider
   */
  private async routeToProvider(
    provider: string,
    request: { prompt: string; duration: number; resolution: string },
  ): Promise<{ taskId: string; status: string }> {
    const startTime = Date.now();

    try {
      let result;

      switch (provider) {
        case 'runway':
          result = await this.runwayService.generateVideo(request);
          break;
        case 'stability':
          result = await this.stabilityService.generateVideo(request);
          break;
        case 'veo3':
          result = await this.veo3Service.generateVideo(request);
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }

      const responseTime = Date.now() - startTime;
      this.recordProviderMetric(provider, 'success', responseTime);

      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.recordProviderMetric(provider, 'failure', responseTime);
      throw error;
    }
  }

  /**
   * Handle job failure with fallback
   */
  private async handleFailure(
    job: VideoGenerationJob,
    error: Error,
  ): Promise<JobResult> {
    console.log(`[SJS] Attempting fallback for job ${job.id}`);

    // Try fallback provider (always stability as last resort)
    try {
      const result = await this.routeToProvider('stability', {
        prompt: job.enhancedPrompt || job.prompt,
        duration: job.duration,
        resolution: job.resolution,
      });

      return {
        jobId: job.id,
        provider: 'stability',
        taskId: result.taskId,
        status: result.status,
      };
    } catch (fallbackError) {
      console.error(`[SJS] Fallback failed:`, fallbackError);
      
      return {
        jobId: job.id,
        provider: job.provider || 'unknown',
        taskId: '',
        status: 'failed',
        error: `Primary and fallback failed: ${error.message}`,
      };
    }
  }

  /**
   * Initialize provider health tracking
   */
  private initializeProviderHealth(): void {
    const providers = ['runway', 'stability', 'veo3'];
    
    for (const provider of providers) {
      this.providerHealth.set(provider, {
        successRate: 1.0,
        avgResponseTime: 10000,
        lastChecked: new Date(),
        available: true,
      });
    }
  }

  /**
   * Update provider health metrics
   */
  private async updateProviderHealth(): Promise<void> {
    console.log('[SJS] Updating provider health...');
    
    // In production, this would make health check API calls
    // For now, we just mark all as available
    for (const [provider, health] of this.providerHealth.entries()) {
      health.lastChecked = new Date();
      health.available = true;
    }
  }

  /**
   * Record provider performance metric
   */
  private recordProviderMetric(
    provider: string,
    result: 'success' | 'failure',
    responseTime: number,
  ): void {
    const health = this.providerHealth.get(provider);
    if (!health) return;

    // Update success rate (exponential moving average)
    const successValue = result === 'success' ? 1 : 0;
    health.successRate = health.successRate * 0.9 + successValue * 0.1;

    // Update average response time (exponential moving average)
    health.avgResponseTime = health.avgResponseTime * 0.9 + responseTime * 0.1;

    // Mark as unavailable if success rate drops below 50%
    health.available = health.successRate > 0.5;

    console.log(`[SJS] ${provider} health: ${(health.successRate * 100).toFixed(1)}% success, ${health.avgResponseTime.toFixed(0)}ms avg`);
  }

  /**
   * Get provider statistics
   */
  getProviderStats(): any {
    const stats = {};
    
    for (const [provider, health] of this.providerHealth.entries()) {
      stats[provider] = {
        successRate: (health.successRate * 100).toFixed(1) + '%',
        avgResponseTime: health.avgResponseTime.toFixed(0) + 'ms',
        available: health.available,
        lastChecked: health.lastChecked,
      };
    }

    return stats;
  }
}