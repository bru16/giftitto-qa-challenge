import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage.js';

const credentials = {
  email: process.env.GIFTITTO_EMAIL || 'demo@giftitto.com',
  password: process.env.GIFTITTO_PASSWORD || 'demo123',
};

test('el usuario puede iniciar sesión con credenciales válidas', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.fillCredentials(credentials.email, credentials.password);
  await loginPage.clickIngresar();
  await loginPage.expectSuccessfulLogin();
});
