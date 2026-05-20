create table google_auth_sessions (
    session_id varchar(80) primary key,
    user_id bigint not null references users(id) on delete cascade,
    google_subject varchar(255) not null,
    email varchar(255) not null,
    name varchar(100) not null,
    profile_image_url text,
    access_token text not null,
    refresh_token text,
    token_expires_at timestamptz not null,
    session_expires_at timestamptz not null,
    invite_verified boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_google_auth_sessions_user_id
    on google_auth_sessions (user_id);

create index idx_google_auth_sessions_expires_at
    on google_auth_sessions (session_expires_at);
