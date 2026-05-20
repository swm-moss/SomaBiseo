alter table users add column if not exists invite_verified_at timestamptz;
alter table users add column if not exists invite_failed_attempts integer not null default 0;
alter table users add column if not exists invite_locked_until timestamptz;

create index if not exists idx_users_invite_verified_at on users(invite_verified_at);
