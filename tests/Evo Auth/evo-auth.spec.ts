import { test, expect } from '@playwright/test';

test.describe('Страница авторизации', () => {
  // Используйте отдельный контекст для каждого теста
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Очищайте состояние перед каждым тестом
    await page.context().clearCookies();
    await page.context().clearPermissions();
    await page.goto('https://dev.evo.internal/signin');
  });

  test('должна отображаться страница авторизации с надписью Вход', async ({ page }) => {
    const logo = page.locator('h1');
    await expect(logo).toBeVisible();
  });

  test('должна отображаться картинка EvoAI', async ({ page }) => {
    const logo = page.locator('img[src*="/logo/logo-white.svg"]');
    await expect(logo).toBeVisible();
  });

  test('должна отображаться картинка с женщиной', async ({ page }) => {
    const womanImage = page.locator('img[alt*="illustration"]');
    await expect(womanImage).toBeVisible();
  });

  // Проверка кнопок
  test('Проверка отображения кнопок', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByText('Login using code')).toBeVisible();
  });

  // Проверка ссылок
  test('Проверка отображения ссылок', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Forgot your password?' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign Up' })).toBeVisible();
  });

  test('должна корректно отображать placeholder в полях ввода', async ({ page }) => {
    const emailInput = page.getByPlaceholder('Email');
    const passwordInput = page.getByPlaceholder('Password');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    await expect(emailInput).toHaveAttribute('placeholder', 'Email');
    await expect(passwordInput).toHaveAttribute('placeholder', 'Password');
  });

  test('поля ввода должны быть пустыми при загрузке', async ({ page }) => {
    const emailInput = page.getByPlaceholder('Email');
    const passwordInput = page.getByPlaceholder('Password');

    await expect(emailInput).toHaveValue('');
    await expect(passwordInput).toHaveValue('');
  });

  test('поле пароля должно иметь атрибут type="password"', async ({ page }) => {
    const passwordInput = page.getByPlaceholder('Password');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('поле электронная почта должно иметь атрибут type="email"', async ({ page }) => {
    const emailInput = page.getByPlaceholder('Email');
    await expect(emailInput).toHaveAttribute('type', 'email');
  });
});

test.describe('Валидация полей ввода', () => {
  // Используйте отдельный контекст для каждого теста
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Очищайте состояние перед каждым тестом
    await page.context().clearCookies();
    await page.context().clearPermissions();
    await page.goto('https://dev.evo.internal/signin');
  });

  test('не должно отправлять форму при пустых полях', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: 'Sign in' });

    await expect(signInButton).toBeVisible();
    await expect(signInButton).toBeDisabled();
  });

  test('должна быть валидация некорректного email', async ({ page }) => {
    await page.getByPlaceholder('Email').fill('invalid-email');
    await page.getByPlaceholder('Password').fill('12345678');

    const loginButton = page.getByRole('button', { name: 'Sign in' });

    await expect(loginButton).toBeEnabled();
    await loginButton.click();

    await expect(page.getByText('Enter a valid email address')).toBeVisible();
  });

  test('должна быть валидация некорректного пароля', async ({ page }) => {
    await page.getByPlaceholder('Email').fill('ignat.mikhaylov.98@mail.ru');
    await page.getByPlaceholder('Password').fill('123');

    const loginButton = page.getByRole('button', { name: 'Sign in' });

    await expect(loginButton).toBeEnabled();
    await loginButton.click();

    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });
});

test.describe('Основная функциональность', () => {
  // Используйте отдельный контекст для каждого теста
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Очищайте состояние перед каждым тестом
    await page.context().clearCookies();
    await page.context().clearPermissions();
    await page.goto('https://dev.evo.internal/signin');
  });

  test('должен быть переход по ссылке "Забыли пароль?"', async ({ page }) => {
    const forgotLink = page.getByRole('link', { name: 'Forgot your password?' });

    await expect(forgotLink).toBeVisible();
    await forgotLink.click();

    await expect(page).toHaveURL(/\/reset-password/);
  });

  test('должен быть переход по ссылке "Зарегистрироваться"', async ({ page }) => {
    const registerLink = page.getByText('Sign Up');
    await registerLink.click();

    await expect(page).not.toHaveURL('https://dev.evo.internal/signin');
    expect(page.url()).not.toContain('/signin');
  });

  test('должен быть переход по кнопке "Войти по коду"', async ({ page }) => {
    const codeButton = page.getByText('Login using code');

    await expect(codeButton).toBeVisible();
    await codeButton.click();

    // проверь ожидаемый результат после клика
    await expect(page).toHaveURL(/code|signin/);
    await expect(page.getByText('Login with password')).toBeVisible();
  });

  test('должна выполняться авторизация с корректными данными', async ({ page }) => {
    await page.getByPlaceholder('Email').fill('ignat.mikhaylov.98@mail.ru');
    await page.getByPlaceholder('Password').fill('12345678');

    const loginButton = page.getByRole('button', { name: 'Sign in' });

    await expect(loginButton).toBeEnabled();
    await loginButton.click();

    await expect(page).toHaveURL(/\/explore\/apps/, { timeout: 10000 });
  });
});

