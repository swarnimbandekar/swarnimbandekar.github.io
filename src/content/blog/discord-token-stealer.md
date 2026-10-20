---
title: "How Hackers Hack Discord"
description: "a technical breakdown of discord token stealers: how they work, how accounts get compromised, and what i learned reversing the actual malware."
date: 2026-10-20
tags: ["malware", "discord", "token stealer", "windows", "forensics"]
cover: "/static/covers/discord-token-stealer.png"
draft: false
---

# how my discord got hacked and what i found after

my discord got hijacked. the attacker went through every dm and sent those elon musk crypto scam images to everyone. people started replying "hacker got hacked lol" fair. embarrassing.

i had 2fa on. that's what made it weird. changed my password, revoked everything, whatever. but i wanted to know *how*, so i reversed the actual malware. this is what i found.

the sample was the [vvs stealer](https://thehackernews.com/2026/01/new-vvs-stealer-malware-targets-discord.html), one of the variants making rounds right now.

---

## 2fa doesn't protect your token

discord doesn't care about your password after you log in. it cares about your **token**, a session credential that looks like this:

```
MTA4NzY1NDMyMTA5ODc2NTQz.Gh3kPq.xR7mNqK2vL9pT4wA8jY6sE3cF1bH0dIuZo
```

three dot-separated parts: user id in base64 (`MTA4NzY1...` decodes to `1087654321098765443`), a base64 timestamp, and an HMAC signature. similar structure to JWT but discord's own format.

that token *is* you. every api request your client sends carries it in the `Authorization` header. no 2fa check on the other end, no device fingerprint, nothing. 2fa only gates the login step. once the token exists, it works until you change your password.

---

## your token is sitting in plaintext on disk

two places, depending on how you use discord.

**browser:** chrome, edge, and brave store discord's local storage in leveldb files at:

```
%LOCALAPPDATA%\Google\Chrome\User Data\Default\Local Storage\leveldb\
```

not encrypted. the token string is in plaintext inside binary `.ldb` and `.log` files. a stealer copies them to a temp folder (to avoid the browser's file lock) and scans them with a regex:

```
[\w-]{24,26}\.[\w-]{6}\.[\w-]{25,110}
```

![powershell scanning leveldb files and extracting discord tokens with regex](/static/blog/discord-token-stealer/regex.png)

done.

**desktop app:** discord is an electron app, basically chromium in a box. chromium ships with a remote debugging interface used by devtools. you enable it at launch with:

```
--remote-debugging-port=9222
```

discord doesn't launch with this flag. the stealer relaunches it with it.

---

## discord hands over your token through its own debugger

the stealer kills discord (`taskkill /F /IM Discord.exe`), copies your real profile data to a temp directory, relaunches discord with that profile plus the debugging port open. from outside, discord looks completely normal.

then it connects to the devtools websocket at `http://127.0.0.1:9222/json`, enables network interception, and waits. when discord reloads and talks to its own api, every outgoing request passes through the interceptor including the `Authorization` header:

```
Network.requestWillBeSent -> request.headers["authorization"] -> your token
```

no decryption. no memory scraping. discord hands it over itself.

---

## exfil takes about 10 seconds

once it has the token, the stealer hits:

```
GET https://discord.com/api/v9/users/@me
Authorization: <token>
```

that returns your username, email, phone number, 2fa status, verification status. everything gets packaged into a webhook embed and posted to a URL hardcoded in the binary. the attacker's server receives a formatted card with your token, account details, and avatar.

![webhook alert showing stolen token and account info](/static/blog/discord-token-stealer/webhookalert.png)

from there: use the token in a script, sell it, or do what happened to me and blast crypto scams to every contact.

and using the token is embarrassingly easy. there's a browser extension called [discord tokens](https://addons.mozilla.org/en-US/firefox/addon/discord-tokens/) that lets you paste a token and log straight in. no password, no 2fa, just your stolen string and a click.

<img src="/static/blog/discord-token-stealer/extension.png" alt="discord token login extension showing account details" width="260" />

---

## binders: the install looks real, the stealer runs behind it

the payload needs delivery. binders are the most common method: one executable that runs two.

you download a cracked tool, run the installer, it installs the tool. what you don't see is a second executable dropped and launched with its window hidden (`ShowWindow(hwnd, SW_HIDE)`). by the time you finish clicking through setup, your token is gone.

more advanced binders skip the disk write entirely. they call `VirtualAlloc`, copy the raw PE bytes of the stealer into memory, manually fix up the import table, and transfer execution via a new thread. no file on disk means nothing for av to scan. it's process hollowing's simpler cousin.

---

## dll side-loading: persistence without a suspicious process

one-shot token theft is fine, but stealers that want persistence use **dll side-loading** to survive reboots without ever showing up as an obvious malicious process.

windows resolves dll imports by checking the application's own directory first, then `%SYSTEM32%`, then `%PATH%`. if a legitimate signed exe loads a dll by name without an absolute path, drop a malicious dll with that name in the same folder and windows loads yours.

i found a real example while digging through procmon. CactusViewer (CVE-2026-36574) loads `VERSION.dll` from its own directory without path verification. signed app, looks clean. but plant a fake `VERSION.dll` next to it and it loads every time CactusViewer runs.

![procmon showing CactusViewer loading VERSION.dll with NAME NOT FOUND](/static/blog/discord-token-stealer/procmon.png)

procmon filtered on `NAME NOT FOUND`: CactusViewer.exe (PID 23144) looking for `VERSION.dll` in `C:\Users\Downloads\` and coming up empty. that's the gap. fill it with a malicious dll and it loads on next launch.

the pattern:
1. find a signed exe loading an unqualified dll name (procmon + `NAME NOT FOUND` filter finds these fast)
2. build a `version.dll` that exports the same functions and forwards real calls to the system copy, so the app stays stable
3. drop both into a writable location like `%APPDATA%`
4. add a registry run key or scheduled task pointing at the legitimate exe

the exe launches clean, av trusts it, your dll rides along.

---

## how i got hit

cracked software (maybe). the installer was a binder. it installed what i wanted, ran the stealer in the background, and my token was in the attacker's webhook before i finished clicking next.

10 seconds. no popup, no slowdown, nothing. and honestly, maybe some of those files are still sitting on my machine. i might get hit again. we'll see.

---

## the actual fix

don't run untrusted executables. token stealers need zero elevation because your token files are in your own profile directory. windows won't stop it.

if you want real mitigation: a hardware security key (yubikey, passkey) means an attacker with your token still can't log in from a new device without it. totp does nothing here.

if you think you've already been hit: change your discord password. that invalidates all active tokens. enable new device login notifications so you at least know next time.

---

none of this is new. leveldb scraping and the devtools trick have been documented for years. what keeps these attacks working is delivery: pirated software, fake tools, your already-compromised friends' accounts spreading it further.

if people in your dms are getting crypto scam images from "you", change your password now and tell them to ignore it.

and run cracked software in a VM or not at all.

*(don't mind if you get another one of those crypto dm blasts from me though. i have a lot of cracked files installed. we'll see how this goes.)*

---

### connect me on:

[swarnimbandekar.in/contact](https://swarnimbandekar.in/contact/)

[LinkedIn](https://www.linkedin.com/in/swarnimbandekar/)

email: hello@swarnimbandekar.in