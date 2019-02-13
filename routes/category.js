const express = require('express');
const router = express.Router();
const { CategoryModel } = require('../models/category_model');
const db = require('../lib/db');

// TODO - Pass everything to models

router.get('/', (req, res, next) => {

    db.task(async t => {
        // Page - quantity filters
        let page = isNaN(req.query.page)? 1 : req.query.page;
        let quantity = isNaN(req.query.quantity)? 15 : req.query.quantity;
        page = Math.max(page, 1);
        quantity = Math.min(Math.max(quantity, 10), 100);
        const offset = (page-1)*quantity;
        
        const { name } = req.query;
        const { slug } = req.query;

        let query = "SELECT * FROM categories";
        let queryCount = "SELECT count(id) FROM categories";
        const params = [];
        if(name !== undefined) {
            params.push(name);
            query += " WHERE name=$1";
            queryCount += " WHERE name=$1";
        }

        if(slug !== undefined) {
            if(params.length === 0) {
                query += " WHERE";
                queryCount += " WHERE";
            }
            else{
                query += " AND";
                queryCount += " AND";
            }
            params.push(slug);
            query += " slug=$"+params.length;
            queryCount += " slug=$"+params.length;
        }
        const count = (await t.query(queryCount, params))[0].count;
        params.push(quantity);
        query += " LIMIT $"+params.length;
        params.push(offset);
        query += " OFFSET $"+params.length;
        const result = await t.query(query, params);
        return res.status(200).send({
            total: count,
            content: result
        });
    });
});

/**
 * Creates a category. Name is mandatory
 * @param {string} name Name of the category
 * @param {string} description Description of the category
 * @param {string} color Color
 * @param {string} image URI to the image
 */
router.post('/', async (req, res, next) => {
    db.task(async t => {
        // Parameters
        const { name } = req.body;
        const { description } = req.body;
        const { color } = req.body;
        const { image } = req.body;
        // No need to create a model to check that
        const categoryExistence = (await t.query("SELECT id FROM categories WHERE name=$1", [name])).length > 0;
        if(categoryExistence) {
            return res.status(400).send({error:"A category with that name already exists"});
        }
        const category = await CategoryModel.create(t);
        category.name = name;
        category.description = description;
        category.color = color;
        category.image = image;
        await category.save();

        return res.status(200).send({id: category.id});
    });
});

/**
 * Edits a category. At least one parameter is mandatory
 * @param {string} name Name of the category
 * @param {string} description Description of the category
 * @param {string} color Color
 * @param {string} image URI to the image
 */
router.put('/:id', (req, res, next) => {
    const { name } = req.body;
    const { description } = req.body;
    const { color } = req.body;
    const { image } = req.body;
    if(description === undefined && color === undefined && image === undefined && name === undefined) {
        return res.status(400).send({error:"You must edit something"});
    }

    db.task(async t => {
        const { id } = req.params;
        const category = await CategoryModel.find("id", id, t);
        if(category === null) {
            return res.status(400).send({error:"Invalid category"});
        }
        if(name !== undefined) {
            category.name = name;
        }
        if(description !== undefined) {
            category.description = description;
        }
        if(color !== undefined) {
            category.color = color;
        }
        if(image !== undefined) {
            category.image = image;
        }
        await category.save();
        return res.status(200).send({success:true});
    });
});

/**
 * Deletes a category
 * @param {integer} id Id of the category to delete
 * @returns {Object} Result of the operation
 */
router.delete('/:id', (req, res, next) => {
    db.task(async t => {
        const { id } = req.params;
        const category = await CategoryModel.find("id", id, t);
        // TODO - Delete sections, threads and posts
        if(category === null) {
            return res.status(400).send({error:"Invalid category"});
        }
        await category.delete();
        return res.status(200).send({success:true});
    });
});

module.exports = router;