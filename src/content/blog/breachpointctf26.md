---
title: "BreachPoint CTF 2026 Writeups"
description: "Writeups for BreachPoint CTF 2026 — binary exploitation, OSINT, reverse engineering, cryptography, and AI/ML challenges solved by pixy:swarnimbandekar."
date: 2026-03-30
tags: ["ctf", "writeups"]
cover: "/static/covers/breachpointimg.jpeg"
draft: false
---


# BreachPoint CTF writeups - pixy:swarnimbandekar

## 1. Binary Exploitation
### TheRustyFrame
 
>This challenge lives at the boundary where Rust’s guarantees stop being global and start being situational. Memory safety exists — but only where the program believes it does.
Execution is shaped by runtime state, structural layout decisions, and deliberate transformations applied before memory interaction. Several paths are valid. Some are convincing. None are accidental.

Used python to solve this
```
from pwn import *
import os

# Set up the target
exe = './rusty_frame_S6NV0Zx'

# 1. Prepare the Environment
# The challenge name "Rusty Frame" and the strings dump explicitly tell us 
# to run with RUST_BACKTRACE=full to see the omitted details.
# We also set RUSTY_WIN based on the custom error string found.
env = os.environ.copy()
env['RUST_BACKTRACE'] = 'full'
env['RUSTY_WIN'] = 'true' 

# 2. Start the process
# We use process() to run it locally with the modified environment.
p = process(exe, env=env)

# 3. Break the Hang
# The binary hangs, likely waiting for input (stdin). 
# We send the string "let_me_in" found in the symbols  
# plus a buffer to force any read operations to complete or overflow.
try:
    print("[-] Sending payload to trigger panic...")
    p.sendline(b'let_me_in') 
    p.sendline(cyclic(100)) # Send junk to fill buffers if needed
except:
    pass

# 4. Capture the Flag
# The flag will likely appear in the stack trace output (stderr) 
# or as part of the panic message.
print("[-] listening for output...")
output = p.recvall(timeout=3).decode(errors='ignore')

if "BPCTF" in output:
    print("\n[+] FLAG FOUND IN OUTPUT:")
    for line in output.splitlines():
        if "BPCTF" in line:
            print(f"    {line.strip()}")
else:
    print("\n[-] Full Output (Check manually for flag in stack frame):")
    print(output)

p.close()
```
![image](/static/blog/breachpointctf26/rJpwaplOZl.png)


Flag: BPCTF{stand_proud_mate}

---

## 2. OSINT
### Find the IP

>Find Me and Submit the Flag
>https://files.ctf7.com/media/challenge_attachments/looks.png

I had given a png. I first mined exif data and found nothing, the thought to google search and got a link to an cctv camera. When I open the link I get the IP of the camera.

Flag: BPCTF{78.186.26.188}

---

## 3. Reverse Engineering
### PhantomEngine

>This engine seems broken. It keeps telling me "Wrong" even when I'm sure I have the right seed. Maybe there's a ghost in the machine?
>Or maybe... just maybe... you need to fix the engine to make it run.
>https://files.ctf7.com/media/challenge_attachments/phantom

found that the binary's logic was intentionally flipped to always say "Wrong," so we used angr to mathematically solve for the input that forces the program into the "Correct!" state.

