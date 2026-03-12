# Release checklist

Before merging to `main`:

- [ ] `npm ci`
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] Critical flows smoke-tested manually:
  - [ ] Login/logout
  - [ ] Dashboard load
  - [ ] Kanban status move
  - [ ] Task detail panel
