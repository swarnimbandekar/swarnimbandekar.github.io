export interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: 'security-tools' | 'ai-security' | 'ctf-infra' | 'dev-tools';
  categoryLabel: string;
  year: string;
  featured: boolean;
  flagship?: boolean;
  sideQuest?: boolean;
  stack: string[];
  roles: string[];
  github: string;
  live?: string;
  stars?: number;
  writeup?: string;
  metrics?: { label: string; value: string }[];
  highlights: string[];
}

export interface CertificationItem {
  id: string;
  code: string;
  title: string;
  issuer: string;
  date: string;
  badge: string;
  summary: string;
  highlights: string[];
  reviewUrl?: string;
}

export interface ExperienceItem {
  role: string;
  org: string;
  period: string;
  location: string;
  type: string;
  active?: boolean;
  summary: string;
  bullets: string[];
  tags: string[];
  link?: { label: string; url: string };
}

export interface EducationItem {
  school: string;
  degree: string;
  period: string;
}

export interface ResumeSkillGroup {
  category: string;
  items: string[];
}

export interface ResumeExperienceItem {
  org: string;
  role: string;
  location: string;
  period: string;
  bullets: string[];
}

export interface ResumeCertificationItem {
  title: string;
  issuer: string;
  reviewUrl?: string;
}

export interface HallOfFameItem {
  id: string;
  name: string;
  /** Path to logo in /public/static/hof/<name>.svg or .png (optional — falls back to monogram emblem) */
  logo?: string;
  /** Set true for wide horizontal wordmark SVGs (e.g. Zerodha) */
  wideLogo?: boolean;
  /** Set true if a dark monochrome logo should invert in dark mode */
  invertOnDark?: boolean;
  /** Set true if a white monochrome logo should invert in light mode */
  invertOnLight?: boolean;
  /** Short acknowledgment label, e.g. "Hall of Fame", "Secured", "VDP" */
  acknowledgment: string;
  /** Optional category/impact tag, e.g. "Fintech", "Travel", "Automotive" */
  tag?: string;
  year?: string;
  /** Optional link to HoF page, advisory, or writeup */
  url?: string;
  /** Set true for private / NDA disclosures */
  confidential?: boolean;
}

export interface CveItem {
  id: string;
  title: string;
  product: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Published' | 'Assigned';
  year: string;
  cwe?: string;
  cvss?: string;
  advisoryUrl?: string;
}

export const PROFILE = {
  name: 'Swarnim Bandekar',
  handle: 'pixy',
  twitterHandle: '@dirtrav',
  role: 'Security Researcher & Systems Builder',
  shortBio:
    'I break web apps, APIs, and Active Directory networks to see how they fail - then build the tools and writeups that help people fix them.',
  location: 'Bengaluru, India',
  email: 'hello@swarnimbandekar.in',
  status: 'Open to security engineering, red team & research roles',
  socials: {
    github: 'https://github.com/swarnimbandekar',
    linkedin: 'https://www.linkedin.com/in/swarnimbandekar/',
    twitter: 'https://x.com/dirtrav',
    medium: 'https://medium.com/@swarnimbandekar',
    rss: '/rss.xml',
  },
  stats: [
    { value: '100%', label: 'CRTA Practical Score' },
    { value: '6/8', label: 'ASCP 12h Lab Flags' },
    { value: '10+', label: 'Open-Source Tools' },
    { value: '600+', label: 'CTF Players Hosted' },
  ],
};

