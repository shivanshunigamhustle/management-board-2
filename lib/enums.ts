export const ROLES = ["MEMBER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const MEETING_TYPES = ["MEETING", "CIRCULAR"] as const;
export type MeetingType = (typeof MEETING_TYPES)[number];

export const MEETING_STATUSES = ["SCHEDULED", "LIVE", "COMPLETED", "ARCHIVED"] as const;
export type MeetingStatus = (typeof MEETING_STATUSES)[number];

export const VOTE_CHOICES = ["FOR", "AGAINST", "ABSTAIN"] as const;
export type VoteChoice = (typeof VOTE_CHOICES)[number];

export const ATTENDANCE_STATUSES = ["INVITED", "PRESENT", "ABSENT"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const ACTION_ITEM_STATUSES = ["OPEN", "DONE"] as const;
export type ActionItemStatus = (typeof ACTION_ITEM_STATUSES)[number];

export const MEETING_ROLES = ["PRESENTER", "VOTER", "OBSERVER"] as const;
export type MeetingRole = (typeof MEETING_ROLES)[number];
