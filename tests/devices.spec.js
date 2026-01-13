// tests/devices.spec.js
const { test } = require('@playwright/test');
require('dotenv').config();

const BASE_URL = process.env.HITEPRO_BASE_URL;
const USERNAME = process.env.HITEPRO_USER;
const PASSWORD = process.env.HITEPRO_PASS;

if (!BASE_URL || !USERNAME || !PASSWORD) {
  throw new Error('Set HITEPRO_BASE_URL, HITEPRO_USER, HITEPRO_PASS in .env');
}

// Вспомогательная функция для Basic Auth
function authHeader() {
  return 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
}

// Глобальная переменная для хранения устройств
let allDevices = [];

// Получаем список устройств один раз
test.beforeAll(async ({ request }) => {
  const res = await request.get(`${BASE_URL}/devices/`, {
    headers: { Authorization: authHeader() }
  });
  test.expect(res.status()).toBe(200);
  allDevices = await res.json();
  test.expect(Array.isArray(allDevices)).toBeTruthy();
});

// Утилита: найти первое устройство заданного типа
function findDeviceByType(type) {
  return allDevices.find(d => d.type === type);
}

// Утилита: пропустить тест, если устройство не найдено
function skipIfNotFound(device, type) {
  test.skip(!device, `No device of type "${type}" found`);
}

// === ТЕСТЫ НА ЧТЕНИЕ СОСТОЯНИЯ ===

test('switch: status is boolean', async ({ request }) => {
  const dev = findDeviceByType('switch');
  skipIfNotFound(dev, 'switch');
  const res = await request.get(`${BASE_URL}/devices/${dev.id}`, {
    headers: { Authorization: authHeader() }
  });
  test.expect(res.status()).toBe(200);
  const data = await res.json();
  test.expect(data).toHaveProperty('status');
  test.expect(typeof data.status).toBe('boolean');
});

test('motion: status is boolean', async ({ request }) => {
  const dev = findDeviceByType('motion');
  skipIfNotFound(dev, 'motion');
  const res = await request.get(`${BASE_URL}/devices/${dev.id}`, {
    headers: { Authorization: authHeader() }
  });
  test.expect(res.status()).toBe(200);
  const data = await res.json();
  test.expect(data).toHaveProperty('status');
  test.expect(typeof data.status).toBe('boolean');
});

test('dimmer: status is integer 0–100', async ({ request }) => {
  const dev = findDeviceByType('dimmer');
  skipIfNotFound(dev, 'dimmer');
  const res = await request.get(`${BASE_URL}/devices/${dev.id}`, {
    headers: { Authorization: authHeader() }
  });
  test.expect(res.status()).toBe(200);
  const data = await res.json();
  test.expect(data).toHaveProperty('status');
  test.expect(Number.isInteger(data.status)).toBeTruthy();
  test.expect(data.status).toBeGreaterThanOrEqual(0);
  test.expect(data.status).toBeLessThanOrEqual(100);
});

test('drive: status is integer 0–3', async ({ request }) => {
  const dev = findDeviceByType('drive');
  skipIfNotFound(dev, 'drive');
  const res = await request.get(`${BASE_URL}/devices/${dev.id}`, {
    headers: { Authorization: authHeader() }
  });
  test.expect(res.status()).toBe(200);
  const data = await res.json();
  test.expect(data).toHaveProperty('status');
  test.expect([0, 1, 2, 3]).toContain(data.status);
});

test('illumination: status is integer 0–100', async ({ request }) => {
  const dev = findDeviceByType('illumination');
  skipIfNotFound(dev, 'illumination');
  const res = await request.get(`${BASE_URL}/devices/${dev.id}`, {
    headers: { Authorization: authHeader() }
  });
  test.expect(res.status()).toBe(200);
  const data = await res.json();
  test.expect(data).toHaveProperty('status');
  test.expect(Number.isInteger(data.status)).toBeTruthy();
  test.expect(data.status).toBeGreaterThanOrEqual(0);
  test.expect(data.status).toBeLessThanOrEqual(100);
});

