const rdf = require("rdflib");
const ns = require("solid-namespace")(rdf);

module.exports.getApps = function (graph) {
  if (graph) {
    const apps = graph
      .each(rdf.sym(this.webId), ns.acl("trustedApp"))
      .map((app) => {
        return graph.any(app, ns.acl("origin")).value;
      });
    return apps;
  } else {
    const graph = this.graph;
    const fetcher = this.fetcher;
    return fetcher
      .load(this.webId, { force: true, clearPreviousData: true })
      .then(() => {
        const apps = graph
          .each(rdf.sym(this.webId), ns.acl("trustedApp"))
          .map((app) => {
            const appUri = graph.any(app, ns.acl("origin")).value;
            console.log(appUri)
            return appUri
          });
        return apps;
      });
  }
};

module.exports.setApps = async function (newApps) {
  const currentApps = await this.getApps();
  const graph = this.graph;
  const del = [];
  const ins = [];

  if (newApps) {
    const appsToDelete = currentApps.filter((app) => !newApps.includes(app));
    const appsToAdd = newApps.filter((app) => !currentApps.includes(app));

    console.log("Adding permissions for: ", appsToAdd);
    console.log("Removing permissions for: ", appsToDelete);

    appsToDelete.forEach((app) => {
      graph
        .each(null, ns.acl("origin"), rdf.sym(app), rdf.sym(this.webId).doc())
        .forEach((app) => {
          graph.statementsMatching(app).forEach((dels) => {
            del.push(dels);
          });
          del.push(
            rdf.st(
              rdf.sym(this.webId),
              ns.acl("trustedApp"),
              app,
              rdf.sym(this.webId).doc()
            )
          );
        });
    });

    appsToAdd.forEach((app) => {
      const bNode = new rdf.blankNode();
      ins.push(
        rdf.st(
          rdf.sym(this.webId),
          ns.acl("trustedApp"),
          bNode,
          rdf.sym(this.webId).doc()
        )
      );
      ins.push(
        rdf.st(
          bNode,
          ns.acl("mode"),
          ns.acl("Append"),
          rdf.sym(this.webId).doc()
        )
      );
      ins.push(
        rdf.st(bNode, ns.acl("mode"), ns.acl("Read"), rdf.sym(this.webId).doc())
      );
      ins.push(
        rdf.st(
          bNode,
          ns.acl("mode"),
          ns.acl("Write"),
          rdf.sym(this.webId).doc()
        )
      );
      ins.push(
        rdf.st(
          bNode,
          ns.acl("mode"),
          ns.acl("Control"),
          rdf.sym(this.webId).doc()
        )
      );
      ins.push(
        rdf.st(bNode, ns.acl("origin"), rdf.sym(app), rdf.sym(this.webId).doc())
      );
    });
    return this.updater.update(del, ins);
  } else {
    return new Error("Please specify the new set of apps to update to.");
  }
};
