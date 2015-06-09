FROM google/nodejs

WORKDIR /dist
ADD package.json /dist/
RUN npm install
ADD . /dist

CMD []
ENTRYPOINT ["/nodejs/bin/npm", "start"]
