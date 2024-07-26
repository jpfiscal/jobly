const db = require("../db.js");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */
describe("create", function(){
    const newJob = {
        title: "j4",
        salary: 48000,
        equity: 0.005,
        companyHandle: "c3"
    };

    test("works", async function(){
        let job = await Job.create(newJob);
        expect(job).toEqual({
            title: "j4",
            salary: 48000,
            equity: "0.005",
            companyHandle: "c3" 
        });

        const result = await db.query(
            `SELECT title, salary, equity, company_handle as "companyHandle"
            FROM jobs
            WHERE title = 'j4'`
        );
        expect(result.rows).toEqual([
            {
                title: "j4",
                salary: 48000,
                equity: "0.005",
                companyHandle: "c3"
            }
        ]);
    })

    test("fail: salary = 0", async function(){
        try{
            await Job.create({
                title: "j4",
                salary: 0,
                equity: 0.005,
                companyHandle: "c3"
            });
        }catch(e){
            expect(e instanceof BadRequestError).toBeTruthy();
        }
    });

    test("fail: equity > 1", async function(){
        try{
            await Job.create({
                title: "j4",
                salary: 400000,
                equity: 1.1,
                companyHandle: "c3"
            });
            fail("Did not throw expected db error for equity constraint.");
        }catch(e){
            expect(e.message).toMatch(`new row for relation "jobs" violates check constraint "jobs_equity_check"`);
        }
    });
})
/************************************** update */

describe("update", function (){
    const updateData = {
        title: "j3",
        salary: 190000,
        equity: 0.005,
        companyHandle: "c1"
    };
    
    test("works", async function(){
        let getID = await db.query(`
            SELECT MAX(id) FROM jobs`);
        const testID = JSON.stringify(getID.rows[0]["max"])
        let job = await Job.update(testID, updateData);
        expect(job.salary).toEqual(190000);
    });

    test("fail: not found if no such job", async function(){
        try{
            await Job.update(99999999, updateData);
            throw new Error("Update should have failed with NotFoundError");
        }catch(e){
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
})

/************************************** remove */
describe("delete", function(){
    test("works", async function(){
        let getID = await db.query(`
            SELECT MAX(id) FROM jobs`);
        const testID = JSON.stringify(getID.rows[0]["max"])
        await Job.remove(testID);
        const res = await db.query(
            `SELECT * FROM jobs WHERE id = $1`,
            [testID]
        );
        expect(res.rows.length).toEqual(0);
    })

    test("fail: not found if no such company", async function() {
        try {
            await Job.remove(999999);  // Assuming 999999 is a non-existent ID
            throw new Error("Should throw NotFoundError for non-existent ID.");
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
})