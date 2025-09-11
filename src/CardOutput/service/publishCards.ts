/**
 * Redis cards publishing service
 */

import { getCardPublisher, AI_RESULT_CHANNEL } from "@gravityai-dev/gravity-server";
import { createLogger, getConfig } from "../../shared/platform";

const logger = createLogger("CardPublisher");

export interface CardPublishConfig {
  cards: any[]; // Flexible card data - any JSON structure
  redisChannel?: string; // Optional, defaults to AI_RESULT_CHANNEL
  chatId: string;
  conversationId: string;
  userId: string;
  providerId: string;
  workflowId: string;
  workflowRunId: string;
  metadata?: Record<string, any>;
}

/**
 * Publish cards to Redis
 */
export async function publishCards(config: CardPublishConfig): Promise<{
  channel: string;
  success: boolean;
}> {
  try {
    // Create publisher - simple and direct
    const appConfig = getConfig();
    const publisher = getCardPublisher(
      appConfig.REDIS_HOST,
      appConfig.REDIS_PORT,
      appConfig.REDIS_PASSWORD,
      "gravity-workflow-service",
      appConfig.REDIS_USERNAME // username from config
    );

    // Base message
    const baseMessage = {
      chatId: config.chatId,
      conversationId: config.conversationId,
      userId: config.userId,
      providerId: config.providerId,
      workflowId: config.workflowId,
      workflowRunId: config.workflowRunId,
      metadata: config.metadata,
    };

    // Determine the channel to use
    const channel = config.redisChannel || AI_RESULT_CHANNEL;

    // Only publish cards if the list has items
    if (config.cards && config.cards.length > 0) {
      // Publish cards - the CardPublisher now accepts any JSON structure
      await publisher.publishCards(
        config.cards,
        baseMessage,
        config.redisChannel ? { channel: config.redisChannel } : undefined
      );

      logger.info("Cards published successfully", {
        channel,
        cardCount: config.cards.length,
        workflowId: config.workflowId,
        chatId: config.chatId,
        conversationId: config.conversationId,
      });
    } else {
      logger.info("No cards to publish", {
        workflowId: config.workflowId,
        chatId: config.chatId,
        conversationId: config.conversationId,
        cardCount: config.cards?.length || 0,
        channel,
      });
    }

    return {
      channel,
      success: true,
    };
  } catch (error: any) {
    logger.error("Failed to publish cards", {
      error: error.message,
      workflowId: config.workflowId,
      chatId: config.chatId,
      conversationId: config.conversationId,
    });
    throw error;
  }
}
