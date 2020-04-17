const db = require("../../db");
const request = require("supertest");
const app = require("../../app");
process.env.NODE_ENV = "test";

let u1 = {
  username: "test1",
  password: "password",
  first_name: "Testley",
  last_name: "Snipes",
  email: "test@gmail.com",
  photo_url: "http://fakephoto.com/photo.jpg",
  is_admin: true
}

let newUser = {
  username: "test2",
  password: "password",
  first_name: "Testa",
  last_name: "Rosa",
  email: "test2@gmail.com",
  photo_url: "http://fakephoto.com/photo2.jpg",
  is_admin: false

}


describe("Tests job routes", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM users");
    await request(app).post(`/users`).send(u1);

  })

  test("TEST create user", async function () {
    let response = await request(app).post("/users")
      .send({
        username: "test2",
        password: "password",
        first_name: "Testa",
        last_name: "Rosa",
        email: "test2@gmail.com",
        photo_url: "http://fakephoto.com/photo2.jpg",
        is_admin: false
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ user: newUser });

    let responseGet = await request(app).get("/users")

    expect(responseGet.body.users).toHaveLength(2);
  });

  test("TEST get all users", async function () {
    let responseGet = await request(app).get("/users")



    expect(responseGet.statusCode).toBe(200);
    expect(responseGet.body.users).toHaveLength(1);
    expect(responseGet.body.users[0]).toEqual({
      username: "test1",
      first_name: "Testley",
      last_name: "Snipes",
      email: "test@gmail.com",
    });

  });

  test("TEST get user by id", async function () {
    let response = await request(app).get("/users/test1");

    expect(response.statusCode).toBe(200);
    expect(response.body.user).toEqual({
      username: "test1",
      first_name: "Testley",
      last_name: "Snipes",
      photo_url: "http://fakephoto.com/photo.jpg",
      email: "test@gmail.com"
    });

  });

  test("TEST PESSIMISTIC get user by id", async function () {
    let response = await request(app).get("/users/test8");

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toEqual("User test8 doesn't exist")
  });

  test("TEST update user", async function () {
    let response = await request(app).patch("/users/test1")
      .send({
        email: "shrek@shrekfans.com"
      })

    expect(response.statusCode).toBe(200);
    expect(response.body.user).toEqual({
      username: "test1",
      password: "password",
      first_name: "Testley",
      last_name: "Snipes",
      email: "shrek@shrekfans.com",
      photo_url: "http://fakephoto.com/photo.jpg",
      is_admin: true
    });

  })

  test("TEST PESSIMISTIC update user", async function () {
    let response1 = await request(app).patch("/users/test1")
      .send()

    expect(response1.statusCode).toBe(400)
    expect(response1.body.message[0]).toEqual("instance is not any of [subschema 0],[subschema 1],[subschema 2],[subschema 3],[subschema 4],[subschema 5],[subschema 6]")

    let response2 = await request(app).patch("/users/test6")
      .send({
        email: "shrek@shrekfans.com"
      });
    expect(response2.statusCode).toBe(400);
    expect(response2.body.message).toEqual("Incorrect body or user data!")

  });

  test("TEST delete user", async function () {
    let response1 = await request(app).delete("/users/test1");

    expect(response1.statusCode).toBe(200);
    expect(response1.body.message).toEqual("User deleted!");

    let response2 = await request(app).get("/users/test1");

    expect(response2.statusCode).toBe(404);
    expect(response2.body.message).toEqual(`User test1 doesn't exist`);

  });

  test("TEST PESSIMISTIC delete user", async function () {
    let response1 = await request(app).delete("/users/test8");

    expect(response1.statusCode).toBe(404);
    expect(response1.body.message).toEqual(`User test8 not found`);

  });

});

afterAll(async function () {
  await db.end();
});