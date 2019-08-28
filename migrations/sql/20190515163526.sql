begin;

insert into migrations (id) values (20190515163526);

-- Do not modify anything above this comment.
-----------------------------------------------------------------------

-- Get the max current value of the order of a category
create or replace function category_order() returns bigint strict as $$
	declare
		result_order bigint;
	begin
		select max(display_order) into result_order
		from
			categories;

		if result_order is null then
			result_order = 0;
		end if;

		return result_order;
	end;
$$ language plpgsql;


-- Add display order parameter
alter table categories
    add column display_order bigint not null default category_order() +1;


-----------------------------------------------------------------------
-- Do not modify anything below this comment.

commit;
