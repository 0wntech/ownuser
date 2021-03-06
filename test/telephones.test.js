const expect = require("chai").expect;
const should = require("chai").should();
const auth = require("solid-auth-cli");
const rdf = require("rdflib");

const User = require("../index");
const config = require("./userConfig.json");

const user = new User(config.webId);

describe("telephones", function () {
  this.timeout(5000);
  before("Setting up auth...", function () {
    return auth.getCredentials().then((credentials) => {
      return auth.login(credentials).then(() => {
        user.fetcher = new rdf.Fetcher(user.graph, { fetch: auth.fetch });
        return user.setTelephones(config.telephones);
      });
    });
  });

  after("Cleaning up...", function () {
    return user.setTelephones(config.telephones);
  });

  describe("getTelephones()", function () {
    it("should fetch the right telephones from the profile", function () {
      return user.getTelephones().then((telephones) => {
        telephones.should.deep.equal(config.telephones);
      });
    });
  });

  describe("setTelephones()", function () {
    it("should modify the specified Telephone field", function () {
      const newTelephone = "012433494444";
      return user.setTelephones(newTelephone).then(() => {
        return user.getTelephones().then((telephones) => {
          telephones.should.deep.equal([newTelephone]);
        });
      });
    });

    it("should modify the specified Telephone field with multiple numbers", function () {
      const newTelephones = ["012433494443", "012433494444"];
      return user.setTelephones(newTelephones).then(() => {
        return user.getTelephones().then((telephones) => {
          telephones.should.deep.equal(newTelephones);
        });
      });
    });

    it("should delete all phone number fields when not specifying a telephone number to set", function () {
      return user.setTelephones().then(() => {
        return user.getTelephones().then((telephones) => {
          telephones.should.deep.equal([]);
        });
      });
    });
  });
});
