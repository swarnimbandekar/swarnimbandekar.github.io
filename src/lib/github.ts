import fallbackSnapshot from '@/data/github-contributions.json';

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export interface ContributionDay {
  date: string;
  count: number;
  level: ContributionLevel;
}

export interface GitHubContributionsData {
  total: number;
  yearRange: string;
  weeks: ContributionDay[][];
}

export interface RawContributionsPayload {
  total?: { lastYear?: number } | number;
  yearRange?: string;
  contributions?: Array<{
    date: string;
    count: number;
    level: number;
  }>;
}

export const GITHUB_CONTRIBUTIONS_ENDPOINT =
  'https://github-contributions-api.jogruber.de/v4/swarnimbandekar?y=last';

function clampLevel(value: unknown): ContributionLevel {
  const num = Number(value);
  if (num >= 4) return 4;
  if (num >= 3) return 3;
  if (num >= 2) return 2;
  if (num >= 1) return 1;
  return 0;
}

/**
 * Normalizes raw daily GitHub contribution entries into 52 aligned
 * Sunday-to-Saturday week columns alongside totals and year bounds.
 */
export function normalizeContributions(
  raw: RawContributionsPayload
): GitHubContributionsData {
  const entries = Array.isArray(raw.contributions)
    ? raw.contributions.map((entry) => ({
        date: String(entry.date || ''),
        count: Math.max(0, Number(entry.count) || 0),
        level: clampLevel(entry.level),
      }))
    : [];

  if (entries.length === 0) {
    return {
      total: 0,
      yearRange: raw.yearRange || '2025-2026',
      weeks: [],
    };
  }

  // Pad the front of the list so column row 0 always corresponds to Sunday.
  const padded: ContributionDay[] = [];
  const firstDateStr = entries[0]?.date;
  if (firstDateStr) {
    const firstUtcDay = new Date(`${firstDateStr}T00:00:00Z`).getUTCDay();
    for (let i = 0; i < firstUtcDay; i++) {
      padded.push({ date: '', count: 0, level: 0 });
    }
  }
  padded.push(...entries);

  const allWeeks: ContributionDay[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    allWeeks.push(padded.slice(i, i + 7));
  }

  const weeks = allWeeks.slice(-52);

  let total = 0;
  if (typeof raw.total === 'number' && Number.isFinite(raw.total)) {
    total = raw.total;
  } else if (
    raw.total &&
    typeof raw.total === 'object' &&
    typeof raw.total.lastYear === 'number'
  ) {
    total = raw.total.lastYear;
  } else {
    total = entries.reduce((sum, day) => sum + day.count, 0);
  }

  const dated = entries.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.date));
  const firstYear = dated[0]?.date.slice(0, 4) || '2025';
  const lastYear = dated[dated.length - 1]?.date.slice(0, 4) || '2026';
  const yearRange =
    raw.yearRange || (firstYear === lastYear ? firstYear : `${firstYear}-${lastYear}`);

  return { total, yearRange, weeks };
}

/**
 * Fetches live GitHub contribution history for static generation, falling back
 * to the bundled snapshot if offline or upstream times out.
 */
export async function getGitHubContributions(): Promise<GitHubContributionsData> {
  try {
    const response = await fetch(GITHUB_CONTRIBUTIONS_ENDPOINT, {
      signal: AbortSignal.timeout(4500),
      headers: { Accept: 'application/json' },
    });
    if (response.ok) {
      const json = (await response.json()) as RawContributionsPayload;
      if (Array.isArray(json.contributions) && json.contributions.length > 0) {
        return normalizeContributions(json);
      }
    }
  } catch {
    // Offline or upstream timeout - fall back to committed snapshot.
  }

  return normalizeContributions(fallbackSnapshot as RawContributionsPayload);
}

export const GITHUB_REPOS_ENDPOINT =
  'https://api.github.com/users/swarnimbandekar/repos?per_page=100';

/**
 * Extracts the lowercase repository name from a GitHub repository URL.
 */
export function extractRepoName(githubUrl: string): string {
  const cleaned = githubUrl.trim().replace(/\/+$/, '').replace(/\.git$/i, '');
  const parts = cleaned.split('/');
  return (parts[parts.length - 1] || '').toLowerCase();
}

/**
 * Extracts the lowercase `owner/repo` slug from a GitHub repository URL.
 */
export function extractRepoFullName(githubUrl: string): string {
  const cleaned = githubUrl.trim().replace(/\/+$/, '').replace(/\.git$/i, '');
  const parts = cleaned.split('/').filter(Boolean);
  if (parts.length < 2) return '';
  return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`.toLowerCase();
}

/**
 * Fetches public repository star counts from GitHub (including org-owned
 * repositories listed in `extraRepoFullNames`), returning an empty map if
 * offline, rate-limited, or timed out.
 */
export async function getGitHubRepoStars(
  extraRepoFullNames: string[] = ['Bidoytu/Bidoytu']
): Promise<Record<string, number>> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  };
  const token =
    typeof process !== 'undefined' ? process.env?.GITHUB_TOKEN : undefined;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const map: Record<string, number> = {};

  try {
    const response = await fetch(GITHUB_REPOS_ENDPOINT, {
      signal: AbortSignal.timeout(4000),
      headers,
    });
    if (response.ok) {
      const repos = (await response.json()) as Array<{
        name?: string;
        full_name?: string;
        stargazers_count?: number;
      }>;
      if (Array.isArray(repos)) {
        for (const repo of repos) {
          if (typeof repo?.stargazers_count !== 'number') continue;
          if (typeof repo?.name === 'string') {
            map[repo.name.toLowerCase()] = repo.stargazers_count;
          }
          if (typeof repo?.full_name === 'string') {
            map[repo.full_name.toLowerCase()] = repo.stargazers_count;
          }
        }
      }
    }
  } catch {
    // Ignore offline / timeout / rate-limit errors
  }

  if (extraRepoFullNames.length > 0) {
    const results = await Promise.allSettled(
      extraRepoFullNames.map(async (fullName) => {
        const res = await fetch(`https://api.github.com/repos/${fullName}`, {
          signal: AbortSignal.timeout(4000),
          headers,
        });
        if (!res.ok) return null;
        return (await res.json()) as {
          name?: string;
          full_name?: string;
          stargazers_count?: number;
        };
      })
    );
    for (const item of results) {
      if (item.status !== 'fulfilled' || !item.value) continue;
      const repo = item.value;
      if (typeof repo.stargazers_count !== 'number') continue;
      if (typeof repo.full_name === 'string') {
        map[repo.full_name.toLowerCase()] = repo.stargazers_count;
      }
      if (typeof repo.name === 'string') {
        map[repo.name.toLowerCase()] = repo.stargazers_count;
      }
    }
  }

  return map;
}
