export const REALTIME_EVENTS = {
  // Connection
  CONNECTED: "realtime:connected",
  ERROR: "realtime:error",

  // Presence
  WORKSPACE_JOIN: "workspace:join",
  WORKSPACE_LEAVE: "workspace:leave",
  WORKSPACE_PRESENCE: "workspace:presence",
  PROJECT_JOIN: "project:join",
  PROJECT_LEAVE: "project:leave",
  PROJECT_PRESENCE: "project:presence",

  // Comments
  COMMENT_CREATED: "comment:created",
  COMMENT_UPDATED: "comment:updated",
  COMMENT_DELETED: "comment:deleted",
  COMMENT_RESOLVED: "comment:resolved",
  COMMENT_REPLY_CREATED: "comment:reply-created",

  // Notifications
  NOTIFICATION_CREATED: "notification:created",
  NOTIFICATION_READ: "notification:read",
  NOTIFICATION_READ_ALL: "notification:read-all",

  // Projects
  PROJECT_UPDATED: "project:updated",
  PROJECT_EDITED: "project:edited",
  PROJECT_VERSION_RESTORED: "project:version-restored",
  PROJECT_PUBLISHED: "project:published",
  PROJECT_UNPUBLISHED: "project:unpublished",

  // Workspaces
  WORKSPACE_MEMBER_JOINED: "workspace:member-joined",
  WORKSPACE_MEMBER_LEFT: "workspace:member-left",
  WORKSPACE_ROLE_CHANGED: "workspace:role-changed",
} as const;

export type RealtimeEventName = typeof REALTIME_EVENTS[keyof typeof REALTIME_EVENTS];
