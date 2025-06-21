# Playwright Authentication Storage State Automation

## Overview

This repository simplifies **authenticated end-to-end testing** in **Playwright** using persistent browser storage state. It automates login flows once and reuses the authenticated session across all test suites.

By persisting authentication state, the setup:

* 🚀 **Reduces test execution time**
* 🔒 **Improves reliability of secure routes**
* 🔁 **Eliminates redundant login steps**

Ideal for projects requiring **consistent, secure, and scalable** test automation.

---

## Table of Contents

* [Getting Started](#getting-started)
* [Environment Setup](#environment-setup)
* [Encryption Workflows](#encryption-workflows)
* [Authentication State Configuration](#authentication-state-configuration)
* [Running Tests](#running-tests)
* [Running Tests by Tag](#running-tests-by-tag)
* [Command Line Utilities](#command-line-utilities)
* [Best Practices](#best-practices)
* [Contributing](#contributing)
* [Further Reading](#further-reading)

---

## Getting Started

Ensure **Node.js** is installed. Then, install dependencies:

```bash
npm install
```

---

## Environment Setup

### 1. Configure Environment Variables

Copy the sample environment file:

```bash
cp envs/.env.dev.example envs/.env.dev
```

Update the newly created `.env.dev` file with your credentials:

```env
PORTAL_USERNAME=your.username
PORTAL_PASSWORD=your.password
```

> ⚠️ The root `.env` file is auto-managed—**do not edit it manually**.

---

## Encryption Workflows

Sensitive environment data is encrypted using **AES-GCM** and secured with **Argon2** hashing.

### Encryption Commands

#### 🔑 1. Generate Secret Key

```bash
npx cross-env PLAYWRIGHT_GREP="@generate-key" npm run test:encryption:dev
```

#### 🔐 2. Encrypt Credentials

```bash
npx cross-env PLAYWRIGHT_GREP="@encrypt-vars" npm run test:encryption:dev
```

> 💡 Replace `dev` with your target environment (e.g., `uat`, `prod`).
> ⚙️ You may pass `false` to skip encryption (not recommended):

```ts
const { username, password } = await environmentResolver.getPortalCredentials('dev', false);
```

---

## Authentication State Configuration

Playwright’s **storage state** persists login sessions between test runs, avoiding repeated authentication.

### How It Works

1. **Setup Phase (`*.setup.ts`)**

   * Logs in with valid credentials
   * Saves session to a local file
   * Runs once before other tests

2. **Test Execution Phase**

   * Test project (e.g., `chromium`) reuses saved session
   * Auth is **selectively applied**—tests like login/logout run without stored session

✅ **Summary**:
Authentication runs once before the suite. Authenticated tests use the stored session; others skip it. This makes full suite runs (e.g., `@sanity`) seamless.

---

### Key Components

| **Component**           | **Purpose**                                                             |
| ----------------------- | ----------------------------------------------------------------------- |
| `BrowserSessionManager` | Automates login and saves session state                                 |
| `AuthStorageManager`    | Resolves path for saving/loading the session file                       |
| `AuthenticationFilter`  | Determines whether a test should apply authentication                   |
| `environmentResolver`   | Dynamically resolves credentials and base URLs from environment configs |

---

### Example Setup Test

```ts
test('Authenticate @sanity @regression', async ({ browserSessionManager, environmentResolver }) => {
  const { username, password } = await environmentResolver.getPortalCredentials('dev', false);
  await browserSessionManager.performLogin(username, password, true);
});
```

---

### Conditional Auth State Loading

The `context` fixture loads `storageState` **only if**:

* `shouldSaveAuthState` is `true` (default), **and**
* The test is **not filtered out** by `AuthenticationFilter`

Fallback: If the auth file is missing, a new session is started and a warning is logged.

```ts
const context = await browser.newContext({ storageState });
```

---

### Storage File Resolution

```ts
AuthStorageManager.resolveAuthStateFilePath();
```

This determines where session data is saved and loaded from across test runs.

---

### Playwright Project Configuration

Split test execution into two projects for setup and test reuse:

```ts
projects: [
  {
    name: 'setup',
    testMatch: /.*\.setup\.ts/,
    use: { storageState: undefined },
  },
  {
    name: 'chromium',
    use: { storageState: storageStatePath },
    dependencies: ['setup'],
  },
];
```

* `setup`: Runs first to generate and save authenticated session
* `chromium`: Executes tests using the saved session

To skip browser-based login (e.g., for API-only tests), set `shouldSkipBrowserInit` to `true`.

---

## Running Tests

Use the following commands to run tests in various environments:

| **Command**               | **Description**                             |
| ------------------------- | ------------------------------------------- |
| `npm run test:ui:dev`     | Run UI tests in the `dev` environment       |
| `npm run test:failed:dev` | Re-run failed tests from previous `dev` run |

> 💡 Replace `dev` with `uat`, `prod`, or any supported environment.

**Example:**

```bash
npm run test:api:uat
```

---

## Running Tests by Tag

Run specific encryption tasks by tag:

```bash
npx cross-env PLAYWRIGHT_GREP="@<tag>" npm run test:encryption:<env>
```

| **Tag**              | **Action**                               |
| -------------------- | ---------------------------------------- |
| `@generate-key`      | Generate a new encryption key            |
| `@encrypt-vars`      | Encrypt environment variables            |
| `@verify-encryption` | Validate encrypted values                |
| `@rotate-key`        | Rotate the key and re-encrypt all values |
| `@rotation-status`   | Check current encryption key status      |
| `@system-audit`      | Run a system-wide security audit         |
| `@key-info`          | Retrieve encryption key metadata         |

---

## Command Line Utilities

| **Command**            | **Description**                  |
| ---------------------- | -------------------------------- |
| `npm run ui`           | Launch Playwright Test Runner UI |
| `npm run record`       | Start Playwright code generator  |
| `npm run report`       | Open latest HTML test report     |
| `npm run format`       | Format code using Prettier       |
| `npm run format:check` | Check formatting without writing |
| `npm run type:check`   | Run TypeScript type checks       |
| `npm run lint`         | Lint source files                |
| `npm run lint:fix`     | Auto-fix lint issues             |

---

## Best Practices

✅ **Do this:**

* Reuse authentication to speed up tests
* Rotate encryption keys after credential changes
* Run `npm install` after switching branches

🚫 **Avoid this:**

* ❌ Committing `.env` or decrypted secrets
* ❌ Disabling encryption in production/test environments

---

## Contributing

Contributions are welcome!
Please feel free to open issues or submit pull requests.

> *TODO: Add `CONTRIBUTING.md` for contribution guidelines.*

---

## Further Reading

* [Playwright Official Docs](https://playwright.dev/docs/intro)
* [Playwright Authentication](https://playwright.dev/docs/auth)
* [Environment Variables in Playwright](https://playwright.dev/docs/test-configuration#environment-variables)
* [Microsoft Docs: Creating README Files](https://docs.microsoft.com/en-us/azure/devops/repos/git/create-a-readme?view=azure-devops)

---