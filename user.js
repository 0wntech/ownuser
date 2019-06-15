const rdf = require("rdflib");
const ns = require("solid-namespace")(rdf);

function User(webId) {
  this.webId = webId;

  this.getProfile = function() {
    const store = rdf.graph();
    const fetcher = new rdf.Fetcher(store);

    return fetcher.load(this.webId).then(() => {
      const name = store.any(rdf.sym(webId), ns.foaf("name"));
      const nameValue = name ? name.value : undefined;

      const emails = store
        .each(rdf.sym(webId), ns.vcard("hasEmail"))
        .map(emailBlankId => {
          return [
            store.any(rdf.sym(emailBlankId), ns.vcard("value")).value,
            emailBlankId.value
          ];
        });

      const picture = store.any(rdf.sym(webId), ns.vcard("hasPhoto"));
      const pictureValue = picture ? picture.value : "";

      const job = store.any(rdf.sym(webId), ns.vcard("role"));
      const jobValue = job ? job.value : "";

      const bio = store.any(rdf.sym(webId), ns.vcard("note"));
      const bioValue = bio ? bio.value : undefined;

      const telephones = store
        .each(rdf.sym(webId), ns.vcard("hasTelephone"))
        .map(telephoneBlankId => {
          return [
            (store.any(rdf.sym(telephoneBlankId), ns.vcard("value"))).value,
            telephoneBlankId.value
          ];
        });

      return {
        webId: webId,
        name: nameValue,
        picture: pictureValue,
        emails: emails,
        job: jobValue,
        bio: bioValue,
        telephones: telephones,
      };

      const nameNode = store.any(rdf.sym(this.webId), ns(rdf).foaf("name"));
      return nameNode.value;
    });
  };
}

module.exports = User;
