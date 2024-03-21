const db = require("../db/index")
// const clientPromise = require("../db/redis")
const redis = require("../db/redis")
const path = require("path")
//获取用户信息
exports.profile = (req, res) => {
    const userInfo = req.user
    sql = 'select * from tt_user as u join tt_user_info as ui on u.id=ui.user_id where u.id=?'
    db.query(sql, userInfo.id, (err, result) => {
        if (err) {
            return res.cc(err)
        }
        if (result.length == 1) {
            return res.send({
                'status': 0, 'message': '获取用户信息成功', 'data': result[0],
            })
        } else {
            return res.cc('获取用户信息失败')
        }
    })

}

//获取指定用户信息
exports.userInfo = (req, res) => {
    let data = {}
    const sql_exe1 = new Promise((resolve) => {
        sql = `select u.id,
                      u.name,
                      u.photo,
                      ui.intro,
                      (select count(1) from tt_user2user uu where uu.from_user_id = u.id) as follow_count,
                      (select count(1) from tt_user2user uu where uu.to_user_id = u.id)   as fans_count,
                      (select count(1) from tt_article a where a.auth_id = u.id)          as art_count,
                      (select count(1)
                       from tt_islike l
                                inner join tt_article a on l.like_id = a.id
                                inner join tt_user uu on a.auth_id = uu.id
                       where uu.id = u.id
                         and l.like_type = 0)                                             as a_like_count,
                      (select count(1)
                       from tt_islike l
                                inner join tt_comment c on l.like_id = c.id
                                inner join tt_user uu on c.user_id = uu.id
                       where uu.id = u.id
                         and l.like_type = 1)                                             as c_like_count
               from tt_user u
                        left join tt_user_info ui
                                  on u.id = ui.user_id
               where u.id = ?`
        db.query(sql, [req.params.to_user_id], (err, result) => {
            if (err) {
                return res.cc(err)
            }
            if (result.length === 1) {
                data = result[0]
                data.like_count = data.a_like_count + data.c_like_count
                delete data.a_like_count
                delete data.c_like_count
            }
            resolve()
        })
    })
    sql_exe1.then(() => {
        res.send(
            {
                status: 0,
                message: '获取指定用户信息成功',
                data: data
            }
        )

    })

}

//更新用户信息
exports.update = (req, res) => {
    let user_info = {...req.body}
    if (req.files.id_card_front) {
        user_info.id_card_front = path.join('/uploads', req.files.id_card_front[0].filename + '.jpg')
    }
    if (req.files.id_card_back) {
        user_info.id_card_back = path.join('/uploads', req.files.id_card_back[0].filename + '.jpg')
    }
    if (req.files.id_card_handheld) {
        user_info.id_card_handheld = path.join('/uploads', req.files.id_card_handheld[0].filename + '.jpg')
    }
    console.log(user_info)
    sql = 'update tt_user u join tt_user_info ui on u.id=ui.user_id set ? where u.id=?'
    db.query(sql, [user_info, req.user.id], (err, result) => {
        if (err) {
            return res.cc(err)
        }
        res.send({
            status: 0, message: '更新信息成功',
        })
    })
}

//关注用户
exports.followings = (req, res) => {
    sql = 'insert into tt_user2user(from_user_id,to_user_id) values (?,?)'
    db.query(sql, [req.user.id, req.body.to_user_id], (err, result) => {
        if (err) {
            return res.cc(err)
        }
        if (result.affectedRows === 1) {
            return res.send({
                status: 0, message: '关注用户成功', data: {
                    target: req.body.to_user_id
                }
            })
        }

    })

}

//取消关注用户
exports.unfollowings = (req, res) => {
    sql = 'delete from tt_user2user where from_user_id=? and to_user_id=?'
    db.query(sql, [req.user.id, req.params.to_user_id], (err, result) => {
        if (err) {
            return res.cc(err)
        }
        if (result.affectedRows === 1) {
            return res.send({
                status: 0, message: '取消关注用户成功'
            })
        } else {
            return res.cc('取消关注用户失败')
        }
    })
}

