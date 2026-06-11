export type Platform = "LeetCode" | "Codeforces" | "CodeChef" | "AtCoder";

export type ContestStatus = "Synced" | "Updated" | "Scheduled";

export type Contest = {
  id: string;
  name: string;
  platform: Platform;
  startTime: string; // ISO
  durationMinutes: number;
  status: ContestStatus;
  url: string;
  reminderMinutes: number;
};

const now = Date.now();
const inHours = (h: number) => new Date(now + h * 3600 * 1000).toISOString();

export const contests: Contest[] = [
  {
    id: "c1",
    name: "Weekly Contest 428",
    platform: "LeetCode",
    startTime: inHours(6),
    durationMinutes: 90,
    status: "Synced",
    url: "https://leetcode.com/contest/weekly-contest-428",
    reminderMinutes: 15,
  },
  {
    id: "c2",
    name: "Codeforces Round 998 (Div. 2)",
    platform: "Codeforces",
    startTime: inHours(28),
    durationMinutes: 135,
    status: "Scheduled",
    url: "https://codeforces.com/contests",
    reminderMinutes: 30,
  },
  {
    id: "c3",
    name: "Starters 167 (Div. 3)",
    platform: "CodeChef",
    startTime: inHours(52),
    durationMinutes: 120,
    status: "Synced",
    url: "https://codechef.com/contests",
    reminderMinutes: 15,
  },
  {
    id: "c4",
    name: "AtCoder Beginner Contest 384",
    platform: "AtCoder",
    startTime: inHours(74),
    durationMinutes: 100,
    status: "Updated",
    url: "https://atcoder.jp/contests",
    reminderMinutes: 15,
  },
  {
    id: "c5",
    name: "Biweekly Contest 142",
    platform: "LeetCode",
    startTime: inHours(120),
    durationMinutes: 90,
    status: "Scheduled",
    url: "https://leetcode.com/contest/biweekly-contest-142",
    reminderMinutes: 15,
  },
  {
    id: "c6",
    name: "Codeforces Educational Round 178",
    platform: "Codeforces",
    startTime: inHours(150),
    durationMinutes: 120,
    status: "Synced",
    url: "https://codeforces.com/contests",
    reminderMinutes: 30,
  },
];

export type ActivityEvent = {
  id: string;
  type: "added" | "updated" | "removed";
  contest: string;
  platform: Platform;
  at: string;
};

export const activity: ActivityEvent[] = [
  { id: "a1", type: "added",   contest: "Weekly Contest 428",          platform: "LeetCode",   at: inHours(-1) },
  { id: "a2", type: "updated", contest: "AtCoder Beginner Contest 384", platform: "AtCoder",    at: inHours(-3) },
  { id: "a3", type: "added",   contest: "Codeforces Round 998",         platform: "Codeforces", at: inHours(-8) },
  { id: "a4", type: "removed", contest: "Starters 165",                 platform: "CodeChef",   at: inHours(-26) },
  { id: "a5", type: "added",   contest: "Starters 167",                 platform: "CodeChef",   at: inHours(-30) },
  { id: "a6", type: "updated", contest: "Biweekly Contest 142",         platform: "LeetCode",   at: inHours(-48) },
];

export const platformMeta: Record<Platform, { color: string; initials: string }> = {
  LeetCode:   { color: "#FFA116", initials: "LC" },
  Codeforces: { color: "#1F8ACB", initials: "CF" },
  CodeChef:   { color: "#5B4638", initials: "CC" },
  AtCoder:    { color: "#222222", initials: "AC" },
};
