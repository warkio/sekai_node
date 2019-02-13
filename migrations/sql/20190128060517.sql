begin;

insert into migrations (id) values (20190128060517);

-- Do not modify anything above this comment.
-----------------------------------------------------------------------


CREATE TABLE session_tokens(
    id bigserial primary key not null,
    token text unique not null,
    belongs_to bigint not null references users(id),
    expires_at timestamp not null default now()+interval'1 hours',
    created_at timestamp not null default now()
);


-----------------------------------------------------------------------
-- Do not modify anything below this comment.

commit;
