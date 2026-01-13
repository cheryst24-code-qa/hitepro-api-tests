
// playwright.config.js
module.exports = {
  // Папка с тестами
  testDir: './tests',
  
  // Таймаут одного теста
  timeout: 30 * 1000,
  
  // Глобальный таймаут
  globalTimeout: 60 * 1000,

  // Репортеры
  reporter: [
    ['list'],     // вывод в консоль
    ['html']      // генерация HTML-отчёта
  ],

  // Не использовать браузеры (чисто API-тесты)
  use: {
    // Отключаем запуск браузера — экономим ресурсы
    headless: true,
    // Но оставляем возможность отладки
    launchOptions: {
      headless: true
    }
  },

  // Проекты (можно оставить один)
  projects: [
    {
      name: 'API Tests',
      use: { /* без браузера */ }
    }
  ]
};