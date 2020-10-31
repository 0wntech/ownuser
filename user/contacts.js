const rdf = require("rdflib");
const ns = require("solid-namespace")(rdf);

const contactQueryCallback = (store, webId) => {
  const ownNode = rdf.sym(webId);
  const contacts = store.each(ownNode, ns.foaf("knows")).map((contact) => {
    return contact.value;
  });
  return contacts;
};

module.exports.getContacts = function (store) {
  const webId = this.webId;
  if (store) {
    return contactQueryCallback(store, this.webId);
  } else {
    const fetcher = this.fetcher;
    store = this.graph;
    return fetcher
      .load(webId)
      .then(() => contactQueryCallback(store, this.webId));
  }
};

module.exports.setContacts = function (contacts) {
  if (!contacts) {
    throw new Error("Please specify the contacts you want to set.");
  } else if (!Array.isArray(contacts)) {
    contacts = [contacts];
  }
  const webId = this.webId;
  const updater = this.updater;
  return this.getContacts().then((prevContacts) => {
    const toDelete = prevContacts
      .filter((contact) => {
        return !contacts.includes(contact);
      })
      .map((contact) => {
        const ownNode = rdf.sym(webId);
        const contactNode = rdf.sym(contact);
        return rdf.st(ownNode, ns.foaf("knows"), contactNode, ownNode.doc());
      });
    const toAdd = contacts
      .filter((contact) => {
        return !prevContacts.includes(contact);
      })
      .map((contact) => {
        const ownNode = rdf.sym(webId);
        const contactNode = rdf.sym(contact);
        return rdf.st(ownNode, ns.foaf("knows"), contactNode, ownNode.doc());
      });

    // console.log("[DEBUG] -- Adding ", toAdd);
    // console.log("[DEBUG] -- Deleting ", toDelete);

    return updater.update(toDelete, toAdd);
  });
};

module.exports.addContact = function (contactWebId) {
  const webId = this.webId;
  const updater = this.updater;

  const del = [];
  const ins = rdf.st(
    rdf.sym(webId),
    ns.foaf("knows"),
    rdf.sym(contactWebId),
    rdf.sym(webId).doc()
  );
  return updater.update(del, ins);
};

module.exports.deleteContact = function (contactWebId) {
  const webId = this.webId;
  const updater = this.updater;

  const del = rdf.st(
    rdf.sym(webId),
    ns.foaf("knows"),
    rdf.sym(contactWebId),
    rdf.sym(webId).doc()
  );
  const ins = [];
  return updater.update(del, ins);
};

module.exports.getContactRecommendations = function () {
  return new Promise(async (resolve, reject) => {
    const friendsOfFriends = [];
    const myFriends = await this.getContacts();
    const fofPromises = myFriends.map((friend) => {
      friend = friend.replace("solid.community", "solidcommunity.net");
      return this.fetcher
        .load(friend)
        .catch((err) => [])
        .then(() => contactQueryCallback(this.graph, friend));
    });
    return await Promise.all(fofPromises)
      .then((allFriendsOfF) => {
        allFriendsOfF.forEach((friendsOfF) => {
          friendsOfF.forEach((friend) => {
            friendsOfFriends.push(
              friend.replace("solid.community", "solidcommunity.net")
            );
          });
        });
        return friendsOfFriends;
      })
      .then((friends) => {
        myFriends.push(this.webId);
        return removeFriendsInCommon(friends, myFriends);
      })
      .then((friends) => resolve(rankFriendsOfFriends(friends)));
  });
};

function removeFriendsInCommon(friendsOfFriends, myFriends) {
  return friendsOfFriends.filter((friend) => {
    return myFriends.indexOf(friend) === -1 ? true : false;
  });
}

function rankFriendsOfFriends(friendsOfFriendArray) {
  let counts = {};
  friendsOfFriendArray.forEach((friend) => {
    counts[friend] = (counts[friend] || 1) + 1;
  });
  let sortable = [];
  for (let friend in counts) {
    sortable.push([friend, counts[friend]]);
  }
  let rankedFriendsList = sortable
    .sort((a, b) => b[1] - a[1])
    .reduce((acc, cur) => {
      acc.push(cur[0]);
      return acc;
    }, []);
  return rankedFriendsList;
}