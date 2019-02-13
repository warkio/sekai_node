const { BaseModel } = require('./base_model');
const slugify = require('../lib/slugify');

class CategoryModel extends BaseModel {
    constructor(conn){
        super(conn);
        this.tableName = CategoryModel.tableName;
    }

    async save() {
        this.slug = slugify(this.name);
        let tempIndex = 0;
        let query = "";
        let params = [this.tableName, ""];
        if(this.id !== undefined) {
            query = "SELECT id FROM $1~ WHERE slug=$2 AND id!=$3";
            params.push(this.id);
        }
        else {
            query = "SELECT id FROM $1~ WHERE slug=$2";
        }
        
        let sameSlug = false;
        do{
            params[1] = tempIndex===0?this.slug : `${tempIndex}-${this.slug}`
            sameSlug = (await this.conn.query(
                query,
                params
            )).length > 0;
            if(sameSlug){
                tempIndex++;
            }
        }while(sameSlug);
        if(tempIndex !== 0) {
            this.slug = `${tempIndex}-${this.slug}`;
        }
        
        await super.save();
    }
}

CategoryModel.tableName = "categories";
module.exports = { CategoryModel };