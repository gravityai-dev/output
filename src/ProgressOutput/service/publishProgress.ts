/**
 * Progress output service
 * Publishes progress output events using the shared Redis connection
 */

import { createLogger, getRedisClient } from "../../shared/platform";
import { buildOutputEvent, OUTPUT_CHANNEL } from "../../shared/publisher";

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
 * Publish a progress output event
 */
export async function publishProgress(config: ProgressPublishConfig): Promise<{
  channel: string;
  success: boolean;
}> {
  try {
    // Build the event structure
    const event = buildOutputEvent({
      eventType: "progress",
      chatId: config.chatId,
      conversationId: config.conversationId,
      userId: config.userId,
      providerId: config.providerId,
      data: {
        text: config.text,
        progress: config.progress,
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

    logger.info("Progress output published as GravityEvent", {
      eventType: "progress",
      workflowId: config.workflowId,
      channel: OUTPUT_CHANNEL,
      progress: config.progress,
      event: event,
    });

    return {
      channel: OUTPUT_CHANNEL,
      success: true,
    };
  } catch (error: any) {
    logger.error("Failed to publish progress output", {
      error: error.message,
      workflowId: config.workflowId,
    });
    throw error;
  }
}
