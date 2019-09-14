const expect = require("chai").expect;
const auth = require("solid-auth-cli");
const rdf = require("rdflib");

const User = require("../index");
const config = require("./userConfig.json");

const user = new User(config.webId);

describe("Job", function() {
  user.fetcher = new rdf.Fetcher(user.graph, { fetch: auth.fetch });

  before("Setting up auth...", async function() {
    const credentials = await auth.getCredentials();
    await auth.login(credentials);
    user.fetcher = new rdf.Fetcher(user.graph, { fetch: auth.fetch });
  });

  afterEach("Resetting job...", async function() {
    await user.setJob(config.job);
  });

  describe("getJob()", function() {
    it("should fetch the right job from the profile", async function() {
      const job = await user.getJob();
      expect(job).to.equal(config.job);
    });
  });

  describe("setJob()", function() {
    it("should modify the job field", async function() {
      const newJob = "Blabla";
      
      await user.setJob(newJob);
      let job = await user.getJob();
      expect(job).to.equal(newJob);
    });

    it("shouldn't modify the job field", async function() {
      await user.setJob();
      let job = await user.getJob();
      expect(job).to.equal(config.job);
    });
  });
});
