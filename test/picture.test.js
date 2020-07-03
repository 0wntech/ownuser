const expect = require("chai").expect;
const auth = require("solid-auth-cli");
const rdf = require("rdflib");

const User = require("../index");
const config = require("./userConfig.json");

const user = new User(config.webId);

describe("Picture", function() {
  
  before("Setting up auth...", async function() {
    const credentials = await auth.getCredentials();
    await auth.login(credentials);
    user.fetcher = new rdf.Fetcher(user.graph, { fetch: auth.fetch });
  });
  
  afterEach("Resetting profile picture...", async function() {
    await user.setPicture(config.picture);
  });

  describe("getPicture()", function() {
    it("should fetch the right picture from the profile", async function() {
      const picture = await user.getPicture();
      expect(picture).to.equal(config.picture);
    });
  });

  describe("setPicture()", function() {
    this.timeout(4000);
    it("should modify the picture field", async function() {
      const newPicture = "https://owntech.de/favicon.ico";

      await user.setPicture(newPicture);
      let picture = await user.getPicture();
      expect(picture).to.equal(newPicture);
    });

    it("shouldn't modify the picture field", async function() {
      await user.setPicture();
      let picture = await user.getPicture();
      expect(picture).to.equal(config.picture);
    });
  });
});
