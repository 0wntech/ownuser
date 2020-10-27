const rdf = require("rdflib");
const ns = require("solid-namespace")(rdf);

module.exports.getName = function (graph) {
  if (graph) {
    const name = graph.any(rdf.sym(this.webId), ns.foaf("name"));
    const nameValue = name ? name.value : undefined;
    return nameValue;
  } else {
    const fetcher = this.fetcher;
    return fetcher
      .load(this.webId, { force: true, clearPreviousData: true })
      .then(() => {
        const name = this.graph.any(rdf.sym(this.webId), ns.foaf("name"));
        const nameValue = name ? name.value : undefined;
        return nameValue;
      });
  }
};

module.exports.setName = function (newName) {
  return this.getName().then((name) => {
    const del = [];
    const ins = [];
    const delSt = this.graph.statementsMatching(
      rdf.sym(this.webId),
      ns.foaf("name")
    );
    delSt.forEach((st) => {
      del.push(st);
    });

    if (newName) {
      ins.push(
        rdf.st(
          rdf.sym(this.webId),
          ns.foaf("name"),
          rdf.lit(newName),
          rdf.sym(this.webId).doc()
        ),
      );
    }

    return this.updater.update(del, ins);
  });
};