export const PROJECTS: ProjectItem[] = [
  {
    id: 'bidoytu',
    title: 'Bidoytu',
    tagline: 'Desktop HTTP interception & testing workspace',
    description:
      'A focused HTTP interception proxy and testing workspace pairing an Electron, React, and TypeScript desktop app with an independent Python network engine. Built around live traffic inspection, editable interception, persistent Repeater tabs, controlled payload runs, and passive auditing.',
    category: 'security-tools',
    categoryLabel: 'Security Tooling',
    year: '2026',
    featured: true,
    flagship: true,
    stack: ['Electron', 'React', 'TypeScript', 'Python 3.11+', 'HTTP/2 Proxy'],
    roles: ['SECURITY TOOLING', 'DESKTOP APP', 'NETWORK ENGINE'],
    github: 'https://github.com/Bidoytu/Bidoytu',
    metrics: [
      { value: 'Dual-Core', label: 'Electron UI + Python Engine' },
      { value: 'Live MITM', label: 'Editable Traffic Intercept' },
      { value: 'Repeater', label: 'Persistent Replay Tabs' },
      { value: 'Passive Audit', label: 'Header & Leak Checks' },
    ],
    highlights: [
      'Decoupled Python interception and replay engine driving a responsive React + TypeScript desktop workspace.',
      'Split request/response inspector with inline payload tampering, header diffing, and multi-encoding decoder.',
      'Persistent Repeater tabs and controlled payload runs for authorized web and API testing.',
    ],
  },
  {
    id: 'knightlingo',
    title: 'Knightlingo',
    tagline: 'On-device Stockfish vision & arrow overlay',
    description:
      'Android app and Chrome extension that reads board state locally from pixels, evaluates moves with Stockfish on-device, and draws clean best-move arrows via a draggable translucent dock.',
    category: 'dev-tools',
    categoryLabel: 'On-Device Vision',
    year: '2026',
    featured: true,
    stack: ['Java', 'Android', 'Chrome Extension', 'Stockfish'],
    roles: ['ON-DEVICE VISION', 'EXTENSION'],
    github: 'https://github.com/swarnimbandekar/knightlingo',
    highlights: [
      'Processes pixels and Stockfish evaluations completely locally with zero external uploads.',
    ],
  },
  {
    id: 'glidecast',
    title: 'Glidecast',
    tagline: 'Open-source auto-zoom screen recorder for Windows',
    description:
      'Native Windows screen recorder that captures screen frames alongside mouse and keyboard telemetry separately, rendering product demos through a virtual camera that zooms onto clicks and glides smoothly between actions.',
    category: 'dev-tools',
    categoryLabel: 'Desktop Tooling',
    year: '2026',
    featured: true,
    stack: ['C#', '.NET', 'Windows 10/11', 'Virtual Camera', 'MIT'],
    roles: ['END-TO-END SHIPPING', 'WINDOWS APP', 'OPEN SOURCE'],
    github: 'https://github.com/swarnimbandekar/glidecast',
    highlights: [
      'Records raw screen frames separately from cursor/click timelines so camera pans and zoom keyframes stay editable after capture.',
      'Free, open-source MIT alternative for clean technical demos and walkthrough videos.',
    ],
  },
  {
    id: 'spotify-now-playing',
    title: 'Spotify Now Playing',
    tagline: 'Real-time Spotify activity SVG widget & multi-user service',
    description:
      'Minimalist multi-user service that renders live Spotify playback as crisp SVG embeds for GitHub READMEs and portfolios. Supports Bring-Your-Own Spotify OAuth credentials, Firestore token persistence with auto-refresh, signed httpOnly sessions, and 30s server-side caching.',
    category: 'dev-tools',
    categoryLabel: 'Web Service',
    year: '2026',
    featured: true,
    stack: ['TypeScript', 'Express', 'Firebase Firestore', 'Spotify API', 'SVG'],
    roles: ['WEB SERVICE', 'OAUTH 2.0', 'SVG WIDGET'],
    github: 'https://github.com/swarnimbandekar/spotify-now-playing',
    live: 'https://spotify.swarnimbandekar.in',
    highlights: [
      'Renders live playback state as lightweight SVG embeds with 30s in-memory TTL caching to protect API rate limits.',
      'Multi-user BYO-credentials OAuth 2.0 flow with CSRF state verification, account deduplication, and signed httpOnly session cookies.',
      'Auto-refreshes expired Spotify tokens persisted in Google Cloud Firestore, keyed by unique user IDs.',
    ],
  },
  {
    id: 'uniguard',
    title: 'UniGuard',
    tagline: 'Real-time metadata-only cyber-threat detection pipeline',
    description:
      'Built for Smart India Hackathon 2026 (NTRO problem statement). Passively inspects unidirectional IP traffic from PCAP replays or a Windows capture bridge, classifying six threat categories without decrypting payloads and streaming alerts to a live SOC dashboard.',
    category: 'ai-security',
    categoryLabel: 'Threat Detection',
    year: '2026',
    featured: false,
    sideQuest: true,
    stack: ['Python', 'gRPC', 'Streaming ML', 'PCAP / Flow Metadata', 'SOC UI'],
    roles: ['SIH 2026 · NTRO', 'THREAT PIPELINE', 'ML INFERENCE'],
    github: 'https://github.com/swarnimbandekar/uniguard',
    highlights: [
      'Detects port scanning, DDoS, DGA domains (via gRPC n-gram inference), C2 beaconing (periodicity & jitter), encrypted malware, and asymmetric data exfiltration.',
      'Operates strictly on unidirectional flow metadata rather than payload decryption.',
      'Streams classified alerts to a live SOC triage dashboard.',
    ],
  },
  {
    id: 'xssurge',
    title: 'XSSurge',
    tagline: 'Adaptive high-concurrency XSS discovery CLI',
    description:
      'Fast XSS discovery utility built for Kali Linux workflows. Pairs with Katana crawling to adapt custom payloads from adder.py based on how endpoints reflect input across concurrent URL streams.',
    category: 'security-tools',
    categoryLabel: 'Side Quest',
    year: '2025',
    featured: false,
    sideQuest: true,
    stack: ['Python', 'Katana', 'Async HTTP', 'CLI'],
    roles: ['BUG BOUNTY', 'WEB SECURITY'],
    github: 'https://github.com/swarnimbandekar/XSSurge',
    highlights: [
      'Modular adder.py payload loader for testing custom WAF bypasses during triage.',
      'Concurrent multi-URL reflection scanning tuned for fast recon pipelines.',
    ],
  },
  {
    id: 'punygen',
    title: 'Punygen',
    tagline: 'Unicode homoglyph & IDNA Punycode generator',
    description:
      'Rich terminal utility that maps English letters (a-z) to visually similar Unicode homoglyphs and generates valid IDNA Punycode domains for phishing simulations and domain fuzzing.',
    category: 'security-tools',
    categoryLabel: 'Side Quest',
    year: '2025',
    featured: false,
    sideQuest: true,
    stack: ['Python', 'Rich TUI', 'IDNA / Punycode'],
    roles: ['RED TEAMING', 'TERMINAL UI'],
    github: 'https://github.com/swarnimbandekar/Punygen',
    highlights: [
      'Interactive terminal table displaying homoglyph candidates alongside validated xn-- Punycode strings.',
    ],
  },
];

