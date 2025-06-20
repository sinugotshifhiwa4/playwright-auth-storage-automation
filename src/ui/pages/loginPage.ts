import { Page, Locator, expect } from '@playwright/test';
import BasePage from '../base/basePage';

export class LoginPage extends BasePage {
  public readonly page: Page;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly companyLogo: Locator;
  private readonly loginError: Locator;

  // Forget Password
  private readonly forgotPasswordLink: Locator;
  private readonly resetPasswordContainerHeader: Locator;
  private readonly forgotPasswordCancelButton: Locator;
  private readonly forgotPasswordResetButton: Locator;
  private readonly resetPasswordSuccessMessage: Locator;

  // Footer
  private readonly footerVersionInfo: Locator;
  private readonly footerCopyrightDate: Locator;
  private readonly footerCompanyLink: Locator;
  private readonly footerRightsReserved: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.companyLogo = page.getByRole('img', { name: 'company-branding' });
    this.loginError = page.locator('p', { hasText: 'Invalid credentials' });
    this.forgotPasswordLink = page.getByText('Forgot your password?');
    this.resetPasswordContainerHeader = page.getByRole('heading', {
      name: 'Reset Password',
      level: 6,
    });
    this.forgotPasswordCancelButton = page.getByRole('button', { name: 'Cancel' });
    this.forgotPasswordResetButton = page.getByRole('button', { name: 'Reset Password' });
    this.resetPasswordSuccessMessage = page.getByRole('heading', {
      name: 'Reset Password link sent successfully',
      level: 6,
    });
    this.footerVersionInfo = page.locator('p', { hasText: 'OrangeHRM OS 5.7' });
    this.footerCopyrightDate = page.locator('p', { hasText: '© 2005 - 2025' });
    this.footerCompanyLink = page.getByRole('link', { name: 'OrangeHRM, Inc' });
    this.footerRightsReserved = page.locator('p', { hasText: 'All rights reserved.' });
  }

  public async fillUsernameInput(username: string): Promise<void> {
    await this.fillElement(this.usernameInput, username, 'Username');
  }

  public async fillPasswordInput(password: string): Promise<void> {
    await this.fillElement(this.passwordInput, password, 'Password');
  }

  public async clickLoginButton(): Promise<void> {
    await this.clickElement(this.loginButton, 'Login button');
  }

  public async verifyCompanyLogoIsDisplayed(): Promise<void> {
    await this.verifyElementState(this.companyLogo, 'visible', 'Company logo');
  }

  public async verifyLoginErrorIsDisplayed(): Promise<void> {
    await this.verifyElementState(this.loginError, 'visible', 'Login error');
  }

  public async verifyLoginErrorIsNotDisplayed(): Promise<void> {
    await this.verifyElementState(this.loginError, 'hidden', 'Login error');
  }

  public async clickForgotPasswordLink(): Promise<void> {
    await this.clickElement(this.forgotPasswordLink, 'Forgot password link');
  }

  public async verifyFooterIsDisplayed(
    expectedFooterVersionInfo: string,
    expectedFooterCopyrightDate: string,
    expectedFooterCompanyLink: string,
    expectedFooterRightsReserved: string,
  ): Promise<void> {
    const actualFooterVersionInfo = await this.getFooterVersionInfo();
    const actualFooterCopyrightDate = await this.getFooterCopyrightDate();
    const actualFooterCompanyLink = await this.getFooterCompanyLink();
    const actualFooterRightsReserved = await this.getFooterRightsReserved();

    expect(actualFooterVersionInfo).toBe(expectedFooterVersionInfo);
    expect(actualFooterCopyrightDate).toBe(expectedFooterCopyrightDate);
    expect(actualFooterCompanyLink).toBe(expectedFooterCompanyLink);
    expect(actualFooterRightsReserved).toBe(expectedFooterRightsReserved);
  }

  private async getFooterVersionInfo(): Promise<string> {
    const versionInfo = await this.getElementProperty<string>(
      this.footerVersionInfo,
      'textContent',
      undefined,
      'Footer version info',
    );

    return versionInfo;
  }

  private async getFooterCopyrightDate(): Promise<string> {
    const copyrightDate = await this.getElementProperty<string>(
      this.footerCopyrightDate,
      'textContent',
      undefined,
      'Footer copyright date',
    );

    return copyrightDate;
  }

  private async getFooterCompanyLink(): Promise<string> {
    const companyLink = await this.getElementProperty<string>(
      this.footerCompanyLink,
      'textContent',
      undefined,
      'Footer company link',
    );

    return companyLink;
  }

  private async getFooterRightsReserved(): Promise<string> {
    const rightsReserved = await this.getElementProperty<string>(
      this.footerRightsReserved,
      'textContent',
      undefined,
      'Footer rights reserved',
    );

    return rightsReserved;
  }

  public async verifyResetPasswordContainerHeaderIsDisplayed(): Promise<void> {
    await this.verifyElementState(
      this.resetPasswordContainerHeader,
      'visible',
      'Reset password container header',
    );
  }

  public async clickResetPasswordCancelButton(): Promise<void> {
    await this.clickElement(this.forgotPasswordCancelButton, 'Reset password cancel button');
  }

  public async clickResetPasswordResetButton(): Promise<void> {
    await this.clickElement(this.forgotPasswordResetButton, 'Reset password reset button');
  }

  public async verifyResetPasswordSuccessMessageIsDisplayed(): Promise<void> {
    await this.verifyElementState(
      this.resetPasswordSuccessMessage,
      'visible',
      'Reset password success message',
    );
  }

  public async verifyCorrectResetPasswordSuccessMessage(
    expectedSuccessMessage: string,
  ): Promise<void> {
    const actualSuccessMessage = await this.getResetPasswordSuccessMessage();
    expect(actualSuccessMessage).toBe(expectedSuccessMessage);
  }

  private async getResetPasswordSuccessMessage(): Promise<string> {
    const successMessage = await this.getElementProperty<string>(
      this.resetPasswordSuccessMessage,
      'textContent',
      undefined,
      'Reset password success message',
    );
    return successMessage;
  }

  public async verifyResetPasswordFlow(
    username: string,
    expectedSuccessMessage: string,
  ): Promise<void> {
    await this.clickForgotPasswordLink();
    await this.verifyResetPasswordContainerHeaderIsDisplayed();
    await this.fillUsernameInput(username);
    await this.clickResetPasswordResetButton();
    await this.verifyResetPasswordSuccessMessageIsDisplayed();
    await this.verifyCorrectResetPasswordSuccessMessage(expectedSuccessMessage);
  }
}
