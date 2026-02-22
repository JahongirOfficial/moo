# Design Document: AI Chat History

## Overview

AI chat uchun suhbat tarixini MongoDB'da saqlash va kontekst sifatida ishlatish tizimi.

## Architecture

```
Frontend (AiChat.tsx)
    ↓ GET /api/ai/history
    ↓ POST /api/ai/chat (with context)
    ↓ DELETE /api/ai/history
Backend (ai.ts)
    ↓
MongoDB (ChatHistory collection)
```

## Components and Interfaces

### Backend API Endpoints

```typescript
// GET /api/ai/history - Tarixni yuklash
Response: { messages: Message[] }

// POST /api/ai/chat - Xabar yuborish
Request: { message: string }
Response: { message: string }

// DELETE /api/ai/history - Tarixni tozalash
Response: { success: true }
```

### Frontend Changes

```typescript
// AiChat.tsx
- useEffect: componentDidMount da tarixni yuklash
- sendMessage: xabar yuborilganda backend saqlaydi
- clearHistory: yangi tugma - tarixni tozalash
```

## Data Models

### ChatHistory Schema

```typescript
const ChatHistorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  updatedAt: { type: Date, default: Date.now }
});
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### Property 1: Message persistence
*For any* message sent by user, after saving, querying the database should return that message.
**Validates: Requirements 1.2**

### Property 2: History limit
*For any* user with more than 20 messages, loading history should return exactly 20 most recent messages.
**Validates: Requirements 2.1**

### Property 3: Context limit
*For any* chat request, the context sent to AI should contain at most 10 messages.
**Validates: Requirements 3.1**

### Property 4: Chronological order
*For any* set of messages, they should be ordered by createdAt timestamp ascending.
**Validates: Requirements 3.2**

### Property 5: Clear deletes all
*For any* user, after clearing history, querying should return empty array.
**Validates: Requirements 4.1**

## Error Handling

- Database connection error: Return 500 with error message
- Invalid userId: Return 401 Unauthorized
- AI API error: Save user message, return error, don't save AI response

## Testing Strategy

- Unit tests: Schema validation, API endpoint responses
- Integration tests: Full flow from frontend to database
