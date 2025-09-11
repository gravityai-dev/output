/**
 * Redis forms publishing service
 */

import { getFormPublisher, AI_RESULT_CHANNEL } from "@gravityai-dev/gravity-server";
import { createLogger, getConfig } from "../../shared/platform";

const logger = createLogger("FormPublisher");

export interface FormPublishConfig {
  forms: any[];
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
 * Publish forms to Redis
 */
export async function publishForms(config: FormPublishConfig): Promise<{
  channel: string;
  success: boolean;
}> {
  try {
    const appConfig = getConfig();
    const publisher = getFormPublisher(
      appConfig.REDIS_HOST,
      appConfig.REDIS_PORT,
      appConfig.REDIS_PASSWORD,
      "gravity-workflow-service",
      appConfig.REDIS_USERNAME
    );

    const baseMessage = {
      chatId: config.chatId,
      conversationId: config.conversationId,
      userId: config.userId,
      providerId: config.providerId,
      workflowId: config.workflowId,
      workflowRunId: config.workflowRunId,
      metadata: config.metadata,
    };

    const channel = config.redisChannel || AI_RESULT_CHANNEL;

    if (config.forms && config.forms.length > 0) {
      // Publish each form individually since the API expects single forms
      for (const form of config.forms) {
        await publisher.publishForm(
          form,
          baseMessage,
          config.redisChannel ? { channel: config.redisChannel } : undefined
        );
      }

      logger.info("Forms published successfully", {
        channel,
        formCount: config.forms.length,
        workflowId: config.workflowId,
      });
    }

    return { channel, success: true };
  } catch (error: any) {
    logger.error("Failed to publish forms", {
      error: error.message,
      workflowId: config.workflowId,
    });
    throw error;
  }
}
