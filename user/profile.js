const rdf = require("rdflib");
const ns = require("solid-namespace")(rdf);

module.exports.getProfile = function (webId) {
  let store;
  let fetcher;
  if (webId) {
    store = rdf.graph();
    fetcher = new rdf.Fetcher(store);
  } else {
    store = this.graph;
    fetcher = this.fetcher;
    webId = this.webId;
  }

  return fetcher
    .load(webId, { force: true, clearPreviousData: true })
    .then(() => {
      const nameValue = this.getName(store);
      const emails = this.getEmails(store);
      const jobValue = this.getJob(store);
      const pictureValue = this.getPicture(store);
      const bioValue = this.getBio(store);
      const telephones = this.getTelephones(store);

      return {
        webId: webId,
        name: nameValue,
        picture: pictureValue,
        emails: emails,
        job: jobValue,
        bio: bioValue,
        telephones: telephones,
      };
    });
};

module.exports.setProfile = function (profile) {
  return new Promise((resolve, reject) => {
    return this.getProfile().then(async (oldProfile) => {
      let { name, job, picture, bio, emails, telephones } = profile;
      const del = [];
      const ins = [];
      if (name !== oldProfile.name) {
        const delSt = this.graph.statementsMatching(
          rdf.sym(this.webId),
          ns.foaf("name")
        );
        delSt.forEach((st) => {
          del.push(st);
        });

        if (name)
          ins.push(
            rdf.st(
              rdf.sym(this.webId),
              ns.foaf("name"),
              rdf.lit(name),
              rdf.sym(this.webId).doc()
            )
          );
      }

      if (job !== oldProfile.job) {
        const delSt = this.graph.statementsMatching(
          rdf.sym(this.webId),
          ns.vcard("role")
        );
        delSt.forEach((st) => {
          del.push(st);
        });

        if (job)
          ins.push(
            rdf.st(
              rdf.sym(this.webId),
              ns.vcard("role"),
              rdf.lit(job),
              rdf.sym(this.webId).doc()
            )
          );
      }

      if (picture !== oldProfile.picture) {
        const delSt = this.graph.statementsMatching(
          rdf.sym(this.webId),
          ns.vcard("hasPhoto")
        );
        delSt.forEach((st) => {
          del.push(st);
        });

        if (picture)
          ins.push(
            rdf.st(
              rdf.sym(this.webId),
              ns.vcard("hasPhoto"),
              rdf.lit(picture),
              rdf.sym(this.webId).doc()
            )
          );
      }

      if (bio !== oldProfile.bio) {
        const delSt = this.graph.statementsMatching(
          rdf.sym(this.webId),
          ns.vcard("note")
        );
        delSt.forEach((st) => {
          del.push(st);
        });

        if (bio)
          ins.push(
            rdf.st(
              rdf.sym(this.webId),
              ns.vcard("note"),
              rdf.lit(bio),
              rdf.sym(this.webId).doc()
            )
          );
      }

      if (JSON.stringify(emails) !== JSON.stringify(oldProfile.emails)) {
        if (!emails) emails = [];
        if (!Array.isArray(emails)) {
          emails = [emails];
        }
        const { insertStatements, deleteStatements } = await this.setEmails(
          emails,
          {
            oldEmails: oldProfile.emails,
            noUpdate: true,
          }
        );
        if (insertStatements) insertStatements.forEach((st) => ins.push(st));
        if (deleteStatements) deleteStatements.forEach((st) => del.push(st));
      }

      if (
        JSON.stringify(telephones) !== JSON.stringify(oldProfile.telephones)
      ) {
        if (!telephones) telephones = [];
        if (!Array.isArray(telephones)) {
          telephones = [telephones];
        }
        const { insertStatements, deleteStatements } = await this.setTelephones(
          telephones,
          {
            oldTelephones: oldProfile.telephones,
            noUpdate: true,
          }
        );
        console.log(insertStatements, deleteStatements, telephones);
        if (insertStatements) insertStatements.forEach((st) => ins.push(st));
        if (deleteStatements) deleteStatements.forEach((st) => del.push(st));
      }

      return this.updater
        .update(del, ins)
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};
