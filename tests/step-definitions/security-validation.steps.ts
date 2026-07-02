import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { basicAuthHeader, jsonFromResponse, postWithAuth, getWithAuth, getLastResponseText, getPageBodyText } from '../support/helpers';
import { CustomWorld } from '../support/world';

Given('I register user {string} with password {string}', async function (this: CustomWorld, username: string, password: string) {
  const res = await this.apiRequest!.post('/api/register', { data: { username, password, email: `${username}@example.test` } });
  this.lastResponse = res;
  this.lastJson = await jsonFromResponse(res);
});

Given('user {string} exists with password {string}', async function (this: CustomWorld, username: string, password: string) {
  const res = await this.apiRequest!.post('/api/register', { data: { username, password, email: `${username}@example.test` } });
  this.lastResponse = res;
  this.lastJson = await jsonFromResponse(res);
});

When('I login as {string} with password {string}', async function (this: CustomWorld, username: string, password: string) {
  const res = await this.apiRequest!.post('/api/login', { data: { username, password } });
  this.lastResponse = res;
  this.lastJson = await jsonFromResponse(res);
});

When('I login as {string} with password {string} and capture id as {string}', async function (this: CustomWorld, username: string, password: string, key: string) {
  const res = await this.apiRequest!.post('/api/login', { data: { username, password } });
  this.lastResponse = res;
  this.lastJson = await jsonFromResponse(res);
  if (this.lastJson && (this.lastJson as any).id) this.stash[key] = (this.lastJson as any).id;
});

When('I request GET {string} using basic auth for {string}', async function (this: CustomWorld, path: string, username: string) {
  const header = basicAuthHeader(username, username === 'admin' ? 'admin123' : username === 'alice' ? 'alice123' : username === 'bob' ? 'bob123' : 'pass123');
  const resolvedPath = path.replace(/\{(\w+)\}/g, (_, k) => this.stash[k]);
  const res = await getWithAuth(this.apiRequest!, resolvedPath, header);
  this.lastResponse = res;
  this.lastJson = await jsonFromResponse(res);
});

When('I request GET {string} using basic auth for {string} with password {string}', async function (this: CustomWorld, path: string, username: string, password: string) {
  const header = basicAuthHeader(username, password);
  const res = await getWithAuth(this.apiRequest!, path, header);
  this.lastResponse = res;
  this.lastJson = await jsonFromResponse(res);
});

When('I request GET {string}', async function (this: CustomWorld, path: string) {
  const resolvedPath = path.replace(/\{(\w+)\}/g, (_, k) => this.stash[k]);
  const res = await this.apiRequest!.get(resolvedPath);
  this.lastResponse = res;
  this.lastJson = await jsonFromResponse(res);
});

When('I perform POST {string} with body {string} using basic auth for {string}', async function (this: CustomWorld, path: string, bodyStr: string, username: string) {
  const header = basicAuthHeader(username, username === 'admin' ? 'admin123' : username === 'alice' ? 'alice123' : username === 'bob' ? 'bob123' : 'pass123');
  const bodyInterpolated = bodyStr.replace(/\{(\w+)\}/g, (_, k) => this.stash[k]);
  const body = JSON.parse(bodyInterpolated);
  const res = await postWithAuth(this.apiRequest!, path, body, header);
  this.lastResponse = res;
  this.lastJson = await jsonFromResponse(res);
});

Then('the login response is successful and does not contain a password field', async function (this: CustomWorld) {
  assert.strictEqual(this.lastResponse!.status(), 200);
  assert.ok(this.lastJson);
  assert.strictEqual(typeof (this.lastJson as any).password, 'undefined');
});

Then('the login response status is 401', async function (this: CustomWorld) {
  assert.strictEqual(this.lastResponse!.status(), 401);
});

Then('the response status should be {int}', async function (this: CustomWorld, status: number) {
  assert.strictEqual(this.lastResponse!.status(), status);
});

Then('the response status should be {int} and body is an array', async function (this: CustomWorld, status: number) {
  assert.strictEqual(this.lastResponse!.status(), status);
  assert.ok(Array.isArray(this.lastJson), 'Expected body to be an array');
});

Then('the response HTML does not contain {string}', async function (this: CustomWorld, unexpectedText: string) {
  const html = await getLastResponseText(this);
  assert.ok(!html.includes(unexpectedText), `Expected HTML not to contain ${unexpectedText}`);
});

Then('the current page body text does not contain {string}', async function (this: CustomWorld, unexpectedText: string) {
  const bodyText = await getPageBodyText(this);
  assert.ok(!bodyText.includes(unexpectedText), `Expected page body text not to contain ${unexpectedText}`);
});

Then('the current page body text contains {string}', async function (this: CustomWorld, expectedText: string) {
  const bodyText = await getPageBodyText(this);
  assert.ok(bodyText.includes(expectedText), `Expected page body text to contain ${expectedText}`);
});

// Additional step definitions to match feature variants
When('I login as {string} with password {string} and capture as {string}', async function (this: CustomWorld, username: string, password: string, key: string) {
  const res = await this.apiRequest!.post('/api/login', { data: { username, password } });
  this.lastResponse = res;
  this.lastJson = await jsonFromResponse(res);
  if (this.lastJson && (this.lastJson as any).id) this.stash[key] = (this.lastJson as any).id;
});

Then('the response status should be {int} and username equals {string}', async function (this: CustomWorld, status: number, username: string) {
  assert.strictEqual(this.lastResponse!.status(), status);
  const json = this.lastJson as any;
  assert.ok(json, 'Expected JSON response');
  assert.strictEqual(json.username, username);
});

Then('the response status should be {int} and body.status equals {string}', async function (this: CustomWorld, status: number, expected: string) {
  assert.strictEqual(this.lastResponse!.status(), status);
  const json = this.lastJson as any;
  assert.ok(json);
  assert.strictEqual(String(json.status), expected);
});

// Regex-based step to accept unquoted JSON bodies in the feature file
When(/^I perform POST "([^"]+)" with body (.+) using basic auth for "([^"]+)"$/, async function (this: CustomWorld, path: string, bodyStr: string, username: string) {
  const header = basicAuthHeader(username, username === 'admin' ? 'admin123' : username === 'alice' ? 'alice123' : username === 'bob' ? 'bob123' : 'pass123');
  const bodyInterpolated = bodyStr.replace(/\{(\w+)\}/g, (_, k) => this.stash[k]);
  const body = JSON.parse(bodyInterpolated);
  const res = await postWithAuth(this.apiRequest!, path, body, header);
  this.lastResponse = res;
  this.lastJson = await jsonFromResponse(res);
});