//获取关注用户列表
exports.tofollowings = (req, res) => {
    let data = {
        per_page: null, page: null, results: []
    }

    let sql_exe1 = new Promise(resolve => {
        sql = 'select count(to_user_id) as res from tt_user2user where from_user_id=?'
        db.query(sql, req.user.id, (err, result) => {
            if (err) {
                return res.cc(err)
            }
            data.total_count = result[0].res
            resolve()
        })
    });
    sql_exe1.then(() => {
        let sql_exe2 = new Promise(resolve => {
            sql2 = 'select u.id,u.name,u.photo from tt_user2user uu join tt_user u on uu.to_user_id=u.id where uu.from_user_id=? '
            if (req.query.page && req.query.per_page) {
                sql2 += `limit ${(req.query.page - 1) * req.query.per_page},${req.query.per_page}`
                data.page = req.query.page
                data.per_page = req.query.per_page
            }
            db.query(sql2, req.user.id, (err, result) => {
                if (err) {
                    return res.cc(err)
                }
                data.results = result
                resolve()

            })


        })
        sql_exe2.then(() => {
            data.results.forEach((item, index) => {
                let sql_exe3 = new Promise(resolve => {
                    sql3 = 'select 1 from tt_user2user where from_user_id=? and to_user_id=?'
                    db.query(sql3, [item.id, req.user.id], (err, result) => {
                        if (err) {
                            res.cc(err)
                        }
                        if (result.length === 1) {
                            item.mutual_follow = true
                        } else {
                            item.mutual_follow = false
                        }
                        resolve()
                    })
                })
                sql_exe3.then(() => {
                    sql4 = "select count(from_user_id) as res from tt_user2user where to_user_id=?"
                    db.query(sql4, data.results[index].id, (err, result) => {
                        if (err) {
                            return res.cc(err)
                        }
                        data.results[index].fans_count = result[0].res
                        if (index == data.results.length - 1) {
                            return res.send({
                                stasus: 0, message: '获取关注用户列表成功', data: data
                            })
                        }
                    })

                })

            })
        })
    })


}

//获取用户粉丝列表
exports.followers = (req, res) => {
    let data = {
        per_page: null, page: null, results: []
    }
    let exe_sql1 = new Promise(resolve => {
        sql1 = 'select count(1) as res from tt_user2user where to_user_id=?'
        db.query(sql1, req.user.id, (err, result) => {
            if (err) {
                return res.cc(err)
            }
            data.totle_count = result[0].res
            resolve()
        })
    })
    exe_sql1.then(() => {
        let exe_sql2 = new Promise(resolve => {
            sql2 = 'select id,name,photo from tt_user2user uu join tt_user u on uu.from_user_id=u.id where to_user_id=? '
            if (req.query.page && req.query.per_page) {
                sql2 += `limit ${(req.query.page - 1) * req.query.per_page},${req.query.per_page}`
                data.page = req.query.page
                data.per_page = req.query.per_page
            }
            db.query(sql2, req.user.id, (err, result) => {
                if (err) {
                    return res.cc(err)
                }
                data.results = result
                resolve()
            })
        })
        exe_sql2.then(() => {
            data.results.forEach((item, index) => {

                let exe_sql3 = new Promise(resolve => {
                    sql3 = 'select count(1) as res from tt_user2user where to_user_id=?'
                    db.query(sql3, item.id, (err, result) => {
                        if (err) {
                            return res.cc(err)
                        }
                        item.fans_count = result[0].res
                        resolve()
                    })
                })
                exe_sql3.then(() => {
                    sql4 = 'select 1 from tt_user2user where from_user_id=? and to_user_id=?'

                    db.query(sql4, [req.user.id, item.id], (err, result) => {
                        if (err) {
                            return res.cc(err)
                        }
                        if (result.length == 1) {

                            item.mutual_follow = true
                        } else {
                            item.mutual_follow = false
                        }
                        if (index == data.results.length - 1) {
                            return res.send({
                                status: 0, message: '获取用户粉丝列表成功', data: data
                            })
                        }
                    })

                })

            })
        })
    })
}

exports.history = async (req, res) => {
    console.log('获取用户历史记录')
    const PREFIX = 'UserHistory_'
    // const client = await redis.createClientPromise()
    // let result=await client.ZRANGE(PREFIX+req.user.id,0,-1)
    let result = await redis.ioReids.zrange(PREFIX + req.user.id, 0, -1, "REV")
    res.send({
        status: 0,
        message: '获取用户历史记录成功',
        data: result
    })
    // await client.disconnect();

}
exports.addHistory = async (req, res) => {
    console.log('新增用户历史记录')
    const PREFIX = 'UserHistory_'
    const keys_in = req.body.keys
    const currentTimeStamp = Date.now()
    await redis.ioReids.zadd(PREFIX + req.user.id, currentTimeStamp, keys_in);
    res.send({
        status: 0,
        message: '添加用户搜索历史记录成功'
    })
}

exports.delHistory = async (req, res) => {
    console.log('删除用户历史记录')
    const PREFIX = 'UserHistory_'
    const keys_in = req.body.keys
    if (!keys_in) {
        await redis.ioReids.del(PREFIX + req.user.id)
        return res.send({
            status: 0,
            message: '清空用户搜索历史记录成功'
        })
    }
    await redis.ioReids.zrem(PREFIX + req.user.id,keys_in)
    return res.send({
        status: 0,
        message: '删除用户指定搜索历史记录成功'
    })
}