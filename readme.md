# Sekai Node
Backend in NodeJS - Express. WIP

# Requirements
- NodeJS >= 11.0

# Config
A `development.js` is required in the `config` folder.

# Scripts

### Create model
`npm run create-model <model-name> <table-name>`<br>
**Example**<br>
`npm run create-model postModel posts`

### Migrations
To create a migration, run:<br>
`npm run create-migration`<br>
a `.sql` file will be created in `migrations/sql`.<br><br>

To run the pending migrations, run:<br>
`npm run run-migrations`<br><br>

All the migrations will be applied if you run `npm start`.
