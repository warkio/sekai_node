const { BaseModel } = require('./base_model');
const slugify = require('../lib/slugify');

class CategoryModel extends BaseModel {
    constructor(conn){
        super(conn);
        this.tableName = CategoryModel.tableName;
    }

    async save() {
        this.slug = slugify(this.name);
        let originalSlug = this.slug;
        let tempIndex = 0;
        let query = "";
        let params = [this.tableName, ""];
        if(this.id) {
            query = "SELECT id FROM $1~ WHERE slug=$2 AND id!=$3";
            params.push(this.id);
        }
        else {
            query = "SELECT id FROM $1~ WHERE slug=$2";
        }
        
        let sameSlug = false;
        do{
            params[1] = tempIndex===0? originalSlug : `${tempIndex}-${originalSlug}`;
            sameSlug = (await this.conn.query(
                query,
                params
            )).length > 0;
            if(sameSlug){
                tempIndex++;
            }
        }while(sameSlug);
        if(tempIndex !== 0) {
            this.slug = `${tempIndex}-${originalSlug}`;
        }
        await super.save(['displayOrder']);
    }

    /**
     *
     * @param {Array<BigInt>} categories Array of category id in the new order
     */
    static async updateOrder(categories, conn) {
        for(let i=0;i<categories.length;i++) {
            await conn.query('UPDATE categories SET display_order=$1, updated_at=now() WHERE id=$2', [i+1, categories[i]]);
        }
    }

    /**
     * Deletes a category, and then proceeds to update the display order for all of them
     */
    async delete() {
        const categoryId = this.id;
        await super.delete();
        await this.conn('UPDATE categories set display_order=(CASE WHEN display_order > $1 THEN display_order-1 WHEN display_order < $1 THEN display_order-1 END)', [categoryId]);
        
    }
}

CategoryModel.tableName = "categories";
module.exports = { CategoryModel };