const expect = require("chai").expect;
const auth = require("solid-auth-cli");
const rdf = require("rdflib");

const User = require("../index");
const config = require("./userConfig.json");

const user = new User(config.webId);

describe("Emails", function () {
  before("Setting up auth...", async function () {
    this.timeout(10000);
    const credentials = await auth.getCredentials();
    await auth.login(credentials);
    user.fetcher = new rdf.Fetcher(user.graph, { fetch: auth.fetch });
    await user.setEmails(config.emails);
  });

  describe("getEmails()", function () {
    it("should fetch the right emails from the profile", async function () {
      const emails = await user.getEmails();
      expect(emails).to.deep.equal(config.emails);
    });
  });

  describe("setEmails()", function () {
    this.timeout(4000);
    it("should modify the specified email field", async function () {
      const newEmail = "lalasepp1@gmail.com";
      await user.setEmails(newEmail);

      let emails = await user.getEmails();
      expect(emails).to.deep.equal([newEmail]);
    });

    it("should modify multiple email fields", async function () {
      const newEmails = ["lalasepp123@gmail.com", "lalasepp1@gmail.com"];
      await user.setEmails(newEmails);

      let emails = await user.getEmails();
      expect(emails).to.deep.equal(newEmails);
    });

    it("shouldn't modify the email field without specifying an email to set", async function () {
      await user.setEmails();
      const emails = await user.getEmails();
      expect(emails).to.deep.equal([]);
    });
  });
});
