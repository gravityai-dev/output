# Migration Guide: Context API Pattern for Output Nodes

## Overview
We're migrating from global state (`getPlatformDependencies()`) to dependency injection (`context.api`) to fix the `gravityPublish` error permanently.

## The Problem We're Solving
- Multiple plugins overwriting global `platformDeps`
- `gravityPublish is not a function` errors
- Untestable global state

## Migration Steps

### Step 1: Update Service Files (`publishXXX.ts`)

#### Remove These Lines:
```typescript
import { getPlatformDependencies } from "@gravityai-dev/plugin-base";

// Remove any of these patterns:
const deps = getPlatformDependencies();
const logger = deps.createLogger("XXX");

// Remove getLogger functions:
let logger: any;
function getLogger() {
  if (!logger) {
    const deps = getPlatformDependencies();
    logger = deps.createLogger("XXX");
  }
  return logger;
}
```

#### Add API Parameter to Function:
```typescript
// BEFORE:
export async function publishXXX(config: XXXConfig): Promise<{

// AFTER:
export async function publishXXX(config: XXXConfig, api: any): Promise<{
```

#### Add Logger Inside Function:
```typescript
export async function publishXXX(config: XXXConfig, api: any): Promise<{
  channel: string;
  success: boolean;
}> {
  // Add this as FIRST line inside function:
  const logger = api?.createLogger?.("XXXPublisher") || console;
  
  try {
    // ... rest of function
```

#### Replace gravityPublish Call:
```typescript
// REMOVE:
const platformDeps = getPlatformDependencies();
await platformDeps.gravityPublish(OUTPUT_CHANNEL, event);

// REPLACE WITH:
if (!api || !api.gravityPublish) {
  throw new Error("API with gravityPublish not provided to publishXXX");
}
await api.gravityPublish(OUTPUT_CHANNEL, event);
```

### Step 2: Update Executor Files (`executor.ts`)

#### Find the publish call and add `context.api`:
```typescript
// BEFORE:
const result = await publishXXX({
  text: config.text,
  // ... other config
});

// AFTER:
const result = await publishXXX({
  text: config.text,
  // ... other config
}, context.api);  // <-- ADD THIS PARAMETER
```

## Files to Update

### ✅ Already Done:
- [x] ProgressOutput (service & executor)
- [x] TextOutput (service & executor)

### ❌ Need Manual Update:
- [ ] QuestionOutput/service/publishQuestions.ts (corrupted, needs manual fix)
- [ ] FormOutput/service/publishForms.ts
- [ ] FormOutput/node/executor.ts
- [ ] JSONOutput/service/publishJSON.ts
- [ ] JSONOutput/node/executor.ts
- [ ] CardOutput/service/publishCards.ts
- [ ] CardOutput/node/executor.ts

## Build & Test

After updating each file:
```bash
cd /Users/gavinpayne/Documents/Dev/GravityServer/services/gravity-services/packages/output
npm run build
```

Then restart your server and test.

## Complete Example (ProgressOutput)

### Service File:
```typescript
// BEFORE:
import { getPlatformDependencies } from "@gravityai-dev/plugin-base";
const deps = getPlatformDependencies();
const logger = deps.createLogger("ProgressPublisher");

export async function publishProgress(config: ProgressPublishConfig): Promise<{
  // ...
  const platformDeps = getPlatformDependencies();
  await platformDeps.gravityPublish(OUTPUT_CHANNEL, event);

// AFTER:
import { v4 as uuid } from "uuid";

export async function publishProgress(config: ProgressPublishConfig, api: any): Promise<{
  const logger = api?.createLogger?.("ProgressPublisher") || console;
  // ...
  if (!api || !api.gravityPublish) {
    throw new Error("API with gravityPublish not provided to publishProgress");
  }
  await api.gravityPublish(OUTPUT_CHANNEL, event);
```

### Executor File:
```typescript
// Just add context.api:
const result = await publishProgress({
  // ... config
}, context.api);  // <-- THIS IS THE ONLY CHANGE
```

## That's It!
Follow these steps for each file. The pattern is consistent across all output nodes.
