create table users (
    id bigserial primary key,
    email varchar(255) not null unique,
    name varchar(100) not null,
    profile_image_url text,
    provider varchar(30) not null,
    provider_id varchar(255),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table notices (
    id bigserial primary key,
    source_id varchar(255) not null unique,
    title varchar(255) not null,
    content text not null,
    category varchar(40) not null,
    source_url text not null,
    is_important boolean not null default false,
    published_at timestamptz not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table soma_events (
    id bigserial primary key,
    source_id varchar(255) not null unique,
    type varchar(40) not null,
    title varchar(255) not null,
    mentor_name varchar(100),
    topic varchar(255),
    description text,
    location varchar(255),
    start_at timestamptz not null,
    end_at timestamptz not null,
    application_start_at timestamptz,
    application_end_at timestamptz,
    capacity integer,
    status varchar(40) not null,
    source_url text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table user_notice_reads (
    id bigserial primary key,
    user_id bigint not null references users(id),
    notice_id bigint not null references notices(id),
    read_at timestamptz not null default now(),
    unique (user_id, notice_id)
);

create table user_notice_bookmarks (
    id bigserial primary key,
    user_id bigint not null references users(id),
    notice_id bigint not null references notices(id),
    created_at timestamptz not null default now(),
    unique (user_id, notice_id)
);

create table user_event_favorites (
    id bigserial primary key,
    user_id bigint not null references users(id),
    event_id bigint not null references soma_events(id),
    created_at timestamptz not null default now(),
    unique (user_id, event_id)
);

create table google_calendar_connections (
    id bigserial primary key,
    user_id bigint not null references users(id),
    google_account_email varchar(255) not null,
    access_token_encrypted text not null,
    refresh_token_encrypted text not null,
    expires_at timestamptz not null,
    calendar_id varchar(255),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table calendar_event_links (
    id bigserial primary key,
    user_id bigint not null references users(id),
    soma_event_id bigint not null references soma_events(id),
    google_event_id varchar(255) not null,
    calendar_id varchar(255) not null,
    created_at timestamptz not null default now(),
    unique (user_id, soma_event_id, calendar_id)
);

create table source_sync_logs (
    id bigserial primary key,
    source_type varchar(40) not null,
    status varchar(40) not null,
    message text,
    started_at timestamptz not null,
    finished_at timestamptz
);
