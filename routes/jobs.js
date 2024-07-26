"use strict";

const express = require("express");
const { BadRequestError, ExpressError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const router = new express.Router();

/**POST / { job } => { job }
 * job should be {title, salary, equity, companyHandle}
 * Returns { id, title, salary, equity, companyHandle }
 * Authorization Required: login, admin
*/
router.post("/", ensureLoggedIn, ensureAdmin, async function(req,res,next){
    try{
        
        const job = await Job.create(req.body);
        return res.status(201).json({job});
    }catch(e){
        return next(e);
    }
});

/**GET / =>
 * {jobs: [{title, salary, equity, companyHandle}, ...]}
 * 
 * can filter on provided search filters:
 * - title
 * - minSalary
 * - hasEquity (as a boolean)
 * 
 * Authorization required: none
 */

router.get("/", async function(req,res,next){
    try{
        if (JSON.stringify(req.query) == '{}'){
            const jobs = await Job.findAll();
            console.log(`RES.JSON = ${JSON.stringify(res.json({jobs}))}`);
            return res.json({jobs});
        }else{
            Object.keys(req.query).forEach(key => {
                if (key != "title" && key != "minSalary" && key != "hasEquity"){
                    throw new ExpressError(`${key} not recognized as appropriate filter parameter`, 400);
                }
            });
            const {title, minSalary, hasEquity} = req.query;
            
            const jobs = await Job.getFilter(title, minSalary, hasEquity);
            return res.json({jobs});
        }
        
    }catch(e){
        return next(e);
    }
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary , equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: login, Admin
 */

router.patch("/:id", ensureLoggedIn, ensureAdmin, async function(req, res, next){
    try{
        const job = await Job.update(req.params.id, req.body);
        return res.json({job});
    }catch(e){
        return next(e);
    }
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: login, Admin
 */

router.delete("/:id", ensureLoggedIn, ensureAdmin, async function(req, res, next){
    try{
        await Job.remove(req.params.id);
        return res.json({ deleted: req.params.id});
    }catch(e){
        return next(e);
    }
});

module.exports = router;