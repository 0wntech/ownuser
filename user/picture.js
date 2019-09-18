const rdf = require("rdflib");
const ns = require("solid-namespace")(rdf);

module.exports.getPicture = function(graph) {
  if (graph) {
    const picture = graph.any(rdf.sym(this.webId), ns.vcard("hasPhoto"));
    const pictureValue = picture ? picture.value : "";
    return pictureValue;
  } else {
    const fetcher = this.fetcher;
    return fetcher.load(this.webId).then(() => {
      const picture = this.graph.any(rdf.sym(this.webId), ns.vcard("hasPhoto"));
      const pictureValue = picture ? picture.value : "";
      return pictureValue;
    });
  }
};

module.exports.setPicture = function(newPicture) {
  if (newPicture) {
    return this.getPicture().then(picture => {
      const del = [];
      const delSt = this.graph.statementsMatching(
        rdf.sym(this.webId),
        ns.vcard("hasPhoto")
      );
      delSt.forEach(st => {
        del.push(st);
      });

      const ins = [
        rdf.st(
          rdf.sym(this.webId),
          ns.vcard("hasPhoto"),
          rdf.sym(newPicture),
          rdf.sym(this.webId).doc()
        )
      ];
      return this.updater.update(del, ins);
    });
  } else {
    console.error("Please specify a picture to update.");
  }
};
