import axios from 'axios';
import { env } from '../config/env.js';
import Contest from '../models/Contest.js';
import { logger } from '../utils/logger.js';
import type { IContest, Platform } from '../types/index.js';

const CLIST_API_BASE = 'https://clist.by/api/v4';

const RESOURCE_MAP: Record<string, Platform> = {
  'leetcode.com': 'leetcode',
  'codeforces.com': 'codeforces',
  'codechef.com': 'codechef',
  'atcoder.jp': 'atcoder',
};

const RESOURCES = Object.keys(RESOURCE_MAP).join(',');

interface ClistContest {
  id: number;
  event: string;
  start: string;
  end: string;
  duration: number;
  href: string;
  resource: string;
}

export async function fetchContests(): Promise<Partial<IContest>[]> {
  const now = new Date().toISOString();
  let allContests: Partial<IContest>[] = [];
  let offset = 0;
  const limit = 200;

  try {
    while (true) {
      const response = await axios.get(`${CLIST_API_BASE}/contest/`, {
        params: {
          resource__name__in: RESOURCES,
          start__gte: now,
          order_by: 'start',
          limit,
          offset,
        },
        headers: {
          Authorization: `ApiKey ${env.CLIST_USERNAME}:${env.CLIST_API_KEY}`,
        },
      });

      const rawContests: ClistContest[] = response.data.objects;
      if (rawContests.length === 0) {
        break; // No more contests
      }

      allContests = allContests.concat(rawContests.map(normalizeContest));
      offset += limit;

      // Also prevent infinite loops if the API goes crazy
      if (rawContests.length < limit || offset >= 10000) {
        break;
      }
    }

    return allContests;
  } catch (error: any) {
    logger.error(`Failed to fetch contests from CLIST API: ${error.message}`);
    throw error;
  }
}

export function normalizeContest(raw: ClistContest): Partial<IContest> {
  const platform = RESOURCE_MAP[raw.resource];
  if (!platform) {
    throw new Error(`Unknown resource: ${raw.resource}`);
  }

  return {
    contestId: `${platform}-${raw.id}`,
    platform,
    name: raw.event,
    startTime: new Date(raw.start),
    endTime: new Date(raw.end),
    duration: raw.duration,
    url: raw.href,
    fetchedAt: new Date(),
  };
}

export async function upsertContests(contests: Partial<IContest>[]) {
  if (contests.length === 0) return { upserted: 0, modified: 0 };

  const operations = contests.map((contest) => ({
    updateOne: {
      filter: { contestId: contest.contestId },
      update: { $set: contest },
      upsert: true,
    },
  }));

  const result = await Contest.bulkWrite(operations);
  
  return {
    upserted: result.upsertedCount,
    modified: result.modifiedCount,
  };
}

export async function fetchAndUpsertContests() {
  logger.info('Fetching contests from CLIST...');
  const contests = await fetchContests();
  logger.info(`Fetched ${contests.length} upcoming contests.`);
  
  const stats = await upsertContests(contests);
  logger.info(`Contests upserted: ${stats.upserted}, modified: ${stats.modified}`);
}
