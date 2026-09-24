# Revisita closed-app reminders

The app schedules one Web Push per timed active revisit, five minutes before its local date/time. Each device must enable notifications itself. The Worker stores a subscription, visit ID, name, and UTC delivery time. A minute cron sends the reminder and marks it sent. Rescheduling or deleting a visit updates or removes the reminder on enabled devices when they next sync.

## Deployment setup

1. Create Cloudflare KV namespace `revisita-push-store`; bind it as `PUSH_STORE` in `wrangler.toml` with its namespace ID.
2. Generate a P-256 VAPID keypair. Set `VAPID_PUBLIC_KEY` to the uncompressed base64url public key in `[vars]` (or an environment variable). Put the 32-byte base64url private scalar in `wrangler secret put VAPID_PRIVATE_KEY`. Keep the private key out of Git and chat.
3. From this folder run `wrangler deploy`. Confirm `GET https://revisita-push.davidfontenelle80.workers.dev/api/health` reports the KV and VAPID bindings.
4. Open the installed Revisita app on each phone, enable alerts under **Más → Recordatorios**, and send a test alert. On iPhone, Web Push requires the Home Screen app, opened from its icon.
5. Create a timed revisit at least six minutes ahead, close the app, and verify the actual notification on the device at five minutes before the visit.

The GitHub Pages app cannot send timed push by itself; this Worker is a separate deployment. The static app displays a setup failure until the Worker is live. Calendar reminders remain independent. The Google Calendar template link uses the calendar's reminder settings; choose the `.ics` mode for an explicit five-minute `VALARM`.
