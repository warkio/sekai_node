const { BaseModel } = require('./base_model');

class UserModel extends BaseModel {
    constructor(){
        super();
        this.tableName = UserModel.tableName;
    }

    async save() {

    }

    async getPermissions() {
        
    }
}
UserModel.tableName = "users";
module.exports = { UserModel };
