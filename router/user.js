const express = require('express')
const router = express.Router()
const userHandler = require("../router_handler/user")
// 1. 导入验证数据的中间件
const expressJoi = require('@escook/express-joi')
// 2. 导入需要的验证规则对象
const {reg_update_profile_schema, reg_followings_schema, reg_unfollowings_schema} = require('../schema/user')

//获取用户信息
router.get("/profile", userHandler.profile)
//获取指定用户信息
router.get("/profile/:to_user_id", expressJoi(reg_unfollowings_schema), userHandler.userInfo)

//更改用户信息
const multer = require('multer')
const path = require("path")
const uploads = multer({dest: path.join(__dirname, "../uploads")})
router.patch("/profile", uploads.fields([
    {name: 'id_card_front', maxCount: 1},
    {name: 'id_card_back', maxCount: 1},
    {name: 'id_card_handheld', maxCount: 1},
    {name: 'photo', maxCount: 1}]), expressJoi(reg_update_profile_schema), userHandler.update)

//关注用户
router.post("/followings", expressJoi(reg_followings_schema), userHandler.followings)

//取消关注用户
router.delete("/followings/:to_user_id", expressJoi(reg_unfollowings_schema), userHandler.unfollowings)

//获取关注用户列表
router.get("/followings", expressJoi(reg_followings_schema), userHandler.tofollowings)

//获取用户粉丝列表
router.get("/followers", expressJoi(reg_followings_schema), userHandler.followers)

//获取用户历史记录
router.get("/history", userHandler.history)
//新增用户历史记录
router.post("/history", userHandler.addHistory)
//删除用户历史记录
router.delete("/history", userHandler.delHistory)
module.exports = router
