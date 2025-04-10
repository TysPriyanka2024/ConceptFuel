const https = require('https');


function requestHeader (path, sessionId) {
    return {
        "host": "www.famark.com",
        "path": "/host/api.svc/api" + path,
        "method": "post", 
        "headers": {
            "SessionId": sessionId,
            "Content-Type": "application/json; charset=UTF-8",
            "Accept": "application/json; charset=UTF-8"
        }
    };
}

module.exports = {  
    postData : (path, data, sessionId) => {
        return new Promise ((resolve, reject) => {
            const body = [];
            const request = https.request(requestHeader(path, sessionId), (response) => {
                response.on('data', (chunk) => {
                    body.push(chunk);
                });
                response.on('end', () => {
                    try {
                        const errorMessage = response.headers['errormessage'];
                        if(errorMessage != null) {
                            console.log("Error:" + errorMessage);
                            reject(errorMessage);
                        } else {
                            const bodyData = Buffer.concat(body).toString();
                            const output = JSON.parse(bodyData);
                            //console.log(output);
                            resolve(output);
                        }
                    } catch(ex) {
                        reject(ex);
                    }
                });
            });
            request.on('error', (error) => {
                reject(error);
            });
            request.write(data);
            request.end();
        });
    },
  };
  