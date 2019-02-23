const fs = require('fs');
const path = require('path');

const currentDate = new Date();
const formattedDate = `${currentDate.getFullYear()}`+
`${String(currentDate.getMonth()+1).padStart(2,0)}`+
`${String(currentDate.getDate()).padStart(2,0)}`+
`${String(currentDate.getHours()).padStart(2,0)}`+
`${String(currentDate.getMinutes()).padStart(2,0)}`+
`${String(currentDate.getSeconds()).padStart(2,0)}`;
const fileName = formattedDate + ".sql";

const template = `begin;

insert into migrations (id) values (${formattedDate});

-- Do not modify anything above this comment.
-----------------------------------------------------------------------


-- TODO: The migration content goes here.


-----------------------------------------------------------------------
-- Do not modify anything below this comment.

commit;
`;

const fullFilePath = path.join(__dirname, "sql", fileName);
fs.writeFileSync(fullFilePath, template);
console.log(`Created migration ${fileName}`);
