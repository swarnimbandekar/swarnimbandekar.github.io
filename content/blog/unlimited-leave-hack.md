---
title: "The \"Unlimited Leave\" Hack I Found at My College"
description: "How a simple IDOR on VIT-AP's VTOP student portal let me download unapproved outing passes, access other students' passes, and bypass the entire mentor and warden approval workflow - and how I disclosed it responsibly."
date: 2025-05-15
tags: ["idor", "web", "bug bounty", "responsible disclosure"]
cover: "/static/covers/unlimited-leave-hack.png"
draft: false
---

# The "Unlimited Leave" Hack I Found at My College

> "With great power comes great responsibility."
> Uncle Ben (and every ethical hacker ever)

## The Setup: Life Inside the Hostel

Being a college student living in a hostel means every outing feels like a covert military mission.

You don't just leave. You apply for a pass. Then wait for mentor approval. Then warden approval. Then, maybe, you get to step outside for a couple of hours.

At VIT-AP, all of this happens on a student portal called VTOP.

One day, while casually navigating through old outing passes (okay, maybe with Burp Suite open), I noticed something that made me freeze.

![gif](/static/blog/unlimited-leave-hack/leave1.gif)

## The Discovery

After applying for a new leave, I looked at the request that generated the outing form. It looked something like this:

```
GET /sensored/sensored/sensored/WXXXXXXX?authorizedID=XYZ&_csrf=ABC...
```

That `WXXXXXXX`?

That's the leave ID.

So I had a thought:

What if I changed that ID?

What if I put in an older leave ID that had already been approved?

Or what if I guessed someone else's leave ID?

So I tried. I intercepted the request, modified the leave ID, and it worked.

![image](/static/blog/unlimited-leave-hack/1.png)

## The Vulnerability: IDOR Strikes Again

The server didn't ask questions. No validation. No permission check.

I was able to:

- Download my own outing pass even if it wasn't approved yet
- Access outing passes of other students, just by guessing theirs
- Bypass the entire mentor and warden approval workflow

This, my friends, is a textbook IDOR: Insecure Direct Object Reference. The kind of bug that's simple, but devastating.

![image](/static/blog/unlimited-leave-hack/2.png)

![image](/static/blog/unlimited-leave-hack/3.png)

## The Temptation

I won't lie. For a second, I sat there like:

"So, I can leave the hostel anytime now?"
"No more waiting on approvals?"
"I could generate outing passes for anyone?"

Unlimited outings. Unlimited freedom. Zero oversight.

But here's the thing: that's not why I do this.

I don't hack to escape. I hack to secure.

## The Responsible Disclosure

Instead of exploiting it, I did the right thing. I wrote a detailed vulnerability report and sent it to the college IT team (SDC).

What I included:

- A step-by-step breakdown of the bug
- The exact affected URL and how to replicate the issue
- A video PoC showing the vulnerability in action
- Recommendations on how to fix it

## The Response: Fast. Respectful. Responsible.

To my surprise, and respect, the VIT-AP team took action immediately.

The issue was patched in just 4 days.

No debates, no denials, just good security hygiene. That's rare. And awesome.

## Lessons Learned

- Always validate access on the server-side.
- Security isn't about complex hacks. It's about overlooked logic.
- Ethical hacking builds bridges, not walls.

This experience was more than just a bug find. It was a crash course in access control, ethics, and responsible disclosure.

## Final Thoughts

You don't need zero-days to make an impact. Sometimes, all it takes is a changed ID in a URL, and the right mindset.

So if you're a budding hacker reading this:

Stay curious. Stay ethical.

Hack not to break things, but to fix them.

![gif](/static/blog/unlimited-leave-hack/leave2.gif)

connect me on:

[swarnimbandekar.in](https://swarnimbandekar.in/)

[LinkedIn](https://www.linkedin.com/in/swarnimbandekar/)

email: hello@swarnimbandekar.in
