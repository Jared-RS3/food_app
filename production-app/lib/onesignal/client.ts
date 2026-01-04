/**
 * OneSignal Client
 * Push notification service
 */

import * as OneSignal from 'onesignal-node';

export const oneSignalClient = new OneSignal.Client(
  process.env.ONESIGNAL_APP_ID!,
  process.env.ONESIGNAL_REST_API_KEY!
);

/**
 * OneSignal app ID for client-side SDK
 */
export const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!;
