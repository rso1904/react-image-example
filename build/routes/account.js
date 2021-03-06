'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _account = require('../models/account');

var _account2 = _interopRequireDefault(_account);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

/*
    ACCOUNT SIGNUP: POST /api/account/signup
    BODY SAMPLE: { "username": "test", "password": "test"};
    ERROR CODES:
        1: BAD USERNAME
        2: BAD PASSWORD
        3: USERNAM EXISTS
*/

router.post('/signup', function (req, res) {
    // CEHCK USERNAME FORMAT
    var usernameRegex = /^[a-z0-9]+$/;

    if (!usernameRegex.test(req.body.username)) {
        return res.status(400).json({
            error: "BAD USERNAME",
            code: 1
        });
    }

    // CHECK PASS LENGTH
    if (req.body.password.length < 4 || typeof req.body.password !== "string") {
        return res.status(400).json({
            error: "BAD PASSWORD",
            code: 2
        });
    }

    // CHECK USER EXISTANCE
    _account2.default.findOne({ username: req.body.username }, function (err, exists) {
        if (err) throw err;
        if (exists) {
            return res.status(409).json({
                error: "USERNAME EXISTS",
                code: 3
            });
        }

        var account = new _account2.default({
            username: req.body.username,
            password: req.body.password
        });

        account.password = account.generateHash(account.password);

        // SAVE IN THE DATABASE
        account.save(function (err) {
            if (err) throw err;
            return res.json({ success: true });
        });
    });

    // res.json({ success: true });
});

/*
    ACCOUNT SIGNIN: POST /api/account/signin
    BODY SAMPLE: { "username": "test", "password": "test" }
    ERROR CODES:
        1: LOGIN FAILED
*/

router.post('/signin', function (req, res) {
    if (typeof req.body.password !== "string") {
        return res.status(401).json({
            error: "LOGIN FAILED",
            code: 1
        });
    }

    // FIND THE USER BY USERNAME
    _account2.default.findOne({ username: req.body.username }, function (err, account) {
        var secret = req.app.get('jwt-secret');

        if (err) throw err;

        // CHECK ACCOUNT EXISTANCY
        if (!account) {
            return res.status(401).json({
                error: "LOGIN FAILED",
                code: 1
            });
        }

        // CHECK WHETHER THE PASSWORD IS VALID
        if (!account.validateHash(req.body.password)) {
            return res.status(401).json({
                error: "LOGIN FAILED",
                code: 1
            });
        }

        var p = new Promise(function (resolve, reject) {
            _jsonwebtoken2.default.sign({
                username: req.body.username
            }, secret, {
                expiresIn: '7d',
                issuer: 'velopert.com',
                subject: 'userInfo'
            }, function (err, token) {
                if (err) reject(err);
                resolve(token);
            });
        });

        // ALTER SESSION
        /*    let session = req.session;
            session.loginInfo = {
                _id: account._id,
                username: account.username
            };*/

        // RETURN SUCCESS
        p.then(function (token) {
            return res.json({
                success: true,
                token: token
            });
        });
    });

    //res.json({ success: true });
});

/*
    GET CURRENT USER INFO GET /api/account/getInfo
*/

router.get('/getinfo', function (req, res) {
    if (typeof req.session.loginInfo === "undefined") {
        return res.status(401).json({
            error: 1
        });
    }
    res.json({ info: req.session.loginInfo });
    //res.json({ info: null });
});

/*
    LOGOUT: POST /api/account/logout
*/

router.post('/logout', function (req, res) {
    //req.session.destroy(err => { if (err) throw err; });
    return res.json({ success: true });
});

/*
    SEARCH USER: GET /api/account/search/:username
*/
router.get('/search/:username', function (req, res) {
    // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
    var re = new RegExp('^' + req.params.username);
    _account2.default.find({ username: { $regex: re } }, { _id: false, username: true }).limit(5).sort({ username: 1 }).exec(function (err, accounts) {
        if (err) throw err;
        res.json(accounts);
    });
});

// EMPTY SEARCH REQUEST: GET /api/account/search
router.get('/search', function (req, res) {
    res.json([]);
});

// update profile
router.put('/update', function (req, res) {
    // FIND THE USER BY USERNAME
    _account2.default.findOne({ username: req.body.data.username }, function (err, account) {
        if (err) throw err;
        /*
        if (typeof req.body.data.password !== "undefined")
            account.password = account.generateHash(req.body.password);
        */
        if (typeof req.body.data.password !== "undefined") account.password = account.generateHash(req.body.data.password);
        if (typeof req.body.data.email !== "undefined") account.email = req.body.data.email;
        if (typeof req.body.data.imagePreviewUrl !== "undefined") account.image = req.body.data.imagePreviewUrl;

        // SAVE IN THE DATABASE
        account.save(function (err) {
            if (err) throw err;
            return res.json({ success: true });
        });
    });
});

router.get('/profile', function (req, res) {

    _account2.default.findOne({ username: req.params.username }).exec(function (err, accounts) {
        if (err) throw err;
        res.json(accounts);
    });
});

router.get('/profile/:username', function (req, res) {

    _account2.default.findOne({ username: req.params.username }).exec(function (err, accounts) {
        if (err) throw err;
        res.json(accounts);
    });
});

exports.default = router;