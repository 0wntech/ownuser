const rdf = require("rdflib");
const ns = require("solid-namespace")(rdf);

const utils = require("../utils.js");
const { getName, setName } = require("./name.js");
const { getBio, setBio } = require("./bio.js");
const { getJob, setJob } = require("./job.js");
const { getPicture, setPicture } = require("./picture.js");
const { getTelephones, setTelephones, addTelephone, deleteTelephone } = require("./telephones.js");
const { getEmails, setEmails, deleteEmail, addEmail} = require("./emails.js");
const { getProfile, setProfile } = require("./profile.js");
const { getContacts, setContacts, addContact, deleteContact } = require("./contacts.js");

function User(webId) {
  this.webId = webId;
  this.graph = rdf.graph();
  this.fetcher = new rdf.Fetcher(this.graph);
  this.updater = new rdf.UpdateManager(this.graph);

  this.getName = getName.bind(this);
  this.setName = setName.bind(this);

  this.getJob = getJob.bind(this);
  this.setJob = setJob.bind(this);

  this.getBio = getBio.bind(this);
  this.setBio = setBio.bind(this);

  this.getPicture = getPicture.bind(this);
  this.setPicture = setPicture.bind(this);

  this.getEmails = getEmails.bind(this);
  this.setEmails = setEmails.bind(this);
  
  this.getTelephones = getTelephones.bind(this);
  this.setTelephones = setTelephones.bind(this);

  this.getProfile = getProfile.bind(this);
  this.setProfile = setProfile.bind(this);
  
  this.getContacts = getContacts.bind(this);
  this.setContacts = setContacts.bind(this);
  this.addContact = addContact.bind(this);
  this.deleteContact = deleteContact.bind(this);

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
