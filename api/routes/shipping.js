var express = require('express');
var router = express.Router();
var config = require('../../config');
var request = require('request');


//promise to generate auth token for shipping API's
var generateShippingApiAccessToken = function () {
    var options = {
        url: config.config.baseUrl + 'oauth/token',
        method: "POST",
        json: true,
        headers: {
            Authorization: 'Basic ' + config.config.apiKey,
            "content-type": "application/x-www-form-urlencoded"
        },
        form: {
            grant_type: "client_credentials"
        }
    };
    return new Promise(function (resolve, reject) {
        request(options, function (err, res, body) {
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
        });
    });
};


//promise to get rates
var getRates = function (token, reqBody) {
    var options = {
        url: config.config.baseUrl + 'shippingservices/v1/rates',
        method: "POST",
        json: true,
        headers: {
            Authorization: 'Bearer ' + token,
            "content-type": "application/json"
        },
        body: reqBody
    };
    return new Promise(function (resolve, reject) {
        request(options, function (err, res, body) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    result: res,
                    body: body
                });
            }
        });
    });
};

//promise to create label
var createLabel = function (token, reqBody) {
    var options = {
        url: config.config.baseUrl + 'shippingservices/v1/shipments',
        method: "POST",
        json: true,
        headers: {
            Authorization: 'Bearer ' + token,
            "content-type": "application/json",
            "X-PB-TransactionId": Math.floor(Math.random() * 1000000000)
        },
        body: reqBody
    };
    return new Promise(function (resolve, reject) {
        request(options, function (err, res, body) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    result: res,
                    body: body
                });
            }
        });
    });
};

//promise to validate address
var validateAddress = function (token, address) {
    let options = {
        url: config.config.baseUrl + "shippingservices/v1/addresses/verify",
        method: "POST",
        json: true,
        body: address,
        headers: {
            Authorization: 'Bearer ' + token,
            "content-type": "application/json;charset=UTF-8"
        }
    };
    return new Promise(function (resolve, reject) {
        request(options, function (err, res, body) {
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
        });
    });
};

// get rates API
router.post('/getRates', function (req, res, next) {
    if (!req.body) {
        res.status(400).send([{
            "message": "Please provide required Data"
        }]);
    }
    if (!req.body.fromAddress || !req.body.toAddress || !req.body.parcel || !req.body.rates) {
        res.status(400).send([{
            "message": "mandatory Fields are missing.fromAddress,toAddress,parcel and rates are mandatory in request body"
        }]);
    }

    let v1 = validateAddress(req.body.fromAddress);
    let v2 = validateAddress(req.body.toAddress);

    Promise.all([v1, v2]).then((results) => {
        let pr = generateShippingApiAccessToken();
        pr.then(function (prRes) {
            getRates(prRes.access_token, req.body).then(function (result) {
                res.status(result.result.statusCode).send(result.body);
            }, function (error) {
                res.send(error);
            });
        }, function (prErr) {
            res.send(prErr);
        });
    }, (errors) => {
        res.send([
            {
                "message": "Error in address.Please check addresses.",
                "error": errors
            }
        ]);
    });
});

// print label API
router.post('/createLabel', function (req, res, next) {
    if (!req.body) {
        res.status(400).send([{
            "message": "Please provide required Data"
        }]);
    }

    if (!req.body.fromAddress || !req.body.toAddress || !req.body.parcel || !req.body.rates) {
        res.status(400).send([{
            "message": "mandatory Fields are missing.fromAddress,toAddress,parcel and rates are mandatory in request body"
        }]);
    }

    let mainReq = Object.assign({}, req.body);
    mainReq.rates = [];
    mainReq.rates.push(req.body.rates);
    mainReq.documents = [{
        "type": "SHIPPING_LABEL",
        "contentType": "URL",
        "size": "DOC_4X6",
        "fileFormat": "PDF",
        "printDialogOption": "EMBED_PRINT_DIALOG"
    }];
    mainReq.shipmentOptions = [{
        "name": "SHIPPER_ID",
        "value": config.config.shipperId
    }];
    mainReq.rates[0].specialServices = [{
        "specialServiceId": "DelCon",
        "inputParameters": [{
            "name": "INPUT_VALUE",
            "value": "0"
        }]
    }];

    let v1 = validateAddress(req.body.fromAddress);
    let v2 = validateAddress(req.body.toAddress);

    Promise.all([v1, v2]).then((results) => {
        let pr = generateShippingApiAccessToken();
        pr.then(function (prRes) {
            createLabel(prRes.access_token, mainReq).then(function (result) {
                res.status(result.result.statusCode).send(result.body);
            }, function (error) {
                res.send(error);
            });
        }, function (prErr) {
            res.send(prErr);
        });
    }, (errors) => {
        res.send([
            {
                "message": "Error in address.Please check addresses.",
                "error": errors
            }
        ]);
    });
});

module.exports = router;