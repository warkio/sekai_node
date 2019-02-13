begin;

insert into migrations (id) values (20190204134413);

-- Do not modify anything above this comment.
-----------------------------------------------------------------------


INSERT INTO permissions(permission_name) VALUES ('admin'),
('admin panel'),
('category'),
('section'),
('thread'),
('post');


-----------------------------------------------------------------------
-- Do not modify anything below this comment.

commit;
