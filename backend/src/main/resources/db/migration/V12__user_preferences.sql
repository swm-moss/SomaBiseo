create table user_notice_bookmark_preferences (
    id bigserial primary key,
    user_id bigint not null references users(id) on delete cascade,
    notice_source_id varchar(255) not null,
    created_at timestamptz not null default now(),
    constraint uk_user_notice_bookmark_preference unique (user_id, notice_source_id)
);

create index idx_user_notice_bookmark_preferences_user
    on user_notice_bookmark_preferences (user_id);

create table user_event_favorite_preferences (
    id bigserial primary key,
    user_id bigint not null references users(id) on delete cascade,
    event_source_id varchar(255) not null,
    created_at timestamptz not null default now(),
    constraint uk_user_event_favorite_preference unique (user_id, event_source_id)
);

create index idx_user_event_favorite_preferences_user
    on user_event_favorite_preferences (user_id);

create table user_interest_topic_preferences (
    id bigserial primary key,
    user_id bigint not null references users(id) on delete cascade,
    topic_id varchar(40) not null,
    display_order integer not null default 0,
    created_at timestamptz not null default now(),
    constraint uk_user_interest_topic_preference unique (user_id, topic_id)
);

create index idx_user_interest_topic_preferences_user
    on user_interest_topic_preferences (user_id);
