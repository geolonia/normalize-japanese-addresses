const assert = require('node:assert');
const { normalize } = require('@geolonia/normalize-japanese-addresses');

(async () => {
  const res = await normalize('渋谷区道玄坂1-10-8');
  assert.strictEqual(res.pref, '東京都');
})()
  .then(() => {
    console.log('OK');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
