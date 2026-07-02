export const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:8080';

// A minimal shared stash interface for scenarios
export interface Stash {
  [key: string]: any;
}
import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { chromium, request, type APIRequestContext, type Browser, type BrowserContext, type Page, type APIResponse } from 'playwright';

export class CustomWorld extends World {
    baseUrl = process.env.APP_BASE_URL || 'http://127.0.0.1:8080';
    browser?: Browser;
    context?: BrowserContext;
    page?: Page;
    apiRequest?: APIRequestContext;
    lastResponse?: APIResponse;
    stash: Stash = {};
    lastJson?: any;

    constructor(options: IWorldOptions) {
        super(options);
    }

    async init() {
        this.apiRequest = await request.newContext({ baseURL: this.baseUrl });
        const headless = process.env.PLAYWRIGHT_HEADLESS !== '0' && process.env.PLAYWRIGHT_HEADLESS !== 'false';
        this.browser = await chromium.launch({ headless, slowMo: 100, args: ['--start-maximized'] });
        this.context = await this.browser.newContext({ baseURL: this.baseUrl, viewport: null });
        this.page = await this.context.newPage();
    }

    async close() {
        if (this.lastResponse) {
            await this.lastResponse.dispose();
        }
        if (this.page) {
            await this.page.close();
        }
        if (this.context) {
            await this.context.close();
        }
        if (this.browser) {
            await this.browser.close();
        }
        if (this.apiRequest) {
            await this.apiRequest.dispose();
        }
    }
}

setWorldConstructor(CustomWorld);
