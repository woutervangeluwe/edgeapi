'use strict';
const AWS = require('aws-sdk');
const https = require('https');
const { v4: uuidv4 } = require('uuid');
const { validate : uuidValidate } = require('uuid');

const datastreamId = "";//your Datastream ID, looks like this: 012a3b4c-500a-600c-d7f8-g90h0000ijk0

const id = (Math.floor(Math.random() * 1000000000000000000001)).toString();
const datetime = new Date().toISOString();

var offerContent = {
  "name": "Default",
  "description": "Default",
  "image": "",//default image
  "showOffer": "no"
}

const customerMappingTable = [
  {
    "loyaltyId": "LOY-53239",
    "uuid": "22dad324-1d34-4ac1-b397-294d292a472f"
  },
  {
    "loyaltyId": "LOY-230722",
    "uuid": "6fe5d299-86c4-4416-952a-3a1681ee001c"
  }
];

var thisUUID = "";
var thisECID = "";
var thisLoyaltyId = "";
var loyaltyIdAvailable = false;
var atContentImage = "";

exports.handler = (event, context, callback) => {
  console.log("Event = ", event);
  //console.log("Cookie = ", (event.headers.Cookie).replace("uuid=", ""));
  
  if(event.httpMethod == "GET"){
    if(event.queryStringParameters == null){
      if(event.headers.hasOwnProperty("Cookie")){
        if(uuidValidate((event.headers.Cookie).replace("uuid=", ""))){
          thisUUID = (event.headers.Cookie).replace("uuid=", "");
          console.log("UUID is valid.");
          createBodyPageView(event, context, callback);
        }
      }else {
        console.log("UUID is invalid. Generating a new UUID.");
          thisECID = "";
          thisLoyaltyId = "";
          loyaltyIdAvailable = false;
          thisUUID = uuidv4();
          createBodyPageView(event, context, callback);
      }
    }else if(event.queryStringParameters !== null && event.queryStringParameters.hasOwnProperty("loyaltyId")){
      thisLoyaltyId = event.queryStringParameters.loyaltyId;
      loyaltyIdAvailable = true;
      if(event.headers.hasOwnProperty("Cookie")){
        if(uuidValidate((event.headers.Cookie).replace("uuid=", ""))){
          thisUUID = (event.headers.Cookie).replace("uuid=", "");
          console.log("UUID is valid.");
          createBodyPageView(event, context, callback);
        }
      }
    }else if(event.headers.hasOwnProperty("Cookie")){
      if(uuidValidate((event.headers.Cookie).replace("uuid=", ""))){
        thisUUID = (event.headers.Cookie).replace("uuid=", "");
        console.log("UUID is valid.");
        createBodyPageView(event, context, callback);
      }
    }else{
      console.log("UUID is invalid. Generating a new UUID.");
        thisECID = "";
        thisLoyaltyId = "";
        loyaltyIdAvailable = false;
        thisUUID = uuidv4();
        createBodyPageView(event, context, callback);
    }
  }else if(event.eventType == "generateUUID"){
    generateUUID(event, context, callback);
  }else if(uuidValidate(event.uuid)){
    console.log("UUIDv4 is valid");
    thisUUID = event.uuid;
    thisECID = "";
    thisLoyaltyId = "";
    loyaltyIdAvailable = false;
    switch (event.eventType) {
      case "web.webpagedetails.pageViews":
        createBodyPageView(event, context, callback);
        break;
      case "commerce.productViews":
        createBodyProductView(event, context, callback);
        break;
      default:
        return callback(null, {"ERROR": "Event Not Supported"});
    }
  }else{
    return callback(null, {"ERROR": "UUIDv4 Invalid"});
  }
}  

function generateUUID(event, context, callback){
  var uuid = uuidv4();
  console.log(uuid);
  return callback(null, {uuid});
} 

