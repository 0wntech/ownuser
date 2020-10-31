const expect = require("chai").expect;
const auth = require("solid-auth-cli");
const rdf = require("rdflib");

const User = require("../index");
const config = require("./userConfig.json");

const user = new User(config.webId);

describe("Contacts", function() {
  this.timeout(4000);
  user.fetcher = new rdf.Fetcher(user.graph, { fetch: auth.fetch });

  before("Setting up auth...", async function() {
    const credentials = await auth.getCredentials();
    await auth.login(credentials);
    user.fetcher = new rdf.Fetcher(user.graph, { fetch: auth.fetch });
  });

  afterEach("Resetting contacts...", async function() {
    await user.setContacts(config.contacts);
  });

  describe("getContacts()", function() {
    it("should fetch the right contacts from the profile", async function() {
      const contacts = await user.getContacts();
      expect(contacts).to.deep.equal(config.contacts);
    });
  });
  
  describe("getContactRecommendations()", function() {
    it("should fetch the contact recommendations from the profile", async function() {
      const contactRecommendations = await user.getContactRecommendations();
      expect(contactRecommendations).to.deep.equal(config.contactRecommendations);
    });
  });

  describe("setContacts()", function() {
    it("should modify the contact field", async function() {
      const newContact = "https://ludwigschubi.solid.community/profile/card#me";

      await user.setContacts(newContact);
      let contacts = await user.getContacts();
      expect(contacts).to.deep.equal([newContact]);
    });

    it("shouldn't modify the contact field and throw an error", async function() {
      expect(() => user.setContacts()).to.throw(Error);
    });
  });
});
