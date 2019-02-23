const express = require('express');
const config = require('../config');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../lib/db');
const {UsernameAlreadyExists, EmailAlreadyExists, InvalidCredentials} = require('../errors/auth');

async function createUser(email,username,password){
    await db.task(async t =>{
        // Check for both email and username
        const validUsername = (await t.query("SELECT id FROM users WHERE username=$1",[username])).length === 0;
        if(!validUsername) {
            throw new UsernameAlreadyExists("That username is already in use");
        }
        const validEmail = (await t.query("SELECT id FROM users WHERE email=$1",[email])).length === 0;
        if(!validEmail) {
            throw new EmailAlreadyExists("That email is already in use");
        }
        const saltedPassword = await bcrypt.hash(password, 5)
        const result = await t.result(
            "INSERT INTO users(email,username,password) VALUES($1,$2,$3)",
            [email,username,saltedPassword],
            r => r.rowCount);
        return result > 0;
    });
}


router.get('/login', (req, res)=>{
    if(res.locals.user !== null) {
        const redirectTo = `${config.http.pathPrefix}/`;
        res.redirect(303, redirectTo);
    }
    // render the page and pass in any flash data if it exists
    res.render('login.html'); 
});

router.get('/register', (req, res)=>{
    if(res.locals.user !== null) {
        const redirectTo = `${config.http.pathPrefix}/`;
        res.redirect(303, redirectTo);
    }
    // render the page and pass in any flash data if it exists
    res.render('register.html');
});

router.get('/logout', async (req, res)=>{
    res.locals.user = null;
    const { sessionToken } = req.signedCookies;
    // Make the token expire, so no one can use it
    await db.query("UPDATE session_tokens SET expires_at=now() WHERE token=$1", [sessionToken]);
    // Delete cookie from browser
    res.clearCookie('sessionToken');

    const redirectTo = `${config.http.pathPrefix}/`;
    res.redirect(303, redirectTo);
});

router.get('/profile', (req, res)=>{
    res.render('profile.html', {
        user : res.locals.user // get the user out of session and pass to template
    });
});
/** POST **/

router.post('/register',(req,res,next)=>{
    let info = req.body;
    let { email } = info;
    let { password } = info;
    let { username } = info;
    if(email === undefined || password === undefined || username === undefined){
        return res.status(400).send({error:"You must pass email, password and username"});
    }
    createUser(email,username,password)
        .then((result)=>{
            return res.status(200).send({success:result})
        })
        .catch((err)=>{
            // TODO - Process better the error
            console.log(err);
            return res.status(500).send({error:err.message});
        })
});

router.post('/login',async (req, res, next)=>{

    if(res.locals.user !== null) {
        return res.status(400);
    }

    db.task(async t => {
        const { email } = req.body;
        const { password } = req.body;
        const { rememberMe } = req.body;
        if(email === undefined || password === undefined) {
            return res.status(400).send({error:"Both email and password must be sent"});
        }
        if(res.locals.user !== null) {
            console.log(res.locals.user);
            return res.redirect("/");
        }
        const userQuery = (await t.query("SELECT * FROM users WHERE email=$1",[email]));
        if(userQuery.length === 0) {
            return res.status(400).send({error:"Invalid credentials"});
        }
        const user = userQuery[0];
        if(!(await bcrypt.compare(password, user.password))){
            return res.status(400).send({error:"Invalid credentials"});
        }
        let sessionToken;
        let tokenExistence;
        // Create an unique token
        do{
            sessionToken = await bcrypt.hash(user.email+new Date().toString(), 5);
            tokenExistence = (await t.query("SELECT id FROM session_tokens WHERE token=$1",[sessionToken])).length > 0;
        }while(tokenExistence);
    
        let query;
        if (rememberMe!==undefined && rememberMe) {
            query = "INSERT INTO session_tokens(token, belongs_to, expires_at) VALUES($1, $2, now()+interval'30 days')";
        }
        else{
            query = "INSERT INTO session_tokens(token, belongs_to) VALUES($1, $2)";
        }
        await t.query(query, [sessionToken, user.id]);
        res.cookie('sessionToken', sessionToken, {
            httpOnly: true,
            signed: true,
            maxAge: rememberMe!==undefined && rememberMe?60*60*24*30*1000 : 60 * 60 * 1000 // 30 days / 1 Hour
        });
        return res.redirect("/");
    });

});

module.exports = router;
