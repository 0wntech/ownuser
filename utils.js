function sortMessages (ownMessages, friendMessages) {
  if (ownMessages !== undefined || friendMessages !== undefined) {
    const messages = [];
    for (var message in ownMessages) {
      messages.push({ message: ownMessages[message], from: "me" });
    }

    for (message in friendMessages) {
      messages.push({ message: friendMessages[message], from: "friend" });
    }

    messages.sort(function(a, b) {
      return new Date(a.message.created) - new Date(b.message.created);
    });

    return messages;
  } else {
    return undefined;
  }
};

module.exports = {sortMessages: sortMessages};