import { test } from '../../fixtures/orangehrm.fixtures';
import logger from '../../src/utils/logging/loggerManager';

test.describe.only('Side Menu Bar Test Suite @regression', () => {
  //   test.afterEach(async ({ page }) => {
  //     if (page && !page.isClosed()) {
  //       await page.close();
  //     }
  //   });

  test('Verify side menus are visible', async ({ sideMenuPage, loginPage, environmentResolver }) => {
      const resolvedUrl = await environmentResolver.getPortalBaseUrl();
    await loginPage.navigateToUrl(resolvedUrl);

    await sideMenuPage.verifySideMenusAreVisible();
    logger.info('Side menus are visible');
  });
});
