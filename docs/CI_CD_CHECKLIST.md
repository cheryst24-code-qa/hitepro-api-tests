📋 CI/CD Чек-лист: HiTE PRO API Тесты

Этот документ описывает пошаговый процесс настройки непрерывной интеграции и мониторинга
для Playwright API-тестов шлюза HiTE PRO Gateway с использованием GitHub Actions и Telegram-уведомлений.

---

🔹 1. Подготовка проекта

- Проект инициализирован (`npm init -y`)
- Установлены зависимости:  
  npm install @playwright/test dotenv --save-dev

Структура папок соответствует:

tests/devices.spec.js  
.env.example  
playwright.config.js  
package.json 

🔹 2. Настройка локального окружения
- Создан файл .env с реальными данными:  
HITEPRO_BASE_URL=https://ваш_ключ.connect-profi.ru/rest/  
HITEPRO_USER=admin  
HITEPRO_PASS=ваш_пароль  

- Файл .env добавлен в .gitignore
- Тесты успешно запускаются локально:  
npx playwright test  
npx playwright show-report  

🔹3. Подготовка к работе с Git
- Создан .gitignore со следующим содержимым:  
node_modules/  
.env  
playwright-report/  
test-results/  
- Создан README.md с инструкцией по установке и запуску
- Создан .env.example (без паролей!)
- Проект закоммичен локально:  
git add .  
git commit -m "feat: initial Playwright API tests"  

🔹4. Создание репозитория на GitHub
- Репозиторий создан (например, hitepro-api-tests)
- Выполнена первая отправка кода:  
git remote add origin https://github.com/cheryst24-code-qa/hitepro-api-tests.git  
git branch -M main  
git push -u origin main  

⚠️ Если возник конфликт - выполнен git pull --rebase перед пушем.

🔹5. Настройка секретов в GitHub
Перейти: Settings → Secrets and variables → Actions

Добавить Repository secrets:
| Название | Значение |                
|----------|----------|
| HITEPRO_BASE_URL | https://ваш_ключ.connect-profi.ru/rest/ |
| HITEPRO_USER | admin |
| HITEPRO_PASS | ваш пароль |
| TELEGRAM_BOT_TOKEN | токен от @BotFatherи|
| TELEGRAM_CHAT_ID | ваш chat_id | 

🔹 6. Создание workflow-файла
- Создан файл .github/workflows/api-tests.yml
- Содержимое включает:
   - Триггеры: push и schedule
   - Установку Node.js и зависимостей
   - Запуск npx playwright test
   - Сохранение артефакта (playwright-report)
   - Отправку уведомления в Telegram

✅ Обязательные проверки:
- Нет пробелов в URL: "https://github.com/$GITHUB_REPO/..."
- Используется "${{ steps.run_tests.outcome }}", а не "${{ job.status }}"
- Все переменные обёрнуты в кавычки
- Используется if: always() для отправки уведомления даже при падении тестов

🔹 7. Покрытие по спецификации api.pdf
Тесты проверяют все ключевые сценарии:
- switch: status: boolean, команды 1 (вкл), 2 (выкл), 3 (импульс)
- dimmer: status: 0–100, команда 101 — восстановить уровень
- drive: status: 0–3, команды 2 (открыть), 3 (закрыть), 4 (остановить)
- LED3S/M: управление цветом через ?color=HEX
- RGBW:
  - color (HEX),
  - colorTemperature при управлении: 1500–6500,
  - effect: 0–9
- Датчики:
  - motion → boolean,
  - temperature → float (-40…+50),
  - checker / water / power → 0 или 1,
  - illumination / humidity → 0–100
- transmitter → не возвращает status (ожидается 404)
- Логи: GET /logs/device/?id=..., GET /logs/scenario/?id=...
- Ошибки: 401 (неверный пароль), 404 (несуществующий ID), 405 (PUT на датчик)

🔹 8. Тестирование и мониторинг
- Workflow запускается автоматически при git push
- Расписание работает: тесты запускаются каждый час
- При падении тестов приходит уведомление в Telegram с ссылкой на запуск
- HTML-отчёт доступен как артефакт в GitHub Actions
- Все шаги завершаются успешно
