/**
 * Validation utilities for CardOutput node
 */

import { CardOutputConfig, WorkflowVariables } from "./types";
import { createLogger } from "../../shared/platform";

const logger = createLogger("CardOutput");

/**
 * Validate CardOutput configuration
 */
export function validateConfig(config: any): ValidationResult {
  if (!config) {
    return { success: false, error: "Configuration is required" };
  }

  // For now, just check if config exists - let the executor handle the rest
  return { success: true };
}

/**
 * Validate workflow variables with warning (not error)
 */
export function validateWorkflowVariables(
  variables: WorkflowVariables,
  isDebugMode: boolean = false
): ValidationResult {
  const { chatId, conversationId, userId, providerId } = variables;

  // In debug mode, we allow empty values
  if (isDebugMode) {
    return { success: true };
  }

  if (chatId === undefined) {
    return { success: false, error: "chatId is required in workflow variables" };
  }

  if (conversationId === undefined) {
    return { success: false, error: "conversationId is required in workflow variables" };
  }

  if (userId === undefined) {
    return { success: false, error: "userId is required in workflow variables" };
  }

  if (providerId === undefined) {
    return { success: false, error: "providerId is required in workflow variables" };
  }

  return { success: true };
}

/**
 * Validate workflow variables with warning level
 * Returns success with warning message instead of failure
 */
export function validateWorkflowVariablesWithWarning(
  variables: WorkflowVariables,
  isDebugMode: boolean = false
): { success: boolean; warning?: string } {
  const validation = validateWorkflowVariables(variables, isDebugMode);
  
  // Convert errors to warnings for non-debug mode
  if (!validation.success && !isDebugMode) {
    return { success: true, warning: validation.error };
  }
  
  return { success: validation.success };
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
