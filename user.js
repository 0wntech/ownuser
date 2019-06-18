const rdf = require("rdflib");
const ns = require("solid-namespace")(rdf);
const utils = require("./utils.js");

function User(webId) {
  this.webId = webId;

  this.getName = function(graph) {
    if (graph) {
      const name = graph.any(rdf.sym(webId), ns.foaf("name"));
      const nameValue = name ? name.value : undefined;
      return nameValue;
    } else {
      const graph = rdf.graph();
      const fetcher = new rdf.Fetcher(graph);
      return fetcher.load(this.webId).then(() => {
        const name = graph.any(rdf.sym(webId), ns.foaf("name"));
        const nameValue = name ? name.value : undefined;
        return nameValue;
      });
    }
  };

  this.getEmails = function(graph) {
    if (graph) {
      const emails = graph
        .each(rdf.sym(webId), ns.vcard("hasEmail"))
        .map(emailBlankId => {
          return [
            graph.any(rdf.sym(emailBlankId), ns.vcard("value")).value,
            emailBlankId.value
          ];
        });
      return emails;
    } else {
      const graph = rdf.graph();
      const fetcher = new rdf.Fetcher(graph);
      return fetcher.load(this.webId).then(() => {
        const emails = graph
          .each(rdf.sym(webId), ns.vcard("hasEmail"))
          .map(emailBlankId => {
            return [
              graph.any(rdf.sym(emailBlankId), ns.vcard("value")).value,
              emailBlankId.value
            ];
          });
        return emails;
      });
    }
  };

  this.getJob = function(graph) {
    if (graph) {
      const job = graph.any(rdf.sym(webId), ns.vcard("role"));
      const jobValue = job ? job.value : "";
      return jobValue;
    } else {
      const graph = rdf.graph();
      const fetcher = new rdf.Fetcher(graph);
      return fetcher.load(this.webId).then(() => {
        const job = graph.any(rdf.sym(webId), ns.vcard("role"));
        const jobValue = job ? job.value : "";
        return jobValue;
      });
    }
  };

  this.getPicture = function(graph) {
    if (graph) {
      const picture = graph.any(rdf.sym(webId), ns.vcard("hasPhoto"));
      const pictureValue = picture ? picture.value : "";
      return pictureValue;
    } else {
      const graph = rdf.graph();
      const fetcher = new rdf.Fetcher(graph);
      return fetcher.load(this.webId).then(() => {
        const picture = graph.any(rdf.sym(webId), ns.vcard("hasPhoto"));
        const pictureValue = picture ? picture.value : "";
        return pictureValue;
      });
    }
  };

  this.getBio = function(graph) {
    if (graph) {
      const bio = graph.any(rdf.sym(webId), ns.vcard("note"));
      const bioValue = bio ? bio.value : undefined;
      return bioValue;
    } else {
      const graph = rdf.graph();
      const fetcher = new rdf.Fetcher(graph);
      return fetcher.load(this.webId).then(() => {
        const bio = graph.any(rdf.sym(webId), ns.vcard("note"));
        const bioValue = bio ? bio.value : undefined;
        return bioValue;
      });
    }
  };

  this.getTelephones = function(graph) {
    if (graph) {
      const telephones = graph
        .each(rdf.sym(webId), ns.vcard("hasTelephone"))
        .map(telephoneBlankId => {
          return [
            graph.any(rdf.sym(telephoneBlankId), ns.vcard("value")).value,
            telephoneBlankId.value
          ];
        });
      return telephones;
    } else {
      const graph = rdf.graph();
      const fetcher = new rdf.Fetcher(graph);
      return fetcher.load(this.webId).then(() => {
        const telephones = graph
          .each(rdf.sym(webId), ns.vcard("hasTelephone"))
          .map(telephoneBlankId => {
            return [
              graph.any(rdf.sym(telephoneBlankId), ns.vcard("value")).value,
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

  this.getMessages = function() {
    const store = rdf.graph();
    const fetcher = new rdf.Fetcher(store);

    const webId = this.webId;
    const inboxAddress = webId.replace("profile/card#me", "inbox/");

    return fetcher.load(inboxAddress).then(() => {
      const inboxFiles = store.each(rdf.sym(inboxAddress), ns.ldp("contains"));
      const chats = inboxFiles.map(inboxFile => {
        const typeStore = rdf.graph();
        const typeFetcher = new rdf.Fetcher(typeStore);
        return typeFetcher.load(inboxFile.value).then(() => {
          const chatBool = typeStore.any(
            null,
            ns.rdf("type"),
            ns.meeting("Chat")
          );
          if (chatBool) {
            const inboxFileValues = inboxFile.value.split("/");
            const contactName = inboxFileValues[inboxFileValues.length - 1];
            const contactWebId =
              "https://" + contactName + ".solid.community/profile/card#me";
            return this.getChatWith(contactWebId);
          } else {
            return undefined;
          }
        });
      });
      return Promise.all(chats).then(results => {
        const chats = [];
        results.forEach(result => {
          if (result) {
            console.log(result);
            chats.push(result);
          }
        });
        return chats;
      });
    });
  };
}

module.exports = User;