function createBodyPageView(event, context, callback){   
  var pageName = "";
  var pageUrl = "";
  var eventType = "";
  
  if(event.httpMethod == "GET"){
    if(event.queryStringParameters !== null){
      pageName = event.queryStringParameters.pageName;
      pageUrl = event.headers.referer;
      eventType = "web.webpagedetails.pageViews";
    }else{
      pageName = "SecurFinancial-Home (1st hit)";
      pageUrl = event.headers.referer;
      eventType = "web.webpagedetails.pageViews";
    }
  }else{
    pageName = event.pageName;
    pageUrl = event.pageUrl;
    eventType = "web.webpagedetails.pageViews";
  }
  
  var postBody = {
    "event": {
      "xdm": {
        "_experienceplatform": {
          "demoEnvironment": {
            "brandIndustry": "fsi",
            "brandName": "Secur Financial"
          }
        },
        "web": {
          "webPageDetails": {
            "URL": pageUrl,
            "name": pageName,
            "pageViews": {
              "value": 1
            }
          },
          "webReferrer": {
            "URL": ""
          }
        },
        "_id": id,
        "eventType": eventType,
        "identityMap": {
        },
        "timestamp": datetime
      }
    },
    "query": {
      "personalization": {
      }
    }
  };
        
  sendEvent(event, context, postBody, callback);
}

function createBodyProductView(event, context, callback){   
  var postBody = {
    "event": {
      "xdm": {
        "_experienceplatform": {
          "demoEnvironment": {
            "brandIndustry": "fsi",
            "brandName": "Secur Financial"
          }
        },
        "_id": id,
        "eventType": event.eventType,
        "identityMap": {
        },
        "timestamp": datetime,
        "commerce": {
          "productViews": {
            "value": 1
          }
        }
      }
    },
    "query": {
      "personalization": {
      }
    }
  };
      
  postBody.event.xdm.productListItems = [];
  postBody.event.xdm.productListItems[0] = {
    "SKU": event.productSKU,
    "name": event.productName,
    "quantity": 1
  }
      
  sendEvent(event, context, postBody, callback);
}

