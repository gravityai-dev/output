/**
 * Text output service
 * Publishes text output events using the shared Redis connection
 */

import { createLogger, getRedisClient } from "../../shared/platform";
import { buildOutputEvent, OUTPUT_CHANNEL } from "../../shared/publisher";

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
 * Publish a text output event
 */
export async function publishText(config: TextPublishConfig): Promise<{
  channel: string;
  success: boolean;
}> {
  try {
    // Build the event structure
    const event = buildOutputEvent({
      eventType: "text",
      chatId: config.chatId,
      conversationId: config.conversationId,
      userId: config.userId,
      providerId: config.providerId,
      data: {
        text: config.text,
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
    const streamKey = "workflow:events:stream";
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

    logger.info("Text output published as GravityEvent", {
      eventType: "text",
      workflowId: config.workflowId,
      channel: OUTPUT_CHANNEL,
      event: event,
    });

    return {
      channel: OUTPUT_CHANNEL,
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
