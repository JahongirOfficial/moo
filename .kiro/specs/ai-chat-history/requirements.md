# Requirements Document

## Introduction

AI chat komponentiga suhbat tarixini saqlash funksiyasi qo'shiladi. Har bir foydalanuvchi uchun suhbat tarixi MongoDB'da saqlanadi va AI oldingi kontekstni eslab qoladi.

## Glossary

- **Chat_History**: Foydalanuvchi va AI o'rtasidagi xabarlar tarixi
- **Message**: Bitta xabar (user yoki assistant tomonidan)
- **Context**: AI ga yuboriladigan oldingi xabarlar ro'yxati

## Requirements

### Requirement 1: Chat History Schema

**User Story:** As a developer, I want to store chat history in database, so that AI can remember previous conversations.

#### Acceptance Criteria

1. THE Database SHALL have ChatHistory collection with userId, messages array, and timestamps
2. WHEN a message is sent, THE System SHALL save it to ChatHistory collection

### Requirement 2: Load Chat History

**User Story:** As a user, I want my previous chat to be loaded when I open AI chat, so that I can continue conversation.

#### Acceptance Criteria

1. WHEN user opens AI chat, THE System SHALL load last 20 messages from database
2. IF no history exists, THE System SHALL show default welcome message

### Requirement 3: Send with Context

**User Story:** As a user, I want AI to remember what I said before, so that conversation feels natural.

#### Acceptance Criteria

1. WHEN sending message to AI, THE System SHALL include last 10 messages as context
2. THE AI SHALL receive messages in correct chronological order

### Requirement 4: Clear History

**User Story:** As a user, I want to clear my chat history, so that I can start fresh conversation.

#### Acceptance Criteria

1. WHEN user clicks clear button, THE System SHALL delete all messages for that user
2. AFTER clearing, THE System SHALL show default welcome message
