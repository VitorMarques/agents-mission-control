import type { UserRole } from "./auth";

export type Permission =
  | "task:status:move"
  | "user:create"
  | "user:view-self"
  | "session:logout";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: ["task:status:move", "user:create", "user:view-self", "session:logout"],
  MANAGER: ["task:status:move", "user:view-self", "session:logout"],
  VIEWER: ["user:view-self", "session:logout"],
};

export function hasPermission(role: UserRole, permission: Permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
