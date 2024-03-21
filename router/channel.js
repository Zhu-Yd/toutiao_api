const express = require('express')
const router = express.Router()
const Handler = require("../router_handler/channel")
// 1. 导入验证数据的中间件
const expressJoi = require('@escook/express-joi')

router.get("/channels", Handler.channels)

router.put("/channels",Handler.update)


module.exports = router