function returnHtml(event, context, uuid, callback){ 
  console.log("Starting Returning HTML");
  
  
  var html= `<html><head><title>SecurFinancial-Home</title>
    <link rel="icon" type="image/x-icon" href="https://parsefiles.back4app.com/hgJBdVOS2eff03JCn6qXXOxT5jJFzialLAHJixD9/3ef716237e4ea87cb52fbcf8271b5f3c_favicon.png">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script>
      window.datalayer = window.dataLayerEnvironment || {};
      //Environment Information
      datalayer.identity = {};
      datalayer.identity.uuid = "${uuid}";
      datalayer.identity.konductor = "${thisECID}";
      datalayer.identity.loyaltyId = "${thisLoyaltyId}";
      
      </script>
    <script>
      if ('URLSearchParams' in window) {
          var searchParams = new URLSearchParams(window.location.search)
          searchParams.set("pageName", window.document.title);
          var newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
          history.pushState(null, '', newRelativePathQuery);
      }
      </script>
    </head><body>
    <div id='header' style="font-family:verdana; font-size:14px;"> Active Loyalty ID: ${thisLoyaltyId}<br />
    <form id="enterLoyaltyId" style="font-family:verdana; font-size:14px;">
      Enter your Loyalty ID:
      <input style="border-radius: 10px;" type="text" name="loyaltyId">
      <input type="submit" value="Log In">
    </form>
    <hr /> 
    <img id="1" src="https://parsefiles.back4app.com/hgJBdVOS2eff03JCn6qXXOxT5jJFzialLAHJixD9/f1dcf87a156d1970defac3b6568c48d9_1.jpg" style="width: 100%;height: auto;max-width: 100%;display:block;">
    <img id="offer" src="${offerContent.image}" style="width: 100%;height: auto;max-width: 100%;display:none;"/>
    <img id="2" src="https://parsefiles.back4app.com/hgJBdVOS2eff03JCn6qXXOxT5jJFzialLAHJixD9/3d3a885ba3d2556ee4f1da92e93c569e_2.jpg" style="width: 100%;height: auto;max-width: 100%;display:block;">
    <img id="3" src="https://parsefiles.back4app.com/hgJBdVOS2eff03JCn6qXXOxT5jJFzialLAHJixD9/2f74fef53db69c2d36438727062537ea_3.jpg" style="width: 100%;height: auto;max-width: 100%;display:block;">
    <img id="4" src="https://parsefiles.back4app.com/hgJBdVOS2eff03JCn6qXXOxT5jJFzialLAHJixD9/7d230a5774a9bac346af8ec32f642249_4.jpg" style="width: 100%;height: auto;max-width: 100%;display:block;">
    <img id="5" src="https://parsefiles.back4app.com/hgJBdVOS2eff03JCn6qXXOxT5jJFzialLAHJixD9/8c0d54ccadc9edd05ceb3e2bce199b06_5.jpg" style="width: 100%;height: auto;max-width: 100%;display:block;">
    <img id="6" src="https://parsefiles.back4app.com/hgJBdVOS2eff03JCn6qXXOxT5jJFzialLAHJixD9/66d7f7bdfddd3dfa454370776cf42b72_6.jpg" style="width: 100%;height: auto;max-width: 100%;display:block;">
    ${atContentImage}
    
    <script>
      if("${offerContent.showOffer}" == "yes"){
        $("#offer").attr("style", "width: 100%;height: auto;max-width: 100%;display:block;");
        $("#2").attr("style", "width: 100%;height: auto;max-width: 100%;display:none;");
      }
      let form_data = new FormData(document.querySelector("#enterLoyaltyId"));
      let form_str = new URLSearchParams(form_data).toString();

      //console.log(form_str);
    </script>
    
    
  </body></html>`;
  console.log("Returning HTML");
  
  var response = {
    "statusCode": 200,
    "body": html,
    "headers": {"Content-Type": "text/html"},
    "multiValueHeaders": {
      "Set-Cookie": ["uuid="+uuid+"; path=/; expires=Fri, 04-Nov-2032 11:27:44 GMT; secure; SameSite=Strict; HttpOnly; domain=aepdemo.net"]
    }
  }
  return callback(null, response);
  
}

