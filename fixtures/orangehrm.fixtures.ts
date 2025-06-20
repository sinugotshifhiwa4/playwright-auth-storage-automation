import { test as baseTest } from '@playwright/test';


import { FetchCIEnvironmentVariables } from '../src/config/environment/resolver/fetch/fetchCIEnvironmentVariables';
import { FetchLocalEnvironmentVariables } from '../src/config/environment/resolver/fetch/fetchLocalEnvironmentVariables';
import { EnvironmentResolver } from '../src/config/environment/resolver/environmentResolver';
import { LoginPage } from '../src/ui/pages/loginPage';

type customFixtures = {
    fetchCIEnvironmentVariables: FetchCIEnvironmentVariables;
    fetchLocalEnvironmentVariables: FetchLocalEnvironmentVariables;
    environmentResolver: EnvironmentResolver;
  loginPage: LoginPage;
};

export const orangeHrmFixtures = baseTest.extend<customFixtures>({

  fetchCIEnvironmentVariables: async ({}, use) => {
    await use(new FetchCIEnvironmentVariables());
  },
  fetchLocalEnvironmentVariables: async ({}, use) => {
    await use(new FetchLocalEnvironmentVariables());
  },

  environmentResolver: async ({ fetchCIEnvironmentVariables, fetchLocalEnvironmentVariables }, use) => {
    await use(new EnvironmentResolver(fetchCIEnvironmentVariables, fetchLocalEnvironmentVariables));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export const test = orangeHrmFixtures;
export const expect = baseTest.expect;
