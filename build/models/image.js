'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;

var Image = new Schema({
    img: {
        data: Buffer,
        contentType: String,
        convert: String,
        contents: String,
        writer: String,
        hashtags: Array
    }
});

exports.default = _mongoose2.default.model('image', Image);