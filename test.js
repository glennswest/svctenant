var fs = require('fs');
var util = require('util');
var mqtt = require('mqtt');
var uuid = require('uuid');
var myuuid = uuid();
var me = "test" + myuuid;
 
var mymqtt  = mqtt.connect('mqtt://localhost');

mymqtt.on('connect', function(){
    console.log("Connected");
    mymqtt.subscribe(me);
    msg = {};
    msg.name = "Neural Cloud Computing";
    msg.email = "glennswest@neuralcloudcomputing.com";
    msg.domain = "ncc";
    msg.replyto = me;
    console.log("Sending message");
    console.log(util.inspect(msg));
    mymqtt.publish('svctenant_new',JSON.stringify(msg));
    }
)

mymqtt.on('message', function(topic, messagestr){
        message = JSON.parse(messagestr);
        console.log("message: " + topic + "message: " + util.inspect(message));
        });
