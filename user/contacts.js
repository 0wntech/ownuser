const rdf = require("rdflib");
const ns = require("solid-namespace")(rdf);
const User = require("../index");
const sparql = require("sparql-fiddle");

module.exports.getContacts = async function(options = {}) {
  const webId = this.webId;

  if (!options.store) {
    const fetcher = this.fetcher;
    store = this.graph;
    await fetcher.load(webId);
  }

  const ownNode = rdf.sym(webId);
  const contacts = store.each(ownNode, ns.foaf("knows")).map(contact => {
    return contact.value;
  });
  return contacts;
};

module.exports.setContacts = function(contacts) {
  if (!contacts) {
    throw new Error("Please specify the contacts you want to set.");
  } else if (!Array.isArray(contacts)) {
    contacts = [contacts];
  }
  const webId = this.webId;
  const updater = this.updater;
  const store = this.graph;
  return this.getContacts({ webIdsOnly: true }).then(prevContacts => {
    const toDelete = prevContacts
      .filter(contact => {
        return !contacts.includes(contact);
      })
      .map(contact => {
        const ownNode = rdf.sym(webId);
        const contactNode = rdf.sym(contact);
        return rdf.st(ownNode, ns.foaf("knows"), contactNode, ownNode.doc());
      });
    const toAdd = contacts
      .filter(contact => {
        return !prevContacts.includes(contact);
      })
      .map(contact => {
        const ownNode = rdf.sym(webId);
        const contactNode = rdf.sym(contact);
        return rdf.st(ownNode, ns.foaf("knows"), contactNode, ownNode.doc());
      });

    // console.log("[DEBUG] -- Adding ", toAdd);
    // console.log("[DEBUG] -- Deleting ", toDelete);

    return updater.update(toDelete, toAdd);
  });
};

module.exports.addContact = function(contactWebId) {
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

module.exports.deleteContact = function(contactWebId) {
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

module.exports.getContactRecommendations = function() {
  return new Promise((resolve, reject) => {
    const query =
      "PREFIX n: <http://xmlns.com/foaf/0.1/> SELECT ?o WHERE {?s n:knows ?o.}";
    let friendsOfFriends = [];
    let myFriends = [];
    runQuery(this.webId, query).then(results => {
      const fofPromises = results.map(friend => {
        myFriends.push(friend.o);
        return runQuery(friend.o, query);
      });
      Promise.all(fofPromises)
        .then(res => {
          res.forEach(friends => {
            friends.forEach(friend => {
              friendsOfFriends.push(friend.o);
            });
          });
          return friendsOfFriends;
        })
        .then(friends => {
          myFriends.push(this.webId);
          return removeFriendsInCommon(friends, myFriends);
        })
        .then(friends => {
          resolve(rankFriendsInCommon(friends));
        });
    });
  });
};

function removeFriendsInCommon(friendsOfFriends, myFriends) {
  return friendsOfFriends.filter(friend => {
    return myFriends.indexOf(friend) == -1 ? true : false;
  });
}

function rankFriendsInCommon(friendsOfFriendArray) {
  let counts = {};
  friendsOfFriendArray.forEach(friend => {
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

function runQuery(endpoint, query) {
  const fiddle = {
    data: endpoint,
    query: query,
    wanted: "Array"
  };
  return sparql.run(fiddle);
}
