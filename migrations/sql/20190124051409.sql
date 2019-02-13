begin;

insert into migrations (id) values (20190124051409);

-- Do not modify anything above this comment.
-----------------------------------------------------------------------


CREATE TABLE users(
    id bigserial not null primary key,
    username varchar(100) not null unique,
    avatar text,
    signature text,
    email text not null unique,
    password text not null,
    in_role_money bigint not null default 0,
    off_role_money bigint not null default 0,
    in_role_exp bigint not null default 0,
    off_role_exp bigint not null default 0,
    in_role_level bigint not null default 1,
    off_role_level bigint not null default 1,
    banned_until timestamp,
    ban_reason text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

-----------------------------------------------------------------------
-- Do not modify anything below this comment.

commit;