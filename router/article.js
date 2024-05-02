const express = require('express')
const router = express.Router()
const Handler = require("../router_handler/article")
// 1. 导入验证数据的中间件
const expressJoi = require('@escook/express-joi')
// 2. 导入需要的验证规则对象
const {
    reg_collections_schema,
    reg_getCollections_schema,
    reg_likings_schema,
    reg_comments_schema,
    reg_getComments_schema,
    reg_getCommentsCount_schema,
    reg_getArticles_schema,
    reg_getChannelArticles_schema,
    reg_getArticleDetail_schema
} = require('../schema/article')

//收藏|取消收藏 文章
router.post("/collections", expressJoi(reg_collections_schema), Handler.updateCollections)

//获取收藏列表 文章
router.get("/collections", expressJoi(reg_getCollections_schema), Handler.getCollections)

//点赞|取消点赞 文章|评论
router.post("/likings", expressJoi(reg_likings_schema), Handler.updateLikings)

//添加|回复 评论
router.post("/comments", expressJoi(reg_comments_schema), Handler.addComments)

//获取评论
router.get("/comments",expressJoi(reg_getComments_schema),Handler.getComments)

//获取指定评论
router.get("/Comment",expressJoi(reg_getCommentsCount_schema),Handler.getComment)

//获取评论数量
router.get("/comments_count",expressJoi(reg_getCommentsCount_schema),Handler.getCommentsCount)

//获取用户文章列表
router.get("/:user_id/articles",expressJoi(reg_getArticles_schema),Handler.getArticles)

//获取频道文章列表
router.get("/articles",expressJoi(reg_getChannelArticles_schema),Handler.getChannelArticles)

//搜索文章
router.get("/search",Handler.searchArticles)

//获取文章详情
router.get("/:article_id",expressJoi(reg_getArticleDetail_schema),Handler.getArticleDetail)


module.exports = router