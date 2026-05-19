alter table notices alter column published_at drop not null;

alter table soma_events alter column start_at drop not null;
alter table soma_events alter column end_at drop not null;
alter table soma_events add column applicant_count integer;
alter table soma_events add column approval_status varchar(80);
alter table soma_events add column operation_type varchar(80);
alter table soma_events add column author varchar(100);
alter table soma_events add column registered_at timestamptz;
alter table soma_events add column detail_items_json text not null default '[]';
alter table soma_events add column content_text text;
alter table soma_events add column applicants_json text not null default '[]';
alter table soma_events add column raw_text text not null default '';

create index idx_notices_published_at on notices(published_at);
create index idx_soma_events_start_at on soma_events(start_at);
