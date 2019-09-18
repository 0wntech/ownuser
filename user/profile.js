const rdf = require("rdflib");
const ns = require("solid-namespace")(rdf);

module.exports.getProfile = function() {
  const store = this.graph;
  const fetcher = this.fetcher;

  return fetcher.load(this.webId).then(() => {
    const nameValue = this.getName(store);
    const emails = this.getEmails(store);
    const jobValue = this.getJob(store);
    const pictureValue = this.getPicture(store);
    const bioValue = this.getBio(store);
    const telephones = this.getTelephones(store);

    return {
      webId: this.webId,
      name: nameValue,
      picture: pictureValue,
      emails: emails,
      job: jobValue,
      bio: bioValue,
      telephones: telephones
    };
  });
};

module.exports.setProfile = function(profile) {
  return new Promise((resolve, reject) => {
    this.getProfile().then(oldProfile => {
      const { name, job, picture, bio, emails, telephones } = profile;
      const del = [];
      const ins = [];
      if (name && name !== oldProfile.name) {
        const delSt = this.graph.statementsMatching(
          rdf.sym(this.webId),
          ns.foaf("name")
        );
        delSt.forEach(st => {
          del.push(st);
        });

        ins.push(
          rdf.st(
            rdf.sym(this.webId),
            ns.foaf("name"),
            rdf.lit(name),
            rdf.sym(this.webId).doc()
          )
        );
      }

      if (job && job !== oldProfile.job) {
        const delSt = this.graph.statementsMatching(
          rdf.sym(this.webId),
          ns.vcard("role")
        );
        delSt.forEach(st => {
          del.push(st);
        });

        ins.push(
          rdf.st(
            rdf.sym(this.webId),
            ns.vcard("role"),
            rdf.lit(job),
            rdf.sym(this.webId).doc()
          )
        );
      }

      if (picture && picture !== oldProfile.picture) {
        const delSt = this.graph.statementsMatching(
          rdf.sym(this.webId),
          ns.vcard("hasPhoto")
        );
        delSt.forEach(st => {
          del.push(st);
        });

        ins.push(
          rdf.st(
            rdf.sym(this.webId),
            ns.vcard("hasPhoto"),
            rdf.lit(picture),
            rdf.sym(this.webId).doc()
          )
        );
      }

      if (bio && bio !== oldProfile.bio) {
        const delSt = this.graph.statementsMatching(
          rdf.sym(this.webId),
          ns.vcard("note")
        );
        delSt.forEach(st => {
          del.push(st);
        });

        ins.push(
          rdf.st(
            rdf.sym(this.webId),
            ns.vcard("note"),
            rdf.lit(bio),
            rdf.sym(this.webId).doc()
          )
        );
      }

      if (
        emails &&
        JSON.stringify(emails) !== JSON.stringify(oldProfile.emails)
      ) {
        if (!Array.isArray(emails)) {
          emails = [emails];
        }
        oldProfile.emails.forEach(email => {
          const emailBlankId = this.graph.any(
            null,
            ns.vcard("value"),
            rdf.sym("mailto:" + email)
          );
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
              rdf.sym("mailto:" + email),
              rdf.sym(this.webId).doc()
            )
          );
        });

        emails.forEach(email => {
          const bN = rdf.sym(
            rdf.sym(this.webId).doc().uri +
              "#" +
              "id" +
              ("" + new Date().getTime())
          );
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
              rdf.sym("mailto:" + email),
              rdf.sym(this.webId).doc()
            )
          );
        });
      }

      if (
        telephones &&
        JSON.stringify(telephones) !== JSON.stringify(oldProfile.telephones)
      ) {
        if (!Array.isArray(telephones)) {
          telephones = [telephones];
        }
        oldProfile.telephones.forEach(telephone => {
          const telephoneBlankId = this.graph.any(
            null,
            ns.vcard("value"),
            rdf.sym("tel:" + telephone)
          );
          del.push(
            rdf.st(
              rdf.sym(this.webId),
              ns.vcard("hasTelephone"),
              telephoneBlankId,
              rdf.sym(this.webId).doc()
            )
          );
          del.push(
            rdf.st(
              telephoneBlankId,
              ns.vcard("value"),
              rdf.sym("tel:" + telephone),
              rdf.sym(this.webId).doc()
            )
          );
        });

        telephones.forEach(telephone => {
          const bN = rdf.sym(
            rdf.sym(this.webId).doc().uri +
              "#" +
              "id" +
              ("" + new Date().getTime())
          );
          ins.push(
            rdf.st(
              rdf.sym(this.webId),
              ns.vcard("hasTelephone"),
              bN,
              rdf.sym(this.webId).doc()
            )
          );
          ins.push(
            rdf.st(
              bN,
              ns.vcard("value"),
              rdf.sym("tel:" + telephone),
              rdf.sym(this.webId).doc()
            )
          );
        });
      }

      return this.updater
        .update(del, ins)
        .then(() => {
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  });
};
