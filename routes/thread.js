const express = require('express');
const router = express.Router();
const { ThreaadModel } = require('../models/thread_model');
const { SectionModel } = require('../models/section_model');
const { PostModel } = require('../models/post_model');
const db = require('../lib/db');

/**
 * Get threads, it's possible to filter with one of these parameters.
 * @param {Integer} page Page of the result. Used to apply offset.
 * @param {Integer} quantity Quantity of elements to return
 * @param {Integer} section-id  Id of the section where the thread belongs 
 */
router.get('/', (req, res, next) => {
    db.task(async t =>{
        // Page - quantity filters
        let page = isNaN(req.query.page)? 1 : req.query.page;
        let quantity = isNaN(req.query.quantity)? 15 : req.query.quantity;
        page = Math.max(page, 1);
        quantity = Math.min(Math.max(quantity, 10), 100);
        const offset = (page-1)*quantity;
        const sectionId = req.query["section-id"];
        const filters = [];
        if(!isNaN(sectionId)) {
            filters.push(
                ["section_id","=",sectionId]
            );
        }

        // Get all threads
        const threads = await ThreaadModel.findAll(
            true,
            filters,
            quantity,
            offset,
            t
        );
        const total = await ThreaadModel.count(filters);
        return res.status(200).send({
            total,
            content: threads
        });
    });
});

router.post('/', (req, res, next) => {
    if(res.locals.user === null) {
        return res.status(401).send({error:"Unauthorized"});
    }
    const { name } = req.body;
    const { description } = req.body;
    const { sectionSlug } = req.body;
    const { postContent } = req.body;
    if(name === undefined || description === undefined || sectionSlug === undefined || postContent === undefined) {
        return res.status(400).send({error:"Invalid structure"});
    }

    if(typeof(name) !== "string") {
        return res.status(400).send({error:"Name must be string"});
    }
    else if(typeof(postContent) !== "string" || postContent.length <=10) {
        return res.status(400).send({error:"Post content must be string and with a length greater than 10"})
    }
    db.task(async t =>{
        const validSection = await SectionModel.find([["slug","=",sectionSlug]], t);
        if(validSection === null) {
            return res.status(400).send({error:"Invalid section"});
        }
        if(!validSection.isOpen) {
            return res.status(401).send({error:"Section is closed"});
        }

        const thread = await ThreaadModel.create(t);
        thread.name = name;
        thread.description = description !== undefined ? description : null;
        thread.sectionId = validSection.id;
        thread.userId = res.locals.user.id;
        await thread.save();

        const post = await PostModel.create(t);
        post.content = postContent;
        post.userId = res.locals.user.id;
        post.threadId = thread.id;
        await post.save();
    });
    
});

router.put('/:id', (req, res, next) => {
    if(res.locals.user === null) {
        return res.status(401).send({error:"Unauthorized"});
    }
});

router.delete('/:id', (req, res, next) =>{
    if(res.locals.user === null) {
        return res.status(401).send({error:"Unauthorized"});
    }
    
})

module.exports = router;