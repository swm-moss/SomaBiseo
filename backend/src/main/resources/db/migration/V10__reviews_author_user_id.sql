alter table reviews
    add column author_user_id bigint references users(id) on delete cascade;

update reviews r
set author_user_id = (
    select id
    from users
    where name = r.author_name
    order by id
    limit 1
);

delete from reviews where author_user_id is null;

alter table reviews
    alter column author_user_id set not null;

alter table reviews
    drop constraint uk_review_event_author;

alter table reviews
    add constraint uk_review_event_user unique (soma_event_id, author_user_id);

create index idx_reviews_author_user_id on reviews (author_user_id);