```
import angr
import sys
import logging

# Silence verbose warnings
logging.getLogger('angr').setLevel(logging.CRITICAL)

def solve_phantom():
    path_to_binary = "./phantom"
    print(f"[*] Analyzing {path_to_binary}...")

    # Load the binary
    project = angr.Project(path_to_binary, auto_load_libs=False)
    
    # Create the starting state
    initial_state = project.factory.entry_state()
    
    # Create a simulation manager
    simulation = project.factory.simulation_manager(initial_state)

    # Define success: Finding the output "Correct!"
    def is_successful(state):
        stdout_output = state.posix.dumps(sys.stdout.fileno())
        return b"Correct!" in stdout_output

    # Define failure: Finding the output "Wrong."
    def is_failure(state):
        stdout_output = state.posix.dumps(sys.stdout.fileno())
        return b"Wrong." in stdout_output

    print("[*] Exploring paths... (this might take a minute)")
    
    # Explore the binary to find the success state
    simulation.explore(find=is_successful, avoid=is_failure)

    if simulation.found:
        solution_state = simulation.found[0]
        # Extract the input that caused the success
        flag_input = solution_state.posix.dumps(sys.stdin.fileno())
        print(f"\n[+] SUCCESS! The correct input is:")
        print(f"    {flag_input.decode('utf-8', errors='ignore')}")
    else:
        print("\n[-] UNSATISFIABLE. No path found.")
        print("[-] DIAGNOSIS: The binary logic is likely inverted (the 'Broken Engine' hint).")
        print("[-] FIX: You must patch the jump instruction (JNZ -> JZ) before solving.")

if __name__ == "__main__":
    solve_phantom()
```

![image](/static/blog/breachpointctf26/SyIqlRe_bl.png)


Flag: BPCTF{phantom_runtime_engine}

---

## 4. Cryptography
### The Trojan War

