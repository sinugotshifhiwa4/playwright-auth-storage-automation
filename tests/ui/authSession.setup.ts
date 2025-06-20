import { test as authSession } from '../../fixtures/orangehrm.fixtures';
import logger from '../../src/utils/logging/loggerManager';

/**
 * Authenticates the user by:
 * - Navigating to the login page
 * - Logging into the portal
 * - Saving the authenticated browser session state
 *
 * This session can be reused across tests that require a pre-authenticated context.
 */
authSession(
  `Authenticate @sanity @regression`,
  async ({ browserSessionManager, environmentResolver, sideMenuPage }) => {
    const { username, password } = await environmentResolver.getPortalCredentials('dev', false);

    await browserSessionManager.performLogin(username, password, true);
    await sideMenuPage.verifyDashboardMenuIsVisible();

    logger.info('Authentication session state setup completed and saved successfully.');
  },
);
