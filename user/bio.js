const rdf = require("rdflib");
const ns = require("solid-namespace")(rdf);

module.exports.getBio = function (graph) {
  if (graph) {
    const bio = graph.any(rdf.sym(this.webId), ns.vcard("note"));
    const bioValue = bio ? bio.value : undefined;
    return bioValue;
  } else {
    const fetcher = this.fetcher;
    return fetcher
      .load(this.webId, { force: true, clearPreviousData: true })
      .then(() => {
        const bio = this.graph.any(rdf.sym(this.webId), ns.vcard("note"));
        const bioValue = bio ? bio.value : undefined;
        return bioValue;
      });
  }
};

module.exports.setBio = function (newBio) {
  if (newBio) {
    return this.getBio().then((bio) => {
      const del = [];
      const delSt = this.graph.statementsMatching(
        rdf.sym(this.webId),
        ns.vcard("note")
      );
      delSt.forEach((st) => {
        del.push(st);
      });

      const ins = [
        rdf.st(
          rdf.sym(this.webId),
          ns.vcard("note"),
          rdf.lit(newBio),
          rdf.sym(this.webId).doc()
        ),
      ];
      return this.updater.update(del, ins);
    });
  } else {
    console.error("Please specify a bio to update.");
  }
};
