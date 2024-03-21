const express = require('express')
const app = express()
const joi = require("joi")
//解决跨域问题
const cors = require('cors')
app.use(cors())
const config = require("./config")
//jwt身份认证模块
const expressJWT = require("express-jwt")

//解析表单数据 只能解析 application/www-x-form-urlencoded 的数据
app.use(express.urlencoded({extended: false}))
// 使用中间件解析 JSON
app.use(express.json());
//封装res.cc 响应返回结果
app.use((req, res, next) => {
    res.cc = function (err, status = 1) {
        res.send({
            status: status,
            message: err instanceof Error ? err.message : err
        })

    }
    next()
})

app.use(expressJWT({secret: config.jwtSecretKey}).unless({path: [/^\/app\//,/^\/uploads\//]}))
//配置路由
const appRouter = require("./router/app")
app.use('/app', appRouter)
const userRouter = require("./router/user")
app.use('/user', userRouter)
const channelRouter=require("./router/channel")
app.use('/channel',channelRouter)
const articleRouter=require("./router/article")
app.use('/article',articleRouter)

// 定义错误级别的中间件
app.use((err, req, res, next) => {
    // 验证失败导致的错误
    if (err instanceof joi.ValidationError) {
        return res.cc(err)
    }
    //身份认证接口
    if(err.name==="UnAuthorizedError"){
        return res.cc('身份认证失败')
    }
    // 未知的错误
    res.cc(err)
})

app.use('/uploads',express.static('./uploads'))

app.listen(3007, () => {
    console.log("api server running at 127.0.0.1:3007")
})