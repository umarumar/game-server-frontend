// Small role pill shared by the admin dashboard and players screens.
// Admin = amber, regular player = gray/muted.

export default function RoleBadge({ isAdmin }: { isAdmin: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        isAdmin
          ? "bg-admin-tint text-amber"
          : "border border-border text-muted"
      }`}
    >
      {isAdmin ? "Admin" : "Player"}
    </span>
  );
}
