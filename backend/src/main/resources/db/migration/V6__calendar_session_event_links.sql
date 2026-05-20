create table calendar_session_event_links (
    id bigserial primary key,
    calendar_session_id varchar(80) not null,
    source_id varchar(255) not null,
    google_event_id varchar(255),
    calendar_id varchar(255) not null,
    status varchar(30) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uk_calendar_session_event_link unique (calendar_session_id, source_id, calendar_id)
);

create index idx_calendar_session_event_links_session
    on calendar_session_event_links (calendar_session_id);

comment on table calendar_session_event_links is
    'Google Calendar event links keyed by the temporary calendar session cookie. The existing user-based calendar_event_links table remains unused until user identity is introduced.';
