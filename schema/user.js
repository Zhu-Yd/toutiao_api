const joi = require("joi")
const user_id = joi.number()
const name = joi.string().pattern(/^\w{6,15}$/)
const mobile = joi.string().pattern(/^1[358]\d{9}$/)
const gender = joi.string().pattern(/^0|1|2$/)
const birthday = joi.string().pattern(/^\d{4}-\d{1,2}-\d{1,2}$/)
const id_number = joi.string().pattern(/^\d{17}(\d|x|X)$/)
const page = joi.number()
const per_page = joi.number()
let reg_update_profile_schema = {
    body: {
        name, mobile, gender, birthday, photo: joi.any(), real_name: joi.any(), id_number, intro: joi.any(),
    }

}

let reg_followings_schema = {
    body: {
        to_user_id: user_id
    },
    query: {
        page, per_page
    },

}

let reg_unfollowings_schema = {
    params: {
        to_user_id: user_id
    }
}


module.exports = {reg_update_profile_schema, reg_followings_schema, reg_unfollowings_schema}