export const CERTIFICATIONS: CertificationItem[] = [
  {
    id: 'ewptx',
    code: 'eWPTX',
    title: 'Web Application Penetration Tester eXtreme',
    issuer: 'INE',
    date: '2026',
    badge: 'Advanced Web Pentest',
    summary:
      'Advanced web application exploitation certification covering custom filter evasion, authentication bypass, deserialization, SSRF, and chained attack paths.',
    highlights: [
      'Hands-on practical examination focused on complex web application vulnerability chaining and manual exploitation.',
    ],
  },
  {
    id: 'crta',
    code: 'CRTA',
    title: 'Certified Red Team Analyst',
    issuer: 'CyberWarFare Labs',
    date: 'May 2026',
    badge: '100% Score · 6h Exam',
    summary:
      'Hands-on offensive security and Active Directory assessment requiring full compromise from initial foothold through lateral movement to Domain Admin.',
    highlights: [
      'Passed with a 100% score across web foothold, Active Directory enumeration, credential abuse, and domain privilege escalation.',
      'Six-hour timed lab environment testing practical red-team methodology under pressure.',
    ],
    reviewUrl: '/blog/crta',
  },
  {
    id: 'ascp',
    code: 'ASCP',
    title: 'API Security Certified Professional',
    issuer: 'APIsec University',
    date: 'May 2026',
    badge: '6/8 Flags · 12h Practical',
    summary:
      'Pure black-box API penetration testing exam with zero multiple-choice questions - chaining broken auth, BOLA/IDOR, and undocumented endpoints inside live environments.',
    highlights: [
      'Captured 6 of 8 flags within the 12-hour exam window across multi-service REST APIs.',
      'Exploited authorization gaps, token verification weaknesses, and business-logic flaws without hints.',
    ],
    reviewUrl: '/blog/ascp',
  },
  {
    id: 'casa',
    code: 'CASA',
    title: 'Certified API Security Analyst',
    issuer: 'APIsec University',
    date: '2026',
    badge: 'API Security',
    summary:
      'Focused on OWASP API Security Top 10, endpoint discovery, broken object-level authorization, token auditing, and API threat modeling.',
    highlights: [
      'Validated end-to-end API security assessment methodology across authentication, authorization, and business logic.',
    ],
  },
];