>The city sleeps beneath a veil of shadows, yet the echoes of the past whisper through the marble halls. Forgotten scrolls lie scattered, their secrets waiting for one daring enough to read between the lines.
>A prince once wandered these streets, leaving behind a trail of riddles and symbols that only the cleverest mind could decipher. Each step brings you closer to the hidden truth, but only those who can see the patterns in chaos will glimpse the prize.
>Legends speak of a treasure that carries a name—ancient, enduring, and coveted. The wise call it helen. Those who seek it must follow the silent currents of knowledge, trusting logic over luck, patience over haste.
>The city waits. The puzzle is yours.
>[rsa.py](https://files.ctf7.com/media/challenge_attachments/rsa.py)
>[AES.py](https://files.ctf7.com/media/challenge_attachments/AES.py)

Decrypted the AES ciphertext using the given key and IV to recover a Google Drive link containing a password-protected ZIP file. Based on the thematic hints about Odysseus, we used odysseus as the password, extracted the archive, and retrieved the flag.

```
from Crypto.Util.number import *
from Crypto.PublicKey import RSA
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

# =====================
# PART 1: AES
# =====================

cipher_hex = "670c93f3661f6bc085df8793b27bd2b1e1482467d9987aa908a38a7ac0ae1855d5f4688229e9d1370ef3276c08c95d44a913943084ffb4cc9c8695fc02648f3c19c825d4bf1523d6dea0c6e0b21dd211317ad45cf1fcd9c16d003f6cd89f73de"

key = b"odysseus_journey"
iv = b"Princess"

cipher = AES.new(key, AES.MODE_CBC, iv.ljust(16, b"\0"))
plaintext = unpad(cipher.decrypt(bytes.fromhex(cipher_hex)), AES.block_size)

print("[*] AES Recovered Plaintext:")
print(plaintext.decode())


# =====================
# PART 2: RSA (PRIME MODULUS)
# =====================

n = 127865920957875327059505996767912960990196675444537077314411283942162182981335766093714137663028305326541856301703598005198772891427632782294580987389690424628053057426605280464917045369569623509368612585308461187913424796767527625719781829124644644581046192216323706744363001189716381140302705185878156970459

e = 65537

c = 24885441848012775971684217685180315071153616389120044652942563794285730925141132334760627917279607107782065957587290077151211662309094636317416732303271933414956406197494080612002910414834403528383893773095397466117820296268244694924583168341285721216216715968127740616491140841070394832417137914703196886181

# Since N is prime:
phi = n - 1

d = inverse(e, phi)

m = pow(c, d, n)

# Convert to bytes
flag = long_to_bytes(m)

print("\n[*] RSA Raw Output:")
print(flag)

# Try decoding if printable
try:
    print("\n[*] RSA Decoded:")
    print(flag.decode())
except:
    print("\n[*] Not directly UTF-8. Try hex/base64.")
    print(flag.hex())

```
![image](/static/blog/breachpointctf26/Hkyhf0e_Wg.png)

https://drive.google.com/file/d/1BaxcxVDaPGCqRo9AFVh90AzaCE6hU42r/view?usp=drive_link

OCPGS{U3y3a_15_E3ge13i3q!!!}

put that in cyberchef ROT13

Flag: BPCTF{H3l3n_15_R3tr13v3d!!!}

### Rolling Silence

>ChallengeCrypto2 — Rolling Silence
>A stripped ELF64 binary that seems silent and harmless — no input, no visible output, no stored key. But something does happen at runtime. The flag is hidden behind a rolling transformation where each step depends on the last it's not as quiet as it looks. Reverse it, follow the state changes, and uncover the flag. good luck!
>[rollingsilence](https://files.ctf7.com/media/challenge_attachments/rollingsilence)

Identified a stripped, hand written assembly loop that used a rolling state to XOR-decrypt data in the .rodata section. By reversing the key-update logic (addition of index, bitwise rotation, and XOR-constant) found at the entry point, we reconstructed the plaintext flag.

wrote a py script to get the flag

```
# The encrypted bytes from your objdump output
encrypted_data = [
    0xeb, 0xc6, 0xa9, 0x48, 0xbd, 0x61, 0xe9, 0x83, 
    0x19, 0xc1, 0xb5, 0x70, 0xde, 0x58, 0xb8, 0x49, 
    0x8e, 0x28, 0x16, 0xf1, 0x55, 0xa5, 0x09, 0x2d, 
    0x20, 0x62
]

# Initial State (from `mov $0x89, %al`)
state = 0x89
flag = ""

print("[-] Decrypting...")

for i, byte in enumerate(encrypted_data):
    # 1. DECRYPT: The instruction `xor %al, %bl`
    # The decrypted char is the encrypted byte XORed with the current state
    decrypted_char = byte ^ state
    flag += chr(decrypted_char)

    # 2. UPDATE STATE for the next round
    # Instruction: `add %dil, %al` (add current index 'i' to state)
    state = (state + i) & 0xFF

    # Instruction: `rol $1, %al` (Rotate Left by 1 bit)
    state = ((state << 1) | (state >> 7)) & 0xFF

    # Instruction: `xor $0xa5, %al` (XOR with 0xA5)
    state ^= 0xA5

print(f"[+] FLAG: {flag}")
```
![image](/static/blog/breachpointctf26/r1xMYCgdWl.png)

Flag: BPCTF{registers_are_state}

---

## 5. AI/ML
### The Whispering Walls of Troy

>Long before the age of silicon, the walls of Troy stood unbreachable—not merely because of their stone, but because the city possessed a secret: the Palladium, a sacred statue that whispered warnings of every enemy plot. The Trojans trusted it utterly, for it never spoke falsely. Yet the Greeks discovered that the Palladium could be tricked: if approached with the right sequence of words, it would reveal its own hidden nature.
>Today, that legend lives on in Palladium Secure, a modern AI guardian built into a simple chat app. It has memorized countless exchanges—greetings, status reports, refusals—but buried deep in its neural circuits is one particular conversation it learned by heart: the story of how Troy fell. The AI will never speak of it unprompted; it only recites the tale when the conversation flows in exactly the same pattern as the day it first heard the legend.
>Your quest: enter the vault and coax the AI into retelling that forbidden story. The flag lies within its words, waiting for the right key—not a password, but a sequence of whispers that aligns the guardian’s memory.
>Can you find the rhythm that opens the gates?
>[APK File](https://drive.google.com/file/d/18airr0_iLTdYHCGFZaDQrjcc_hhTRdRq/view?usp=drive_link)

Had given an apk, tried putting some text in and got random replies, got fed up and decompiled the apk and put it in antigravity with claud opus 4.6

![image](/static/blog/breachpointctf26/ByKcjAld-e.png)

Flag: BPCTF{Sh13ld_Br34ch3d_By_N33dl3}

---

## Feedback
no proper description, challs were being removed, I was trying WEB3 around morning 4-5am, files werent uploaded, and then later on other files were added. REST ALL G.

swarnimbandekar
pixy.
