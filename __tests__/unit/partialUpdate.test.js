const partialUpdate = require("../../helpers/partialUpdate")


describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
    function () {
      let testObj = {
        username: "test1",
        first_name: "Andrei"
      }
      let response = partialUpdate("users", testObj, "username", 1);
      expect(response.query).toEqual(
        `UPDATE users SET username=$1, first_name=$2 WHERE username=$3 RETURNING *`
      )
      expect(response).toEqual({
        query:`UPDATE users SET username=$1, first_name=$2 WHERE username=$3 RETURNING *`,
        values: ["test1","Andrei",1]
      });

    });
});


