begin;

insert into migrations (id) values (20190204133248);

-- Do not modify anything above this comment.
-----------------------------------------------------------------------


CREATE TABLE permissions(
    id bigserial not null primary key,
    permission_name text not null unique,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

CREATE TABLE roles(
    id bigserial not null primary key,
    role_name text not null unique,
    description text,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

CREATE TABLE role_permissions(
    role_id bigint not null references roles(id),
    permission_id bigint not null references permissions(id),
    read_permission boolean not null default false,
    write_permission boolean not null default false,
    update_permission boolean not null default false,
    delete_permission boolean not null default false,
    primary key(role_id, permission_id)
);
-----------------------------------------------------------------------
-- Do not modify anything below this comment.

commit;
