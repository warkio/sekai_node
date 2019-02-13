const express = require('express');
const path = require('path');
const config = require('./config');
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const logger = require('morgan');
const log = require('./lib/log');
const db = require('./lib/db');
const nunjucks = require('nunjucks');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const categoryRouter = require('./routes/category');

const app = express();

app.set('view engine', 'html');

nunjucks.configure(path.join(__dirname, 'views'), {
    express: app,
    noCache: config.env !== 'production',
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(config.http.cookiesKey));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.locals.pathPrefix = config.http.pathPrefix;
    res.locals.title = 'Sekai';
    res.locals.user = null;

    next();
});

app.use((req, res, next) => {
    const { sessionToken } = req.signedCookies;
    if (!sessionToken) {
        next();

        return;
    }
    db.task(async t=>{
        const rows = await t.query("SELECT * FROM session_tokens WHERE token=$1 AND now()<expires_at", [sessionToken]);
        if(rows.length === 0) {
            res.locals.user = null;
            next();
            return;
        }
        const userQuery = (await t.query(
            "SELECT id, email, username, avatar, signature, in_role_money,in_role_exp,in_role_level,off_role_money,off_role_exp,off_role_level, banned_until, ban_reason FROM users WHERE id=$1",
            [rows[0].belongs_to]
        ));
        const user = userQuery[0];
        // Set user info
        res.locals.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            avatar: user.avatar,
            signature: user.signature,
            inRoleMoney: user.in_role_money,
            offRoleMoney: user.off_role_money,
            inRoleExp: user.in_role_exp,
            offRoleExp: user.off_role_exp,
            inRoleLevel: user.in_role_level,
            offRoleLevel: user.off_role_level,
            bannedUntil: user.banned_until,
            banReason: user.ban_reason
        };
        next();
    });
});

app.use((req, res, next)=>{
    console.log(res.locals.user);
    next();
});
app.use('/api/category', categoryRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use((req, res, next) => {
    next(createError(404));
});

app.use((err, req, res, next) => {
    const isProduction = req.app.get('env') === 'production';

    res.locals.message = err.message;
    res.locals.error = null;

    const status = err.status || 500;

    if (!isProduction) {
        if (status >= 500 && status <= 599) {
            log.error(err.stack);
        }

        res.locals.error = err;
    }

    res.status(status);
    res.render('error');
});

module.exports = app;
