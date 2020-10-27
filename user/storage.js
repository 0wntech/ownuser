const rdf = require("rdflib");
const ns = require("solid-namespace")(rdf);

module.exports.getStorage = function (graph) {
  if (graph) {
    const storage = graph.any(rdf.sym(this.webId), ns.space("storage"));
    const storageValue = storage ? storage.value : "";
    return storageValue;
  } else {
    const fetcher = this.fetcher;
    return fetcher
      .load(this.webId, { force: true, clearPreviousData: true })
      .then(() => {
        const storage = this.graph.any(
          rdf.sym(this.webId),
          ns.space("storage")
        );
        const storageValue = storage ? storage.value : undefined;
        return storageValue;
      });
  }
};

module.exports.setStorage = function (newStorage) {
  return this.getStorage().then(() => {
    const del = [];
    const ins = [];
    const delSt = this.graph.statementsMatching(
      rdf.sym(this.webId),
      ns.space("storage")
    );
    delSt.forEach((st) => {
      del.push(st);
    });

    if (newStorage) {
      ins.push(
        rdf.st(
          rdf.sym(this.webId),
          ns.space("storage"),
          rdf.sym(newStorage),
          rdf.sym(this.webId).doc()
        )
      );
    }
    return this.updater.update(del, ins);
  });
};
