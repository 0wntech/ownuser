const rdf = require("rdflib");
const ns = require("solid-namespace")(rdf);

module.exports.getApps = function(graph) {
  if (graph) {
    const apps = graph
      .each(rdf.sym(this.webId), ns.acl("trustedApp"))
      .map(app => {
        return graph.any(app, ns.acl("origin")).value;
      });
    return apps;
  } else {
    const graph = this.graph;
    const fetcher = this.fetcher;
    return fetcher.load(this.webId, { force: true, clearPreviousData: true }).then(() => {
      const apps = graph
        .each(rdf.sym(this.webId), ns.acl("trustedApp"))
        .map(app => {
          return graph.any(app, ns.acl("origin")).value;
        });
      return apps;
    });
  }
};

module.exports.setApps = function(newApps) {
  if (newApps) {
    const graph = this.graph;
    return this.fetcher.load(this.webId, { force: true, clearPreviousData: true }).then(() => {
      const del = graph
        .statementsMatching(rdf.sym(this.webId), ns.acl("trustedApp"))
        .concat(graph.statementsMatching(null, ns.acl("origin")))
        .concat(graph.statementsMatching(null, ns.acl("mode")));

      const ins = [];
      newApps.forEach(app => {
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
          rdf.st(
            bNode,
            ns.acl("mode"),
            ns.acl("Read"),
            rdf.sym(this.webId).doc()
          )
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
          rdf.st(
            bNode,
            ns.acl("origin"),
            rdf.lit(app),
            rdf.sym(this.webId).doc()
          )
        );
      });
      return this.updater.update(del, ins);
    });
  } else {
    return new Error("Please specify a bio to update.");
  }
};
