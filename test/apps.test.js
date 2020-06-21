const expect = require("chai").expect;
const auth = require("solid-auth-cli");
const rdf = require("rdflib");

const User = require("../index");
const config = require("./userConfig.json");

const user = new User(config.webId);

describe("Apps", function() {
  user.fetcher = new rdf.Fetcher(user.graph, { fetch: auth.fetch });

  before("Setting up auth...", async function() {
    this.timeout(5000);
    const credentials = await auth.getCredentials();
    await auth.login(credentials);
    user.fetcher = new rdf.Fetcher(user.graph, { fetch: auth.fetch });
    await user.setApps(config.trustedApps);
  });

  describe("getApps()", function() {
    it("should fetch the trusted apps from the profile", async function() {
      const apps = await user.getApps();
      console.log(apps)
      expect(apps).to.deep.equal(config.trustedApps);
    });
  });

  describe("setApps()", function() {
    it("should modify the trusted apps field", async function() {
      const trustedApps = [];

      await user.setApps(trustedApps);
      const apps = await user.getApps();
      expect(apps).to.deep.equal(trustedApps);
    });
  });
});