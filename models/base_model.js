const db = require('../lib/db');
const snakeCase = require('lodash.snakecase');
const camelCase = require('lodash.camelcase');

class BaseModel {
    constructor(conn){
        this.id = null;
        this.tableName = BaseModel.tableName;
        this.hasTimestamp = true;
        if(conn === undefined){
            this.conn = db;
        }
        else{
            this.conn = conn;
        }
        
    }

    /**
     * Helper function to delete element from array, matching camelCase
     * @param {Array} arr 
     * @param {*} element 
     */
    _deleteFromArray(arr, element){
        const index = arr.indexOf(element);
        if( index !== -1) {
            arr.splice(index, 1);
        }
    }

    /**
     * Get all columns of a determined PostgreSQL table and
     * makes them attributes for the class
     */
    async _getColumns (){
        let columns = (await this.conn.query("select column_name from information_schema.columns where table_name=$1", [this.tableName]));
        for(let i=0;i<columns.length;i++) {
            Object.defineProperty(this, camelCase(columns[i].column_name),{value:null, writable:true,enumerable:true,configurable:true});
        }
    }

    /**
     * Get the columns from the database and add them to
     * the object
     */
    async build() {
        await this._getColumns();
    }

    /**
     * Saves the object into database,
     * it either performs an update or an insert,
     * depending on the value of the id attribute
     */
    async save() {
        let query = "";
        let columns = Object.keys(this);
        this._deleteFromArray(columns, "hasTimestamp");
        this._deleteFromArray(columns, "tableName");
        this._deleteFromArray(columns, "id");
        this._deleteFromArray(columns, "conn");
        // Doesn't have timestamp columns
        if(!this.hasTimestamp) {
            this._deleteFromArray(columns, "createdAt");
            this._deleteFromArray(columns, "updatedAt");
        }
        let params = [ this.tableName ];
        if( this.id === null ) {

            if (this.hasTimestamp) {
                this.createdAt = new Date();
                this.updatedAt = new Date();
            }

            // Is insert
            query = "INSERT INTO $1~(";
            query += columns.map(x => snakeCase(x)).join(",") + ") VALUES(";
            for( let i=0; i<columns.length; i++) {
                params.push(this[columns[i]]);
                query += "$"+params.length;
                if(i !== columns.length - 1) {
                    query += ",";
                }
            }
            query += ") RETURNING id";

        }
        else {
            this._deleteFromArray(columns, "createdAt");
            if (this.hasTimestamp) {
                this.updatedAt = new Date();
            }
            // Is update
            query = "UPDATE $1~ SET ";
            query += columns.map(x =>{
                params.push(this[x]);
                return snakeCase(x)+"=$"+params.length;
            }).join(",");
            params.push(this.id);
            query += " WHERE id=$"+params.length;

        }
        const result = await this.conn.query(query, params);
        if(this.id === null) {
            this.id = result[0].id;
        }
    }

    /**
     * Deletes an object from the database
     */
    async delete() {
        if (this.id === null) {
            return;
        }
        await this.conn.query("DELETE FROM $1~ WHERE id=$2", [this.tableName, this.id]);
        this.id = null;
    }

    /**
     * Creates a new object, just in case you
     * don't want to go through the new -> build
     * process
     * @param {Connection} conn Optional database connection 
     */
    static async create(conn) {
        let obj = new this(conn);
        await obj.build();
        return obj;
    }
    /**
     * Class method to create a class instance from object
     * @param {Parameters} obj 
     */
    static async fromObject(obj) {
        let o = new this();
        await o.build();
        for(let key in obj) {
            if(o.hasOwnProperty(key)){
                o[key] = obj[key];
            }
        }
        return o;
    }

    /**
     * Creates an object from a search. If no one is found,
     * returns null instead
     * @param {string} column 
     * @param {*} value 
     * @returns either null or an instance of the class
     */
    static async find(column, value, conn) {
        if(conn !== undefined) {
            this.conn = conn;
        }
        const res = await this.conn.query("SELECT * FROM  $1~ WHERE $2~=$3",[this.tableName, column, value]);
        if(res.length === 0) {
            return null;
        }
        return await this.fromObject(res[0]);
    }

    /**
     * Returns all occurrences of a determined search
     * @param {Boolean} asJson specifies if the return value should be json or a class object
     * @param {string} column 
     * @param {*} value
     * @param {Integer} limit
     * @param {Integer} offset
     * @returns ?Array<Object>
     */
    static async findAll(asJson, column, value, limit, offset, conn) {
        if(conn !== undefined) {
            this.conn = conn;
        }
        const result = [];
        let query = "SELECT * FROM  $1~ WHERE $2~=$3";
        if(column === undefined && value === undefined) {
            column = "true";
            value = "true";
            query = "SELECT * FROM $1~ WHERE $2=$3";
        }
        if( limit !== undefined && limit !== null) {
            params.push(limit);
            query += " LIMIT $" + params.length;
        }
        if( offset !== undefined && offset !== null ) {
            params.push(offset);
            query += " OFFSET $"+params.length;
        }

        const res = await this.conn.query(query,[this.tableName, column, value]);
        for(let i=0;i<res.length;i++) {
            if(asJson){
                let tempObj = {};
                for(let key in res[i]) {
                    tempObj[camelCase(key)] = res[i][key];
                }
                result.push(tempObj);
            }
            else{
                result.push(await this.fromObject(res[i]));
            }
            
        }
        return result;
    }
}

BaseModel.tableName = null;
module.exports = { BaseModel };