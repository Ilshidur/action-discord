const axios = require('axios');
const fs = require('fs');
const _ = require('lodash');
const { argv } = require('yargs');

const DISCORD_CHAR_LIMIT = 2000;
const REQUIRED_ENV_VARS = [
  'GITHUB_EVENT_PATH',
  'GITHUB_REPOSITORY',
  'GITHUB_WORKFLOW',
  'GITHUB_ACTOR',
  'GITHUB_EVENT_NAME',
  'GITHUB_ACTION',
  'DISCORD_WEBHOOK'
];

function splitMessage(message) {
  const chunks = [];
  for (let i = 0; i < message.length; i += DISCORD_CHAR_LIMIT) {
    chunks.push(message.slice(i, i + DISCORD_CHAR_LIMIT));
  }
  return chunks;
}

process.env.GITHUB_ACTION = process.env.GITHUB_ACTION || '<missing GITHUB_ACTION env var>';

REQUIRED_ENV_VARS.forEach(env => {
  if (!process.env[env] || !process.env[env].length) {
    console.error(
      `Env var ${env} is not defined. Maybe try to set it if you are running the script manually.`
    );
    process.exit(1);
  }
});

const eventContent = fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8');

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

let url;
let payloads = [];

if (argv._.length === 0 && !process.env.DISCORD_EMBEDS) {
  // If argument and embeds NOT provided, let Discord show the event informations.
  url = `${process.env.DISCORD_WEBHOOK}/github`;
  payload = JSON.stringify(JSON.parse(eventContent));
} else {
  // Otherwise, if the argument or embeds are provided, let Discord override the message.
  const args = argv._.join(' ');
  const message = _.template(args)({ ...process.env, EVENT_PAYLOAD: JSON.parse(eventContent) });

  let embedsObject;
  if (process.env.DISCORD_EMBEDS) {
     try {
        embedsObject = JSON.parse(process.env.DISCORD_EMBEDS);
     } catch (parseErr) {
       console.error('Error parsing DISCORD_EMBEDS :' + parseErr);
       process.exit(1);
     }
  }

  url = process.env.DISCORD_WEBHOOK;
  payloads = messageChunks.map(chunk => JSON.stringify({
    content: chunk,
    ...process.env.DISCORD_EMBEDS && { embeds: embedsObject },
    ...process.env.DISCORD_USERNAME && { username: process.env.DISCORD_USERNAME },
    ...process.env.DISCORD_AVATAR && { avatar_url: process.env.DISCORD_AVATAR },
  }));
}

// curl -X POST -H "Content-Type: application/json" --data "$(cat $GITHUB_EVENT_PATH)" $DISCORD_WEBHOOK/github

(async () => {
  console.log(`Sending ${payloads.length} message(s)...`);
  
  for (const [index, payload] of payloads.entries()) {
    try {
      await axios.post(
        `${url}?wait=true`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-GitHub-Event': process.env.GITHUB_EVENT_NAME,
          },
        },
      );
      console.log(`Message ${index + 1}/${payloads.length} sent successfully`);
    } catch (err) {
      console.error(`Error sending message ${index + 1}:`, err.response.status, err.response.statusText);
      console.error('Message:', err.response ? err.response.data : err.message);
      process.exit(1);
    }
  }
  
  console.log('All messages sent! Shutting down...');
  process.exit(0);
})();
