import { request, APIRequestContext } from '@playwright/test';

type Role = 'admin' | 'analyst' | 'viewer';

const CREDS: Record<Role, { user?: string; pass?: string }> = {
    admin:   { user: process.env.ADMIN_USER,   pass: process.env.ADMIN_PASS },
    analyst: { user: process.env.ANALYST_USER, pass: process.env.ANALYST_PASS },
    viewer:  { user: process.env.VIEWER_USER,  pass: process.env.VIEWER_PASS },
};

/**
 * AuthApi - performs API-level login and returns a JWT for browser injection.
 */
export class AuthApi {
    private ctx?: APIRequestContext;

  constructor(private readonly baseURL: string) {}

  async loginAs(role: Role): Promise<string> {
        this.ctx = this.ctx ?? await request.newContext({ baseURL: this.baseURL });
        const { user, pass } = CREDS[role];
        if (!user || !pass) throw new Error(`Missing credentials for role ${role}`);

      const res = await this.ctx.post('/api/auth/login', {
              data: { username: user, password: pass },
      });
        if (!res.ok()) throw new Error(`Login failed (${res.status()}) for ${role}`);
        const body = await res.json();
        return body.token ?? body.access_token;
  }

  async logout(token: string) {
        this.ctx = this.ctx ?? await request.newContext({ baseURL: this.baseURL });
        await this.ctx.post('/api/auth/logout', {
                headers: { Authorization: `Bearer ${token}` },
        });
  }
}
