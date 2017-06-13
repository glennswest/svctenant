var fs = require('fs');
var util = require('util');
var getenv = require('getenv');
var fs = require('fs');
var mqtt = require('mqtt');
var uuid = require('uuid');
var myuuid = uuid();
 

// Setup our database
var diskdb = require('diskdb');
var data_path = "/data";
db = diskdb.connect(data_path, ['tenant']);
db.loadCollections(['tenant']);


myIP = process.env.myIP;
console.log("My IP is: " + myIP);

// Setup MQTT for communications to DNS
var mymqtt  = mqtt.connect('mqtt://svcmqtt.ncc9.com');
var servicedata = {name: "svctenant",ip: myIP, id: myuuid, version: "v1"};

mymqtt.on('connect', function(){
    mymqtt.subscribe('svctenant_new');
    mymqtt.subscribe('svctenant_list');
    mymqtt.subscribe('svctenant_get');
    }
)

mymqtt.on('message', function(topic, messagestr){
        message = JSON.parse(messagestr);
        console.log("message: " + topic + "message: " + util.inspect(message));
        switch(topic){
            case "svctenant_new":
                  console.log("Handling new tenant");
                  response = {};
                  response.code = 0;
                  query = {};
                  query.name = message.name;
                  tenant = db.tenant.findOne(query);
                  if (tenant != undefined){
                     console.log("Duplciate name");
                     response.code = 422;
                     response.tenant = tenant;
                     mymqtt.publish(message.replyto,JSON.stringify(response));     
                     return;
                     }
                  query = {};
                  query.domain = message.domain;
                  tenant = db.tenant.findOne(query);
                  if (tenant != undefined){
                     console.log("Duplciate domain");
                     response.code = 422;
                     response.tenant = tenant;
                     mymqtt.publish(message.replyto,JSON.stringify(response));     
                     return;
                     }
                  console.log("Creating Tenant");
                  tenant = {};
                  tenant.id = response.uuid;
                  tenant.name = message.name;
                  tenant.email = message.email;
                  tenant.domain = message.domain;
                  tenant.date_created = new Date().getTime();
                  response = tenant;
                  db.tenant.save(tenant);
                  console.log(message.replyto);
                  console.log(util.inspect(response));
                  mymqtt.publish(message.replyto,JSON.stringify(response));     
                  mymqtt.publish("svctenant_tenantcreated", JSON.stringify(response));
                  break;
            case "svctenant_list":
                  console.log("Handling list tenant");
                  response = {};
                  tenants = db.tenant.find();
                  response.tenants = tenants;
                  console.log(message.replyto);
                  console.log(util.inspect(response));
                  mymqtt.publish(message.replyto,JSON.stringify(response));     
                  break;
            case "svctenant_get":
                  console.log("Handling get tenant");
                  response = {};
                  query = {};
                  query._id = message.id;
                  tenant = db.tenant.findOne(query);
                  response.tenant = tenant;
                  console.log(message.replyto);
                  console.log(util.inspect(response));
                  mymqtt.publish(message.replyto,JSON.stringify(response));     
                  break;
            default:
               break;
         }

});

