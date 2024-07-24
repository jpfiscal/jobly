const { ExpressError } = require("../expressError");

function buildWhereClause(name, minEmployees, maxEmployees){
    let conditions = {};
    if (name){
        const namestring = `'%${String(name)}%'`;
        conditions["name LIKE"] = namestring; 
    }
    if (minEmployees){
        if(isNaN(minEmployees)){
            throw new ExpressError("minEmployees must be a number",400);
        }
        conditions["num_employees >="] = minEmployees;
    }
    if (maxEmployees){
        if(isNaN(maxEmployees)){
            throw new ExpressError("maxEmployees must be a number",400);
        }
        conditions["num_employees <="] = maxEmployees;
    }
    console.log(`CONDITIONS = ${JSON.stringify(conditions)}`);
    let whereClause = 'WHERE ';
    let idx = 0;
    Object.keys(conditions).forEach(key => {  
      if (idx === 0){
        whereClause += `${key} ${conditions[key]} `;
      }else{
        whereClause += ` AND ${key} ${conditions[key]} `;
      }
      idx += 1;
      
    });
    return whereClause;
}

function AdminOrOwnAccount(username, loginUser){
  return (loginUser.username === username || loginUser.isAdmin) ? true : false;
}

module.exports = { buildWhereClause, AdminOrOwnAccount };
