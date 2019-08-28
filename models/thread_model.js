const { BaseModel } = require('./base_model');
const slugify = require('../lib/slugify');

class ThreadModel extends BaseModel {
    constructor(conn){
        super(conn);
        this.tableName = ThreadModel.tableName;
    }
    async save() {
        this.slug = slugify(this.name);
        let originalSlug = this.slug;
        let query = "";
        let params = [this.tableName, ""];
        if(this.id !== undefined) {
            query = "SELECT id FROM $1~ WHERE slug=$2 AND id!=$3 AND section_id!=$4";
            params.push(this.id);
            params.push(this.sectionId);
        }
        else {
            query = "SELECT id FROM $1~ WHERE slug=$2";
        }
        let tempIndex = 0;
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
        
        super.save();
    }

    async isRead(user) {
        if(user === null) {
            return true;
        }
        let read = await this.conn.query(
            "SELECT * FROM thread_read WHERE user_id=$1 AND thread_id=$2", [user.id, this.id]
            );
        if(read.length === 0 ){
            read = await this.conn.query(
                "INSERT INTO thread_read(thread_id, user_id, is_read) VALUES($1,$2,false) RETURNING *",
                [this.id, user.id]
            );
        }
        return read[0].is_read;
    }
}
ThreadModel.tableName = "threads";
module.exports = { ThreadModel };
