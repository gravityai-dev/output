/**
 * JSONOutput Node Types
 * Type definitions for the JSONOutput node
 */

export interface JSONOutputConfig {
  data: any;
  dataType?: string;
  redisChannel?: string;
}

export interface WorkflowVariables {
  chatId: string;
  conversationId: string;
  userId: string;
  providerId: string;
}

export interface JSONOutputServiceResult {
  data: any;
  dataType: string;
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

export interface JSONOutputResult {
  __outputs: {
    output: JSONOutputServiceResult;
  };
}
