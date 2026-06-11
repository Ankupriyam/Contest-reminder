import { google } from 'googleapis';
import { getOAuth2Client } from '../config/google.js';
import type { IContest } from '../types/index.js';
import { logger } from '../utils/logger.js';

function getCalendarClient(accessToken: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export async function createCalendar(accessToken: string): Promise<string> {
  const calendar = getCalendarClient(accessToken);
  
  const response = await calendar.calendars.insert({
    requestBody: {
      summary: 'Competitive Programming Contests',
      timeZone: 'UTC',
      description: 'Automatically synced by ContestSync',
    },
  });

  if (!response.data.id) {
    throw new Error('Failed to create Google Calendar');
  }

  return response.data.id;
}

function formatEventBody(contest: IContest, reminderMinutes: number) {
  return {
    summary: `[${contest.platform.toUpperCase()}] ${contest.name}`,
    description: `Platform: ${contest.platform}\nDuration: ${Math.floor(contest.duration / 60)} minutes\nURL: ${contest.url}\n\nSynced by ContestSync`,
    start: {
      dateTime: contest.startTime.toISOString(),
      timeZone: 'UTC',
    },
    end: {
      dateTime: contest.endTime.toISOString(),
      timeZone: 'UTC',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: reminderMinutes },
        { method: 'email', minutes: reminderMinutes },
      ],
    },
    source: {
      title: 'ContestSync',
      url: contest.url,
    },
  };
}

export async function createEvent(
  accessToken: string,
  calendarId: string,
  contest: IContest,
  reminderMinutes: number,
): Promise<string> {
  const calendar = getCalendarClient(accessToken);
  
  const response = await calendar.events.insert({
    calendarId,
    requestBody: formatEventBody(contest, reminderMinutes),
  });

  if (!response.data.id) {
    throw new Error('Failed to create calendar event');
  }

  return response.data.id;
}

export async function updateEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  contest: IContest,
  reminderMinutes: number,
): Promise<void> {
  const calendar = getCalendarClient(accessToken);
  
  await calendar.events.update({
    calendarId,
    eventId,
    requestBody: formatEventBody(contest, reminderMinutes),
  });
}

export async function deleteEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
): Promise<void> {
  const calendar = getCalendarClient(accessToken);
  
  try {
    await calendar.events.delete({
      calendarId,
      eventId,
    });
  } catch (error: any) {
    // If already deleted or not found, we don't care
    if (error.code === 404 || error.code === 410) {
      logger.debug(`Event ${eventId} already deleted or not found`);
      return;
    }
    throw error;
  }
}

export async function getEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
) {
  const calendar = getCalendarClient(accessToken);
  
  try {
    const response = await calendar.events.get({
      calendarId,
      eventId,
    });
    return response.data;
  } catch (error: any) {
    if (error.code === 404) return null;
    throw error;
  }
}
