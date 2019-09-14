const express = require('express');
const router = express.Router();
const { CategoryModel } = require('../models/category_model');
const { SectionModel } = require('../models/section_model');
const { ThreadModel } = require('../models/thread_model');
const db = require('../lib/db');

// TODO - Manage everything with models

/* GET home page. */
router.get('/', async (req, res, next)=>{
    db.task(async t=>{
        const categories = await CategoryModel.findAll(true,null,null,null,t);
        for(let i=0; i<categories.length;i++) {
            categories[i].sections = await SectionModel.findAll(true,[["category_id", "=",categories[i].id]], null, null, t);
            for(let j=0;j<categories[i].sections.length;j++){
                categories[i].sections[j].isRead = await (await SectionModel.fromObject(categories[i].sections[j])).isRead(res.locals.user);
            }
        }

        return res.render('index', {
            categories: categories.sort((a, b) => (
                (a.display_order|0) - (b.display_order|0)
            )),
        });
    });

});

/**
 * Just in case you want to see the sections in a separated page
 */
router.get('/:categorySlug', async (req, res, next)=>{
    console.log("here");
    db.task(async t => {

        const category = await CategoryModel.find([["slug","=",req.params.categorySlug]], t);
        if(category === null) {
            return next(404);
        }
        
        const sections = await SectionModel.findAll(
            true,
            [
                ["category_id", "=", category.id],
            ],
            null,
            null,
            t
        );
        for( let i=0; i<sections.length; i++) {
            sections[i].isRead = await(await SectionModel.fromObject(sections[i])).isRead(res.locals.user);
        }
        return res.render('category', {sections});
    });

});

/**
 * Get threads
 */
router.get('/:categorySlug/:sectionSlug', async (req, res, next)=>{

    db.task(async t => {
        let page = isNaN(req.query.page)? 1 : req.query.page;
        let quantity = isNaN(req.query.quantity)? 15 : req.query.quantity;
        page = Math.max(page, 1);
        quantity = Math.min(Math.max(quantity, 10), 100);
        const offset = (page-1)*quantity;

        const category = await CategoryModel.find([["slug", "=",req.params.categorySlug]], t);
        // TODO - Add option to model to have multiple conditions in query
        const section = await SectionModel.find(
            [
                ["slug", "=", req.params.sectionSlug],
                ["category_id", "=", category.id]
            ],
            t
        );
        if( !section || section.length === 0 ) {
            return next(404);
        }
        // Response object
        const threads = {
            pinned: [],
            normal: {
                total: 0,
                content: []
            }
        };
        // Get pinned threasd and threads
        const pinnedThreads = await t.query("SELECT * FROM threads WHERE is_pinned=true AND section_id=$1", [section.id]);
        const threadsQuery = await t.query(
            "select * from (select distinct on (id) * from ( SELECT threads.*, posts.created_at as last_post_date, posts.id as post_id from threads left join posts on posts.thread_id = threads.id order by last_post_date asc) as threads) as res WHERE is_pinned=false AND section_id=$1 ORDER BY last_post_date DESC limit $2 OFFSET $3",
            [section.id, quantity, offset]
        );
        const totalThreads = (await t.query(
            "select count(id) from (select distinct on (id) * from ( SELECT threads.*, posts.created_at as last_post_date, posts.id as post_id from threads left join posts on posts.thread_id = threads.id order by last_post_date asc) as threads) as res WHERE is_pinned=false AND section_id=$1",
            [section.id]
        ))[0].count;
        threads.normal.total = totalThreads;
        // Pinned threads
        for(let i=0; i<pinnedThreads.length; i++) {
            let lastPostUser = (await t.query("SELECT id, username FROM users WHERE id=$1",[pinnedThreads[i].user_id]))[0];
            let lastPostDate = (await t.query("SELECT created_at FROM posts WHERE id=$1", [pinnedThreads[i].id]))[0].created_at;
            threads.pinned.push({
                id: pinnedThreads[i].id,
                name: pinnedThreads[i].name,
                slug: pinnedThreads[i].slug,
                description: pinnedThreads[i].description,
                color: pinnedThreads[i].color,
                image: pinnedThreads[i].image,
                userId: pinnedThreads[i].user_id,
                isPinned: pinnedThreads[i].is_pinned,
                isOpen: pinnedThreads[i].is_open,
                isRead: (await ThreadModel.fromObject(pinnedThreads[i])).isRead(res.locals.user),
                lastPost: {
                    id: pinnedThreads[i].post_id,
                    user: {
                        id: lastPostUser.id,
                        name: lastPostUser.username
                    },
                    date: lastPostDate
                }
            });
        }
        // Threads
        for(let i=0; i<threadsQuery.length; i++) {
            let lastPostUser = (await t.query("SELECT id, username FROM users WHERE id=$1",[threadsQuery[i].user_id]))[0];
            let lastPostDate = (await t.query("SELECT created_at FROM posts WHERE thread_id=$1", [threadsQuery[i].id]))[0].created_at;
            threads.normal.count++;
            threads.normal.content.push({
                id: threadsQuery[i].id,
                name: threadsQuery[i].name,
                slug: threadsQuery[i].slug,
                description: threadsQuery[i].description,
                color: threadsQuery[i].color,
                image: threadsQuery[i].image,
                userId: threadsQuery[i].user_id,
                isPinned: threadsQuery[i].is_pinned,
                isOpen: threadsQuery[i].is_open,
                isRead: (await ThreadModel.fromObject(threadsQuery[i])).isRead(res.locals.user),
                lastPost: {
                    id: threadsQuery[i].post_id,
                    user: {
                        id: lastPostUser.id,
                        name: lastPostUser.username
                    },
                    date: lastPostDate
                }
            });
        }

        res.render('section', {
            category,
            section,
            threads,
        });
    });

});

router.get('/:categorySlug/:sectionSlug/:threadSlug', async (req, res, next)=>{
    const posts = [];
    res.render('index', {posts});
});

module.exports = router;
