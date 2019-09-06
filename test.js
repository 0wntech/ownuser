const assert = require("assert");
const auth = require("solid-auth-cli");
const rdf = require("rdflib");
const User = require("./index");

const user = new User("https://lalasepp.solid.community/profile/card#me");

user.getName().then(name => {
  assert.equal(name, "Lala Sepp");
});

user.getJob().then(job => {
  assert.equal(job, "Hacker");
});

user.getBio().then(bio => {
  assert.equal(bio, "Hacking");
});

user.getEmails().then(emails => {
  assert.deepStrictEqual(emails, [
    [
      "mailto:lalasepp@gmail.com",
      "https://lalasepp.solid.community/profile/card#id1567761320623"
    ]
  ]);
});

user.getTelephones().then(telephones => {
  assert.deepStrictEqual(telephones, [
    [
      "tel:03055493333",
      "https://lalasepp.solid.community/profile/card#id1567761334296"
    ]
  ]);
});

user.getPicture().then(picture => {
  assert.equal(
    picture,
    "https://lalasepp.solid.community/profile/icon%20Kopie.ico_.ico"
  );
});

user.getProfile().then(profile => {
  const profileCheck = {
    webId: "https://lalasepp.solid.community/profile/card#me",
    name: "Lala Sepp",
    picture: "https://lalasepp.solid.community/profile/icon%20Kopie.ico_.ico",
    emails: [
      [
        "mailto:lalasepp@gmail.com",
        "https://lalasepp.solid.community/profile/card#id1567761320623"
      ]
    ],
    job: "Hacker",
    bio: "Hacking",
    telephones: [
      [
        "tel:03055493333",
        "https://lalasepp.solid.community/profile/card#id1567761334296"
      ]
    ]
  };
  assert.deepStrictEqual(profile, profileCheck);
});

auth.getCredentials().then(credentials => {
  auth.login().then(session => {
    user.fetcher = new rdf.Fetcher(user.graph, { fetch: auth.fetch });
    const newName = "Lalasepp";
    const oldName = "Lala Sepp";
    user.setName(newName).then(() => {
      user.getName().then(name => {
        assert.equal(name, newName);
        user.setName(oldName).then(() => {
          user.getName().then(name => {
            assert.equal(name, oldName);
          });
        });
      });
    });

    const oldEmail = "lalasepp@gmail.com";
    const newEmail = "lalasepp1@gmail.com";

    user.setEmail(newEmail).then(() => {
      user.getEmails().then((emails) => {
        const newEmailFound = false;
        emails.forEach(email => {
          if(email[0] === newEmail){
            newEmailFound = true;
          }
        });
        assert.equal(true, newEmailFound);
        user.setEmail(oldEmail, newEmail).then(() => {
          user.getEmails().then((emails) => {
            const oldEmailFound = false;
            emails.forEach(email => {
            if(email[0] === newEmail){
              oldEmailFound = true;
            }
            });
            assert.equal(true, oldEmailFound);
          })
        });
      })
    })

  });
});
