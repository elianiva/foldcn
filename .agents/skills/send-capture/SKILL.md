---
name: send-capture
description: Capture a screenshot or video recording with agent-browser and send it to the user. Use when the user asks to see something running, wants a screenshot or video of the demo, or needs visual proof of a component change.
---

# Send a Capture

Take a screenshot or screen recording with `agent-browser`, then get the file
to the user. Before driving the browser, run `agent-browser skills get core`
if you have not loaded the core guide in this session.

## 1. Isolate a session

Every example below assumes a named session so parallel agents never share one
browser:

```bash
export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix capture)"
S="$AGENT_BROWSER_SESSION"
```

## 2. Capture

Captures go to `.tmp/captures/` (gitignored). Keep filenames stable per subject
so re-runs overwrite rather than accumulate. Use absolute paths — bare relative
paths can resolve against agent-browser's own tmp dir instead of the repo:

```bash
CAP="$PWD/.tmp/captures"; mkdir -p "$CAP"
```

### Screenshot

```bash
agent-browser --session "$S" open "<url>"
agent-browser --session "$S" set viewport 1280 800
agent-browser --session "$S" wait --load networkidle
# element crop (avoids full-page chrome drift) or plain viewport shot:
agent-browser --session "$S" screenshot "[data-slot=\"<name>\"]" "$CAP/<name>.png"
agent-browser --session "$S" screenshot "$CAP/<name>-page.png"
# full scroll height when the subject is a whole page:
agent-browser --session "$S" screenshot --full "$CAP/<name>-full.png"
```

### Video (WebM)

Plan first (`snapshot -i`), then record while driving with canonical `@eN`
refs (re-snapshot after each mutation):

```bash
agent-browser --session "$S" open "<url>"
agent-browser --session "$S" set viewport 1280 800
agent-browser --session "$S" snapshot -i            # find refs, plan the drive
agent-browser --session "$S" record start "$CAP/<name>.webm"
agent-browser --session "$S" click @e3              # the planned drive
agent-browser --session "$S" record stop            # saves the file
```

`record start` preserves cookies/localStorage but starts a fresh browser
context — set viewport *before* starting the recording.

## 3. Send

Default to **local-only**: hand over the file path and let the user's own
environment decide how to display it (most agent frontends render attached
images / videos or file links directly):

```
Captured: .tmp/captures/<name>.png
```

Only when the user explicitly wants to open the capture on another device (or
you are driving a remote session where local file references do not resolve),
ask whether they want a remotely accessible link — default to no. If they say
yes, serve the captures dir and share it with whatever remote-access tool the
current environment provides:

```bash
# from the thread that started the server (leave running while the link is needed):
node .agents/skills/send-capture/scripts/serve-captures.mjs --port 8321 &
```

- Under **bb**: check `bb connect status --json` (must be paired +
  connected), then `bb connect expose 8321` from the thread that started the
  server. Give the returned URL as markdown links — never a localhost URL
  (it does not work remotely). `bb connect unexpose 8321` when the link is
  no longer needed.
- Elsewhere: use that environment's equivalent (tunnel, static hosting,
  artifact upload) and fall back to the localhost URL + file path when none
  exists.

```markdown
[Screenshot of <subject>](https://<share-host>/<file>.png)
[Recording of <subject>](https://<share-host>/<file>.webm)
```

Browsers render PNG inline and play WebM natively — no download step. `/` on
the share URL lists the captures dir for browsing.

## 4. Clean up

```bash
agent-browser --session "$S" close
# only if you exposed a share in step 3 (bb example):
# bb connect unexpose 8321
```

Evidence files stay in `.tmp/captures/`; stop the static server (if you
started one) only after any share is unexposed.
