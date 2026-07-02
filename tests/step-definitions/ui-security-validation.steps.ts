import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { CustomWorld } from '../support/world';
import { openBrowserPage, getPageBodyText } from '../support/helpers';

Given('I open the login page', async function (this: CustomWorld) {
  await openBrowserPage(this, '/login');
  await this.page!.waitForSelector('#username');
  await this.page!.waitForTimeout(500);
});

When('I sign in as {string} with password {string}', async function (this: CustomWorld, username: string, password: string) {
  await this.page!.fill('#username', username);
  await this.page!.waitForTimeout(300);
  await this.page!.fill('#password', password);
  await this.page!.waitForTimeout(300);
  await Promise.all([
    this.page!.waitForNavigation({ waitUntil: 'networkidle' }),
    this.page!.click('button[type="submit"]')
  ]);
  await this.page!.waitForTimeout(600);
});

Then('I should see a page containing {string}', async function (this: CustomWorld, expectedText: string) {
  await this.page!.waitForTimeout(500);
  const bodyText = await getPageBodyText(this);
  assert.ok(bodyText.includes(expectedText), `Expected page to contain ${expectedText}`);
});
