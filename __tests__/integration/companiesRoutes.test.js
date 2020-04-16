const db = require("../../db");
const request = require("supertest");
const app = require("../../app");
process.env.NODE_ENV = "test";
// const Company = require("../../models/company");


const company1 = {
  handle: "handle1",
  name: "name1",
  num_employees: 1,
  description: "description1",
  logo_url:
    "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
};

const company2 = {
  handle: "handle2",
  name: "name2",
  num_employees: 2,
  description: "description2",
  logo_url:
    "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
};

const company3 = {
  handle: "handle3",
  name: "name3",
  num_employees: 3,
  description: "description3",
  logo_url:
    "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
};

describe("Testing Companies Routes", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM companies");
    await request(app).post(`/companies`).send(company1);
    await request(app).post(`/companies`).send(company2);
  });

  test("POST new company", async function () {
    let response = await request(app).post(`/companies`).send(company3);

    expect(response.statusCode).toBe(200);
    expect(response.body.company).toEqual(company3);
  });

  test("Test ERROR POST new company", async function () {
    let response = await request(app).post(`/companies`).send(company1);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Handle handle1 already taken!");
  });

  test("GET all companies (no params)", async function () {
    let response = await request(app).get(`/companies`);

    expect(response.statusCode).toBe(200);
    expect(response.body.companies).toHaveLength(2);
  });

  test("GET all companies (with search)", async function () {
    let response = await request(app).get(`/companies?search=name1`);

    expect(response.statusCode).toBe(200);
    expect(response.body.companies).toHaveLength(1);
    expect(response.body.companies[0]).toEqual({
      handle: "handle1",
      name: "name1",
    });
  });

  test("GET all companies (with min_employees)", async function () {
    let response = await request(app).get(`/companies?min_employees=1`);

    expect(response.statusCode).toBe(200);
    expect(response.body.companies).toHaveLength(1);
    expect(response.body.companies[0]).toEqual({
      handle: "handle2",
      name: "name2",
    });
  });

  test("GET all companies (with max_employees)", async function () {
    let response = await request(app).get(`/companies?max_employees=2`);

    expect(response.statusCode).toBe(200);
    expect(response.body.companies).toHaveLength(1);
    expect(response.body.companies[0]).toEqual({
      handle: "handle1",
      name: "name1",
    });
  });

  test("Test ERROR GET all (with min_employees > max_employees)", async function () {
    let response = await request(app).get(
      `/companies?min_employees=3&max_employees=2`
    );

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual("parameters are incorrect");
  });

  test("GET all companies (with search, min_employees, max_employees)", async function () {
    let response = await request(app).get(
      `/companies?search=name1&min_employees=0&max_employees=2`
    );

    expect(response.statusCode).toBe(200);
    expect(response.body.companies).toHaveLength(1);
    expect(response.body.companies[0]).toEqual({
      handle: "handle1",
      name: "name1",
    });
  });

  test("GET company by handle", async function () {
    let response = await request(app).get(`/companies/handle1`);

    expect(response.statusCode).toBe(200);
    expect(response.body.company).toEqual({
      handle: "handle1",
      name: "name1",
      num_employees: 1,
      description: "description1",
      jobs: [],
      logo_url:
        "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    });
  });

  test("PATCH update a company", async function () {
    let response = await request(app)
      .patch(`/companies/handle1`)
      .send({ name: "name1CHANGED", num_employees: 4 });

    expect(response.statusCode).toBe(200);
    expect(response.body.company.name).toEqual("name1CHANGED");
    expect(response.body.company.num_employees).toEqual(4);
  });

  test("DELETE a company", async function () {
    let response = await request(app).delete(`/companies/handle1`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toEqual("Company deleted!");

    let responseGet = await request(app).get(`/companies`);

    expect(responseGet.statusCode).toBe(200);
    expect(responseGet.body.companies).toHaveLength(1);
  });

  test("Test ERROR PATCH update a company", async function () {
    let response = await request(app)
      .patch(`/companies/handle5`)
      .send({ name: "name1CHANGED", num_employees: 4 });

    expect(response.statusCode).not.toBe(200);
  });

  test("Test ERROR DELETE a company", async function () {
    let response = await request(app).delete(`/companies/handle5`);

    expect(response.statusCode).toBe(404);
  });
});

afterAll(async function () {
  await db.end();
});
