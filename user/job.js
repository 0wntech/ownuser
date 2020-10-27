const rdf = require("rdflib");
const ns = require("solid-namespace")(rdf);

module.exports.getJob = function (graph) {
  if (graph) {
    const job = graph.any(rdf.sym(this.webId), ns.vcard("role"));
    const jobValue = job ? job.value : "";
    return jobValue;
  } else {
    const fetcher = this.fetcher;
    return fetcher
      .load(this.webId, { force: true, clearPreviousData: true })
      .then(() => {
        const job = this.graph.any(rdf.sym(this.webId), ns.vcard("role"));
        const jobValue = job ? job.value : undefined;
        return jobValue;
      });
  }
};

module.exports.setJob = function (newJob) {
  return this.getJob().then((job) => {
    const del = [];
    const ins = [];
    const delSt = this.graph.statementsMatching(
      rdf.sym(this.webId),
      ns.vcard("role")
    );
    delSt.forEach((st) => {
      del.push(st);
    });

    if (newJob) {
      ins.push(
        rdf.st(
          rdf.sym(this.webId),
          ns.vcard("role"),
          rdf.lit(newJob),
          rdf.sym(this.webId).doc()
        ),
      );
    }
    return this.updater.update(del, ins);
  });
};
