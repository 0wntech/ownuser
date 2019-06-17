const rdf = require("rdflib");
const ns = require("solid-namespace")(rdf);

function User(webId) {
  this.webId = webId;

  this.getName = function(graph) {
    if (graph) {
      const name = graph.any(rdf.sym(webId), ns.foaf("name"));
      const nameValue = name ? name.value : undefined;
      return nameValue;
    } else {
      const graph = rdf.graph();
      const fetcher = new rdf.Fetcher(graph);
      return fetcher.load(this.webId).then(() => {
        const name = graph.any(rdf.sym(webId), ns.foaf("name"));
        const nameValue = name ? name.value : undefined;
        return nameValue;
      });
    }
  };

  this.getEmails = function(graph) {
    if (graph) {
      const emails = graph
        .each(rdf.sym(webId), ns.vcard("hasEmail"))
        .map(emailBlankId => {
          return [
            graph.any(rdf.sym(emailBlankId), ns.vcard("value")).value,
            emailBlankId.value
          ];
        });
      return emails;
    } else {
      const graph = rdf.graph();
      const fetcher = new rdf.Fetcher(graph);
      return fetcher.load(this.webId).then(() => {
        const emails = graph
          .each(rdf.sym(webId), ns.vcard("hasEmail"))
          .map(emailBlankId => {
            return [
              graph.any(rdf.sym(emailBlankId), ns.vcard("value")).value,
              emailBlankId.value
            ];
          });
        return emails;
      });
    }
  };

  this.getJob = function(graph) {
    if (graph) {
      const job = graph.any(rdf.sym(webId), ns.vcard("role"));
      const jobValue = job ? job.value : "";
      return jobValue;
    } else {
      const graph = rdf.graph();
      const fetcher = new rdf.Fetcher(graph);
      return fetcher.load(this.webId).then(() => {
        const job = graph.any(rdf.sym(webId), ns.vcard("role"));
        const jobValue = job ? job.value : "";
        return jobValue;
      });
    }
  };

  this.getPicture = function(graph) {
    if (graph) {
      const picture = graph.any(rdf.sym(webId), ns.vcard("hasPhoto"));
      const pictureValue = picture ? picture.value : "";
      return pictureValue;
    } else {
      const graph = rdf.graph();
      const fetcher = new rdf.Fetcher(graph);
      return fetcher.load(this.webId).then(() => {
        const picture = graph.any(rdf.sym(webId), ns.vcard("hasPhoto"));
        const pictureValue = picture ? picture.value : "";
        return pictureValue;
      });
    }
  };

  this.getBio = function(graph) {
    if (graph) {
      const bio = graph.any(rdf.sym(webId), ns.vcard("note"));
      const bioValue = bio ? bio.value : undefined;
      return bioValue;
    } else {
      const graph = rdf.graph();
      const fetcher = new rdf.Fetcher(graph);
      return fetcher.load(this.webId).then(() => {
        const bio = graph.any(rdf.sym(webId), ns.vcard("note"));
        const bioValue = bio ? bio.value : undefined;
        return bioValue;
      });
    }
  };

  this.getTelephones = function(graph) {
    if (graph) {
      const telephones = graph
        .each(rdf.sym(webId), ns.vcard("hasTelephone"))
        .map(telephoneBlankId => {
          return [
            graph.any(rdf.sym(telephoneBlankId), ns.vcard("value")).value,
            telephoneBlankId.value
          ];
        });
      return telephones;
    } else {
      const graph = rdf.graph();
      const fetcher = new rdf.Fetcher(graph);
      return fetcher.load(this.webId).then(() => {
        const telephones = graph
        .each(rdf.sym(webId), ns.vcard("hasTelephone"))
        .map(telephoneBlankId => {
          return [
            graph.any(rdf.sym(telephoneBlankId), ns.vcard("value")).value,
            telephoneBlankId.value
          ];
        });
        return telephones;
      });
    }
  };

  

  this.getProfile = function() {
    const store = rdf.graph();
    const fetcher = new rdf.Fetcher(store);

    return fetcher.load(this.webId).then(() => {
      const nameValue = this.getName(store);
      const emails = this.getEmails(store);
      const jobValue = this.getJob(store);
      const pictureValue = this.getPicture(store);
      const bioValue = this.getBio(store);
      const telephones = this.getTelephones(store);

      return {
        webId: webId,
        name: nameValue,
        picture: pictureValue,
        emails: emails,
        job: jobValue,
        bio: bioValue,
        telephones: telephones
      };
    });
  };
}

module.exports = User;
