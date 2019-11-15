#!/bin/sh

set -eu

# Check if arguments provided
if [ $# -eq 0 ]
then

# If argument NOT provided, let Discord show the event informations.

echo Sending event informations

echo Payload : $(cat $GITHUB_EVENT_PATH)

curl -X POST -H "Content-Type: application/json" --data "$(cat $GITHUB_EVENT_PATH)" $DISCORD_WEBHOOK/github

else

# If argument provided, override the Discord message.

echo Sending : $*

curl -X POST -H "Content-Type: application/json" --data "{ \"content\": \"$*\" }" $DISCORD_WEBHOOK

fi
