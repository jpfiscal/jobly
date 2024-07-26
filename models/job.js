"use strict";

const db = require("../db");
const { NotFoundError, ExpressError } = require("../expressError");
const { buildJobWhereClause } = require("../helpers/util");
const { sqlForPartialUpdate } = require("../helpers/sql");


class Job {
    /**create a new job */
    static async create({title, salary, equity, companyHandle}) {
        const result = await db.query(
            `INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING title, salary, equity, company_handle AS "companyHandle"`,
        [
            title,
            salary,
            equity,
            companyHandle
        ]);
        const job = result.rows[0];

        return job;
    }
    /**find all jobs in db */
    static async findAll(){
        const result = await db.query(
            `SELECT title, salary, equity, company_handle
            FROM jobs
            ORDER BY title`
        );
        return result.rows;
    }
    /**find a job given filtering conditions:
     * - title
     * - minSalary
     * - hasEquity
     */
    static async getFilter(title, minSalary, hasEquity){
        const whereClause = buildJobWhereClause(title, minSalary, hasEquity);
        const result = await db.query(
            `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle
            FROM jobs
            ${whereClause}
            ORDER BY id`
        );
        return result.rows;
    }

    /**return a specific job by ID */
    static async get(id){
        const result = await db.query(
            `SELECT *
            FROM jobs
            WHERE id = $1`,
            [id]
        );
        const job = result.row[0];
        if (!job) throw new NotFoundError(`No job with ID: ${id}`);
        return job;
    }
    /**update an existing job; identify using job's ID */
    static async update(id, data){
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
              title: "title",
              salary: "salary",
              equity: "equity",
              companyHandle: "company_handle"
            });
        const handleVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle AS "companyHandle"`;
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];
        if (!job){
            throw new NotFoundError(`No job exists with ID: ${id}`);
        }
        return job;
    }

    /**Delete a given job by ID; returns undefined */
    static async remove(id){
        const result = await db.query(
            `DELETE
             FROM jobs
             WHERE id = $1
             RETURNING id`,
            [id]);
        const job = result.rows[0];
  
        if (!job) {
            throw new NotFoundError(`No job with ID: ${id}`);
        }
    }
}

module.exports = Job;