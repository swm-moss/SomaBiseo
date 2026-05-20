alter table users add column invite_verified_at timestamptz;
alter table users add column invite_failed_attempts integer not null default 0;
alter table users add column invite_locked_until timestamptz;

create index idx_users_invite_verified_at on users(invite_verified_at);
