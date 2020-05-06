const superagent = require('superagent');

module.exports = function (RED) {

    function STConfigNode(n) {
        RED.nodes.createNode(this, n);
        this.endpoint = n.endpoint;
        this.apiPath  = n.apiPath;
        this.username = n.username;
        this.password = n.password;
        this.url = this.endpoint + this.apiPath;
    }


    function STBlacklistCheck(config){
        var node = this;
        RED.nodes.createNode(this, config);
        var server = RED.nodes.getNode(config.config);
        node.scenario = config.scenario;
        node.SRUrl = server.url + "blacklist/check";
        console.log(node.scenario);
       
        this.on("input", function(msg, send, done) {
            let payload = {
                scenario: msg.scenario||msg.payload.scenario||node.scenario,
                item: msg.item||msg.payload.item||msg.payload
            }
            // console.log(msg.payload)
            if(msg.noincrement||msg.payload.noincrement){
              payload["no-increment"] = 1;
            }
           
          send = send || node.send.apply(node, arguments);
          node.log("bl-check");
        //   console.log(node.SRUrl,payload);
         let sa = superagent
           .get(node.SRUrl)
           .type("application/json")
           .set("Accept", "application/json")
           .auth(server.username, server.password)
           .query(payload);
           if(msg.devmode){
              sa.set("Dev-Mode",1);
          }
           sa.send()
           .then(r => {
            //  console.log(r.text, "nody", r.body, r.status);
             msg.payload = r.body;
             msg.status = r.status;
             send(msg);
             done();
           })
           .catch(e => {
             node.log(e);
             msg.payload={};
             
             node.error(e,msg);
             send(msg);
            //  throw e;
           });


          
        });
    }

    function STBlacklistInsert(config) {
      var node = this;
      RED.nodes.createNode(this, config);
      var server = RED.nodes.getNode(config.config);
      node.scenario = config.scenario;
      node.SRUrl = server.url + "blacklist/add";

      this.on("input", function(msg, send, done) {
        let payload = {
          scenario: msg.scenario || node.scenario,
          item: msg.item || msg.payload
        };
        if(msg.addedBy){
          payload["added-by"] = msg.addedBy;
        }
        send = send || node.send.apply(node, arguments);
        superagent
          .get(node.SRUrl)
          .type("application/json")
          // .set("Accept", "application/json")
          .auth(server.username, server.password)
          .query(payload)
          .send()
          .then(r => {
            msg.payload = r.body;
            msg.status = r.status;
            send(msg);
            done();
          })
          .catch(e => {
            node.log(e);
            msg.payload={};
            
            node.error(e,msg);
          });
      });
    }

function STBlacklistRemove(config) {
  var node = this;
  RED.nodes.createNode(this, config);
  var server = RED.nodes.getNode(config.config);
  node.scenario = config.scenario;
  node.SRUrl = server.url + "blacklist/remove";

  this.on("input", function(msg, send, done) {
    let payload = {
      scenario: msg.scenario || node.scenario,
      item: msg.item || msg.payload
    };
    if(msg.removedBy){
      payload["removed-by"] = msg.removedBy;
    }
    send = send || node.send.apply(node, arguments);
    superagent
      .get(node.SRUrl)
      .type("application/json")
      .set("Accept", "application/json")
      .auth(server.username, server.password)
      .query(payload)
      .send()
      .then(r => {
        msg.payload = r.body;
        msg.status = r.status;
        send(msg);
        done();
      })
      .catch(e => {
        node.log(e);
        msg.payload={};
        
        node.error(e,msg);
send(msg);
      });
  });
}


     RED.nodes.registerType("signaltower-config", STConfigNode);
     RED.nodes.registerType("signaltower-bl-check", STBlacklistCheck);
     RED.nodes.registerType("signaltower-bl-insert", STBlacklistInsert);
     RED.nodes.registerType("signaltower-bl-remove", STBlacklistRemove);

}