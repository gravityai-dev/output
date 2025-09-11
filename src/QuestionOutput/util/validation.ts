/**
 * Validation utilities for QuestionOutput node
 */

import { QuestionOutputConfig, WorkflowVariables } from "./types";
import { createLogger } from "../../shared/platform";

const logger = createLogger("QuestionOutput");

/**
 * Validate QuestionOutput configuration
 */
export function validateConfig(config: any): ValidationResult {
  if (!config) {
    return { success: false, error: "Configuration is required" };
  }

  return { success: true };
}

/**
 * Validate workflow variables with warning level
 */
export function validateWorkflowVariablesWithWarning(
  variables: WorkflowVariables,
  isDebugMode: boolean = false
): { success: boolean; warning?: string } {
  const { chatId, conversationId, userId, providerId } = variables;
  
  if (isDebugMode) {
    return { success: true };
  }
  
  const missing = [];
  if (!chatId) missing.push("chatId");
  if (!conversationId) missing.push("conversationId");
  if (!userId) missing.push("userId");
  if (!providerId) missing.push("providerId");
  
  if (missing.length > 0) {
    return { success: true, warning: `Missing workflow variables: ${missing.join(", ")}` };
  }
  
  return { success: true };
}

/**
 * Get final workflow variables with debug defaults
 */
export function getFinalWorkflowVariables(
  variables: WorkflowVariables,
  workflowId: string,
  isDebugMode: boolean
): Required<WorkflowVariables> {
  return {
    chatId: variables.chatId || (isDebugMode ? "debug-chat-id" : ""),
    conversationId: variables.conversationId || (isDebugMode ? "debug-conversation-id" : ""),
    userId: variables.userId || (isDebugMode ? "debug-user-id" : ""),
    providerId: variables.providerId || (isDebugMode ? "debug-provider-id" : ""),
  };
}

export interface ValidationResult {
  success: boolean;
  error?: string;
}
