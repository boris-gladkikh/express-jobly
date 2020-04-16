const db = require("../../db");
const request = require("supertest");
const app = require("../../app");
process.env.NODE_ENV = "test";
// const Job = require("../../models/Job");

const company1 = {
  handle: "handle1",
  name: "name1",
  num_employees: 1,
  description: "description1",
  logo_url:
    "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
};


let job1 = {
  title: "test1",
  salary: 32000,
  equity: 0.5,
  company_handle: "handle1",
  date_posted: "2004-05-23"
};

let job2 = {
  title: "test2",
  salary: 25000,
  equity: 0.5,
  company_handle: "handle1",
  date_posted: "2004-05-23"
};

let newJob = {
  title: "test3",
  salary: 25000,
  equity: 0.5,
  company_handle: "handle1",
  date_posted: "2004-05-23"
};



let job1Id, job2Id;


describe("Tests job routes", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM jobs");
    await db.query("DELETE FROM companies");
    await request(app).post(`/companies`).send(company1);
    await request(app).post(`/jobs`).send(job1);
    await request(app).post(`/jobs`).send(job2);
    job1Id = await db.query(`SELECT id
    FROM jobs
    WHERE title = $1`, [job1.title])
    job2Id = await db.query(`SELECT id
    FROM jobs
    WHERE title = $1`, [job2.title])


  });

  test("TEST get all jobs", async function () {
    let response = await request(app).get("/jobs");

    expect(response.statusCode).toBe(200);
    expect(response.body.jobs).toHaveLength(2);
  });

  test("TEST get job by id", async function () {
    let response = await request(app).get(`/jobs/${job1Id.rows[0].id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.job).toEqual({
      title: "test1",
      salary: 32000,
      equity: 0.5,
      company_handle: "handle1",
      date_posted: expect.any(String)
    });

  });

  test("TEST create job", async function () {
    let response = await request(app).post("/jobs")
      .send(newJob);

    expect(response.statusCode).toBe(200);
    expect(response.body.job).toEqual({
      title: "test3",
      id: expect.any(Number),
      salary: 25000,
      equity: 0.5,
      company_handle: "handle1",
      date_posted: expect.any(String)
    });

    let response2 = await request(app).get(`/jobs/${response.body.job.id}`);
    expect(response2.statusCode).toBe(200);
    expect(response2.body.job).toEqual({
      title: "test3",
      salary: 25000,
      equity: 0.5,
      company_handle: "handle1",
      date_posted: expect.any(String)
    });
  });

  test("TEST update job via PATCH", async function () {
    let response = await request(app).patch(`/jobs/${job1Id.rows[0].id}`)
      .send({
        salary: 696969
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.job.salary).toEqual(696969);

  });

  test("TEST delete job", async function () {
    let response = await request(app).delete(`/jobs/${job1Id.rows[0].id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toEqual("Job deleted!");

    let response2 = await request(app).get(`/jobs/${job1Id.rows[0].id}`);

    expect(response2.statusCode).toBe(400);
    expect(response2.body.message).toEqual(`Job of id ${job1Id.rows[0].id} doesn't exist`);

  })

});


describe("PESSIMISTIC testing our routes", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM jobs");
    await db.query("DELETE FROM companies");
    await request(app).post(`/companies`).send(company1);
    await request(app).post(`/jobs`).send(job1);
    await request(app).post(`/jobs`).send(job2);
    job1Id = await db.query(`SELECT id
      FROM jobs
      WHERE title = $1`, [job1.title])
    job2Id = await db.query(`SELECT id
      FROM jobs
      WHERE title = $1`, [job2.title])

  });

  test("PESSIMISTIC test get job by id ", async function () {
    let response = await request(app).get("/jobs/666");

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual(`Job of id 666 doesn't exist`);

    let response2 = await request(app).get("/jobs/beans");

    expect(response2.statusCode).toBe(500);

  });

  test("PESSIMISTIC test create job ", async function () {
    let response = await request(app).post("/jobs")
      .send({
        title: "test3",
        salary: 32000,
        company_handle: "handle1",
        date_posted: "2004-05-23"
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message[0]).toEqual('instance requires property "equity"')

  })

  test("PESSIMISTIC test update job via PATCH", async function () {
    let response = await request(app).patch(`/jobs/${job1Id.rows[0].id}`)
      .send();

    expect(response.statusCode).toBe(400);
    expect(response.body.message[0]).toEqual("instance is not any of [subschema 0],[subschema 1],[subschema 2],[subschema 3],[subschema 4]");

  });

  test("PESSIMISTIC test delete job", async function () {
    let response = await request(app).delete(`/jobs/666`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toEqual("Job not found");

  });

});

afterAll(async function () {
  await db.end();
});