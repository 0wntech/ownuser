const rdf = require("rdflib");
const ns = require("solid-namespace")(rdf);

module.exports.getTelephones = function(graph) {
  if (graph) {
    const telephones = graph
      .each(rdf.sym(this.webId), ns.vcard("hasTelephone"))
      .map(telephoneBlankId => {
        return [
          graph.any(rdf.sym(telephoneBlankId), ns.vcard("value")).value,
          telephoneBlankId.value
        ];
      });
    return telephones;
  } else {
    const fetcher = this.fetcher;
    return fetcher.load(this.webId).then(() => {
      const telephones = this.graph
        .each(rdf.sym(this.webId), ns.vcard("hasTelephone"))
        .map(telephoneBlankId => {
          return this.graph
            .any(rdf.sym(telephoneBlankId), ns.vcard("value"))
            .value.replace("tel:", "");
        });
      return telephones;
    });
  }
};

module.exports.deleteTelephone = function(telephone) {
  if (telephone) {
    telephone = rdf.sym("tel:" + telephone);
    return this.getTelephones().then(() => {
      const telephoneBlankId = this.graph.any(
        null,
        ns.vcard("value"),
        telephone
      );

      const del = [
        rdf.st(
          rdf.sym(this.webId),
          ns.vcard("hasTelephone"),
          telephoneBlankId,
          rdf.sym(this.webId).doc()
        ),
        rdf.st(
          rdf.sym(telephoneBlankId),
          ns.vcard("value"),
          telephone,
          rdf.sym(this.webId).doc()
        )
      ];

      return this.updater.update(del, []).catch(err => {
        console.error(err);
      });
    });
  } else {
    console.error("Please specify a Telephone number to delete.");
  }
};

module.exports.addTelephone = function(telephone) {
  if (telephone) {
    telephone = rdf.sym("tel:" + telephone);
    const bN = rdf.sym(
      rdf.sym(this.webId).doc().uri + "#" + "id" + ("" + new Date().getTime())
    );
    const ins = [
      rdf.st(
        rdf.sym(this.webId),
        ns.vcard("hasTelephone"),
        bN,
        rdf.sym(this.webId).doc()
      ),
      rdf.st(
        rdf.sym(bN),
        ns.vcard("value"),
        telephone,
        rdf.sym(this.webId).doc()
      )
    ];

    return this.updater.update([], ins).catch(err => {
      console.error(err);
    });
  } else {
    console.error(
      "Please specify the telephone numbers you would like to add."
    );
  }
};

module.exports.setTelephone = function(oldTelephone, newTelephone) {
  if (oldTelephone && newTelephone) {
    return Promise.all([
      this.deleteTelephone(oldTelephone),
      this.addTelephone(newTelephone)
    ]);
  }
};
