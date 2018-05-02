var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.status(200).send("Integrated rates and print label Shipping API.");
});

module.exports = router;