/**
 * HALL OF FAME — Organizations Secured
 * ---------------------------------------------------------------------------
 * To showcase a company's logo:
 * 1. Drop the logo file (SVG or transparent PNG) into: /public/static/hof/<company>.svg
 * 2. Add an entry below with `logo: '/static/hof/<company>.svg'`
 *    (Set `invertOnDark: true` for dark logos, or `invertOnLight: true` for white logos.)
 */
export const HALL_OF_FAME: HallOfFameItem[] = [
  {
    id: 'uidai',
    name: 'UIDAI (Aadhaar)',
    logo: '/static/hof/uidai.svg',
    acknowledgment: 'Secured',
    tag: 'GovTech · National ID',
  },
  {
    id: 'zerodha',
    name: 'Zerodha',
    logo: '/static/hof/zerodha.svg',
    wideLogo: true,
    acknowledgment: 'Secured',
    tag: 'Fintech',
  },
  {
    id: 'tatamotors',
    name: 'Tata Motors',
    logo: '/static/hof/tatamotors.svg',
    acknowledgment: 'Secured',
    tag: 'Automotive',
  },
  {
    id: 'nykaa',
    name: 'Nykaa',
    logo: '/static/hof/nykaa.png',
    acknowledgment: 'Secured',
    tag: 'E-Commerce',
  },
  {
    id: 'ixigo',
    name: 'ixigo',
    logo: '/static/hof/ixigo.png',
    acknowledgment: 'Secured',
    tag: 'Travel Tech',
  },
  {
    id: 'abhibus',
    name: 'AbhiBus',
    logo: '/static/hof/abhibus.png',
    acknowledgment: 'Secured',
    tag: 'Travel Tech',
  },
  {
    id: 'confirmtkt',
    name: 'ConfirmTkt',
    logo: '/static/hof/confirmtkt.png',
    acknowledgment: 'Secured',
    tag: 'Travel Tech',
  },
  {
    id: 'maxhealthcare',
    name: 'Max Healthcare',
    logo: '/static/hof/maxhealthcare.png',
    acknowledgment: 'Secured',
    tag: 'Healthcare',
  },
  {
    id: 'wibmo',
    name: 'Wibmo',
    logo: '/static/hof/wibmo.png',
    acknowledgment: 'Secured',
    tag: 'PayTech · PayU',
  },
  {
    id: 'orientelectric',
    name: 'Orient Electric',
    logo: '/static/hof/orientelectric.png',
    acknowledgment: 'Secured',
    tag: 'Consumer Tech',
  },
  {
    id: 'dsgroup',
    name: 'DS Group',
    logo: '/static/hof/dsgroup.png',
    acknowledgment: 'Secured',
    tag: 'Conglomerate',
  },
  {
    id: 'brandmuscle',
    name: 'BrandMuscle',
    logo: '/static/hof/brandmuscle.png',
    acknowledgment: 'Secured',
    tag: 'MarTech',
  },
  {
    id: 'nbc',
    name: 'NBC',
    acknowledgment: 'Secured',
    tag: 'Enterprise',
  },
  {
    id: 'elan',
    name: 'Elan',
    logo: '/static/hof/elan.png',
    acknowledgment: 'Secured',
    tag: 'Real Estate',
  },
  {
    id: 'goodlives',
    name: 'GoodLives',
    logo: '/static/hof/goodlives.png',
    acknowledgment: 'Secured',
    tag: 'HealthTech',
  },
  {
    id: 'exampreptool',
    name: 'ExamPrepTool',
    logo: '/static/hof/exampreptool.png',
    acknowledgment: 'Secured',
    tag: 'EdTech',
  },
];

export const CVES: CveItem[] = [
  {
    id: 'CVE-2026-31955',
    title: 'Independently Discovered Security Vulnerability',
    product: 'Assigned via Independent Research',
    severity: 'High',
    status: 'Assigned',
    year: '2026',
    advisoryUrl: 'https://www.cve.org/CVERecord?id=CVE-2026-31955',
  },
  {
    id: 'CVE-2026-31952',
    title: 'Independently Discovered Security Vulnerability',
    product: 'Assigned via Independent Research',
    severity: 'High',
    status: 'Assigned',
    year: '2026',
    advisoryUrl: 'https://www.cve.org/CVERecord?id=CVE-2026-31952',
  },
  {
    id: 'CVE-2026-31953',
    title: 'Independently Discovered Security Vulnerability',
    product: 'Assigned via Independent Research',
    severity: 'High',
    status: 'Assigned',
    year: '2026',
    advisoryUrl: 'https://www.cve.org/CVERecord?id=CVE-2026-31953',
  },
];

