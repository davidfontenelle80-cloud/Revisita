# Revisita closed-app reminders — deployment pending

PR #5 must stay draft. No closed-app notification has been received in this audit, and push is **not live**. The published app remains v1.4.4.

## Confirmed account, 2026-09-24

- Dashboard: `Davidfontenelle80@gmail.com's Account`.
- Account ID: `3df617adc3ddf2b3ed89cedbbb917fab`.
- workers.dev subdomain: `davidfontenelle80.workers.dev`.
- Intended Worker: `https://revisita-push.davidfontenelle80.workers.dev` (not deployed).
- No existing Revisita Worker was listed. Ministry Tracker and its data were not modified.

## Scheduling and delivery

Each enabled browser/Home Screen installation has its own subscription and 32-byte random ownership token. The client saves the token before registration, and the server stores only its SHA-256 hash. Existing subscription registration, schedule replacement, test sends and removal require that token. The notification permission prompt runs directly from the Enable button before network awaits.

A sync atomically replaces this device's pending schedule, including deletions. Only active visits with a valid date and time and a future five-minute reminder are included. Saves, logging/completing, deletion, import/restore, cloud merge, startup, foreground and reconnect trigger synchronization. Wait for **Alerts synced** before closing. Offline changes cannot cancel a server reminder until reconnection. Other devices update when their copies of the visits next sync; a closed second device may retain its old schedule. Push is per device, not a replacement for KHub visit-data synchronization.

`PUSH_SCHEDULER` is a Revisita-only SQLite Durable Object that serializes mutations and cron sends. This replaces the draft's shared KV minute buckets, which could lose concurrent writes and read stale cancellations. `PUSH_STORE` is a separate KV namespace holding non-sensitive delivery receipts (timestamps/status only), expiring after 24 hours. No private key is stored in either store.

The `* * * * *` cron runs independently of open app windows. One Web Push submission is made per scheduled visit/device. Before sending, the attempt is recorded durably to prevent duplicate submissions after a restart. Consequently an ambiguous network failure is **not retried** and may lose that reminder. Requests time out after ten seconds. Reminders more than five minutes late are discarded; push-service TTL is five minutes. Device settings, power saving, connectivity, cron and push-service delays can move delivery slightly from the scheduled minute. This is not an exact-time or guaranteed-delivery alarm.

Expired subscriptions (404/410) and their pending reminders are removed. Disabling alerts removes the device's subscription and all pending reminders, then unsubscribes locally. Tapping a notification focuses an existing Revisita window or opens Revisita, never a payload-supplied external URL.

Abuse bounds: JSON bodies at most 128 KiB; 500 reminders/device; 1,000 subscriptions; ten new registrations/IP/hour; thirty schedule syncs/device/minute; one test send/device/minute; 100 scheduled attempts per cron tick. Endpoints are limited to HTTPS Apple, Google, Mozilla and Windows push services, with no redirects. Keys, IDs, times and content lengths are validated. Anonymous registration is still public; these bounds are intended for this small app, not a high-volume service.

## Time zones and calendars

New or rescheduled visits save the device's IANA zone as `dueTimeZone`. Notes-only edits retain it. Wall time is converted using the offset on the **visit date**, not today's offset. Connecticut (`America/New_York`) observes DST; Dominican Republic (`America/Santo_Domingo`) stays UTC−4. Thus 10:00 in Connecticut is 15:00 UTC in December and 14:00 UTC in July; 10:00 in the DR is 14:00 UTC in both.

The spring DST gap is rejected; the fall repeated hour selects its first occurrence. Existing visits with no stored zone retain the old floating device-local interpretation until rescheduled; review those schedules when traveling or synchronizing across zones. The visit detail shows a saved zone. Date grouping elsewhere in the app still follows its existing local calendar-date behavior.

For visits with a stored zone, `.ics` exports UTC start/end plus an explicit `TRIGGER:-PT5M` when five minutes is selected. Legacy exports remain floating local time. Calendar application import/notification behavior still needs phone acceptance testing. An untimed calendar event may have its separate morning alarm; untimed visits never get Web Push. Google Calendar links include the saved zone but **do not set an exact five-minute alarm**; the calendar's reminder defaults apply. Existing external calendar events must still be updated/removed by the user.

## Deployment steps (executed 2026-09-24)

Deployed via the Cloudflare API using a scoped token (`revisita-push deploy`: Workers Scripts Edit, Workers KV Storage Edit, Account Settings Read). Wrangler OAuth was not used. Only Revisita resources were created or changed; Ministry Tracker was untouched.

1. Token verified active; workers.dev subdomain confirmed as `davidfontenelle80`.
2. Created new isolated KV namespace `revisita-push-PUSH_STORE`, id `0863854e6afe4d87a262043c7d66b037`, and recorded it in `wrangler.toml`.
3. Worker `revisita-push` uploaded (ES modules: `worker.js` + `web-push.js`). The v1 `new_sqlite_classes` migration for `PushScheduler` applied on first upload; re-uploads omit `migrations` (re-sending is rejected with 10074).
4. Generated a new P-256 VAPID pair in memory; uploaded only the private scalar as the `VAPID_PRIVATE_KEY` secret; wrote the public key to `[vars] VAPID_PUBLIC_KEY` in `wrangler.toml`. Note: plain-text vars must be sent as `plain_text` bindings in the upload metadata, not a `vars` object.
5. Set the cron trigger via `PUT .../workers/scripts/revisita-push/schedules` with body `[{"cron": "* * * * *"}]` (an array of `{cron}` objects — the `{"crons": [...]}` shape is rejected with 10026).
6. `https://revisita-push.davidfontenelle80.workers.dev/api/health` returns all true: `hasStore`, `hasScheduler`, `hasVapidPublicKey`, `hasVapidPrivateKey`, `hasVapidSubject`.
7. Smoke-tested the Durable Object chain: `POST /api/subscribe` with an invalid body returns the expected 400 from `PushScheduler`, proving edge → Worker → DO → SQLite works.

## Release gate and actual results

Automated: `npm run check` PASS, 58 tests. Includes independent RFC 8291 decryption and VAPID signature verification, subscription ownership, per-device isolation, schedule replacement/cancellation, denied permission, Home Screen detection, expired subscription removal, rate limiting, notification taps, DST, and five-minute ICS content. These use mocks for network/storage and do **not** prove Cloudflare runtime or device delivery.

Browser: local v1.4.5 loaded in Chrome; map opened with visible controls and rendered tiles after zoom. Existing map code is unchanged. No production user visits were modified.

Updated draft CI passed all 58 checks and the Wrangler dry-run bundle on Node 22 ([run 36048763662](https://github.com/davidfontenelle80-cloud/Revisita/actions/runs/36048763662)). This verifies bundling without credentials or deployment. The earlier local Wrangler dry-run could not write outside the workspace sandbox.

Still required: real permission and test-push receipt on a device, timed revisit 6–10 minutes ahead with app closed, reschedule/delete with absence of old alerts, untimed visit, device cleanup, and physical iPhone Home Screen test where practical. Supported devices need Web Push and notification permission; iPhone/iPad require iOS/iPadOS 16.4+ and the installed Home Screen app. Desktop delivery may require the browser's background process to remain running.

Only after receiving and recording a closed-app notification: update these results, mark PR #5 ready, merge, wait for Pages, verify published v1.4.5 and the service-worker update, and recheck map opening/zoom. Never treat a push-service 201/202 acceptance as device receipt.
