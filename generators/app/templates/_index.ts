/// <reference path="../typings/tsd.d.ts" />
var Promise = require("bluebird");
<% if (props.isRabbit) {%>var pubSub = require("da-helpers").pubSub;<% } %>
<% if (props.isTraderNet) {%>var tn = require("trader-net");<% } %>
var logger = require("da-helpers").logger;
<% if (props.handler != 'no') {%>var handler = require("./handler");<% } %>

//get initialization parameters from env, docker env parameters have priority
<% if (props.isRabbit) {
%>var rabbitUrl = process.env.RABBITMQ_PORT_5672_TCP_ADDR ? "amqp://#{process.env.RABBITMQ_PORT_5672_TCP_ADDR}:#{process.env.RABBITMQ_PORT_5672_TCP_PORT}" : process.env.RABBITMQ_URI;
var rabbitQueue = process.env.RABBITMQ_QUEUE;<% } %>

<% if (props.isTraderNet) {
%>var tnUrl = process.env.TRADERNET_URL;
var tnAuth = {
    apiKey: process.env.TRADERNET_API_KEY,
    securityKey: process.env.TRADERNET_SEC_KEY
  }; <% } %>
<% if (props.isRabbit) {
%><% if (props.rabbit_pub_sub.indexOf("sub") != -1) {%>
var subHub = new pubSub.PubSubRabbit();<% } %><% if (props.rabbit_pub_sub.indexOf("pub") != -1) {
%>var pubHub = new pubSub.PubSubRabbit();<% } %><% } %>
<% if (props.isTraderNet) {
%>var traderNet = new tn.TraderNet(tnUrl);<% } %>

var mongoUrl = process.env.MONGO_PORT_27017_TCP_ADDR ?
  "mongodb://#{process.env.MONGO_PORT_27017_TCP_ADDR}:#{process.env.MONGO_PORT_27017_TCP_PORT}" :
  process.env.MONGO_HANDLER_URI;
var log = new logger.LoggerCompose(
  {pack: require("../package.json"), tags: ["trader"]},
  {
    loggly: {token: process.env.LOGGLY_KEY, subdomain: process.env.LOGGLY_SUBDOMAIN},
    mongo: {connection: mongoUrl, collection: process.env.MONGO_LOG_COLLECTION},
    console: true
  }
);

log.write({oper: "app_start", status: "success"});

function onExit(res) {
  log.write({oper: "app_stop", status: "success", res: res});
  subHub.close();
}

function onHandle(cmd) {
  if (cmd.extit) onExit(cmd);
  log.write({oper: "handle", status: "success", cmd: cmd});
  <% if (props.handler != 'no') {%>handler.handle(log, cmd);<% } %>
}

var promise = Promise.resolve();
<% if (props.isTraderNet) { %>
promise.then(() => {
  traderNet.connect(tnAuth)
}).then(() => {
    log.write({oper: "trader_connected", status: "success", url: tnUrl});
  }, (err) => {
    log.write({oper: "trader_connected", status: "error", error: err, url: tnUrl});
  }
);<% } %>
<% if (props.rabbit_pub_sub.indexOf("sub") != -1) { %>
promise.then(() => {
    subHub.connect({
      uri: rabbitUrl,
      queue: rabbitQueue,
      type: pubSub.PubSubTypes.sub,
      onSub: onHandle
    });
  }
).then(() => {
    log.write({oper: "amqp_connected", status: "success", queue: rabbitQueue, type : "sub"});
  }, (err) => {
    log.write({oper: "amqp_connected", status: "error", error: err, queue: rabbitQueue, type : "sub"});
  }
);<% } %>
<% if (props.rabbit_pub_sub.indexOf("pub") != -1) { %>
promise.then(() => {
    pubHub.connect({
      uri: rabbitUrl,
      queue: rabbitQueue,
      type: pubSub.PubSubTypes.pub
    });
  }
).then(() => {
    log.write({oper: "amqp_connected", status: "success", queue: rabbitQueue, type : "pub"});
  }, (err) => {
    log.write({oper: "amqp_connected", status: "error", error: err, queue: rabbitQueue, type : "pub"});
  }
);<% } %>

