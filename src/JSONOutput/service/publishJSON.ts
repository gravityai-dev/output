/**
 * JSON output service
 * Publishes JSON output events using the gravity publisher
 */

import { getPlatformDependencies } from "@gravityai-dev/plugin-base";
import { v4 as uuid } from "uuid";

// Get platform dependencies
const deps = getPlatformDependencies();
export const createLogger = deps.createLogger;

// Single channel for all events
export const OUTPUT_CHANNEL = "gravity:output";

const logger = createLogger("JSONPublisher");

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

    // Use the universal gravityPublish function from platform API
    const platformDeps = getPlatformDependencies();
    await platformDeps.gravityPublish(OUTPUT_CHANNEL, event);

    logger.info("JSON output published as GravityEvent", {
      eventType: "json",
      workflowId: config.workflowId,
      channel: OUTPUT_CHANNEL,
      dataType: config.dataType,
      chatId: config.chatId,
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
