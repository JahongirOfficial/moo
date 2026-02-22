# Implementation Plan: AI Chat History

## Overview

AI chat uchun suhbat tarixini MongoDB'da saqlash va kontekst sifatida ishlatish.

## Tasks

- [x] 1. ChatHistory schema yaratish
  - [x] 1.1 server/db.ts ga ChatHistory schema qo'shish
    - userId, messages array, updatedAt fields
    - _Requirements: 1.1_

- [x] 2. Backend API endpoints
  - [x] 2.1 GET /api/ai/history - tarixni yuklash (oxirgi 20 ta)
    - _Requirements: 2.1, 2.2_
  - [x] 2.2 POST /api/ai/chat - xabar yuborish va saqlash
    - Oldingi 10 ta xabarni kontekst sifatida yuborish
    - User va AI xabarlarini saqlash
    - _Requirements: 1.2, 3.1, 3.2_
  - [x] 2.3 DELETE /api/ai/history - tarixni tozalash
    - _Requirements: 4.1_

- [x] 3. Frontend o'zgarishlar
  - [x] 3.1 AiChat.tsx - tarixni yuklash
    - useEffect da GET /history chaqirish
    - _Requirements: 2.1, 2.2_
  - [x] 3.2 AiChat.tsx - clear tugmasi qo'shish
    - Header da tozalash tugmasi
    - _Requirements: 4.1, 4.2_

- [x] 4. API endpoint qo'shish
  - [x] 4.1 src/api/index.ts ga history va clear endpoints qo'shish

## Notes

- Har bir foydalanuvchi uchun bitta ChatHistory document
- Messages array ichida role va content saqlanadi
- Kontekst uchun oxirgi 10 ta xabar ishlatiladi
