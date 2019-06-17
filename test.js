const assert = require("assert");
const utils = require('./utils.js');
const User = require("./index");

const user = new User("https://ludwigschubert.solid.community/profile/card#me");

user.getName().then(name => {
  assert.equal(name, "Ludwig Faust Schubert");
});

user.getJob().then(job => {
  assert.equal(job, "Software Engineer");
});

user.getBio().then(bio => {
  assert.equal(bio, "Request Access");
});

user.getEmails().then(emails => {
  assert.deepStrictEqual(emails, [
    [
      "mailto:ludwigschubi1@gmail.com",
      "https://ludwigschubert.solid.community/profile/card#id1550750583468"
    ],
    [
      "mailto:ludwigschubi1234@gmail.com",
      "https://ludwigschubert.solid.community/profile/card#id1551875997884"
    ]
  ]);
});

user.getTelephones().then(telephones => {
  assert.deepStrictEqual(telephones, [
    [
      "tel:017698361189",
      "https://ludwigschubert.solid.community/profile/card#id1551815623136"
    ],
    [
      "tel:03055493333",
      "https://ludwigschubert.solid.community/profile/card#id1551876409474"
    ]
  ]);
});

user.getPicture().then(picture => {
  assert.equal(
    picture,
    "https://ludwigschubert.solid.community/profile/aa.jpeg"
  );
});

user.getProfile().then(profile => {
  const profileCheck = {
    webId: "https://ludwigschubert.solid.community/profile/card#me",
    name: "Ludwig Faust Schubert",
    picture: "https://ludwigschubert.solid.community/profile/aa.jpeg",
    emails: [
      [
        "mailto:ludwigschubi1@gmail.com",
        "https://ludwigschubert.solid.community/profile/card#id1550750583468"
      ],
      [
        "mailto:ludwigschubi1234@gmail.com",
        "https://ludwigschubert.solid.community/profile/card#id1551875997884"
      ]
    ],
    job: "Software Engineer",
    bio: "Request Access",
    telephones: [
      [
        "tel:017698361189",
        "https://ludwigschubert.solid.community/profile/card#id1551815623136"
      ],
      [
        "tel:03055493333",
        "https://ludwigschubert.solid.community/profile/card#id1551876409474"
      ]
    ]
  };
  assert.deepStrictEqual(profile, profileCheck);
});
