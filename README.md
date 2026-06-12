# IdeaCheck AI

Hackathon MVP: AI-сервис первичной оценки бизнес-идей и стартапов.

## Запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## AI API

Приложение работает без ключа и возвращает реалистичный mock-отчет.

Чтобы включить AI-режим, создайте `.env.local`:

```bash
OPENAI_API_KEY=your_api_key_here
```

Опционально можно задать модель и OpenAI-compatible endpoint:

```bash
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1/chat/completions
```

Для OpenAI-compatible провайдера укажите его chat completions URL, например:

```bash
OPENAI_MODEL=deepseek-v4-flash-free
OPENAI_BASE_URL=https://opencode.ai/zen/v1/chat/completions
```

## Что входит

- Главная страница с CTA.
- Форма бизнес-идеи с валидацией.
- Кнопка заполнения демо-примером.
- API route `POST /api/analyze`.
- OpenAI-интеграция при наличии ключа.
- Mock-режим без ключа.
- Карточки результата, риски, рекомендации и оценки 1-10.
- Копирование и скачивание `.txt` отчета.
