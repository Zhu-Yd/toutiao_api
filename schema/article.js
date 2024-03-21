const joi = require("joi")
const article = joi.number().required()
const user = joi.number().required()
const channel=joi.number().required()
const type = joi.string().pattern(/^\d{1}$/).required()
const like_type = joi.number().required().min(1).max(1)
const per_page = joi.number()
const page = joi.number()
const content = joi.string().required()
const art_id = joi.number()
const comment_type = joi.string().pattern(/^a|c$/).required()
const source = joi.number().required()
const offset = joi.number()
const limit = joi.number()
let reg_collections_schema = {
    body: {
        target: article,
        type: type,
        //code:joi.any()
    }
}
let reg_getCollections_schema = {
    query: {
        per_page, page
    }
}

let reg_likings_schema = {
    body: {
        target: article,
        type: type,
        like_type: like_type
    }
}

let reg_comments_schema = {
    body: {
        target: article,
        content, art_id
    }
}

let reg_getComments_schema = {
    query: {
        type: comment_type,
        source, offset, limit
    }
}

let reg_getArticles_schema = {
    query: {
        page, per_page
    },
    params: {
        user_id: user
    }
}
let reg_getChannelArticles_schema = {
    query: {
        page, per_page,channel
    }
}

let reg_getArticleDetail_schema={
    params:{
        article_id:article
    }
}
module.exports = {
    reg_collections_schema,
    reg_getCollections_schema,
    reg_likings_schema,
    reg_comments_schema,
    reg_getComments_schema,
    reg_getArticles_schema,
    reg_getChannelArticles_schema,
    reg_getArticleDetail_schema
}