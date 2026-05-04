import { APIRequestContext } from '@playwright/test';

/**
 * QueryApi - API-level operations on satellite & drone queries.
 */
export class QueryApi {
    static async create(ctx: APIRequestContext, payload: unknown) {
          const res = await ctx.post('/api/queries', { data: payload });
          if (!res.ok()) throw new Error(`createQuery ${res.status()} ${await res.text()}`);
          return res.json();
    }

  static async get(ctx: APIRequestContext, id: string) {
        const res = await ctx.get(`/api/queries/${id}`);
        if (!res.ok()) throw new Error(`getQuery ${res.status()}`);
        return res.json();
  }

  static async cancel(ctx: APIRequestContext, id: string) {
        return ctx.post(`/api/queries/${id}/cancel`);
  }

  static async waitForStatus(ctx: APIRequestContext, id: string, status: string, timeoutMs = 60_000) {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
                const q = await this.get(ctx, id);
                if (q.status === status) return q;
                if (q.status === 'failed' && status !== 'failed') {
                          throw new Error(`Query ${id} failed while waiting for ${status}`);
                }
                await new Promise(r => setTimeout(r, 1_000));
        }
        throw new Error(`Timeout waiting for ${id} -> ${status}`);
  }
}
