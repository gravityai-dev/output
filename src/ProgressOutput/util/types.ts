/**
 * Type definitions for ProgressOutput node
 */

export interface ProgressOutputConfig {
  text: string;
  redisChannel?: string;
  asComponentSpec?: boolean;
}

export interface WorkflowVariables {
  chatId?: string;
  conversationId?: string;
  userId?: string;
  providerId?: string;
}

export interface ProgressOutputServiceResult {
  text: string;
  channel: string;
  chatId: string;
  conversationId: string;
  userId: string;
  providerId: string;
  success: boolean;
  workflow: {
    id: string;
    variables: WorkflowVariables;
  };
}

export interface ProgressOutputResult {
  __outputs: {
    output: ProgressOutputServiceResult;
  };
}