test('temperature: status is float in -40..+50', async ({ request }) => {
  const dev = findDeviceByType('temperature');
  skipIfNotFound(dev, 'temperature');
  const res = await request.get(`${BASE_URL}/devices/${dev.id}`, {
    headers: { Authorization: authHeader() }
  });
  test.expect(res.status()).toBe(200);
  const data = await res.json();
  test.expect(data).toHaveProperty('status');
  test.expect(typeof data.status).toBe('number'); // float → number
  test.expect(data.status).toBeGreaterThanOrEqual(-40);
  test.expect(data.status).toBeLessThanOrEqual(50);
});

test('humidity: status is integer 0–100', async ({ request }) => {
  const dev = findDeviceByType('humidity');
  skipIfNotFound(dev, 'humidity');
  const res = await request.get(`${BASE_URL}/devices/${dev.id}`, {
    headers: { Authorization: authHeader() }
  });
  test.expect(res.status()).toBe(200);
  const data = await res.json();
  test.expect(data).toHaveProperty('status');
  test.expect(Number.isInteger(data.status)).toBeTruthy();
  test.expect(data.status).toBeGreaterThanOrEqual(0);
  test.expect(data.status).toBeLessThanOrEqual(100);
});

test('checker: status is 0 (closed) or 1 (open)', async ({ request }) => {
  const dev = findDeviceByType('checker');
  skipIfNotFound(dev, 'checker');
  const res = await request.get(`${BASE_URL}/devices/${dev.id}`, {
    headers: { Authorization: authHeader() }
  });
  test.expect(res.status()).toBe(200);
  const data = await res.json();
  test.expect([0, 1]).toContain(data.status);
});

test('water: status is 0 (ok) or 1 (flood)', async ({ request }) => {
  const dev = findDeviceByType('water');
  skipIfNotFound(dev, 'water');
  const res = await request.get(`${BASE_URL}/devices/${dev.id}`, {
    headers: { Authorization: authHeader() }
  });
  test.expect(res.status()).toBe(200);
  const data = await res.json();
  test.expect([0, 1]).toContain(data.status);
});

test('power: status is 0 (no voltage) or 1 (voltage)', async ({ request }) => {
  const dev = findDeviceByType('power');
  skipIfNotFound(dev, 'power');
  const res = await request.get(`${BASE_URL}/devices/${dev.id}`, {
    headers: { Authorization: authHeader() }
  });
  test.expect(res.status()).toBe(200);
  const data = await res.json();
  test.expect([0, 1]).toContain(data.status);
});

// === ТЕСТЫ НА УПРАВЛЕНИЕ ===

test('switch: can turn on (command=1)', async ({ request }) => {
  const dev = findDeviceByType('switch');
  skipIfNotFound(dev, 'switch');
  const res = await request.put(`${BASE_URL}/devices/${dev.id}/1`, {
    headers: { Authorization: authHeader() }
  });
  test.expect(res.status()).toBe(200);
  const data = await res.json();
  test.expect(data).toHaveProperty('result', 'Command send');
});

test('dimmer: can set level 50', async ({ request }) => {
  const dev = findDeviceByType('dimmer');
  skipIfNotFound(dev, 'dimmer');
  const res = await request.put(`${BASE_URL}/devices/${dev.id}/50`, {
    headers: { Authorization: authHeader() }
  });
  test.expect(res.status()).toBe(200);
  const data = await res.json();
  test.expect(data).toHaveProperty('result', 'Command send');
});

test('drive: can open (command=2)', async ({ request }) => {
  const dev = findDeviceByType('drive');
  skipIfNotFound(dev, 'drive');
  const res = await request.put(`${BASE_URL}/devices/${dev.id}/2`, {
    headers: { Authorization: authHeader() }
  });
  test.expect(res.status()).toBe(200);
  const data = await res.json();
  test.expect(data).toHaveProperty('result', 'Command send');
});

// === ЦВЕТНЫЕ УСТРОЙСТВА ===

test('RGBW / LED3S/M: can set color', async ({ request }) => {
  // Ищем любое цветное устройство
  const colorTypes = ['LED', 'LED3S/M', 'RGBW'];
  let dev = null;
  for (const type of colorTypes) {
    dev = findDeviceByType(type);
    if (dev) break;
  }
  test.skip(!dev, 'No color-capable device found');
  
  const res = await request.put(
    `${BASE_URL}/devices/${dev.id}/100?color=ff5733`,
    { headers: { Authorization: authHeader() } }
  );
  test.expect(res.status()).toBe(200);
  const data = await res.json();
  test.expect(data).toHaveProperty('result', 'Command send');
});