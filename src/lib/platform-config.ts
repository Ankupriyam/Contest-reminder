export type Platform = 'LeetCode' | 'Codeforces' | 'CodeChef' | 'AtCoder';
export type PlatformKey = 'leetcode' | 'codeforces' | 'codechef' | 'atcoder';

export const platformMeta: Record<
  Platform,
  { color: string; initials: string; key: PlatformKey }
> = {
  LeetCode: { color: '#FFA116', initials: 'LC', key: 'leetcode' },
  Codeforces: { color: '#1F8ACB', initials: 'CF', key: 'codeforces' },
  CodeChef: { color: '#5B4638', initials: 'CC', key: 'codechef' },
  AtCoder: { color: '#222222', initials: 'AC', key: 'atcoder' },
};

export const platformKeyToDisplay: Record<PlatformKey, Platform> = {
  leetcode: 'LeetCode',
  codeforces: 'Codeforces',
  codechef: 'CodeChef',
  atcoder: 'AtCoder',
};

export type ContestStatus = 'synced' | 'upcoming' | 'live';
