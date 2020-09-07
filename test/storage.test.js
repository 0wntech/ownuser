const expect = require("chai").expect;
const auth = require("solid-auth-cli");
const rdf = require("rdflib");

const User = require("../index");
const config = require("./userConfig.json");

const user = new User(config.webId);

describe("Storage", function () {
  this.timeout(4000);

  before("Setting up auth...", async function () {
    const credentials = await auth.getCredentials();
    await auth.login(credentials);
    user.fetcher = new rdf.Fetcher(user.graph, { fetch: auth.fetch });
  });

  afterEach("Resetting storage...", async function () {
    await user.setStorage(config.storage);
  });

  describe("getStorage()", function () {
    it("should fetch the right storage from the profile", async function () {
      const storage = await user.getStorage();
      expect(storage).to.equal(config.storage);
    });
  });

  describe("setStorage()", function () {
    it("should modify the storage field", async function () {
      const newStorage = "https://lalasepp1.solid.community/public";

      await user.setStorage(newStorage);
      let storage = await user.getStorage();
      expect(storage).to.equal(newStorage);
    });

    it("should delete the job field", async function () {
      await user.setStorage();
      let storage = await user.getStorage();
      expect(storage).to.equal(undefined);
    });
  });
});
