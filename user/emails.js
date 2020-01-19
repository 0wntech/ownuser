const rdf = require("rdflib");
const ns = require("solid-namespace")(rdf);

module.exports.getEmails = function(graph) {
  if (graph) {
    const emails = graph
      .each(rdf.sym(this.webId), ns.vcard("hasEmail"))
      .map(emailBlankId => {
        return graph
          .any(emailBlankId, ns.vcard("value"))
          .value.replace("mailto:", "");
      });
    return emails;
  } else {
    const fetcher = this.fetcher;
    return fetcher.load(this.webId).then(() => {
      const emails = this.graph
        .each(rdf.sym(this.webId), ns.vcard("hasEmail"))
        .map(emailBlankId => {
          return this.graph
            .any(emailBlankId, ns.vcard("value"))
            .value.replace("mailto:", "");
        });
      return emails;
    });
  }
};

module.exports.setEmails = function(
  emails,
  options = { oldEmails: null, noUpdate: null }
) {
  if (emails) {
    if (!Array.isArray(emails)) {
      emails = [emails];
    }
    return new Promise(async (resolve, reject) => {
      const oldEmails = !options.oldEmails
        ? await this.getEmails()
        : options.oldEmails;
      const del = [];
      const ins = [];

      const toDelete = oldEmails.filter(function(email) {
        return !emails.includes(email);
      });
      // console.log("DEBUG --- DELETE ", toDelete);
      toDelete.forEach(email => {
        email = rdf.sym("mailto:" + email);
        const emailBlankId = this.graph.any(null, ns.vcard("value"), email);
        del.push(
          rdf.st(
            rdf.sym(this.webId),
            ns.vcard("hasEmail"),
            emailBlankId,
            rdf.sym(this.webId).doc()
          )
        );
        del.push(
          rdf.st(
            emailBlankId,
            ns.vcard("value"),
            email,
            rdf.sym(this.webId).doc()
          )
        );
      });

      const toAdd = emails.filter(function(email) {
        return !oldEmails.includes(email);
      });
      // console.log("DEBUG --- ADD ", toAdd);
      toAdd.forEach(email => {
        email = rdf.sym("mailto:" + email);
        const bN = new rdf.BlankNode()
        ins.push(
          rdf.st(
            rdf.sym(this.webId),
            ns.vcard("hasEmail"),
            bN,
            rdf.sym(this.webId).doc()
          )
        );
        ins.push(
          rdf.st(
            bN,
            ns.vcard("value"),
            email,
            rdf.sym(this.webId).doc()
          )
        );
      });
      return options.noUpdate
        ? resolve({ deleteStatements: del, insertStatements: ins })
        : this.updater
            .update(del, ins)
            .then(() => {
              resolve();
            })
            .catch(err => {
              reject(err);
            });
    });
  } else {
    throw new Error("No emails were specified");
  }
};
