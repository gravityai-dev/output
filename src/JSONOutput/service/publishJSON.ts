/**
 * JSON output service
 * Publishes JSON output events using the shared Redis connection
 */

import { createLogger, getRedisClient } from "../../shared/platform";
import { buildOutputEvent, OUTPUT_CHANNEL } from "../../shared/publisher";

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
 * Publish a JSON output event
 */
export async function publishJSON(config: JSONPublishConfig): Promise<{
  channel: string;
  success: boolean;
}> {
  try {
    // Build the event structure
    const event = buildOutputEvent({
      eventType: "json",
      chatId: config.chatId,
      conversationId: config.conversationId,
      userId: config.userId,
      providerId: config.providerId,
      data: {
        data: config.data,
        dataType: config.dataType,
        metadata: {
          ...config.metadata,
          workflowId: config.workflowId,
          workflowRunId: config.workflowRunId,
        },
      },
    });

    // Get Redis client from platform
    const redis = getRedisClient();

    // Publish to Redis Streams (not Pub/Sub) for reliable delivery
    const REDIS_NAMESPACE = process.env.REDIS_NAMESPACE || process.env.NODE_ENV || "local";
    const streamKey = `${REDIS_NAMESPACE}:workflow:events:stream`;
    const conversationId = config.conversationId || "";

    await redis.xadd(
      streamKey,
      "*",
      "conversationId",
      conversationId,
      "channel",
      OUTPUT_CHANNEL,
      "message",
      JSON.stringify(event)
    );

    logger.info("JSON output published as GravityEvent", {
      eventType: "json",
      workflowId: config.workflowId,
      channel: OUTPUT_CHANNEL,
      dataType: config.dataType,
      event: event,
    });

    return {
      channel: OUTPUT_CHANNEL,
      success: true,
    };
  } catch (error: any) {
    logger.error("Failed to publish JSON output", {
      error: error.message,
      workflowId: config.workflowId,
    });
    throw error;
  }
}
