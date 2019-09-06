const rdf = require("rdflib");
const ns = require("solid-namespace")(rdf);

module.exports.getEmails = function(graph) {
  if (graph) {
    const emails = graph
      .each(rdf.sym(this.webId), ns.vcard("hasEmail"))
      .map(emailBlankId => {
        return [
          graph.any(rdf.sym(emailBlankId), ns.vcard("value")).value,
          emailBlankId.value
        ];
      });
    return emails;
  } else {
    const fetcher = this.fetcher;
    return fetcher.load(this.webId).then(() => {
      const emails = this.graph
        .each(rdf.sym(this.webId), ns.vcard("hasEmail"))
        .map(emailBlankId => {
          return this.graph
            .any(rdf.sym(emailBlankId), ns.vcard("value"))
            .value.replace("mailto:", "");
        });
      return emails;
    });
  }
};

module.exports.deleteEmail = function(email) {
  if (email) {
    email = rdf.sym("mailto:" + email);
    return this.getEmails().then(() => {
      const emailBlankId = this.graph.any(null, ns.vcard("value"), email);

      const del = [
        rdf.st(
          rdf.sym(this.webId),
          ns.vcard("hasEmail"),
          emailBlankId,
          rdf.sym(this.webId).doc()
        ),
        rdf.st(
          rdf.sym(emailBlankId),
          ns.vcard("value"),
          email,
          rdf.sym(this.webId).doc()
        )
      ];

      return this.updater.update(del, []).catch(err => {
        console.error(err);
      });
    });
  } else {
    console.error("Please specify an email to delete.");
  }
};

module.exports.addEmail = function(email) {
  if (email) {
    email = rdf.sym("mailto:" + email);
    const bN = rdf.sym(
      rdf.sym(this.webId).doc().uri + "#" + "id" + ("" + new Date().getTime())
    );
    const ins = [
      rdf.st(
        rdf.sym(this.webId),
        ns.vcard("hasEmail"),
        bN,
        rdf.sym(this.webId).doc()
      ),
      rdf.st(rdf.sym(bN), ns.vcard("value"), email, rdf.sym(this.webId).doc())
    ];

    return this.updater.update([], ins).catch(err => {
      console.error(err);
    });
  } else {
    console.error("Please specify the email you would like to add.");
  }
};

module.exports.setEmail = function(oldEmail, newEmail) {
  if (oldEmail && newEmail) {
    return Promise.all([this.deleteEmail(oldEmail), this.addEmail(newEmail)]);
  }
};
