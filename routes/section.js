const express = require('express');
const router = express.Router();
const { SectionModel } = require('../models/category_model');
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
        const categoryId = req.query["category-id"];

        let query = "SELECT * FROM sections";
        let queryCount = "SELECT count(id) FROM sections";
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

        if(categoryId !== undefined) {
            if(params.length === 0) {
                query += " WHERE";
                queryCount += " WHERE";
            }
            else{
                query += " AND";
                queryCount += " AND";
            }
            params.push(categoryId);
            query += " category_id=$"+params.length;
            queryCount += " category_id=$"+params.length;
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
 * Creates a section. Name and categoryId are mandatory
 * @param {string} name Name of the section
 * @param {integer} categoryId Id of the category
 * @param {string} description Description of the section
 * @param {string} color Color
 * @param {string} image URI to the image
 */
router.post('/', async (req, res, next) => {
    db.task(async t => {
        // Parameters
        const { name } = req.body;
        const { categoryId } = req.body;
        const { description } = req.body;
        const { color } = req.body;
        const { image } = req.body;
        // No need to create a model to check that
        if(isNaN(categoryId) || name === undefined) {
            return res.status(400).send({error:"Category id and name are required"});
        }
        const sectionExistence = (await t.query("SELECT id FROM sections WHERE name=$1 AND category_id=$2", [name, categoryId])).length > 0;
        if(sectionExistence) {
            return res.status(400).send({error:"A section with that name already exists in the category"});
        }
        const section = await SectionModel.create(t);
        section.name = name;
        section.categoryId = categoryId;
        section.description = description;
        section.color = color;
        section.image = image;
        await section.save();

        return res.status(200).send({id: section.id});
    });
});

/**
 * Edits a section. At least one parameter is mandatory
 * @param {string} name Name of the section
 * @param {integer} categoryId Id of the category
 * @param {string} description Description of the section
 * @param {string} color Color
 * @param {string} image URI to the image
 */
router.put('/:id', (req, res, next) => {
    const { name } = req.body;
    const { categoryId } = req.body;
    const { description } = req.body;
    const { color } = req.body;
    const { image } = req.body;
    if(description === undefined && color === undefined && image === undefined && name === undefined && categoryId === undefined) {
        return res.status(400).send({error:"You must edit something"});
    }

    db.task(async t => {
        const { id } = req.params;
        const section = await SectionModel.find("id", id, t);
        if(section === null) {
            return res.status(400).send({error:"Invalid section"});
        }
        let existenceParams;
        if(name === undefined && categoryId !== undefined) {
            // New category - Same name
            existenceParams = [
                section.name,
                categoryId,
                section.id
            ]
        }
        else if( categoryId === undefined && name !== undefined) {
            // New name - Same category
            existenceParams = [
                name,
                section.categoryId,
                section.id
            ]
        }
        else if( categoryId !== undefined && name !== undefined) {
            // New name and new category
            existenceParams = [
                name,
                categoryId,
                section.id
            ]
            
        }
        const existence = (await db.query("SELECT id FROM sections WHERE category_id=$1 AND name=$2 AND id!=$3")).length > 0;

        if(existence) {
            return res.status(400).send({error:"Invalid name and category id combination"});
        }

        if(name !== undefined) {
            section.name = name;
        }
        if(description !== undefined) {
            section.description = description;
        }
        if(color !== undefined) {
            section.color = color;
        }
        if(image !== undefined) {
            section.image = image;
        }
        await section.save();
        return res.status(200).send({success:true});
    });
});

/**
 * Deletes a section
 * @param {integer} id Id of the section to delete
 * @returns {Object} Result of the operation
 */
router.delete('/:id', (req, res, next) => {
    db.task(async t => {
        const { id } = req.params;
        const section = await SectionModel.find("id", id, t);
        if(section === null) {
            return res.status(400).send({error:"Invalid section"});
        }
        await section.delete();
        return res.status(200).send({success:true});
    });
});

module.exports = router;