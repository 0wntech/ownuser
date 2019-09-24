const expect = require("chai").expect;
const should = require("chai").should();
const auth = require("solid-auth-cli");
const rdf = require("rdflib");

const User = require("../index");
const config = require("./userConfig.json");
const originalProfile = {
  webId: config.webId,
  name: config.name,
  bio: config.bio,
  job: config.job,
  picture: config.picture,
  emails: config.emails,
  telephones: config.telephones
};

const user = new User(config.webId);

describe("Profile", function() {
  before("Setting up auth...", function() {
    this.timeout(12000);
    return auth.getCredentials().then(credentials => {
      return auth.login(credentials).then(() => {
        user.fetcher = new rdf.Fetcher(user.graph, { fetch: auth.fetch });
        return user.setProfile(originalProfile);
      });
    });
  });

  after("Cleaning up...", function() {
    this.timeout(12000);
    return user.setProfile(originalProfile);
  });

  describe("getProfile()", function() {
    it("should fetch the right profile", function() {
      return user.getProfile().then(profile => {
        profile.should.deep.equal(originalProfile);
      });
    });
  });

  describe("setProfile()", function() {
    this.timeout(5000);
    it("should modify the profile", function() {
      const newProfile = {
        emails: ["blabla@gmail.com"]
      };
      return user.setProfile(newProfile).then(() => {
        return user.getProfile().then(profile => {
          profile.emails.should.deep.equal(newProfile.emails);
        });
      });
    });
  });
});
