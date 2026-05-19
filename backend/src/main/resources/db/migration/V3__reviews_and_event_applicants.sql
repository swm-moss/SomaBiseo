create table event_applicants (
    id bigserial primary key,
    soma_event_id bigint not null references soma_events(id),
    applicant_no varchar(40) not null,
    trainee_name varchar(100) not null,
    applied_at timestamptz,
    canceled_at timestamptz,
    status varchar(40) not null,
    snapshot_at timestamptz not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uk_event_applicant unique (soma_event_id, applicant_no)
);

create table reviews (
    id bigserial primary key,
    soma_event_id bigint not null references soma_events(id),
    author_name varchar(100) not null,
    content varchar(500) not null,
    author_ip varchar(45),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uk_review_event_author unique (soma_event_id, author_name),
    constraint ck_review_content_length check (char_length(content) between 20 and 500)
);
