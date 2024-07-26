"use strict";

const request = require("supertest");

const db = require("../db");
const { ExpressError } = require("../expressError");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u3Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
    const newJob = {
      title: "j4",
      salary: 9000000,
      equity: "0.005",
      companyHandle: "c1"
    };

    test("pass: Admin creates job", async function(){
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            job: newJob
        });
    });

    test("fail: missing data", async function(){
        const resp = await request(app)
            .post("/jobs")
            .send({
                salary: 500,
                equity: 0.08,
                companyHandle: "c1"
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(500);
    })

    test("fail: non-admin creates job", async function(){
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${u3Token}`);
        expect(resp.statusCode).toEqual(401);
    })
});
/************************************** PATCH /jobs/:id */
describe("PATCH /jobs/", function(){
    
    const updateData = {
        title: "j5",
        salary: 190000,
        equity: 0.005,
        companyHandle: "c1"
    };

    test("works", async function(){
        //Create entry in jobs to update
        await request(app)
            .post("/jobs")
            .send(updateData)
            .set("authorization", `Bearer ${u1Token}`);
        let getID = await db.query(`
            SELECT MIN(id) FROM jobs`);
        const testID = JSON.stringify(getID.rows[0]["min"]);
        const resp = await request(app)
            .patch(`/jobs/${testID}`)
            .send({
                title: "NewJobs"
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.body.job.title).toEqual("NewJobs");
    });

    test("fail: non-admin update request", async function(){
        //Create entry in jobs to update
        await request(app)
            .post("/jobs")
            .send(updateData)
            .set("authorization", `Bearer ${u1Token}`);
        let getID = await db.query(`
            SELECT MIN(id) FROM jobs`);
        const testID = JSON.stringify(getID.rows[0]["min"]);
        const resp = await request(app)
            .patch(`/jobs/${testID}`)
            .send({
                title: "NewJobs"
            })
            .set("authorization", `Bearer ${u3Token}`);
        expect(resp.status).toEqual(401);
    })
});

/************************************** GET /jobs */
describe("GET /jobs", function(){
    test("pass: happy path", async function(){
        const resp = await request(app).get("/jobs");
        expect(resp.body).toEqual({
            jobs: 
                [
                    {
                        title: "j1",
                        salary: 50000,
                        equity: 0,
                        companyHandle: "c1"
                    },
                    {
                        title: "j2",
                        salary: 150000,
                        equity: 0.01,
                        companyHandle: "c2"
                    },
                    {
                        title: "j3",
                        salary: 90000,
                        equity: 0,
                        companyHandle: "c1"
                    }
                ],
            jobs: []
        });
    });
    test("pass: happy path with filters", async function(){
        const resp = await request(app)
            .get("/jobs")
            .query({title: "j1", minSalary: 40000, hasEquity: false});
        expect(resp.body).toEqual({
            jobs: 
                [
                    {
                        title: "j1",
                        salary: 50000,
                        equity: 0,
                        companyHandle: "c1"
                    }
                ],
            jobs: []
        });
    });
});
 
/************************************** DELETE /jobs/:id */
describe("DELETE /jobs/:id", function () {
    const DataToDelete = {
        title: "j5",
        salary: 190000,
        equity: 0.005,
        companyHandle: "c1"
    };
    test("works for admin user", async function () {
        await request(app)
            .post("/jobs")
            .send(DataToDelete)
            .set("authorization", `Bearer ${u1Token}`);
        let getID = await db.query(`
            SELECT MIN(id) FROM jobs`);
        const testID = JSON.stringify(getID.rows[0]["min"]);
        const resp = await request(app)
            .delete(`/jobs/${testID}`)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.status).toEqual(200);
    });
  
    test("unauth for non-admin", async function () {
        const resp = await request(app)
            .delete(`/jobs/c1`)
            .set("authorization", `Bearer ${u3Token}`);
        expect(resp.status).toEqual(401);
    });
  });