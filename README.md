# Playwright Authentication Storage State Automation

## Overview

This repository streamlines **authenticated end-to-end testing** using **Playwright** and **TypeScript** by managing browser storage state. It enables one-time login automation and **reuses the authenticated session across all test suites**.

By persisting authentication state, the setup:

* 🚀 Reduces test execution time
* 🔒 Improves reliability of secure routes
* 🔁 Eliminates redundant login steps

Ideal for projects requiring **consistent, secure, and scalable** test automation.

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

#### 1. Generate Secret Key

```bash
npx cross-env PLAYWRIGHT_GREP="@generate-key" npm run test:encryption:dev
```

#### 2. Encrypt Credentials

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

Playwright's **storage state** is used to persist authentication across sessions, avoiding repeated logins.

### How It Works

1. **Setup Phase (`*.setup.ts`)**

   * Performs login using valid credentials
   * Saves session to a storage file
   * Runs **once** before other tests

2. **Test Execution Phase**

   * Tests in the main project (e.g., `chromium`) reuse the saved session
   * Auth is **automatically skipped** for tests that don't need it (e.g., login page)
   * When running all tests (e.g., sanity or full suite), auth setup runs first, and tests that need auth use the session; those that don’t simply ignore it

✅ **Summary**:
Authentication runs once before the test suite. Tests that require auth will use the stored session, while those that don’t (e.g., login/logout tests) will skip it automatically. This makes the setup seamless when running full suites like `@sanity`.

---

### Key Components

| Component               | Purpose                                                               |
| ----------------------- | --------------------------------------------------------------------- |
| `BrowserSessionManager` | Automates login and saves the session state                           |
| `AuthStorageManager`    | Resolves the storage state file path                                  |
| `AuthenticationFilter`  | Determines whether a test should use or skip authentication           |
| `environmentResolver`   | Dynamically resolves credentials and base URLs from env configuration |

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

This path determines where the session is saved and reloaded.

---

### Playwright Project Configuration

```ts
projects: [
  {
    name: 'setup',
    testMatch: /.*\.setup\.ts/,
    use: { storageState: undefined }
  },
  {
    name: 'chromium',
    use: { storageState: storageStatePath },
    dependencies: ['setup']
  }
]
```

* `setup` — Runs before main tests to prepare the auth state
* `chromium` — Runs tests using the pre-authenticated session

You can bypass the auth phase entirely by setting `shouldSkipBrowserInit` to `true`—useful for non-UI or API-only scenarios.

---

## Advanced Encryption Commands

Tagged test executions allow flexible encryption handling:

```bash
npx cross-env PLAYWRIGHT_GREP="@<tag>" npm run test:encryption:<env>
```

Replace `<tag>` with the desired operation, and `<env>` with `dev`, `uat`, etc.

| Tag                  | Action                                   |
| -------------------- | ---------------------------------------- |
| `@generate-key`      | Generate a new encryption key            |
| `@encrypt-vars`      | Encrypt environment variables            |
| `@verify-encryption` | Validate encrypted values                |
| `@rotate-key`        | Rotate the key and re-encrypt all values |
| `@rotation-status`   | Check current encryption key status      |
| `@system-audit`      | Run an audit to ensure secure setup      |
| `@key-info`          | Retrieve metadata about encryption keys  |

---

## Command Line Utilities

| Command                   | Description                              |
| ------------------------- | ---------------------------------------- |
| `npm run ui`              | Launch Playwright Test Runner UI         |
| `npm run record`          | Start Playwright code generator          |
| `npm run report`          | View HTML test report                    |
| `npm run format`          | Format code with Prettier                |
| `npm run format:check`    | Check formatting only                    |
| `npm run type:check`      | Run TypeScript checks                    |
| `npm run lint`            | Lint source files                        |
| `npm run lint:fix`        | Auto-fix lint issues                     |
| `npm run spell`           | Spellcheck markdown and source           |
| `npm run test:failed:dev` | Re-run failed tests in `dev` environment |
| `npm run test:failed:uat` | Re-run failed tests in `uat` environment |

---

## Best Practices

✅ Do:

* Reuse authentication to speed up tests
* Rotate encryption keys after credential changes
* Run `npm install` after switching branches

🚫 Don’t:

* ❌ Commit `.env` or decrypted secrets
* ❌ Skip encryption in production/test environments

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