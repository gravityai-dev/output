# QuestionOutput Publishing Updates

This document outlines the updates made to the QuestionOutput package to align with the modern TextOutput publishing pattern.

## Overview

The QuestionOutput package has been updated to use the unified Redis Streams publishing infrastructure, moving away from the legacy Redis publisher pattern to match TextOutput's implementation.

## Changes Made

### 1. Updated `service/publishQuestions.ts`

**Before:**
- Used `getQuestionsPublisher()` from `@gravityai-dev/gravity-server`
- Complex Redis configuration with multiple parameters
- Published to various channels based on configuration

**After:**
- Uses `getRedisClient()` from shared platform utilities
- Uses `buildOutputEvent()` and `OUTPUT_CHANNEL` from shared publisher
- Publishes to unified `workflow:events:stream` using Redis Streams

```typescript
// New implementation
const event = buildOutputEvent({
  eventType: "questions",
  chatId: config.chatId,
  conversationId: config.conversationId,
  userId: config.userId,
  providerId: config.providerId,
  data: {
    questions: config.questions,
    metadata: {
      ...config.metadata,
      workflowId: config.workflowId,
      workflowRunId: config.workflowRunId,
    },
  },
});

await redis.xadd(
  "workflow:events:stream",
  "*",
  "conversationId", conversationId,
  "channel", OUTPUT_CHANNEL,
  "message", JSON.stringify(event)
);
```

### 2. Updated `node/executor.ts`

**Changes:**
- Removed `AI_RESULT_CHANNEL` import (no longer needed)
- Simplified `publishQuestions()` call by removing channel fallback
- The service now handles channel routing internally

**Before:**
```typescript
import { AI_RESULT_CHANNEL } from "@gravityai-dev/gravity-server";

const result = await publishQuestions({
  // ...
  redisChannel: config.redisChannel || AI_RESULT_CHANNEL,
  // ...
});
```

**After:**
```typescript
const result = await publishQuestions({
  // ...
  redisChannel: config.redisChannel,
  // ...
});
```

### 3. Files Not Changed

- `node/index.ts` - Still imports `AI_RESULT_CHANNEL` for UI dropdown options (correct)
- `util/` files - No publishing dependencies, only types and validation

## Benefits

1. **Unified Event Structure**: All output events now use the same `GravityEvent` format
2. **Reliable Delivery**: Redis Streams provide better reliability than Pub/Sub
3. **Consistent Architecture**: Matches TextOutput and other modern output nodes
4. **Simplified Dependencies**: Removed complex legacy publisher dependencies

## Event Structure

Questions are now published as:

```typescript
{
  id: "uuid",
  timestamp: "2025-01-12T17:03:11.000Z",
  providerId: "gravity-services",
  chatId: "chat-123",
  conversationId: "conv-456",
  userId: "user-789",
  __typename: "GravityEvent",
  type: "GRAVITY_EVENT",
  eventType: "questions",
  data: {
    questions: ["Question 1?", "Question 2?"],
    metadata: {
      workflowId: "workflow-123",
      workflowRunId: "run-456",
      // ... other metadata
    }
  }
}
```

## Migration Pattern

This same pattern can be applied to other output nodes:

1. **Replace legacy publisher** with `getRedisClient()` from shared platform
2. **Use `buildOutputEvent()`** with appropriate `eventType`
3. **Publish to Redis Streams** using `workflow:events:stream`
4. **Use `OUTPUT_CHANNEL`** for consistent routing
5. **Remove legacy imports** from executors

## Files Updated

- ✅ `service/publishQuestions.ts` - Complete rewrite using shared utilities
- ✅ `node/executor.ts` - Removed legacy imports and simplified calls
- ✅ `node/index.ts` - No changes needed (UI configuration only)
- ✅ `util/` files - No changes needed (no publishing logic)

## Testing

After these changes, questions should:
1. Publish successfully to the unified event stream
2. Appear in the UI with the same functionality
3. Include all required metadata for proper routing
4. Use reliable Redis Streams delivery

## Next Steps

Consider applying this same publishing pattern to other output nodes in the package for consistency across the entire output system.
