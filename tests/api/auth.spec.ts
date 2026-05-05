–import { test, expect } from '../../src/fixtures/base';

test.describe('API – Auth', () => {
    test('API-AU-01 valid analyst returns 200 + token', async ({ authApi }) => {
          const res = await authApi.loginRaw({
                  username: process.env.ANALYST_USER!,
                  password: process.env.ANALYST_PASS!,
          });
          expect(res.status).toBe(200);
          expect(res.body.accessToken).toBeTruthy();
          expect(res.body.refreshToken).toBeTruthy();
    });

                test('API-AU-02 wrong password returns 401', async ({ authApi }) => {
                      const res = await authApi.loginRaw({
                              username: process.env.ANALYST_USER!,
                              password: 'definitely-wrong',
                      });
                      expect(res.status).toBe(401);
                      expect(res.body.error).toMatch(/credentials/i);
                });

                test('API-AU-03 expired token triggers refresh flow', async ({ authApi }) => {
                      const { refreshToken } = await authApi.login();
                      await authApi.expireCurrentToken();
                      const probe = await authApi.callProtectedRaw();
                      expect(probe.status).toBe(401);
                      const refreshed = await authApi.refresh(refreshToken);
                      expect(refreshed.status).toBe(200);
                      expect(refreshed.body.accessToken).toBeTruthy();
                });
});
