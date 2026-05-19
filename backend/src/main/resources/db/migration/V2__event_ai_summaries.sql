create table event_ai_summaries (
    id bigserial primary key,
    source_id varchar(255) not null,
    source_url text not null,
    content_hash varchar(64) not null,
    model varchar(80) not null,
    one_line varchar(500) not null,
    summary_bullets text not null,
    target_audience text not null,
    key_topics text not null,
    takeaways text not null,
    difficulty varchar(20) not null,
    input_tokens integer,
    output_tokens integer,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uk_event_ai_summary_source_hash unique (source_id, content_hash)
);

create index idx_event_ai_summaries_source_id on event_ai_summaries(source_id);
