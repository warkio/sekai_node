begin;

insert into migrations (id) values (20190204140829);

-- Do not modify anything above this comment.
-----------------------------------------------------------------------


CREATE TABLE thread_read(
    id bigserial not null primary key,
    user_id bigint not null references users(id),
    thread_id bigint not null references threads(id),
    is_read boolean not null default false,
    unique(user_id, thread_id),
    unique(thread_id, user_id)
);


-----------------------------------------------------------------------
-- Do not modify anything below this comment.

commit;
