const jwt = require("jsonwebtoken");
const { sqlForPartialUpdate } = require("./sql");
const { SECRET_KEY } = require("../config");

describe("Generate SQL for Partial Update", function(){
    test("create list of columns to update and their new values", function(){
        const data = {
            firstName: 'Aliya', 
            age: 32}
        const jsToSql = {
            firstName: "first_name",
            age: "age"
        }
        const updates = sqlForPartialUpdate(data, jsToSql);
        expect(updates).toEqual({
            "setCols": `"first_name"=$1, "age"=$2`,
            "values": ['Aliya',32]
        });
    })
})