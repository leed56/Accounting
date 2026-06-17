# RLS Policies

## Helper Functions

- `get_user_company_id()` — returns company_id from profiles
- `get_user_role()` — owner | manager | staff
- `is_owner()` / `is_manager_or_owner()`

## Policy Summary

| Table | Owner | Manager | Staff |
|-------|-------|---------|-------|
| companies | read/update | read | — |
| transactions | full + approve | create/read | — |
| payment_requests | approve | create | — |
| payroll_runs | approve | submit | — |
| leave_requests | approve | create | self read |

## Security Rules

- Service role key never on client
- AI cannot write financial data
- Approval actions require owner role in RLS
- Audit logs on approve/reject (app + triggers planned)

See `supabase/migrations/20260617000001_initial_schema.sql` for full SQL.
