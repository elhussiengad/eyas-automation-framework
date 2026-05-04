import { test as base, expect, Page, APIRequestContext, request } from '@playwright/test';
import { AuthApi } from '../api/AuthApi';
import { DroneQueryForm } from '../pages/queryBuilder/DroneQueryForm';
import { SatelliteQueryForm } from '../pages/queryBuilder/SatelliteQueryForm';
import { VideoPlayer } from '../pages/components/VideoPlayer';
import { TelemetryHUD } from '../pages/components/TelemetryHUD';
import {
    injectLatency, dropWebSocket, simulateGpsLoss,
    throttleNetwork, killDroneHeartbeat, restoreNetwork,
} from '../utils/chaos';

type Fixtures = {
    authedPage: Page;
    apiCtx: APIRequestContext;
    droneForm: DroneQueryForm;
    satelliteForm: SatelliteQueryForm;
    videoPlayer: VideoPlayer;
    telemetry: TelemetryHUD;
    chaos: {
      latency: (ms: number) => Promise<void>;
      dropStream: () => Promise<void>;
      gpsLoss: () => Promise<void>;
      throttle: (kbps: number) => Promise<void>;
      killHeart: () => Promise<void>;
      restore: () => Promise<void>;
    };
};

export const test = base.extend<Fixtures>({
    authedPage: async ({ page, baseURL }, use) => {
          const auth = new AuthApi(baseURL!);
          const token = await auth.loginAs('analyst');
          await page.addInitScript((t) => localStorage.setItem('auth_token', t), token);
          await page.goto('/');
          await use(page);
    },

    apiCtx: async ({ baseURL }, use) => {
          const ctx = await request.newContext({ baseURL });
          await use(ctx);
          await ctx.dispose();
    },

    droneForm:     async ({ authedPage }, use) => use(new DroneQueryForm(authedPage)),
    satelliteForm: async ({ authedPage }, use) => use(new SatelliteQueryForm(authedPage)),
    videoPlayer:   async ({ authedPage }, use) => use(new VideoPlayer(authedPage)),
    telemetry:     async ({ authedPage }, use) => use(new TelemetryHUD(authedPage)),

    chaos: async ({ authedPage }, use) => use({
          latency:    (ms)   => injectLatency(authedPage, ms),
          dropStream: ()     => dropWebSocket(authedPage, /\/stream\//),
          gpsLoss:    ()     => simulateGpsLoss(authedPage),
          throttle:   (kbps) => throttleNetwork(authedPage, kbps),
          killHeart:  ()     => killDroneHeartbeat(authedPage),
          restore:    ()     => restoreNetwork(authedPage),
    }),
});

export { expect };
