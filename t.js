/* eslint-disable no-console */
const editor = require("./");

const content = `
This is
a
multiline
content
thingy..
`;

editor.edit({
  getContentKey: () => "content",
  fetch: () => ({ numberInString: "1", number: 42, emoji: "😎", content }),
  save: item => {
    console.log(JSON.stringify(item, null, 2));
  }
});
