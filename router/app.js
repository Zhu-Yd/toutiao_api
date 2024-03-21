const express = require('express')
const router = express.Router()
const Handler = require("../router_handler/app")
// 1. 导入验证数据的中间件
const expressJoi = require('@escook/express-joi')
// 2. 导入需要的验证规则对象
const {reg_login_schema} = require('../schema/app')

router.post("/login", expressJoi(reg_login_schema), Handler.login)


module.exports = router