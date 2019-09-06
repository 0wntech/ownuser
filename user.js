const rdf = require("rdflib");
const ns = require("solid-namespace")(rdf);
const utils = require("./utils.js");

function User(webId) {
  this.webId = webId;
  this.graph = rdf.graph();
  this.fetcher = new rdf.Fetcher(this.graph);
  this.updater = new rdf.UpdateManager(this.graph);

  this.getName = function(graph) {
    if (graph) {
      const name = graph.any(rdf.sym(this.webId), ns.foaf("name"));
      const nameValue = name ? name.value : undefined;
      return nameValue;
    } else {
      const fetcher = this.fetcher;
      return fetcher.load(this.webId).then(() => {
        const name = this.graph.any(rdf.sym(this.webId), ns.foaf("name"));
        const nameValue = name ? name.value : undefined;
        return nameValue;
      });
    }
  };

  this.setName = function(newName) {
    if (newName) {
      return this.getName().then(name => {
        const ins = [
          rdf.st(
            rdf.sym(this.webId),
            ns.foaf("name"),
            rdf.lit(newName),
            rdf.sym(this.webId).doc()
          )
        ];

        const del = [
          rdf.st(
            rdf.sym(this.webId),
            ns.foaf("name"),
            rdf.lit(name),
            rdf.sym(this.webId).doc()
          )
        ];
        return this.updater.update(del, ins);
      });
    } else {
      console.error("Please specify a name to update.");
    }
  };

  this.getEmails = function(graph) {
    if (graph) {
      const emails = graph
        .each(rdf.sym(this.webId), ns.vcard("hasEmail"))
        .map(emailBlankId => {
          return [
            graph.any(rdf.sym(emailBlankId), ns.vcard("value")).value,
            emailBlankId.value
          ];
        });
      return emails;
    } else {
      const fetcher = this.fetcher;
      return fetcher.load(this.webId).then(() => {
        const emails = this.graph
          .each(rdf.sym(this.webId), ns.vcard("hasEmail"))
          .map(emailBlankId => {
            return [
              this.graph.any(rdf.sym(emailBlankId), ns.vcard("value")).value,
              emailBlankId.value
            ];
          });
        return emails;
      });
    }
  };

  this.setEmail = function(newEmail, oldEmail) {
    if (newEmail) {
      if (oldEmail) {
        return this.getEmails().then(emails => {
          let emailBlankId = "";
          emails.forEach(email => {
            if (email[0] == oldEmail) {
              emailBlankId = email[1];
            }
          });

          const ins = [
            rdf.st(
              rdf.sym(emailBlankId),
              ns.vcard("value"),
              rdf.sym("mailto:" + newEmail),
              rdf.sym(this.webId).doc()
            )
          ];

          const del = [
            rdf.st(
              rdf.sym(emailBlankId),
              ns.vcard("value"),
              rdf.sym(oldEmail),
              rdf.sym(this.webId).doc()
            )
          ];
          return this.updater.update(del, ins);
        });
      } else {
        const bN = 'id' + Math.floor(Math.random() * 1000000000);
        const ins = [
          rdf.st(
            rdf.sym(this.webId),
            ns.vcard("hasEmail"),
            bN,
            rdf.sym(this.webId).doc()
          ),
          rdf.st(
            rdf.sym(bN),
            ns.vcard("value"),
            rdf.sym("mailto:" + newEmail),
            rdf.sym(this.webId).doc()
          )
        ];

        return this.updater.update([], ins);
      }
    } else {
      console.error("Please specify an email.");
    }
  };

  this.getJob = function(graph) {
    if (graph) {
      const job = graph.any(rdf.sym(this.webId), ns.vcard("role"));
      const jobValue = job ? job.value : "";
      return jobValue;
    } else {
      const fetcher = this.fetcher;
      return fetcher.load(this.webId).then(() => {
        const job = this.graph.any(rdf.sym(this.webId), ns.vcard("role"));
        const jobValue = job ? job.value : "";
        return jobValue;
      });
    }
  };

  this.getPicture = function(graph) {
    if (graph) {
      const picture = graph.any(rdf.sym(this.webId), ns.vcard("hasPhoto"));
      const pictureValue = picture ? picture.value : "";
      return pictureValue;
    } else {
      const fetcher = this.fetcher;
      return fetcher.load(this.webId).then(() => {
        const picture = this.graph.any(
          rdf.sym(this.webId),
          ns.vcard("hasPhoto")
        );
        const pictureValue = picture ? picture.value : "";
        return pictureValue;
      });
    }
  };

  this.getBio = function(graph) {
    if (graph) {
      const bio = graph.any(rdf.sym(this.webId), ns.vcard("note"));
      const bioValue = bio ? bio.value : undefined;
      return bioValue;
    } else {
      const fetcher = this.fetcher;
      return fetcher.load(this.webId).then(() => {
        const bio = this.graph.any(rdf.sym(this.webId), ns.vcard("note"));
        const bioValue = bio ? bio.value : undefined;
        return bioValue;
      });
    }
  };

  this.getTelephones = function(graph) {
    if (graph) {
      const telephones = graph
        .each(rdf.sym(this.webId), ns.vcard("hasTelephone"))
        .map(telephoneBlankId => {
          return [
            graph.any(rdf.sym(telephoneBlankId), ns.vcard("value")).value,
            telephoneBlankId.value
          ];
        });
      return telephones;
    } else {
      const fetcher = this.fetcher;
      return fetcher.load(this.webId).then(() => {
        const telephones = this.graph
          .each(rdf.sym(this.webId), ns.vcard("hasTelephone"))
          .map(telephoneBlankId => {
            return [
              this.graph.any(rdf.sym(telephoneBlankId), ns.vcard("value"))
                .value,
              telephoneBlankId.value
            ];
          });
        return telephones;
      });
    }
  };

  this.getProfile = function() {
    const store = rdf.graph();
    const fetcher = new rdf.Fetcher(store);

    return fetcher.load(this.webId).then(() => {
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
        telephones: telephones
      };
    });
  };

  this.getMessagesWith = function(friendsWebId) {
    const store = rdf.graph();
    const fetcher = new rdf.Fetcher(store);
    const username = this.webId.split(".")[0].replace("https://", "");
    const userInboxAddress = this.webId.replace("profile/card#me", "inbox/");

    const friendsName = friendsWebId.split(".")[0].replace("https://", "");
    return fetcher
      .load(userInboxAddress + friendsName)
      .then(response => {
        const userInbox = rdf.sym(userInboxAddress + friendsName);
        const ownMessages = store
          .each(userInbox, ns.wf("message"))
          .map(message => {
            message = rdf.sym(message);
            const messageContent = store.any(message, ns.sioc("content"));
            const messageTimestamp = store.any(message, ns.dc("created"));
            const altMessageTimestamp = messageTimestamp
              ? ""
              : store.any(message, ns.dct("created"));
            const messageContentValue = messageContent.value;
            const messageTimestampValue = messageTimestamp
              ? messageTimestamp.value
              : altMessageTimestamp.value;
            return {
              content: messageContentValue,
              created: messageTimestampValue
            };
          });
        return ownMessages;
      })
      .catch(err => {
        console.log("You haven't send any messages yet!");
      });
  };

  this.getMessagesFrom = function(friendsWebId) {
    const store = rdf.graph();
    const fetcher = new rdf.Fetcher(store);
    const username = this.webId.split(".")[0].replace("https://", "");
    const friendsInboxAddress = friendsWebId.replace(
      "profile/card#me",
      "inbox/" + username
    );

    return fetcher
      .load(friendsInboxAddress)
      .then(response => {
        const friendMessages = store
          .each(rdf.sym(friendsInboxAddress), ns.wf("message"))
          .map(message => {
            message = rdf.sym(message.value);
            const messageContent = store.any(message, ns.sioc("content"));
            const messageTimestamp = store.any(message, ns.dc("created"));
            const altMessageTimestamp = messageTimestamp
              ? ""
              : store.any(message, ns.dct("created"));
            const messageContentValue = messageContent.value;
            const messageTimestampValue = messageTimestamp
              ? messageTimestamp.value
              : altMessageTimestamp.value;
            return {
              content: messageContentValue,
              created: messageTimestampValue
            };
          });
        return friendMessages;
      })
      .catch(err => {
        //console.log("This friend has no chat with you yet.");
      });
  };

  this.getChatWith = function(friendsWebId) {
    return this.getMessagesWith(friendsWebId).then(ownMessages => {
      return Promise.resolve(
        this.getMessagesFrom(friendsWebId).then(friendMessages => {
          var chat = {};
          chat[friendsWebId] = utils.sortMessages(ownMessages, friendMessages);
          return chat;
        })
      );
    });
  };
}

module.exports = User;
