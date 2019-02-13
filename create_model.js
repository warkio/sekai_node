const fs = require('fs');
const path = require('path');
const startCase = require('lodash.startcase');
const snakeCase = require('lodash.snakecase');
const modelName = startCase(process.argv[2]).replace(" ", "");
const tableName = process.argv[3];

const modelPath = path.join(__dirname, "models", snakeCase(process.argv[2])+".js");

const template = `const { BaseModel } = require('./base_model');

class ${modelName} extends BaseModel {
    constructor(){
        super();
        this.tableName = ${modelName}.tableName;
    }
}
${modelName}.tableName = "${tableName}";
module.exports = { ${modelName} };
`

fs.writeFileSync(modelPath, template);