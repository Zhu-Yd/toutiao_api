const joi = require("joi")
const mobile = joi.string().pattern(/^1[358]\d{9}$/).required()
const code=joi.string().pattern(/^\d{6}$/).required()
let reg_login_schema = {
    body: {
        mobile: mobile,
        code:code,
        //code:joi.any()
    }

}

module.exports = {reg_login_schema}