function sendEvent(event, context, postBody, callback){     
                         
    postBody.event.xdm.identityMap.FPID = [];
    postBody.event.xdm.identityMap.FPID[0] = {
      "id": thisUUID,
      "primary": true
    }  
    
    if(loyaltyIdAvailable == true){
      postBody.event.xdm.identityMap.loyaltyId = [];
      postBody.event.xdm.identityMap.loyaltyId[0] = {
        "id": thisLoyaltyId,
        "primary": false
      }
    }
    
    postBody.query.personalization.schemas = [];
    postBody.query.personalization.schemas[0] = "https://ns.adobe.com/personalization/html-content-item";
    postBody.query.personalization.schemas[1] = "https://ns.adobe.com/personalization/json-content-item";
    postBody.query.personalization.schemas[0] = "https://ns.adobe.com/personalization/redirect-item";
    postBody.query.personalization.schemas[0] = "https://ns.adobe.com/personalization/dom-action";
    postBody.query.personalization.decisionScopes = [];
    postBody.query.personalization.decisionScopes[0] = ""; //decision scope
    postBody.query.personalization.decisionScopes[1] = ""; //decision scope
    //postBody.query.personalization.decisionScopes[2] = "__view__";
  
    var postBodyStr = JSON.stringify(postBody);
    console.log("XDM Experience Event" + postBodyStr); 
    
    
      var lambda = new AWS.Lambda({
        region: 'us-west-2' //change to your region
      });
    

    //the below code is used to generate a valid Access Token to interact with Adobe IO APIs
    lambda.invoke({
        FunctionName: 'arn:aws:lambda:us-west-2:765050914486:function:ioAuthenticate',
        InvocationType : 'RequestResponse',
        LogType : 'Tail',
        Payload: JSON.stringify(context, null, 2) // pass params
      }, function(error, data) {
            console.log("Returning from function call");
            if (error) {
              console.log("We have an error", error);
            }
            if(data){
              console.log("Data: ", data);
              console.log("Info: create user in Adobe Admin Console");
              //console.log("We have data");
              
                  console.log("Bearer : " + JSON.parse(data.Payload).Payload);
                  
                  var bearer = JSON.parse(data.Payload).Payload;
                  
                  var options = {
                    hostname: 'server.adobedc.net',
                    path: '/v2/interact?datastreamId=' + datastreamId,
                    method: 'POST',
                    headers: {
                      'Authorization' : 'Bearer ' + bearer,
                      'x-gw-ims-org-id': 'xxx@AdobeOrg',//IMS Org ID
                      'x-api-key': '',//Adobe IO Client Key
                      'x-sandbox-name': '',
                      'Content-type': 'application/json',
                      'Accept': 'application/json'
                    }
                  };
                                  
                  var req = https.request(options, (res) => {
                    console.log('statusCode:', res.statusCode);
                                  
                    res.on('data', function(data) {
                      console.log(data.toString('utf8'));
                      var responseJSON = JSON.parse(data.toString('utf8'));
                      //console.log("Offer Image: " +  responseJSON.handle[0].payload[0].items[0].data.deliveryURL);
                      //offerContent.image = responseJSON.handle[0].payload[0].items[0].data.deliveryURL;
                      const p = responseJSON.handle;
                      let deliveryURL;
                      for (let i = 0; i < p.length; i++) {
                        if (
                          p[i].hasOwnProperty("payload") &&
                          p[i].payload.length > 0 &&
                          p[i].payload[0].hasOwnProperty("items") &&
                          p[i].payload[0].items.length > 0 &&
                          p[i].payload[0].items[0].hasOwnProperty("data") &&
                          p[i].payload[0].scope =="" //decision scope
                        ) {
                          deliveryURL = p[i].payload[0].items[0].data.deliveryURL;
                          offerContent.image = deliveryURL;
                          offerContent.showOffer = "yes";
                        } 
                        
                        if (
                          p[i].hasOwnProperty("payload") &&
                          p[i].payload.length > 0 &&
                          p[i].payload[0].hasOwnProperty("key") &&
                          p[i].payload[0].key == "kndctr_xxx_AdobeOrg_identity"
                        ) {
                          thisECID = (Buffer.from((p[i].payload[0].value), 'base64').toString()).substring(2, 40);
                          console.log(thisECID);
                        }
                        
                        if (
                          p[i].hasOwnProperty("payload") &&
                          p[i].payload.length > 0 &&
                          p[i].payload[0].hasOwnProperty("items") &&
                          p[i].payload[0].items.length > 0 &&
                          p[i].payload[0].items[0].hasOwnProperty("data") &&
                          p[i].payload[0].id.startsWith("AT") &&
                          p[i].payload[0].scope ==""//decision scope, in this case the Adobe Target mbox name
                        ) {
                          
                          atContentImage = p[i].payload[0].items[0].data.content;
                          console.log(atContentImage);
                        } 
                        
                        
                      }
                      
                      
                      console.log('delivery URL', deliveryURL)
                      
                      if(event.httpMethod == "GET"){
                        //console.log("responseJSON: " + responseJSON);
                        returnHtml(event, context, thisUUID, callback);
                      }else{
                        return callback(null, responseJSON);
                      }
                      
                    });
                  });
                                  
                  req.on('error', (e) => {
                    console.error(e);
                  });
                                  
                  req.write(postBodyStr);
                                  
                  req.end();
                }
    
    })}