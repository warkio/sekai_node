const express = require('express');
const router = express.Router();
const { CategoryModel } = require('../models/category_model');
const db = require('../lib/db');
const validSort = ['id', 'display-order'];
const possibleSort = ['asc', 'desc'];

/**
 * Get a determined quantity of categories
 */
router.get('/', (req, res, next) => {
    let sort = 'display-order';
    let sortOrder = 'asc';
    if(req.query['order-by'] && validSort.includes(req.query['order-by'])) {
        sort = req.query['order-by'];
    }
    if(req.query['order-type'] && possibleSort.includes(req.query['order-type'])) {
        sortOrder = req.query['order-type'];
    }
    if(sort === 'display-order')  {
        sort = 'display_order';
    }
    db.task(async t => {
        // Page - quantity filters
        let page = isNaN(req.query.page)? 1 : req.query.page;
        let quantity = isNaN(req.query.quantity)? 15 : req.query.quantity;
        page = Math.max(page, 1);
        quantity = Math.min(Math.max(quantity, 10), 100);
        const offset = (page-1)*quantity;
        
        const { name } = req.query;
        const { slug } = req.query;

        const params = [];
        if(name !== undefined) {
            params.push(["name", "=", name]);
        }

        if(slug !== undefined) {
            params.push(["slug", "=", slug]);
        }
        const count = await CategoryModel.count(null, t);
        const result = await CategoryModel.findAll(true, params, quantity, offset, t, sort, sortOrder);

        return res.status(200).send({
            total: count,
            content: result
        });
    });
});

/**
 * Get all categories
 */
router.get('/all', (req, res, next) => {
    let sort = 'display-order';
    let sortOrder = 'asc';
    if(req.query['order-by'] && validSort.includes(req.query['order-by'])) {
        sort = req.query['order-by'];
    }
    if(req.query['order-type'] && possibleSort.includes(req.query['order-type'])) {
        sortOrder = req.query['order-type'];
    }
    if(sort === 'display-order')  {
        sort = 'display_order';
    }
    db.task(async t => {
        const count = await CategoryModel.count(null, t);
        const result = await CategoryModel.findAll(true, params, quantity, offset, t, sort, sortOrder);
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
        if(name === undefined) {
            return res.status(400).send({error:"'name' is a required field"});
        }
        const { description } = req.body;
        const { color } = req.body;
        const { image } = req.body;
        // No need to create a model to check that
        const categoryExistence = await CategoryModel.find([["name", "=", name]], t);
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
 * Updates the order of all categories
 * @param {Array<<Object<String, String>>} categories array of categories to process 
 * @returns {Object} result of the operation
 */
router.put('/order', (req, res, next) => {
    db.task(async t => {
        // Get all ids
        const categoryIds = (await t.query('SELECT id FROM categories')).map(cat => cat.id);
        const { categories } = req.body;
        // Not all categories were sent
        if(categories.length !== categoryIds.length) {
            return res.status(400).send({error: 'Invalid categories sent here'});
        }
        // Check existence of all categories
        for (let i=0; i<categories.length; i++) {
            if ( !categoryIds.includes(categories[i] ) ) {
                console.log('Db: ', categoryIds, ' desired: ', categories[i])
                return res.status(400).send({error: 'Invalid categories sent'});
            }
        }
        await CategoryModel.updateOrder(categories, t)
            .catch((err) => {
                next(err);
            });
        return res.status(200).send({success:true});
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
        const category = await CategoryModel.find([["id","=",id]], t);
        if(category === null) {
            return res.status(400).send({error:"Invalid category"});
        }
        if(name !== undefined) {
            const existence = await CategoryModel.find(
                [
                    ["name","=",name],
                    ["id", "!=", id]
                ]
            )
            if(existence) {
                return res.status(400).send({error:"Can't change the category name to that one"});
            }
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
        category.save()
            .then(()=>{
                res.status(200).send({success:true});
            })
            .catch((err)=>{
                next(err);
            });
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
        category.delete()
            .then(()=>{
                res.status(200).send({success:true});
            })
            .catch((err)=>{
                next(err);
            })
    });
});

module.exports = router;