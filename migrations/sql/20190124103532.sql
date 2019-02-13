begin;

insert into migrations (id) values (20190124103532);

-- Do not modify anything above this comment.
-----------------------------------------------------------------------

-- Categories
create table categories(
    id bigserial primary key,
    name text not null unique,
    slug text not null unique,
    description text,
    color text,
    image text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

-- Sections. Each section is inside a category
create table sections(
    id bigserial primary key,
    name text not null,
    slug text not null unique,
    description text,
    color text,
    image text,
    category_id bigint not null references categories(id),
    is_open boolean not null default true,
    unique(name, category_id),
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);
-- There can be many threads inside a section
create table threads(
    id bigserial primary key,
    name text not null,
    slug text not null unique,
    description text,
    color text,
    image text,
    section_id bigint not null references sections(id),
    user_id bigint not null references users(id),
    is_pinned boolean not null default false,
    is_open boolean not null default true,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

-- There can be many posts inside a thread
create table posts(
    id bigserial primary key,
    content text not null,
    title text,
    update_count bigint not null default 0,
    last_updated_by bigint references users(id),
    last_update_reason text,
    user_id bigint not null references users(id),
    thread_id bigint not null references threads(id),
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

-----------------------------------------------------------------------
-- Do not modify anything below this comment.

commit;
