# IdeaCheck

Хакатонний MVP: сервіс первинної оцінки бізнес-ідей і стартапів.

## Запуск

```bash
npm install
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000).

## AI API

Застосунок працює без ключа й повертає реалістичний mock-звіт.

Щоб увімкнути AI-режим, створіть `.env.local`:

```bash
OPENAI_API_KEY=your_api_key_here
```

Опційно можна задати модель і OpenAI-compatible endpoint:

```bash
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1/chat/completions
```

Для OpenAI-compatible провайдера вкажіть його chat completions URL, наприклад:

```bash
OPENAI_MODEL=deepseek-v4-flash-free
OPENAI_BASE_URL=https://opencode.ai/zen/v1/chat/completions
```

## Що входить

- Головна сторінка з CTA.
- Окрема сторінка методики.
- Окрема сторінка результату.
- Форма бізнес-ідеї з валідацією.
- Кнопка заповнення демо-прикладом.
- API route `POST /api/analyze`.
- OpenAI-compatible інтеграція за наявності ключа.
- Mock-режим без ключа.
- Картки результату, ризики, рекомендації та оцінки 1-10.
- Копіювання і завантаження `.txt` звіту.
