/**
 * JSON Data Publishing Service
 * Publishes JSON data to Redis for real-time updates
 */

import { getJsonDataPublisher, AI_RESULT_CHANNEL } from "@gravityai-dev/gravity-server";
import { createLogger, getConfig } from "../../shared/platform";

const logger = createLogger("JSONPublisher");

export interface JSONPublishConfig {
  data: any;
  dataType: string;
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
 * Publish JSON data to Redis
 */
export async function publishJSON(config: JSONPublishConfig): Promise<{
  channel: string;
  success: boolean;
}> {
  try {
    const appConfig = getConfig();
    const providerId = "gravity-workflow-service";

    const publisher = getJsonDataPublisher(
      appConfig.REDIS_HOST,
      appConfig.REDIS_PORT,
      appConfig.REDIS_PASSWORD,
      providerId,
      appConfig.REDIS_USERNAME
    );

    const baseMessage = {
      chatId: config.chatId,
      conversationId: config.conversationId,
      userId: config.userId,
      providerId: config.providerId,
      workflowId: config.workflowId,
      workflowRunId: config.workflowRunId,
      metadata: config.metadata,
    };

    const channel = config.redisChannel || AI_RESULT_CHANNEL;

    await publisher.publishJsonData(
      config.data,
      baseMessage,
      config.redisChannel ? { channel: config.redisChannel } : undefined
    );

    logger.info("JSON data published", {
      channel: config.redisChannel ?? AI_RESULT_CHANNEL,
      workflowId: config.workflowId,
      dataType: config.dataType,
    });

    return {
      channel: config.redisChannel ?? AI_RESULT_CHANNEL,
      success: true,
    };
  } catch (error: any) {
    logger.error("Failed to publish JSON data", {
      error: error.message,
      workflowId: config.workflowId,
    });
    throw error;
  }
}