export const EXPERIENCE: ExperienceItem[] = [
  {
    role: 'Independent Security Researcher & Bug Hunter',
    org: 'ComOlho · Independent Security Research',
    period: 'Feb 2024 - Present',
    location: 'Bengaluru, India',
    type: 'Research & Bug Bounty',
    active: true,
    summary:
      'Researching web, API, authentication, and malware attack surfaces while responsibly disclosing vulnerabilities on ComOlho (Top 1% researcher, Top 10 globally) and shipping open-source offensive tooling.',
    bullets: [
      'Ranked in the Top 1% of security researchers and achieved a Top 10 global ranking on ComOlho, with 3 assigned CVEs (CVE-2026-31955, CVE-2026-31952, CVE-2026-31953) for independently discovered vulnerabilities.',
      'Discovered and responsibly disclosed an IDOR & workflow-authorization bypass on VIT-AP’s VTOP portal ("Unlimited Leave" bug) affecting student outing passes and mentor/warden approval state.',
      'Reverse-engineered Windows info-stealer malware (VVS Discord token stealer) to trace DPAPI decryption, LevelDB token extraction, and session-hijacking mechanics bypassing 2FA.',
      'Built open-source offensive security tools including Bidoytu, XSSurge, and Punygen.',
    ],
    tags: ['Web & API Pentesting', 'ComOlho Top 10', 'Malware Reversing', 'IDOR / Race Conditions', 'JWT / OAuth'],
    link: { label: 'Read VTOP Disclosure Writeup', url: '/blog/unlimited-leave-hack' },
  },
  {
    role: 'Infrastructure Lead & CTF Challenge Author',
    org: 'ReCon CTF 2026 & Spiderman: Far From Secure',
    period: '2025 - 2026',
    location: 'VIT-AP',
    type: 'CTF Engineering',
    active: true,
    summary:
      'Engineered production backend infrastructure, King-of-the-Hill vulnerable machines, and multi-stage Web/Misc exploitation challenges for 600+ hackers.',
    bullets: [
      'Built the FastAPI + PostgreSQL + Redis + Cloudflare R2 platform powering ReCon - a 3-day, 600-person cybersecurity summit, participant PWA, and operations dashboard.',
      'Created KOTH_orchestrator managing 7+ multi-vector boxes covering WordPress RCE, unauth Redis, Jenkins, SQLi-to-UDF, PwnKit, and LXD container breakouts.',
      'Authored challenges featuring chained CSP bypass, DOM clobbering, prototype pollution, RS256 JWKS JWT forging, and race-condition double spends.',
    ],
    tags: ['FastAPI', 'Docker', 'King of the Hill', 'DOM Clobbering', 'Prototype Pollution'],
    link: { label: 'Read Spiderman CTF Writeups', url: '/blog/spidermanctf' },
  },
];

export const SKILL_MATRIX = [
  {
    category: 'Web & API Security',
    items: [
      'BOLA / IDOR & Authorization Bypass',
      'Race Conditions & Single-Packet TOCTOU',
      'JWT / JWKS Forgery & OAuth Flaws',
      'DOM Clobbering, CSP Bypass & Prototype Pollution',
      'SSRF, SSTI, SQLi & Business Logic Abuse',
      'API Discovery & Shadow Endpoint Auditing',
    ],
  },
  {
    category: 'Red Teaming & Reversing',
    items: [
      'Active Directory Enumeration & BloodHound',
      'Kerberoasting, Credential Abuse & Relay',
      'Linux & Windows Privilege Escalation',
      'Lateral Movement to Domain Admin',
      'Windows Info-Stealer Malware Analysis',
      'IDN Punycode & Phishing Simulations',
    ],
  },
  {
    category: 'Languages & Systems',
    items: [
      'Python, TypeScript, Go, C#, Bash, C/C++',
      'Next.js, React, FastAPI, Electron, Node.js',
      'HTTP/2 Proxy & Network Engine Design',
      'gRPC, PostgreSQL, Redis, Docker & Linux',
      'PCAP Flow Telemetry & SOC Dashboards',
    ],
  },
  {
    category: 'Tooling & Environments',
    items: [
      'Burp Suite Pro, Caido & Bidoytu',
      'Metasploit, Impacket, NetExec & Responder',
      'Wireshark, Procmon, Ghidra & pwntools',
      'Katana, ffuf, Nuclei, Subfinder & httpx',
      'Kali Linux, BlackArch, Parrot OS & Debian',
      'GitHub Actions, Cloudflare R2 & Neon',
    ],
  },
];

