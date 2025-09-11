/**
 * Type definitions for QuestionOutput node
 */

export interface QuestionOutputConfig {
  questions: any; // Template field for questions data
  redisChannel?: string;
}

export interface WorkflowVariables {
  chatId?: string;
  conversationId?: string;
  userId?: string;
  providerId?: string;
}

export interface QuestionOutputServiceResult {
  questionData: string[];
  channel: string;
  chatId: string;
  conversationId: string;
  userId: string;
  providerId: string;
  success: boolean;
  workflow: {
    id: string;
    variables: Required<WorkflowVariables>;
  };
}

export interface QuestionOutputResult {
  __outputs: {
    output: QuestionOutputServiceResult;
  };
}
