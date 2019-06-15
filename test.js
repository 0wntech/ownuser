const assert = require("assert");
const User = require("./index");

const user = new User("https://ludwigschubert.solid.community/profile/card#me");

user.getName().then((name) => {
    assert.equal(name, "Ludwig Faust Schubert");
})