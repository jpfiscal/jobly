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

function buildJobWhereClause(title, minSalary, hasEquity){
  let conditions = {};
  if (title){
    const titleString = `'%${String(title)}%'`;
    conditions["title LIKE"] = titleString;
  }
  if (minSalary){
    if(isNaN(minSalary)){
      throw new ExpressError("minSalary must be a number", 400);
    }
    conditions["salary >="] = minSalary;
  }
  if (hasEquity){
    if(hasEquity != 'true' && hasEquity != 'false'){
      throw new ExpressError("hasEquity must be a either true or false", 400);
    }
    if(hasEquity === "true"){
      conditions["equity"] = "> 0";
    }
  }
  let whereClause = 'WHERE ';
  let idx = 0;
  Object.keys(conditions).forEach(key => {
    if (idx === 0){
      whereClause += `${key} ${conditions[key]}`;
    }else{
      whereClause += `AND ${key} ${conditions[key]}`;
    }
    idx += 1;
  });
  return whereClause;
}

function AdminOrOwnAccount(username, loginUser){
  return (loginUser.username === username || loginUser.isAdmin) ? true : false;
}

function OwnAccount(username, loginUser){
  return (loginUser.username === username) ? true : false;
}

function createJobArray(username, jobResultRows){
  let jobArray = [];
  for (i in jobResultRows){
    if (jobResultRows[i]["username"] == username){
      jobArray.push(jobResultRows[i]["jobId"]);
    }
  }
  return jobArray;
}

module.exports = { buildWhereClause, AdminOrOwnAccount , buildJobWhereClause, OwnAccount, createJobArray};
