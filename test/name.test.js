const expect = require("chai").expect;
const auth = require("solid-auth-cli");
const rdf = require("rdflib");

const User = require("../index");
const config = require("./userConfig.json");

const user = new User(config.webId);

describe("Name", function() {
  user.fetcher = new rdf.Fetcher(user.graph, { fetch: auth.fetch });

  before("Setting up auth...", async function() {
    const credentials = await auth.getCredentials();
    await auth.login(credentials);
    user.fetcher = new rdf.Fetcher(user.graph, { fetch: auth.fetch });
  });

  afterEach("Resetting name...", async function() {
    await user.setName(config.name);
  });

  describe("getName()", function() {
    it("should fetch the right name from the profile", async function() {
      const name = await user.getName();
      expect(name).to.equal(config.name);
    });
  });

  describe("setName()", function() {
    it("should modify the name field", async function() {
      const newName = "Lalasepp";
      
      await user.setName(newName);
      let name = await user.getName();
      expect(name).to.equal(newName);
    });

    it("shouldn't modify the name field", async function() {
      await user.setName();
      let name = await user.getName();
      expect(name).to.equal(config.name);
    });
  });
});
