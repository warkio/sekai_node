const { BaseModel } = require('./base_model');

class PostModel extends BaseModel {
    constructor(){
        super();
        this.tableName = PostModel.tableName;
    }
}
PostModel.tableName = "posts";
module.exports = { PostModel };
