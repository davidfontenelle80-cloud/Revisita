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

## Deployment steps (not yet executed)

Use this folder and this account only. Do not reuse or change Ministry Tracker secrets, bindings or namespaces.

1. Authenticate Wrangler for the account above. The installed Wrangler is 4.105.0. This session's automatic approval review rejected its account-wide Worker/KV OAuth scope; a separate dashboard GitHub-integration step was also rejected. Explicit access approval is still required. No credentials were entered into Git or chat.
2. Run `npx wrangler kv namespace create PUSH_STORE`. Add the returned **new** namespace ID to this file's `wrangler.toml`:

   ```toml
   [[kv_namespaces]]
   binding = "PUSH_STORE"
   id = "THE_NEW_REVISITA_NAMESPACE_ID"
   ```

3. Confirm `PUSH_SCHEDULER` binding and `new_sqlite_classes = ["PushScheduler"]` migration. `ALLOWED_ORIGIN` is `https://davidfontenelle80-cloud.github.io`; `VAPID_SUBJECT` is `mailto:davidfontenelle80@gmail.com`; cron is every minute. Run `npx wrangler deploy` to create the isolated service (it rejects API changes while unconfigured).
4. Run `node provision-vapid.mjs` using the installed Wrangler, or pass the absolute path to its `bin/wrangler.js`. The script generates a new P-256 pair in memory, pipes only the private scalar directly to `wrangler secret put VAPID_PRIVATE_KEY`, suppresses command output, and writes only the public key to `[vars]`. It refuses to overwrite an existing public key. Do not print the private scalar or pass it in command arguments. If the upload fails, no private key file remains.
5. Run `npx wrangler deploy` again, then inspect `/api/health`: store, scheduler, public/private-key-presence and subject flags must all be true. The health response includes only the public key and presence flags, never a private scalar. Check the actual dashboard cron configuration too; the health cron string describes the expected configuration.
6. Run a draft app preview against this Worker before merging. A local browser preview is available with `node scripts/serve-preview.mjs`; production CORS deliberately does not allow that local origin. Use an explicitly configured temporary HTTPS preview origin for real push testing and remove it afterward. Do not change production Pages to expose the unfinished feature.

## Release gate and actual results

Automated: `npm run check` PASS, 58 tests. Includes independent RFC 8291 decryption and VAPID signature verification, subscription ownership, per-device isolation, schedule replacement/cancellation, denied permission, Home Screen detection, expired subscription removal, rate limiting, notification taps, DST, and five-minute ICS content. These use mocks for network/storage and do **not** prove Cloudflare runtime or device delivery.

Browser: local v1.4.5 loaded in Chrome; map opened with visible controls and rendered tiles after zoom. Existing map code is unchanged. No production user visits were modified.

Updated draft CI passed all 58 checks and the Wrangler dry-run bundle on Node 22 ([run 36048763662](https://github.com/davidfontenelle80-cloud/Revisita/actions/runs/36048763662)). This verifies bundling without credentials or deployment. The earlier local Wrangler dry-run could not write outside the workspace sandbox.

Still required: KV creation, VAPID provisioning, successful Worker build/deployment, health/cron checks, then real permission and test-push receipt, timed revisit 6–10 minutes ahead with app closed, reschedule/delete with absence of old alerts, untimed visit, device cleanup, and physical iPhone Home Screen test where practical. Supported devices need Web Push and notification permission; iPhone/iPad require iOS/iPadOS 16.4+ and the installed Home Screen app. Desktop delivery may require the browser's background process to remain running.

Only after receiving and recording a closed-app notification: update these results, mark PR #5 ready, merge, wait for Pages, verify published v1.4.5 and the service-worker update, and recheck map opening/zoom. Never treat a push-service 201/202 acceptance as device receipt.
