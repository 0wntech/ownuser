const rdf = require("rdflib");
const ns = require("solid-namespace")(rdf);

module.exports.getContacts = async function(store) {
  const webId = this.webId;

  if (!store) {
    const fetcher = this.fetcher;
    store = this.graph;
    await fetcher.load(webId);
  }

  const ownNode = rdf.sym(webId);
  const contacts = store.each(ownNode, ns.foaf("knows")).map(contact => {
    return contact.value;
  });
  return contacts;
};

module.exports.setContacts = function(contacts) {
  if (!contacts) {
    throw new Error("Please specify the contacts you want to set.");
  } else if (!Array.isArray(contacts)) {
    contacts = [contacts];
  }
  const webId = this.webId;
  const updater = this.updater;
  const store = this.graph;
  return this.getContacts().then(prevContacts => {
    const toDelete = prevContacts
      .filter(contact => {
        return !contacts.includes(contact);
      })
      .map(contact => {
        const ownNode = rdf.sym(webId);
        const contactNode = rdf.sym(contact);
        return rdf.st(ownNode, ns.foaf("knows"), contactNode, ownNode.doc());
      });
    const toAdd = contacts
      .filter(contact => {
        return !prevContacts.includes(contact);
      })
      .map(contact => {
        const ownNode = rdf.sym(webId);
        const contactNode = rdf.sym(contact);
        return rdf.st(ownNode, ns.foaf("knows"), contactNode, ownNode.doc());
      });

    // console.log("[DEBUG] -- Adding ", toAdd);
    // console.log("[DEBUG] -- Deleting ", toDelete);

    return updater.update(toDelete, toAdd);
  });
};

module.exports.addContact = function(contactWebId) {
  const webId = this.webId;
  const updater = this.updater;

  const del = [];
  const ins = rdf.st(
    rdf.sym(webId),
    ns.foaf("knows"),
    rdf.sym(contactWebId),
    rdf.sym(webId).doc()
  );
  return updater.update(del, ins);
};

module.exports.deleteContact = function(contactWebId) {
  const webId = this.webId;
  const updater = this.updater;

  const del = rdf.st(
    rdf.sym(webId),
    ns.foaf("knows"),
    rdf.sym(contactWebId),
    rdf.sym(webId).doc()
  );
  const ins = [];
  return updater.update(del, ins);
};
