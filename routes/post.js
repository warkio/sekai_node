const express = require('express');
const router = express.Router();
const { PostModel } = require('../models/post_model');
const db = require('../lib/db');


router.get('/', (req, res, next) => {
    db.task(async t =>{
        // Page - quantity filters
        let page = isNaN(req.query.page)? 1 : req.query.page;
        let quantity = isNaN(req.query.quantity)? 15 : req.query.quantity;
        page = Math.max(page, 1);
        quantity = Math.min(Math.max(quantity, 10), 100);
        const offset = (page-1)*quantity;
        const threadId = req.query["section-id"];
        const filters = [];
        if(!isNaN(threadId)) {
            filters.push(
                ["thread_id","=",threadId]
            );
        }

        // Get all threads
        const posts = await PostModel.findAll(
            true,
            filters,
            quantity,
            offset,
            t
        );
        const total = await PostModel.count(filters);
        return res.status(200).send({
            total,
            content: posts
        });
    });
});

module.exports = router;