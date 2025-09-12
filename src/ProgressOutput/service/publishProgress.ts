/**
 * Redis progress publishing service
 */

import { getProgressPublisher, AI_RESULT_CHANNEL } from "@gravityai-dev/gravity-server";
import { createLogger, getConfig } from "../../shared/platform";

const logger = createLogger("ProgressPublisher");

export interface ProgressPublishConfig {
  text: string;
  progress?: number;
  redisChannel?: string;
  chatId: string;
  conversationId: string;
  userId: string;
  providerId: string;
  workflowId: string;
  workflowRunId: string;
  metadata?: Record<string, any>;
}

/**
 * Publish a progress update to Redis
 */
export async function publishProgress(config: ProgressPublishConfig): Promise<{
  channel: string;
  success: boolean;
}> {
  try {
    const appConfig = getConfig();
    const providerId = "gravity-workflow-service";

    const publisher = getProgressPublisher(
      appConfig.REDIS_HOST,
      appConfig.REDIS_PORT,
      appConfig.REDIS_TOKEN || appConfig.REDIS_PASSWORD,
      providerId,
      appConfig.REDIS_TOKEN ? 'default' : appConfig.REDIS_USERNAME,
      undefined, // db
      appConfig.REDIS_TOKEN,
      appConfig.REDIS_TLS ? true : undefined
    );

    const baseMessage = {
      chatId: config.chatId,
      conversationId: config.conversationId,
      userId: config.userId,
      providerId: config.providerId,
    };

    await publisher.publishProgressUpdate(
      config.text,
      config.progress,
      baseMessage,
      config.redisChannel ? { channel: config.redisChannel } : undefined
    );

    logger.info("Progress update published", {
      channel: config.redisChannel ?? AI_RESULT_CHANNEL,
      workflowId: config.workflowId,
    });

    return {
      channel: config.redisChannel ?? AI_RESULT_CHANNEL,
      success: true,
    };
  } catch (error: any) {
    logger.error("Failed to publish progress update", {
      error: error.message,
      workflowId: config.workflowId,
    });
    throw error;
  }
}
