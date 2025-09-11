/**
 * TextOutput Node Type Definitions
 */

export interface TextOutputConfig {
  text: string;
  redisChannel?: string;
}

export interface TextOutputInput {
  data?: any;
  metadata?: Record<string, any>;
}

export interface TextOutputServiceResult {
  text: string;
  channel: string;
  chatId: string;
  conversationId: string;
  userId: string;
  providerId: string;
  success: boolean;
  workflow?: {
    id: string;
    variables: Record<string, any>;
  };
}

export interface TextOutputError {
  error: string;
  code?: string;
}

export interface TextOutputResult {
  __outputs: {
    output?: TextOutputServiceResult;
    error?: TextOutputError;
  };
}
