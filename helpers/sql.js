const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  //get keys from dataToUpdate object
  const keys = Object.keys(dataToUpdate);
  //if no keys are found in the dataToUpdate object then throw an error
  if (keys.length === 0) throw new BadRequestError("No data");
  // converts object notation to SQL format for the "SET" clause in the SQL UPDATE statement
  // ex.) {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );
  // return the list of columns to change delimited by commas and the list of values
  // to change those columns to
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
