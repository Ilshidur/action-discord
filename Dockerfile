FROM mhart/alpine-node:16.4.2

ADD package.json package-lock.json /
RUN npm ci --production
ADD entrypoint.js /
RUN chmod +x /entrypoint.js

ENTRYPOINT ["node", "/entrypoint.js"]
