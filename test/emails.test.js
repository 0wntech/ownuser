const expect = require("chai").expect;
const auth = require("solid-auth-cli");
const rdf = require("rdflib");

const User = require("../index");
const config = require("./userConfig.json");

const user = new User(config.webId);

describe("Emails", function() {
  before("Setting up auth...", async function() {
    this.timeout(10000);
    const credentials = await auth.getCredentials();
    await auth.login(credentials);
    user.fetcher = new rdf.Fetcher(user.graph, { fetch: auth.fetch });

    const emails = await user.getEmails();
    await Promise.all(
      emails.map(async email => {
        return user.deleteEmail(email);
      })
    );
    return Promise.all(
      config.emails.map(async configEmail => {
        return user.addEmail(configEmail);
      })
    );
  });

  afterEach("Resetting emails...", async function() {
    const emails = await user.getEmails();
    await Promise.all(
      emails.map(async email => {
        return user.deleteEmail(email);
      })
    );
    return Promise.all(
      config.emails.map(async configEmail => {
        return user.addEmail(configEmail);
      })
    );
  });

  describe("getEmails()", function() {
    it("should fetch the right emails from the profile", async function() {
      const emails = await user.getEmails();
      expect(emails).to.deep.equal(config.emails);
    });
  });

  describe("setEmail()", function() {
    it("should modify the specified email field", async function() {
      const newEmail = "lalasepp1@gmail.com";

      await user.setEmail(config.emails[0], newEmail);
      let emails = await user.getEmails();
      expect(emails[0]).to.equal(newEmail);
    });

    it("shouldn't modify the email field without specifying an email to set", async function() {
      await user.setEmail();
      let emails = await user.getEmails();
      expect(emails).to.deep.equal(config.emails);
    });

    it("shouldn't modify the a specified email field without specifying new email", async function() {
      await user.setEmail(config.emails[0]);
      let emails = await user.getEmails();
      expect(emails).to.deep.equal(config.emails);
    });
  });
});
