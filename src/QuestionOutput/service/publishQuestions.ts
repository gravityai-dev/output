/**
 * Redis questions publishing service
 */

import { getQuestionsPublisher, AI_RESULT_CHANNEL } from "@gravityai-dev/gravity-server";
import { createLogger, getConfig } from "../../shared/platform";

const logger = createLogger("QuestionsPublisher");

export interface QuestionPublishConfig {
  questions: string[];
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
 * Publish questions to Redis
 */
export async function publishQuestions(config: QuestionPublishConfig): Promise<{
  channel: string;
  success: boolean;
}> {
  try {
    const appConfig = getConfig();
    const publisher = getQuestionsPublisher(
      appConfig.REDIS_HOST,
      appConfig.REDIS_PORT,
      appConfig.REDIS_TOKEN || appConfig.REDIS_PASSWORD,
      "gravity-workflow-service",
      appConfig.REDIS_TOKEN ? 'default' : appConfig.REDIS_USERNAME,
      undefined, // db
      appConfig.REDIS_TOKEN,
      appConfig.REDIS_TLS ? true : undefined
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

    if (config.questions && config.questions.length > 0) {
      await publisher.publishQuestions(
        config.questions,
        baseMessage,
        config.redisChannel ? { channel: config.redisChannel } : undefined
      );

      logger.info("Questions published successfully", {
        channel,
        questionCount: config.questions.length,
        workflowId: config.workflowId,
        chatId: config.chatId,
        conversationId: config.conversationId,
      });
    } else {
      logger.info("No questions to publish", {
        workflowId: config.workflowId,
        chatId: config.chatId,
        conversationId: config.conversationId,
        questionCount: config.questions?.length || 0,
        channel,
      });
    }

    return { channel, success: true };
  } catch (error: any) {
    logger.error("Failed to publish questions", {
      error: error.message,
      workflowId: config.workflowId,
      chatId: config.chatId,
      conversationId: config.conversationId,
    });
    throw error;
  }
}
