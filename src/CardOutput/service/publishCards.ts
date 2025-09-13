/**
 * Card output service
 * Publishes card output events using the shared Redis connection
 */

import { createLogger, getRedisClient } from "../../shared/platform";
import { buildOutputEvent, OUTPUT_CHANNEL } from "../../shared/publisher";

const logger = createLogger("CardPublisher");

export interface CardPublishConfig {
  cards: any[]; // Flexible card data - any JSON structure
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
 * Publish a card output event
 */
export async function publishCards(config: CardPublishConfig): Promise<{
  channel: string;
  success: boolean;
}> {
  try {
    // Build the event structure
    const event = buildOutputEvent({
      eventType: "cards",
      chatId: config.chatId,
      conversationId: config.conversationId,
      userId: config.userId,
      providerId: config.providerId,
      data: {
        cards: config.cards,
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

    logger.info("Card output published as GravityEvent", {
      eventType: "cards",
      workflowId: config.workflowId,
      channel: OUTPUT_CHANNEL,
      cardCount: config.cards?.length || 0,
      event: event,
    });

    return {
      channel: OUTPUT_CHANNEL,
      success: true,
    };
  } catch (error: any) {
    logger.error("Failed to publish card output", {
      error: error.message,
      workflowId: config.workflowId,
    });
    throw error;
  }
}
