const db = require('../lib/db');
const path = require('path');
const fs = require('fs');

const queriesPath = path.join(__dirname, "sql");

( async ()=>{
    const files = fs.readdirSync(queriesPath);
    files.sort() // Just in case
    // Create migrations table if it doesn't exists
    await db.query("CREATE TABLE IF NOT EXISTS migrations(id bigint not null primary key, created_at timestamp default now());");
    for (let i=0; i<files.length; i++) {
        let fullPath = path.join(queriesPath, files[i]);
        // Check if the migration is already done
        let migrationDone = (await db.query("SELECT id FROM migrations WHERE id=$1", [files[i].split(".")[0]])).length > 0;
        if(!migrationDone) {
            // Run the migration
            console.log(`Running migration ${files[i]}`);
            let migrationContent = fs.readFileSync(fullPath).toString();
            await db.query(migrationContent);
            console.log("Migration done");
        }
        else {
            // Nothing to do here
            console.log(`Migration ${files[i]} already done`);
        }
    }
    process.exit();
})();


