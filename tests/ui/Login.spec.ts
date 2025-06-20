import { test } from '../../fixtures/orangehrm.fixtures';
import logger from '../../src/utils/logging/loggerManager';

test.describe('Login Page Validation', () => {
  test('Verify navigation to login page and verify URL and title', async ({
    loginPage,
    environmentResolver,
  }) => {
    const resolvedUrl = await environmentResolver.getPortalBaseUrl();

    await loginPage.navigateToUrl(resolvedUrl);

    await loginPage.verifyPageUrl(resolvedUrl, { exact: true });
    await loginPage.verifyPageTitle('OrangeHRM', { exact: true });

    logger.info('Login page successfully loaded and validated');
  });
});

test.describe.only('Login - Valid Credentials', () => {
  test('Verify user can login successfully with valid credentials', async ({
    loginPage,
    environmentResolver,
    sideMenuPage
  }) => {
    const resolvedUrl = await environmentResolver.getPortalBaseUrl();
    await loginPage.navigateToUrl(resolvedUrl);

    await loginPage.verifyLoginErrorIsNotDisplayed();
    await sideMenuPage.verifyDashboardMenuIsVisible();

    logger.info('Login successfully');
  });
});

test.describe.only('Login - Invalid Credentials', () => {
  test('Verify user with invalid credentials cannot login', async ({
    loginPage,
    environmentResolver,
    browserSessionManager,
  }) => {
    const resolvedUrl = await environmentResolver.getPortalBaseUrl();
    await loginPage.navigateToUrl(resolvedUrl);

    const { username } = await environmentResolver.getPortalCredentials('dev', false);

    await browserSessionManager.performLogin(username, 'invalidPassword', false);
    await loginPage.verifyLoginErrorIsDisplayed();
    logger.info('Login failed');
  });
});

test.describe('Login - Forgot Password Flow', () => {
  test('Verify user can reset password successfully', async ({
    environmentResolver,
    loginPage,
  }) => {
    const resolvedUrl = await environmentResolver.getPortalBaseUrl();
    await loginPage.navigateToUrl(resolvedUrl);
    await loginPage.verifyResetPasswordFlow('Admin', 'Reset Password link sent successfully');
    logger.info('Password reset successfully');
  });
});

test.describe('Login - Footer Elements', () => {});
