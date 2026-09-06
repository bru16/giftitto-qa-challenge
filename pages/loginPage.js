export class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.getByRole('button', { name: 'Ingresar' });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async fillCredentials(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async clickIngresar() {
    await this.submitButton.click();
  }

  async login(email, password) {
    await this.fillCredentials(email, password);
    await this.clickIngresar();
  }

  async expectSuccessfulLogin() {
    await this.page.waitForURL((url) => !url.pathname.includes('/login'));
    const session = await this.page.request.get('/api/usuario/me');
    if (!session.ok()) {
      throw new Error(`Sesión inválida tras el login (HTTP ${session.status()})`);
    }
  }
}
