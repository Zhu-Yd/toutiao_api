const express = require('express')
const app = express()
const joi = require("joi")
//解决跨域问题
const cors = require('cors')
app.use(cors())
const config = require("./config")
//jwt身份认证模块
const expressJWT = require("express-jwt")
const jwt = require('jsonwebtoken')

//解析表单数据 只能解析 application/www-x-form-urlencoded 的数据
app.use(express.urlencoded({extended: false}))
// 使用中间件解析 JSON
app.use(express.json());
//封装res.cc 响应返回结果
app.use((req, res, next) => {
    res.cc = function (err, status = 500) {
        res.status(status).send({
            // status: status,
            error: 'Internal Server Error',
            message: err instanceof Error ? err.message : err
        })

    }
    next()
})

// app.use(expressJWT({secret: config.jwtSecretKey}).unless({path: [/^\/app\//,/^\/uploads\//,/^\/article\/articles/]}))
// 自定义中间件进行 JWT 解析
function jwtMiddleware(req, res, next) {
    const token = req.headers.authorization;
    // 获取请求路径并存储在 req.path 中
    const requestPath = req.path;

    let flag = true // 白名单控制标志
    // 正则表达式数组 排除路径 如果请求路径存在于白名单中，直接放行并返回
    const regexArray = [/^\/app\//, /^\/uploads\//, /^\/channel\//, /^\/article\/articles/];
    // 使用 some() 方法检查字符串是否与数组中的任何一个正则表达式匹配
    const isMatched = regexArray.some(regex => regex.test(requestPath));
    if (isMatched) {
        if (!token) {
            return next()
        } else {
            flag = false // 如果有token,白名单控制标志设为false,尝试解码
        }

    }

    if (token) {
        // 执行 JWT 解析并将解析后的用户信息存储在 req.user 中
        jwt.verify(token, config.jwtSecretKey, (err, decoded) => {
            if (err && flag) {
                //如果解码出错 and 白名单标志为true（表示该路由不属于白名单但是token错误）返回错误
                return res.status(401).json({message: 'Token is not valid'});
            } else {
                //如果能正确解码,设置user;如果不能,什么都不做
                if (!err) {
                    req.user = decoded;
                }
                next();
            }
        });
    } else {
        // console.log(requestPath);
        // return res.status(401).json({message: 'No token, authorization denied'});
        return res.cc('No token, authorization denied', 401)

    }
}

// 在应用中使用自定义中间件进行 JWT 解析
app.use(jwtMiddleware);
//配置路由
const appRouter = require("./router/app")
app.use('/app', appRouter)
const userRouter = require("./router/user")
app.use('/user', userRouter)
const channelRouter = require("./router/channel")
app.use('/channel', channelRouter)
const articleRouter = require("./router/article")
app.use('/article', articleRouter)

// 定义错误级别的中间件
app.use((err, req, res, next) => {
    // 验证失败导致的错误
    if (err instanceof joi.ValidationError) {
        return res.cc(err, 400)
    }
    //身份认证异常
    if (err.name === "UnauthorizedError") {
        return res.cc('身份认证异常', 401)
    }
    // 未知的错误
    res.cc(err)
})

app.use('/uploads', express.static('./uploads'))

app.listen(3007, () => {
    console.log("api server running at 127.0.0.1:3007")
})