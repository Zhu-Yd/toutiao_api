const db = require("../db/index")
const jwt = require("jsonwebtoken")
const config = require("../config")

exports.login = (req, res) => {
    const userInfo = req.body
    let userinfo = {}
    db.getConnection(async (error, connection) => {
        // console.log(userInfo)
        if(error){
            return res.cc('数据库链接失败')
        }
        const {isCreat} = await new Promise(resolve => {
            const sql = `select *
                         from tt_user
                         where phone = ?`
            connection.query(sql, userInfo.mobile, (err, result) => {
                if (err) {
                    // console.log(err)
                    return res.cc(err)
                }
                let login_res = (userInfo.code == '910219' ? true : false)
                if (!login_res) {
                    return res.cc("验证码错误")
                } else {
                    if (result.length < 1) {
                        return resolve({isCreat: true})
                    } else {
                        userinfo = {...result[0], photo: "",}
                    }
                }
                const tokenStr = jwt.sign(userinfo, config.jwtSecretKey, {
                    expiresIn: config.expiresIn
                })
                // console.log(userinfo)

                return res.send({
                    status: 0,
                    message: "登录成功",
                    // token: 'Bearer ' + tokenStr
                    token:tokenStr
                })
            })
        })
        if (isCreat) {
            // createUser(userInfo.mobile, req, res)
            try {
                connection.beginTransaction()

                const {isCreated} = await new Promise((resolve, reject) => {
                    const sql = 'insert into tt_user(phone,name,birthday) values (?,?,?)'
                    connection.query(sql, [userInfo.mobile, userInfo.mobile, '1970-1-1'], (err, result) => {
                        if (err) {
                            // console.log(err)
                            connection.rollback()
                            return reject(err)
                        }
                        if (result.affectedRows === 1) {
                            return resolve({isCreated: true})
                        }
                    })
                })
                if (isCreated) {
                    const sql = 'select * from tt_user where phone=?'
                    connection.query(sql, userInfo.mobile, (err, result) => {
                        if (result.length === 1) {
                            userinfo = {...result[0], photo: ''}
                            const tokenStr = jwt.sign(userinfo, config.jwtSecretKey, {
                                expiresIn: config.expiresIn
                            })
                            connection.commit()
                            return res.send({
                                status: 0,
                                message: "登录成功",
                                token: tokenStr
                            })
                        } else {
                            connection.rollback()
                            connection.release()
                            return res.cc('登录失败')
                        }
                    })

                }

            } catch (err) {
                res.cc(err)
                connection.rollback()
                connection.release()
            }
        }
    })
}

