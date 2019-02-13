const { BaseModel } = require('./base_model');
const { PostModel } = require('./post_model');
const { ThreadModel } = require('./thread_model');
const slugify = require('../lib/slugify');

class SectionModel extends BaseModel {
    constructor(conn){
        super(conn);
        this.tableName = SectionModel.tableName;
    }

    async save() {
        this.slug = slugify(this.name);
        let query = "";
        let tempIndex = 0;
        let params = [this.tableName, ""];
        if(this.id !== undefined) {
            query = "SELECT id FROM $1~ WHERE slug=$2 AND id!=$3 AND category_id!=$4";
            params.push(this.id);
            params.push(this.categoryId);
        }
        else {
            query = "SELECT id FROM $1~ WHERE slug=$2";
        }
        
        let sameSlug = false;
        do{
            params[1] = tempIndex===0?this.slug : `${tempIndex}-${this.slug}`;
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

    /**
     * @param {Object | null} user User object
     * @returns {Boolean} If the section is read for the current user
     */
    async isRead(user) {
        // Is not a registered user, so 
        if(user === null) {
            return true;
        }
        const query = "select * from (select distinct on (id) * from ( SELECT threads.*, posts.created_at as last_post_date, posts.id as post_id from threads left join posts on posts.thread_id = threads.id order by last_post_date asc) as threads) as res where section_id=$1 order by last_post_date desc";
        const threads = this.conn.query(query, [this.id]);
        
        for( let i=0; i<threads.length; i++) {
            let post = PostModel.find("id", threads[i].post_id);
            let lastPost = post.createdAt;
            let thread = ThreadModel.find(threads[i].id);
            let isRead = new Date(user.createdAt) > new Date(lastPost) ? true : thread.isRead(user);
            if(!$isRead){
                return false;
            }
        }
        return true;
    }
}
SectionModel.tableName = "sections";
module.exports = { SectionModel };
