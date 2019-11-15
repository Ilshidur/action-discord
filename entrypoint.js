const axios = require('axios');
const fs = require('fs');
const _ = require('lodash');
const { argv } = require('yargs');

const REQUIRED_ENV_VARS = [
  'GITHUB_EVENT_PATH',
  'GITHUB_REPOSITORY',
  'GITHUB_WORKFLOW',
  'GITHUB_ACTOR',
  'GITHUB_EVENT_NAME',
  'GITHUB_ACTION',
  'DISCORD_WEBHOOK'
];

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
let payload;

if (argv._.length === 0) {
  // If argument NOT provided, let Discord show the event informations.
  url = `${process.env.DISCORD_WEBHOOK}/github`;
  payload = JSON.stringify(JSON.parse(eventContent));
} else {
  // Otherwise, if the argument is provided, let Discord override the message.
  const args = argv._.join(' ');
  const message = _.template(args)({ ...process.env, EVENT_PAYLOAD: JSON.parse(eventContent) });

  url = process.env.DISCORD_WEBHOOK;
  payload = JSON.stringify({
    content: message,
    ...process.env.DISCORD_USERNAME && { username: process.env.DISCORD_USERNAME },
    ...process.env.DISCORD_AVATAR && { avatar_url: process.env.DISCORD_AVATAR },
  });
}

// curl -X POST -H "Content-Type: application/json" --data "$(cat $GITHUB_EVENT_PATH)" $DISCORD_WEBHOOK/github

(async () => {
  console.log('Sending message ...');
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
  console.log('Message sent ! Shutting down ...');
  process.exit(0);
})().catch(err => {
  console.error('Error :', err.response.status, err.response.statusText);
  console.error('Message :', err.response ? err.response.data : err.message);
  process.exit(1);
});
