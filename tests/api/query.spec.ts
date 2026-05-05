–import { test, expect } from '../../src/fixtures/base';

test.describe('API – Queries', () => {
    test('API-QY-01 POST /queries (drone) creates and returns id', async ({ queryApi }) => {
          const res = await queryApi.createDroneQueryRaw({
                  missionName: 'API smoke',
                  droneId: 'drone-001',
                  videoMode: 'stream',
          });
          expect(res.status).toBe(201);
          expect(res.body.id).toMatch(/^q_/);
    });

                test('API-QY-02 malformed payload returns 422', async ({ queryApi }) => {
                      const res = await queryApi.createDroneQueryRaw({ missionName: '' } as any);
                      expect(res.status).toBe(422);
                      expect(res.body.errors).toBeDefined();
                });

                test('API-QY-03 cross-tenant read returns 403', async ({ queryApi, authApi }) => {
                      const otherTenant = await authApi.loginAs('admin-other-tenant');
                      const owned = await queryApi.createDroneQuery({ missionName: 'tenant-A' });
                      const res = await queryApi.getQueryRaw(owned.id, otherTenant.accessToken);
                      expect(res.status).toBe(403);
                });

                test('API-QY-04 list queries paginates and respects page-size cap', async ({ queryApi }) => {
                      const res = await queryApi.listQueriesRaw({ page: 1, pageSize: 1000 });
                      expect(res.status).toBe(200);
                      expect(res.body.items.length).toBeLessThanOrEqual(100);
                      expect(res.body.pageSize).toBe(100);
                });
});
