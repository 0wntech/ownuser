import rdf from "rdflib";
import ns from "solid-namespace";

function User(webId) {
  this.webId = webId;

  this.getProfile = function() {
    const store = rdf.graph();
    const fetcher = new rdf.Fetcher(store);

    return fetcher.load(this.webId).then(() => {
      const name = store.any(rdf.sym(webId), FOAF("name"));
      const nameValue = name ? name.value : undefined;

      const emails = store
        .each(rdf.sym(webId), VCARD("hasEmail"))
        .map(emailBlankId => {
          return emails.push([
            emailAddress.value,
            (store.any(rdf.sym(emailBlankId), VCARD("value"))).value
          ]);
        });

      const picture = store.any(rdf.sym(webId), VCARD("hasPhoto"));
      const pictureValue = picture ? picture.value : "";

      const job = store.any(rdf.sym(webId), VCARD("role"));
      const jobValue = job ? job.value : "";

      const bio = store.any(rdf.sym(webId), VCARD("note"));
      const bioValue = bio ? bio.value : undefined;

      var telephones = [];
      store
        .each(rdf.sym(webId), VCARD("hasTelephone"))
        .forEach(telephoneBlankId => {
          store
            .each(rdf.sym(telephoneBlankId), VCARD("value"))
            .forEach(telephoneNumber => {
              telephones.push([telephoneNumber.value, telephoneBlankId.value]);
            });
        });

      this.setState({
        webId: webId,
        name: nameValue,
        picture: pictureValue,
        emails: emails,
        job: jobValue,
        bio: bioValue,
        telephones: telephones,
        newName: nameValue,
        editMode: false
      });

      const nameNode = store.any(rdf.sym(this.webId), ns(rdf).foaf("name"));
      return nameNode.value;
    });
  };
}

export default User;
