import { test as baseTest } from '@playwright/test';
import AuthStorageManager from '../src/utils/auth/storage/authStorageManager';
import AsyncFileManager from '../src/utils/fileSystem/asyncFileManager';
import AuthenticationFilter from '../src/utils/auth/authenticationFilter';
import { FetchCIEnvironmentVariables } from '../src/config/environment/resolver/fetch/fetchCIEnvironmentVariables';
import { FetchLocalEnvironmentVariables } from '../src/config/environment/resolver/fetch/fetchLocalEnvironmentVariables';
import { EnvironmentResolver } from '../src/config/environment/resolver/environmentResolver';
import { BrowserSessionManager } from '../src/utils/auth/state/browserSessionManager';
import { TopMenuPage } from '../src/ui/pages/topMenuPage';
import { SideMenuPage } from '../src/ui/pages/sideMenuPage';
import { LoginPage } from '../src/ui/pages/loginPage';
import logger from '../src/utils/logging/loggerManager';

type customFixtures = {
  shouldSaveAuthState: boolean;
  fetchCIEnvironmentVariables: FetchCIEnvironmentVariables;
  fetchLocalEnvironmentVariables: FetchLocalEnvironmentVariables;
  environmentResolver: EnvironmentResolver;
  loginPage: LoginPage;
  browserSessionManager: BrowserSessionManager;
  topMenuPage: TopMenuPage;
  sideMenuPage: SideMenuPage;
};

export const orangeHrmFixtures = baseTest.extend<customFixtures>({
  shouldSaveAuthState: [true, { option: true }],
  fetchCIEnvironmentVariables: async ({}, use) => {
    await use(new FetchCIEnvironmentVariables());
  },
  fetchLocalEnvironmentVariables: async ({}, use) => {
    await use(new FetchLocalEnvironmentVariables());
  },

  environmentResolver: async (
    { fetchCIEnvironmentVariables, fetchLocalEnvironmentVariables },
    use,
  ) => {
    await use(new EnvironmentResolver(fetchCIEnvironmentVariables, fetchLocalEnvironmentVariables));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  browserSessionManager: async ({ page, environmentResolver, loginPage }, use) => {
    await use(new BrowserSessionManager(page, environmentResolver, loginPage));
  },
  topMenuPage: async ({ page }, use) => {
    await use(new TopMenuPage(page));
  },
  sideMenuPage: async ({ page }, use) => {
    await use(new SideMenuPage(page));
  },

  context: async ({ browser, shouldSaveAuthState }, use, testInfo) => {
    let storageState: string | undefined;

    // Use AuthenticationFilter to determine if auth should be skipped
    const shouldSkipAuth = AuthenticationFilter.shouldSkipAuthSetup(testInfo, [
      'Invalid Credentials',
      'invalid credentials',
    ]);

    if (shouldSaveAuthState && !shouldSkipAuth) {
      const storagePath = await AuthStorageManager.resolveAuthStateFilePath();
      const fileExists = await AsyncFileManager.doesFileExist(storagePath);

      if (fileExists) {
        storageState = storagePath;
        logger.info(`Using auth state from: ${storagePath}`);
      } else {
        logger.warn(`Auth state file not found at: ${storagePath}`);
        storageState = undefined;
      }
    } else {
      logger.info(`Skipping auth state for test: ${testInfo.title}`);
      storageState = undefined;
    }

    const context = await browser.newContext({ storageState });
    await use(context);
    await context.close();
  },
});

export const test = orangeHrmFixtures;
export const expect = baseTest.expect;
