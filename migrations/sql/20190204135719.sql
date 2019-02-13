begin;

insert into migrations (id) values (20190204135719);

-- Do not modify anything above this comment.
-----------------------------------------------------------------------


INSERT INTO roles(role_name) VALUES ('admin'),
('moderator'),
('user');

INSERT INTO role_permissions(role_id, permission_id, write_permission, read_permission, update_permission, delete_permission) VALUES
(1,1,true,true,true,true), -- Admin admin
(2,2,true,false,false,false), -- Moderator admin panel
(2,3,false,true,false,false), -- Moderator categories
(2,4,false,true,false,false), -- Moderator sections
(2,5,true,true,true,true), -- Moderator Threads
(2,6,true,true,true,true), -- Moderator posts
(3,5,true,true,false,false), -- User threads
(3,6,true,true,false,false); -- User posts


-----------------------------------------------------------------------
-- Do not modify anything below this comment.

commit;
