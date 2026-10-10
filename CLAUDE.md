# BogFit — how to ship a change

BogFit exists in two places that must always match. Every improvement goes to BOTH:

1. **Claude artifact** (data saved in Rob's Claude account): https://claude.ai/artifact/6eeaU2uUSxiRiJGbvhDk1a
2. **Home Screen app** (data saved on Rob's iPhone, no sign-in): https://boggyw.github.io/bogfit/ — served by GitHub Pages from `main` of this repo.

## Steps for every change
1. Edit `src/bogfit.html` only. It is the single source for both versions. Never hand-edit `index.html`.
2. Run `./build.sh` (rebuilds `index.html` and bumps the cache name in `sw.js`, so installed phones update on next open).
3. Test in a browser (Playwright + Chromium are available): open `index.html` over `python3 -m http.server`, check the changed screens, and that there are no page errors.
4. Commit and push to `main`. GitHub Pages republishes in about a minute.
5. Republish the artifact: Artifact tool, `file_path` = `src/bogfit.html`, `url` = the artifact URL above.
6. Tell Rob both are updated.

## Things to know
- Code checks `IS_CLAUDE` (window.claude present). In Claude it uses the artifact `db` + `assets`; elsewhere it uses IndexedDB on the phone via `localStores()` with the same API.
- Backup/restore (Settings → Backup) moves data between the two: phone exports a JSON file, either version can restore it.
- This repo is public. Never commit Rob's workout history, health data, or backup files in readable form.
- `seed.enc.json` is Rob's history encrypted (AES-GCM, key from PBKDF2-SHA256, 600k iterations) with his password. A new phone loads it on first open after he enters the password. Never write the password into the repo, memory or code. To refresh it, ask Rob for the password and re-encrypt a fresh backup.
- The phone app is locked by password (`S.locked`), with optional Face ID via a WebAuthn platform passkey (`bogfit-faceid` in localStorage, rpId = hostname; client-side gate, password is the fallback). The lock is never shown inside Claude (`IS_CLAUDE`).
- One-time updates run when each version next opens (both copies keep separate data): `migrateInc75` (all machines to 7.5 kg) and `migrateAddOct26` (adds Biceps Curl, Triceps Extension, Rear Deltoid, Torso Rotation, Glute, Multi-Press, Dual Adjustable Pulley; skips names that already exist) and `migrateMergeAbduct` (combines machines with "abduct" in the name into one: keeps the Lane Cove one, else most sets; moves all sets, adds missing settings, deletes the rest; flag `prefs.mergeAbduct`) and `migrateDropKieser` (Rob decided Kieser sets aren't comparable: deletes imported sets with ids k0, k1…, keeps BogFit-logged sets with ids e-…). Flags live in prefs. `seed.enc.json` no longer contains any Kieser sets.
- Tabs: Session, Machines, History, Target, Profile, Settings. The machine list (with Edit, Instructions/Video buttons) lives on the Machines tab, not in Settings.
- Machines can be starred as Lane Cove machines (`m.laneCove`, gold star next to the name; toggle in Edit machine). Not shown on the top machine tabs (Rob asked for no icons there).
- Rob's requirements: each machine has a weight increment Rob types in or adjusts with +/− (0.5 kg or 1 lb per tap; default 7.5 kg because BlueFit stacks run 7.5, 15, 22.5…); weights land on multiples of the increment (+/− go to the next stack position up/down; suggestions snap to the nearest); a one-time update (`migrateInc75`, flag `prefs.inc75`) set every machine to 7.5 kg; BogFit never changes the weight by itself: the Session page starts at the last weight and asks Decrease / Same / Increase, highlighting the suggestion from last set's seconds (under 110 s down one step, 110–130 s same, over 130 s up one step, 180 s up two steps); the Log a set card lists the last 3 sets; stopping the timer saves the set and Save becomes Edit; target 120–140 s; one timer counting in plain seconds (scale 0 / 120 / 180), red until 120 s then green, stops at 180 s; lists alphabetical; logo = blue-to-green ring with B; BOGFIT wordmark grey and subtle.
