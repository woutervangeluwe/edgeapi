const jwt = require('jsonwebtoken');
const request = require('request');

const privateKey = ""; //private key from your Adobe IO project, looks like this (full key on one line, add line breaks manually using \n): -----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9...1yO78=\n-----END PRIVATE KEY-----\n

var now = new Date();
var tomorrow = new Date();
tomorrow.setDate(now.getDate() + 1);


var jwtPayload; 

const imsOrg = "xxx@AdobeOrg";
const client_id = '';
const client_secret = '';
const tech_account_id = 'xxx@techacct.adobe.com';


var jwtToken; // = jwt.sign(jwtPayload, privateKey, { algorithm: 'RS256'});
var accessToken = '';


exports.handler = (event, context) => {
    
    if (jwtPayload == undefined) {
        console.log("JWT is undefined");
        jwtPayload = {
            "exp": tomorrow.getTime(),
            "iss": imsOrg,
            "sub": tech_account_id,
            "https://ims-na1.adobelogin.com/s/ent_dataservices_sdk": true,
            "aud": "https://ims-na1.adobelogin.com/c/"+client_id
        }
        
        jwtToken = jwt.sign(jwtPayload, privateKey, { algorithm: 'RS256'});
        
        request.post({url: 'https://ims-na1.adobelogin.com/ims/exchange/jwt?client_id=' + client_id + '&client_secret=' + client_secret + '&jwt_token=' + jwtToken}, function (err, httpResponse, body) {
            if (err) {
                console.log("Error getting accessToken : " + err);
                accessToken = "";
                console.log(err);
            } else {
                //console.log("body : " + body);
                var response = JSON.parse(body);
                accessToken = response.access_token;
                //console.log("accessToken : " + accessToken);
                var result = {};
                result.Payload = accessToken;
                console.log("New JWT Token", result);
                context.succeed(result);
            }
        });
    }
    else {
        
        
        var expireDate = new Date(jwtPayload.exp);
        if (expireDate <= now) {
            
            console.log("JWT is expired");
            jwtPayload = {
                "exp": tomorrow.getTime(),
                "iss": imsOrg,
                "sub": tech_account_id,
                "https://ims-na1.adobelogin.com/s/ent_dataservices_sdk": true,
                "aud": "https://ims-na1.adobelogin.com/c/"+client_id
            }
            
            jwtToken = jwt.sign(jwtPayload, privateKey, { algorithm: 'RS256'});
            
            request.post({url: 'https://ims-na1.adobelogin.com/ims/exchange/jwt?client_id=' + client_id + '&client_secret=' + client_secret + '&jwt_token=' + jwtToken}, function (err, httpResponse, body) {
                if (err) {
                    console.log("Error getting accessToken : " + err);
                    accessToken = "";
                    console.log(err);
                } else {
                    //console.log("body : " + body);
                    var response = JSON.parse(body);
                    accessToken = response.access_token;
                    //console.log("accessToken : " + accessToken);
                    var result = {};
                    result.Payload = accessToken;
                    console.log("New JWT Token", result);
                    context.succeed(result);
                }
            });
            
        }
        else {
            var result = {};
            result.Payload = accessToken;
            console.log("result", result);
            context.succeed(result);
        }
        
    }
    
    // console.log("JWT Token : " + jwtToken);
    
    
        
};