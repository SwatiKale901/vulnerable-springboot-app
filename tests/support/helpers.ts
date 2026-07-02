import assert from 'assert';
import { type APIRequestContext, type APIResponse, type Page } from 'playwright';
import { CustomWorld } from './world';

export function basicAuthHeader(user: string, pass: string) {
    const token = Buffer.from(`${user}:${pass}`).toString('base64');
    return { Authorization: `Basic ${token}` };
}

export function buildBasicAuthHeader(username: string, password: string): string {
    return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

export async function jsonFromResponse(res: any) {
    try {
        return await res.json();
    } catch (e) {
        return null;
    }
}

export async function getWithAuth(api: APIRequestContext, path: string, authHeader: any) {
    return api.get(path, { headers: { ...(authHeader || {}) } });
}

export async function postWithAuth(api: APIRequestContext, path: string, body: any, authHeader?: any) {
    return api.post(path, { data: body, headers: { 'Content-Type': 'application/json', ...(authHeader || {}) } });
}

export async function sendJsonRequest(world: CustomWorld, method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, payload: unknown, authHeader?: string): Promise<APIResponse> {
    assertApiRequest(world);
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    };
    if (authHeader) headers.Authorization = authHeader;
    const response = await world.apiRequest!.fetch(path, {
        method,
        headers,
        data: payload
    });
    return response;
}

export async function sendRawRequest(world: CustomWorld, method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, contentType: string, body: string, authHeader?: string): Promise<APIResponse> {
    assertApiRequest(world);
    const headers: Record<string, string> = {
        'Content-Type': contentType,
        Accept: '*/*'
    };
    if (authHeader) headers.Authorization = authHeader;
    const response = await world.apiRequest!.fetch(path, {
        method,
        headers,
        data: body
    });
    return response;
}

export async function openBrowserPage(world: CustomWorld, path: string): Promise<void> {
    assertPage(world);
    await world.page!.goto(`${world.baseUrl}${path}`);
}

export async function getPageBodyText(world: CustomWorld): Promise<string> {
    assertPage(world);
    const body = await world.page!.$('body');
    if (!body) return '';
    return (await body.textContent()) || '';
}

export async function getLastResponseText(world: CustomWorld): Promise<string> {
    assertLastResponse(world);
    return await world.lastResponse!.text();
}

export async function getLastResponseJson(world: CustomWorld): Promise<unknown> {
    assertLastResponse(world);
    return await world.lastResponse!.json();
}

function assertApiRequest(world: CustomWorld): asserts world is CustomWorld & { apiRequest: APIRequestContext } {
    if (!world.apiRequest) throw new Error('API request context is not initialized');
}

function assertPage(world: CustomWorld): asserts world is CustomWorld & { page: Page } {
    if (!world.page) throw new Error('Browser page is not initialized');
}

function assertLastResponse(world: CustomWorld): asserts world is CustomWorld & { lastResponse: APIResponse } {
    if (!world.lastResponse) throw new Error('No response has been recorded');
}