test.describe('Запоминание данных и авто-заполнение', () => {
  // Используйте отдельный контекст для каждого теста
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Очищайте состояние перед каждым тестом
    await page.context().clearCookies();
    await page.context().clearPermissions();
    await page.goto('https://dev.evo.internal/signin');
  });

  test('должно сохраняться значение email в поле при авто-заполнении', async ({ page }) => {
    const emailInput = page.getByPlaceholder('Email');

    await expect(emailInput).toBeVisible();
    await emailInput.fill('ignat.mikhaylov.98@mail.ru');

    await expect(emailInput).toHaveValue('ignat.mikhaylov.98@mail.ru');

    // Перезагружаем страницу и проверяем, сохранился ли email
    await page.reload();
    await expect(page.getByPlaceholder('Email')).toHaveValue('');
  });
});

test.describe('UI/UX проверки', () => {
  // Используйте отдельный контекст для каждого теста
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Очищайте состояние перед каждым тестом
    await page.context().clearCookies();
    await page.context().clearPermissions();
    await page.goto('https://dev.evo.internal/signin');
  });

  test('кнопка "Войти" должна быть активна при заполненных полях', async ({ page }) => {
    const emailInput = page.getByPlaceholder('Email');
    const passwordInput = page.getByPlaceholder('Password');
    const loginButton = page.getByRole('button', { name: 'Sign in' });

    await emailInput.fill('ignat.mikhaylov.98@mail.ru');
    await passwordInput.fill('12345678');

    await expect(loginButton).toBeEnabled();
  });

  test('кнопка "Войти" должна быть заблокирована при пустых полях', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: 'Sign in' });

    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeDisabled();
    await expect(page).toHaveURL('https://dev.evo.internal/signin');
  });

  test('должна быть кнопка для показа/скрытия пароля', async ({ page }) => {
    const passwordInput = page.getByPlaceholder('Password');
    const passwordFieldWrapper = passwordInput.locator('../..');
    const toggleButton = passwordFieldWrapper.locator('button').first();

    // Проверяем, что кнопка видима
    await expect(toggleButton).toBeVisible();

    // Проверяем, что пароль скрыт
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Нажимаем на кнопку показа пароля
    await toggleButton.click();

    // Проверяем, что пароль стал видимым
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Нажимаем на кнопку скрытия пароля
    await toggleButton.click();

    // Проверяем, что пароль снова скрыт
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});

test.describe('Обработка ошибок и сообщения', () => {
  // Используйте отдельный контекст для каждого теста
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Очищайте состояние перед каждым тестом
    await page.context().clearCookies();
    await page.context().clearPermissions();
    await page.goto('https://dev.evo.internal/signin');
  });

  test('должно отображаться сообщение при неверных учетных данных', async ({ page }) => {
    const emailInput = page.getByPlaceholder('Email');
    const passwordInput = page.getByPlaceholder('Password');
    const loginButton = page.getByRole('button', { name: 'Sign in' });

    await emailInput.fill('ignat.mikhaylov.98888@mail.ru');
    await passwordInput.fill('123456789999');
    await loginButton.click();

    // Проверяем появление сообщения об ошибке
    await expect(page.getByText('Invalid email or password.')).toBeVisible();
  });

  test('должно быть сообщение о блокировке аккаунта после нескольких неудачных попыток', async ({
    page,
  }) => {
    // Тест для проверки блокировки аккаунта
    const emailInput = page.getByPlaceholder('Email');
    const passwordInput = page.getByPlaceholder('Password');
    const loginButton = page.getByRole('button', { name: 'Sign in' });

    for (let i = 0; i < 5; i++) {
      await emailInput.fill('ignat.mikhaylov.988@mail.ru');
      await passwordInput.fill(`123456789999${i}`);
      await expect(loginButton).toBeEnabled();
      await loginButton.click();
      await page.waitForTimeout(500);
    }

    const responsePromise = page.waitForResponse((response) => response.status() === 429);

    await emailInput.fill('ignat.mikhaylov.988@mail.ru');
    await passwordInput.fill('1234567899995');
    await expect(loginButton).toBeEnabled();
    await loginButton.click();

    const response = await responsePromise;
    const body = await response.json();

    // Проверяем появление сообщения о блокировке аккаунта
    expect(body.code).toBe('email_code_login_limit');
    expect(body.message).toBe('Too many incorrect password attempts. Please try again later.');
    expect(body.status).toBe(429);
  });
});
