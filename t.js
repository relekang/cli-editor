/* eslint-disable no-console */
const yn = require("yn");

const editor = require("./");

const content = `
This is
a
multiline
content
thingy..
`;

const [_node, _program, shouldFail] = process.argv;

if (shouldFail === null || shouldFail === undefined) {
  console.error("Usage: node t.js <should-fail: yes/no>");
  process.exit(1);
}

editor.edit({
  getContentKey: () => "content",
  fetch: () => ({ numberInString: "1", number: 42, emoji: "😎", content }),
  errorHandler: error => ({ retry: true, message: error.toString() }),
  save: item => {
    if (yn(shouldFail)) {
      throw new Error("Something happened");
    }
    console.log(JSON.stringify(item, null, 2));
  }
});
