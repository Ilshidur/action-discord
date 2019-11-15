# 🚀 Discord for GitHub Actions - DEVELOPMENT

This document will help you in case you want to test your GitHub Action before deploying it.
By installing and running this Action manually, you'll be able to control the environment variables that GitHub usually applies to the Action's container.

<hr/>

## Requirements

* Node.js *(sorry ...)*

## Installation

* Copy `.env.dist` to `.env` and set **all** the environment variables
* Run `npm ci`

## Development

Run the Action using this :

```bash
node -r dotenv/config entrypoint.js "{{ EVENT_PAYLOAD.commits[0].message }}"
```

You can change the event payload by editing the `event-example.json` file according to the [event types](https://developer.github.com/v3/activity/events/types).

<hr/>

<p align="center">
  Don't forget to 🌟 Star 🌟 the repo if you like this GitHub Action !<br/>
  <a href="https://github.com/Ilshidur/action-discord/issues/new">Your feedback is appreciated</a>
</p>
