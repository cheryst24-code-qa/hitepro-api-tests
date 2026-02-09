# 🏠 HiTE PRO Gateway - API тесты

Автоматизированные тесты REST API шлюза умного дома **HiTE PRO Gateway** на основе официальной спецификации [Спецификация API](https://cloud.mail.ru/public/k9he/nzDhMmiD6).

---

## 1.🔌 Поддерживаемые типы устройств

### Управляемые устройства

| Тип | Состояние (`status`) | Управление (`command`) |
|-----|----------------------|------------------------|
| `switch` | `boolean` | `1` – Включить<br>`2` – Выключить<br>`3` – Импульс |
| `dimmer` | `int` (0–100) | `0` – Выключить<br>`1–100` – Яркость<br>`101` – Восстановить прошлый уровень |
| `drive` | `int`<br>`0=Открыт`<br>`1=Закрыт`<br>`2=Открытие`<br>`3=Закрытие` | `2` – Открыть<br>`3` – Закрыть<br>`4` – Остановить |

### Цветные устройства

| Тип | Состояние | Управление |
|-----|----------|-----------|
| `LED3S/M` | `status: int (0–100)`<br>`color: string (HEX)` | `PUT /devices/{id}/{level}?color=fc0841` |
| `RGBW` | `status: int (0–100)`<br>`color: HEX`<br>`colorTemperature: int (0–3600)`<br>`effect: int (0–10)` | `PUT /devices/{id}/100?color=...`<br>`colorTemperature=1500–6500`<br>`effect=0–9` |

> ⚠️ При чтении `colorTemperature` возвращается `0–3600`, при управлении допустимо `1500–6500`.

### Датчики (только чтение)

| Тип | Формат `status` | Значения |
|-----|----------------|---------|
| `motion` | `boolean` | `true`/`false` |
| `illumination` | `int` | `0–100` |
| `temperature` | `float` | `-40 … +50` |
| `humidity` | `int` | `0–100` |
| `checker` | `int` | `0=Закрыто`, `1=Открыто` |
| `water` | `int` | `0=Норма`, `1=Залив` |
| `power` | `int` | `0=Нет напряжения`, `1=Есть` |
| `transmitter` | **Не возвращает `status`** | Состояние только через **webhook** |

---

## 📡 Ресурсы API

- Базовый URI:
  - Локальный: `http://hitepro.local/rest/`
  - По IP: `http://<IP>/rest/`
  - Внешний: `https://<внешний_ключ>.connect-profi.ru/rest/`

- Авторизация: **Basic Auth**

- Методы:
  - `GET /devices/` → список устройств
  - `GET /devices/{id}` → состояние (или `404`, если нет обратной связи)
  - `PUT /devices/{id}/{command}` → управление
  - `PUT /devices/{id}/{level}?color=...&colorTemperature=...&effect=...` → RGBW
  - `GET /logs/device/?id=...` → логи устройства
  - `GET /logs/scenario/?id=...` → логи сценария

- Коды ответа:
  - `200` – OK
  - `401` – Unauthorized
  - `404` – Not Found (устройство без обратной связи или несуществующий ID)
  - `405` – Method Not Allowed (например, PUT на датчик)

---

## 🧪 Основные сценарии

- Получение списка устройств и сценариев
- Чтение состояния всех типов датчиков
- Управление реле, диммерами, приводами
- Управление цветом, цветовой температурой и эффектами RGBW
- Проверка обработки ошибок (`401`, `404`, `405`)
- Чтение логов устройств и сценариев

---

## 🚀 Установка и запуск

```bash
git clone https://github.com/cheryst24-code-qa/hitepro-api-tests.git
cd hitepro-api-tests
npm install
cp .env.example .env  # ← укажите HITEPRO_BASE_URL, USER, PASS
npm test
npx playwright show-report

```
🤖 CI/CD
- GitHub Actions: запуск при push и по расписанию (0 * * * *)
- Telegram-уведомления о статусе
- HTML-отчёт как артефакт
Настройка: добавьте секреты в GitHub.

🔒 Безопасность
- .env исключён из Git
- Секреты — только через GitHub Secrets
---
- Структура:
tests/devices.spec.js
.env.example
playwright.config.js

## 2. Локальное окружение
.env содержит:

HITEPRO_BASE_URL=https://ваш_ключ.connect-profi.ru/rest/  
HITEPRO_USER=admin  
HITEPRO_PASS=пароль

- .env в .gitignore
- Тесты запускаются: npx playwright test

## 3. Git и GitHub
.gitignore содержит:

node_modules/  
.env  
playwright-report/  
test-results/

- .env.example без паролей
- Репозиторий создан и код запущен

## 4. Секреты GitHub
Добавлены в Settings → Secrets and variables → Actions:
- HITEPRO_BASE_URL
- HITEPRO_USER
- HITEPRO_PASS
- TELEGRAM_BOT_TOKEN
- TELEGRAM_CHAT_ID

## 5. Workflow
Файл: .github/workflows/api-tests.yml

Проверки:
- Триггеры: push + schedule: '0 * * * *'
- Корректный URL без пробелов
- Используется "${{ steps.run_tests.outcome }}"
- Шаг отправки в Telegram с parse_mode=HTML
- Артефакт: playwright-report

## 6. Покрытие по спецификации
Тесты проверяют:
- switch: status: bool, команды 1/2/3
- dimmer: 0–100, команда 101
- drive: статус 0–3, команды 2/3/4
- LED3S/M: color через query-параметр
- RGBW:
    - color (HEX),
    - colorTemperature при управлении: 1500–6500,
    - effect: 0–9
- Датчики:
    - motion → bool,
    - temperature → float (-40…+50),
    - checker/water/power → 0/1,
    - illumination/humidity → 0–100
- transmitter → не возвращает status (проверка 404)
- Логи: /logs/device/, /logs/scenario/
- Ошибки: 401, 404, 405

🔹 7. Уведомления и отчёт
- При падении тестов - сообщение в Telegram с ссылкой на запуск
- HTML-отчёт доступен как артефакт
- Все шаги проходят успешно в GitHub Actions

- [📋 Полный чек-лист настройки CI/CD](docs/CI_CD_CHECKLIST.md)
