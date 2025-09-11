/**
 * FormOutput Node Type Definitions
 */

export interface FormOutputConfig {
  form: any; // Template field for form component data
  redisChannel?: string;
}

export interface FormOutputServiceResult {
  formData: any;
  channel: string;
  chatId: string;
  conversationId: string;
  userId: string;
  providerId: string;
  success: boolean;
  workflow: {
    id: string;
    variables: Record<string, any>;
  };
}

export interface FormOutputResult {
  __outputs: {
    output: FormOutputServiceResult;
  };
}
