const rdf = require("rdflib");
const ns = require("solid-namespace")(rdf);

module.exports.getTelephones = function (graph) {
  if (graph) {
    const telephones = graph
      .each(rdf.sym(this.webId), ns.vcard("hasTelephone"))
      .map((telephoneBlankId) => {
        return graph
          .any(telephoneBlankId, ns.vcard("value"))
          .value.replace("tel:", "");
      });
    return telephones;
  } else {
    const fetcher = this.fetcher;
    return fetcher.load(this.webId).then(() => {
      const telephones = this.graph
        .each(rdf.sym(this.webId), ns.vcard("hasTelephone"))
        .map((telephoneBlankId) => {
          return this.graph
            .any(telephoneBlankId, ns.vcard("value"))
            .value.replace("tel:", "");
        });
      return telephones;
    });
  }
};

module.exports.setTelephones = function (
  telephones,
  options = { oldTelephones: null, noUpdate: null }
) {
  if (!telephones) telephones = [];
  if (!Array.isArray(telephones)) {
    telephones = [telephones];
  }
  return new Promise(async (resolve, reject) => {
    const oldTelephones = !options.oldTelephones
      ? await this.getTelephones()
      : options.oldTelephones;
    const del = [];
    const ins = [];

    console.log(oldTelephones, telephones);

    toDelete = oldTelephones.filter(function (telephone) {
      return !telephones.includes(telephone);
    });
    // console.log("DEBUG --- DELETE ", toDelete);
    toDelete.forEach((telephone) => {
      telephone = rdf.sym("tel:" + telephone);
      const telephoneBlankId = this.graph.any(
        null,
        ns.vcard("value"),
        telephone
      );

      del.push(
        rdf.st(
          rdf.sym(this.webId),
          ns.vcard("hasTelephone"),
          telephoneBlankId,
          rdf.sym(this.webId).doc()
        )
      );
      del.push(
        rdf.st(
          telephoneBlankId,
          ns.vcard("value"),
          telephone,
          rdf.sym(this.webId).doc()
        )
      );
    });

    toAdd = telephones.filter(function (telephone) {
      return !oldTelephones.includes(telephone);
    });
    toAdd.forEach((telephone) => {
      telephone = rdf.sym("tel:" + telephone);
      const bN = new rdf.BlankNode();
      ins.push(
        rdf.st(
          rdf.sym(this.webId),
          ns.vcard("hasTelephone"),
          bN,
          rdf.sym(this.webId).doc()
        )
      );
      ins.push(
        rdf.st(bN, ns.vcard("value"), telephone, rdf.sym(this.webId).doc())
      );
    });

    return options.noUpdate
      ? resolve({ deleteStatements: del, insertStatements: ins })
      : this.updater
          .update(del, ins)
          .then(() => {
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
  });
};
