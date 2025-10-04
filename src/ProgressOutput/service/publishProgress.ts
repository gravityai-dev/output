/**
 * Progress output service
 * Publishes progress output events using the gravity publisher
 */

import { v4 as uuid } from "uuid";

// Single channel for all events
export const OUTPUT_CHANNEL = "gravity:output";

/**
 * Build a unified GravityEvent structure
 */
export function buildOutputEvent(config: {
  eventType: string;
  chatId: string;
  conversationId: string;
  userId: string;
  providerId?: string;
  data: Record<string, any>;
}): Record<string, any> {
  // Ensure required fields
  if (!config.chatId || !config.conversationId || !config.userId) {
    throw new Error("chatId, conversationId, and userId are required");
  }

  // Build unified message structure
  return {
    id: uuid(),
    timestamp: new Date().toISOString(),
    providerId: config.providerId || "gravity-services",
    chatId: config.chatId,
    conversationId: config.conversationId,
    userId: config.userId,
    __typename: "GravityEvent", // Single type for all events
    type: "GRAVITY_EVENT", // Single type enum
    eventType: config.eventType, // Distinguishes between text, progress, card, etc.
    data: config.data, // Contains the actual event data
  };
}

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
 * @param config - The progress configuration
 * @param api - The injected platform API from context
 */
export async function publishProgress(config: ProgressPublishConfig, api: any): Promise<{
  channel: string;
  success: boolean;
}> {
  // Get logger from injected API
  const logger = api?.createLogger?.("ProgressPublisher") || console;
  
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

    // Use the injected API's gravityPublish function
    if (!api || !api.gravityPublish) {
      throw new Error("API with gravityPublish not provided to publishProgress");
    }
    await api.gravityPublish(OUTPUT_CHANNEL, event);

    logger.info("Progress output published as GravityEvent", {
      eventType: "progress",
      workflowId: config.workflowId,
      channel: OUTPUT_CHANNEL,
      progress: config.progress,
      chatId: config.chatId,
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
