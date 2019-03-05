FROM debian:9.8-slim

LABEL "com.github.actions.name"="Actions for Discord"
LABEL "com.github.actions.description"="Outputs a message to Discord."
LABEL "com.github.actions.icon"="message-square"
LABEL "com.github.actions.color"="gray-dark"

LABEL "repository"="https://github.com/Ilshidur/actions"
LABEL "homepage"="https://github.com/Ilshidur/actions/discord"
LABEL "maintainer"="Ilshidur <ilshidur@gmail.com>"
LABEL "version"="0.0.2"

RUN apt-get update && apt-get install -y curl

ADD entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