export const EDUCATION: EducationItem[] = [
  {
    school: 'Vellore Institute of Technology, Amaravati, India',
    degree: 'Bachelor of Technology, Computer Science & Business Systems (CSBS)',
    period: 'Aug 2024 - Aug 2028',
  },
  {
    school: 'Jnana Bindu Composite PU College, Bengaluru, India',
    degree: 'Higher Secondary Education (PCMS)',
    period: 'Jun 2020 - May 2022',
  },
  {
    school: 'Rashtrotthana Vidya Kendra, Dharwad, India',
    degree: 'Secondary Education (CBSE)',
    period: 'May 2017 - May 2020',
  },
];

export const RESUME_SKILLS: ResumeSkillGroup[] = [
  {
    category: 'Cybersecurity',
    items: [
      'Vulnerability Assessment',
      'Penetration Testing',
      'Web Application Security',
      'Bug Bounty Hunting',
    ],
  },
  {
    category: 'Languages',
    items: ['C/C++', 'Python', 'JavaScript', 'SQL', 'Bash', 'Go'],
  },
  {
    category: 'Concepts',
    items: [
      'OWASP Top 10',
      'API Security',
      'Web Security',
      'Cryptography',
      'Offensive Security Analysis',
    ],
  },
  {
    category: 'Soft Skills',
    items: [
      'Teamwork',
      'Time Management',
      'Analytical Thinking',
      'Research',
      'Problem Solving',
      'Technical Writing',
    ],
  },
];

export const RESUME_EXPERIENCE: ResumeExperienceItem[] = [
  {
    org: 'ComOlho',
    role: 'Cybersecurity Researcher',
    location: 'Remote',
    period: 'Feb 2024 - July 2026',
    bullets: [
      'Discovered and responsibly disclosed security vulnerabilities across web applications through independent research on the platform.',
      'Collaborated directly with security teams at client organizations to report findings and guide remediation efforts.',
      'Ranked in the Top 1% of security researchers on the platform and achieved a Top 10 global ranking.',
    ],
  },
  {
    org: 'Infopercept',
    role: 'Offensive Security Analyst Intern',
    location: 'Onsite',
    period: 'Jun 2025 - Jul 2025',
    bullets: [
      'Performed Vulnerability Assessment and Penetration Testing (VAPT) across web applications and APIs for client engagements.',
      'Authored detailed technical reports with remediation recommendations for development teams; validated fixes through retesting.',
    ],
  },
];

export const RESUME_CERTIFICATIONS: ResumeCertificationItem[] = [
  {
    title: 'eWPTX - Web Application Penetration Tester eXtreme',
    issuer: 'INE',
  },
  {
    title: 'CRTA - Certified Red Team Analyst',
    issuer: 'CyberWarFare Labs',
    reviewUrl: '/blog/crta',
  },
  {
    title: 'ASCP - API Security Certified Professional',
    issuer: 'APIsec University',
    reviewUrl: '/blog/ascp',
  },
  {
    title: 'Certified Ethical Hacking Associate',
    issuer: 'RedTeam Hacker Academy',
  },
  {
    title: 'CASA - Certified API Security Analyst',
    issuer: 'APIsec University',
  },
  {
    title: 'Ethical Hacking Essentials (EHE)',
    issuer: 'EC-Council',
  },
  {
    title: 'Offensive Penetration Testing',
    issuer: 'Cybrary',
  },
];

export const ACHIEVEMENTS: string[] = [
  'Winner, Breach Point CTF (National Level) - awarded ₹2.5 lakh prize pool.',
  'Assigned 3 CVEs: CVE-2026-31955, CVE-2026-31952, CVE-2026-31953, for independently discovered vulnerabilities.',
  'Ranked Top 1% researcher, #1 in state, and Top 10 globally on ComOlho.',
  '7th Place - Hack MSC 2.0 Hackathon, SRM University.',
  'Outstanding Performance Award - Postathon Hackathon, organized by India Post.',
  '1st Place - Project Atlas CTF, Mr. Robot CTF, and Bypass CTF.',
];
