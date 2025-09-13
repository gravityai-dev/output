/**
 * Simplified Output Event Builder for Gravity
 * 
 * Creates a unified GravityEvent structure that can be published by the workflow system.
 * This eliminates subscription complexity by using one event type.
 */

import { v4 as uuid } from "uuid";

// Single channel for all events
export const OUTPUT_CHANNEL = "gravity:output";

/**
 * Build a unified GravityEvent structure
 * 
 * @param config - Event configuration
 * @returns The complete event structure ready for publishing
 * 
 * @example
 * // Text event
 * const event = buildOutputEvent({
 *   eventType: "text",
 *   chatId: "chat123",
 *   conversationId: "conv456",
 *   userId: "user789",
 *   providerId: "my-service",
 *   data: {
 *     text: "Hello world"
 *   }
 * });
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
    __typename: "GravityEvent",  // Single type for all events
    type: "GRAVITY_EVENT",       // Single type enum
    eventType: config.eventType, // Distinguishes between text, progress, card, etc.
    data: config.data            // Contains the actual event data
  };
}
