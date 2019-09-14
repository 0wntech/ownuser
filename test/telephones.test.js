const expect = require("chai").expect;
const auth = require("solid-auth-cli");
const rdf = require("rdflib");

const User = require("../index");
const config = require("./userConfig.json");

const user = new User(config.webId);

describe("telephones", function() {
  before("Setting up auth...", async function() {
    this.timeout(10000);
    const credentials = await auth.getCredentials();
    await auth.login(credentials);
    user.fetcher = new rdf.Fetcher(user.graph, { fetch: auth.fetch });

    const telephones = await user.getTelephones();
    await Promise.all(
      telephones.map(async telephone => {
        return user.deleteTelephone(telephone);
      })
    );
    return Promise.all(
      config.telephones.map(async configTelephone => {
        return user.addTelephone(configTelephone);
      })
    );
  });

  afterEach("Resetting telephones...", async function() {
    const telephones = await user.getTelephones();
    await Promise.all(
      telephones.map(async telephone => {
        return user.deleteTelephone(telephone);
      })
    );
    return Promise.all(
      config.telephones.map(async configTelephone => {
        return user.addTelephone(configTelephone);
      })
    );
  });

  describe("getTelephones()", function() {
    it("should fetch the right telephones from the profile", async function() {
      const telephones = await user.getTelephones();
      expect(telephones).to.deep.equal(config.telephones);
    });
  });

  describe("setTelephone()", function() {
    it("should modify the specified Telephone field", async function() {
      const newTelephone = "012433494444";

      await user.setTelephone(config.telephones[0], newTelephone);
      let telephones = await user.getTelephones();
      expect(telephones[0]).to.equal(newTelephone);
    });

    it("shouldn't modify the Telephone field without specifying a telephone number to set", async function() {
      await user.setTelephone();
      let telephones = await user.getTelephones();
      expect(telephones).to.deep.equal(config.telephones);
    });

    it("shouldn't modify the a specified Telephone field without specifying new telephone number", async function() {
      await user.setTelephone(config.telephones[0]);
      let telephones = await user.getTelephones();
      expect(telephones).to.deep.equal(config.telephones);
    });
  });
});
