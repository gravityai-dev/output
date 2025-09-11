/**
 * Type definitions for CardOutput node
 */

export interface CardOutputConfig {
  cards: any; // Template field for card component data (object from template system)
  redisChannel?: string;
}

export interface WorkflowVariables {
  chatId?: string;
  conversationId?: string;
  userId?: string;
  providerId?: string;
}

export interface CardOutputServiceResult {
  cardData: any; // The parsed card data that was published
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

export interface CardOutputResult {
  __outputs: {
    output: CardOutputServiceResult;
  };
}
