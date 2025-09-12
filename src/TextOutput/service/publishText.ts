/**
 * Text publishing service
 * Handles publishing text output messages to Redis channels
 */

import { getTextPublisher } from "@gravityai-dev/gravity-server";
import { getConfig, createLogger } from "../../shared/platform";
import { AI_RESULT_CHANNEL } from "@gravityai-dev/gravity-server";

const logger = createLogger("TextPublisher");

export interface TextPublishConfig {
  text: string;
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
 * Publish a text output to Redis
 */
export async function publishText(config: TextPublishConfig): Promise<{
  channel: string;
  success: boolean;
}> {
  try {
    // Create publisher - simple and direct
    const appConfig = getConfig();
    const providerId = "gravity-workflow-service";

    const publisher = getTextPublisher(
      appConfig.REDIS_HOST,
      appConfig.REDIS_PORT,
      appConfig.REDIS_TOKEN || appConfig.REDIS_PASSWORD,
      providerId,
      appConfig.REDIS_TOKEN ? 'default' : appConfig.REDIS_USERNAME,
      undefined, // db
      appConfig.REDIS_TOKEN,
      appConfig.REDIS_TLS ? true : undefined
    );

    // Base message
    const baseMessage = {
      chatId: config.chatId,
      conversationId: config.conversationId,
      userId: config.userId,
      providerId: config.providerId,
      metadata: {
        ...config.metadata,
        workflowId: config.workflowId,
        workflowRunId: config.workflowRunId,
      },
    };

    // Publish text
    await publisher.publishText(
      config.text,
      baseMessage,
      config.redisChannel ? { channel: config.redisChannel } : undefined
    );

    logger.info("Text output published", {
      channel: config.redisChannel ?? AI_RESULT_CHANNEL,
      workflowId: config.workflowId,
    });

    return {
      channel: config.redisChannel ?? AI_RESULT_CHANNEL,
      success: true,
    };
  } catch (error: any) {
    logger.error("Failed to publish text output", {
      error: error.message,
      workflowId: config.workflowId,
    });
    throw error;
  }
}
