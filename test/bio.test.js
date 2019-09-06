const expect = require("chai").expect;
const auth = require("solid-auth-cli");
const rdf = require("rdflib");

const User = require("../index");
const config = require("./userConfig.json");

const user = new User(config.webId);

describe("Bio", function() {
  user.fetcher = new rdf.Fetcher(user.graph, { fetch: auth.fetch });

  before("Setting up auth...", async function() {
    const credentials = await auth.getCredentials();
    await auth.login(credentials);
    user.fetcher = new rdf.Fetcher(user.graph, { fetch: auth.fetch });
  });

  afterEach("Resetting bio...", async function() {
    await user.setBio(config.bio);
  });

  describe("getBio()", function() {
    it("should fetch the right bio from the profile", async function() {
      const bio = await user.getBio();
      expect(bio).to.equal(config.bio);
    });
  });

  describe("setBio()", function() {
    it("should modify the bio field", async function() {
      const newBio = "Blabla";
      
      await user.setBio(newBio);
      let bio = await user.getBio();
      expect(bio).to.equal(newBio);
    });

    it("shouldn't modify the bio field", async function() {
      await user.setBio();
      let bio = await user.getBio();
      expect(bio).to.equal(config.bio);
    });
  });
});
