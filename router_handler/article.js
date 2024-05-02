const db = require('../db/index')
const {boolean} = require("joi");

exports.updateCollections = (req, res) => {
    const articleInfo = req.body
    data = {
        target: null
    }
    if (articleInfo.type == 1) {
        sql = 'insert into tt_user2article(user_id,article_id) values(?,?)'
        db.query(sql, [req.user.id, articleInfo.target], (err, result) => {
            if (err) {
                return res.cc(err)
            }
            if (result.affectedRows === 1) {
                data.target = articleInfo.target
                return res.send({
                    status: 0, message: '收藏文章成功', data: data
                })
            }
        })
    }
    if (articleInfo.type == 0) {
        sql = 'delete from tt_user2article where user_id=? and article_id=?'
        db.query(sql, [req.user.id, articleInfo.target], (err, result) => {
            if (err) {
                return res.cc(err)
            }
            if (result.affectedRows == 1) {
                data.target = articleInfo.target
                return res.send({
                    status: 0, message: '取消文章收藏成功', data: data
                })
            } else {
                res.cc('操作失败')
            }

        })

    }

}

exports.getCollections = (req, res) => {
    data = {
        per_page: 2, page: 1, results: []
    }
    if (req.query.per_page && req.query.page) {
        data.per_page = req.query.per_page
        data.page = req.query.page
    }
    let sql_exe1 = new Promise(resolve => {
        sql = `select a.id                                                                    as art_id,
                      a.title,
                      a.auth_id,
                      u.name,
                      (select count(1) from tt_comment where a.id = article_id)               as comm_count,
                      pubdate,
                      cover_1,
                      cover_2,
                      cover_3,
                      (select count(1) from tt_islike where like_id = a.id and like_type = 0) as like_count,
                      (select count(1) from tt_user2article where article_id = a.id)          as collect_count,
                      (select count(1)
                       from tt_islike
                       where like_id = a.id
                         and like_type = 0
                         and user_id = ua.user_id)                                            as is_liking
               from tt_user2article ua
                        inner join tt_article a on ua.article_id = a.id
                        inner join tt_user u on a.auth_id = u.id
               where ua.user_id = ? limit ${(data.page - 1) * data.per_page}
                   , ${data.per_page}`
        db.query(sql, [req.user.id], (err, result) => {
            if (err) {
                return res.cc(err)
            }
            data.results = result
            resolve()
        })
    })
    sql_exe1.then(() => {
        data.results.forEach((item, index) => {
            let cover = {
                images: []
            }
            if (!item.cover_1) {
                cover.type = 0
            } else if (item.cover_3) {
                cover.type = 3
                cover.images.push(item.cover_1)
                cover.images.push(item.cover_2)
                cover.images.push(item.cover_3)
            } else {
                cover.type = 1
                cover.images.push(item.cover_1)
            }
            item.cover = cover
            delete item.cover_1
            delete item.cover_2
            delete item.cover_3

        })
        sql = 'select count(1) as res from tt_user2article where user_id =?'
        db.query(sql, req.user.id, (err, result) => {
            if (err) {
                return res.cc(err)
            }
            data.totle_count = result[0].res
            return res.send({
                status: 0, message: '获取用户收藏文章列表成功', data: data
            })

        })
    })

}

exports.updateLikings = (req, res) => {
    data = {}
    if (req.body.type == 1) {
        sql = 'insert into tt_islike(user_id,like_type,like_id) values (?,?,?)'
        db.query(sql, [req.user.id, req.body.like_type, req.body.target], (err, result) => {
            if (err) {
                return res.cc(err)
            }
            if (result.affectedRows == 1) {
                data.target = req.body.target
                return res.send({
                    status: 0, message: '点赞成功', data: data
                })
            } else {
                res.cc('点赞失败')
            }
        })
    }
    if (req.body.type == 0) {
        sql = 'delete from tt_islike where user_id=? and like_type=? and like_id=?'
        db.query(sql, [req.user.id, req.body.like_type, req.body.target], (err, result) => {
            if (err) {
                res.cc(err)
            }
            if (result.affectedRows == 1) {
                data.target = req.body.target
                res.send({
                    status: 0, message: '取消点赞成功', data: data
                })
            } else {
                res.cc('取消点赞失败')
            }
        })
    }
}

exports.addComments = (req, res) => {
    data = {}
    sql = null
    if (req.body.art_id) {
        sql = 'insert into tt_comment(content,user_id,pubdat,article_id,is_top,comment_id) values(?,?,NOW(),?,"0",?)'
        db.query(sql, [req.body.content, req.user.id, req.body.art_id, req.body.target], (err, result) => {
            if (err) {
                return res.cc(err)
            }
            if (result.affectedRows == 1) {
                data.com_id = result.insertId
                data.target = req.body.target
                data.art_id = req.body.art_id
                res.send({
                    status: 0, message: '回复评论成功', data: data
                })
            } else {
                res.cc('添加评论失败')
            }
        })
    } else {
        sql = 'insert into tt_comment(content,user_id,pubdat,article_id,is_top,comment_id) values(?,?,NOW(),?,"0",0)'
        db.query(sql, [req.body.content, req.user.id, req.body.target], (err, result) => {
            if (err) {
                return res.cc(err)
            }
            if (result.affectedRows == 1) {
                data.com_id = result.insertId
                data.target = req.body.target
                data.art_id = req.body.target
                res.send({
                    status: 0, message: '添加文章评论成功', data: data
                })
            } else {
                res.cc('添加文章评论失败')
            }
        })
    }
}

exports.getComments = (req, res) => {
    data = {}
    let isFirstPage = false
    if (req.query.type === 'a') {
        req.query.type = 0
    }
    if (req.query.type === 'c') {
        req.query.type = 1
    }

    const sql_exe1 = new Promise((resolve) => {
        let sql = ''
        if (req.query.type === 0) {
            sql = `select id
                   from tt_comment
                   where article_id = ?
                   order by id asc`

        } else {
            sql = `select id
                   from tt_comment
                   where comment_id = ?
                   order by id asc`
        }
        db.query(sql, [req.query.source], (err, result) => {
            if (err) {
                return res.cc(err)
            }
            if (result.length >= 1) {
                data.end_id = result[0].id //结束id为第一条数据的id值
                if (!req.query.offset) {
                    //如果没有offset,默认为最新id,并且为第一页
                    req.query.offset = result[result.length - 1].id
                    isFirstPage = true
                }
                data.totle_count = result.length
            } else {
                //如果没有数据
                data.end_id = null
                data.totle_count = 0
            }
            resolve()
        })

    })
    sql_exe1.then(() => {
        sql = ''
        if (data.end_id && (req.query.offset >= data.end_id)) {
            if (!req.query.limit) {
                req.query.limit = 5
            }
            if (req.query.type == 0) {
                sql = `select c.id                                                      as com_id,
                              c.user_id                                                 as aut_id,
                              u.name                                                    as aut_name,
                              u.photo                                                   as aut_photo,
                              (select count(1)
                               from tt_islike
                               where like_id = c.id
                                 and like_type = 1)                                     as like_count,
                              (select count(1) from tt_comment where comment_id = c.id) as reply_count,
                              c.pubdat,
                              c.content,
                              c.is_top,
                              (select count(1)
                               from tt_islike
                               where user_id = ?
                                 and like_type = 1
                                 and like_id = c.id)                                    as is_liking

                       from tt_comment c
                                inner join tt_user u on c.user_id = u.id
                       where c.article_id = ?
                         and c.id <= ? and c.comment_id = 0
                       order by c.id desc limit ?
                `
            } else {
                sql = `select c.id                                                      as com_id,
                              c.user_id                                                 as aut_id,
                              u.name                                                    as aut_name,
                              u.photo                                                   as aut_photo,
                              (select count(1)
                               from tt_islike
                               where like_id = c.id
                                 and like_type = 1)                                     as like_count,
                              (select count(1) from tt_comment where comment_id = c.id) as reply_count,
                              c.pubdat,
                              c.content,
                              c.is_top,
                              (select count(1)
                               from tt_islike
                               where user_id = ?
                                 and like_type = 1
                                 and like_id = c.id)                                    as is_liking
                       from tt_comment c
                                inner join tt_user u on c.user_id = u.id
                       where c.comment_id = ?
                         and c.id <= ?
                       order by c.id desc limit ?
                `
            }
            db.query(sql, [req.user.id, req.query.source, req.query.offset, req.query.limit], (err, result) => {
                if (err) {
                    return res.cc(err)
                }
                data.last_id = result[result.length - 1].com_id
                //处理分页，如果不是第一页，则删除第一个元素
                if (!isFirstPage) {
                    result.shift()
                }

                result.forEach((item, index) => {
                    if (item.is_liking == 0) {
                        item.is_liking = false
                    } else {
                        item.is_liking = true
                    }
                    if (item.is_top == '1') {
                        result.splice(index, 1);
                        result.unshift(item)
                    }
                })
                data.results = result
                // console.log(result)

                return res.send({
                    status: 0, message: '获取评论信息成功', data: data
                })

            })
        }else{
            return res.send({
                status:0,
                message:'评论信息列表为空',
                data:data
            })
        }


    })
}

exports.getComment = (req, res) => {
    data = {}
    sql = `select c.id                                                      as com_id,
                  c.user_id                                                 as aut_id,
                  u.name                                                    as aut_name,
                  u.photo                                                   as aut_photo,
                  (select count(1) from tt_comment where comment_id = c.id) as reply_count,
                  c.pubdat,
                  c.content
           from tt_comment c
                    left join tt_user u
                              on c.user_id = u.id
           where c.id = ?`
    db.query(sql,[req.query.target],(err,result)=>{
        if(err){
            return res.cc(err)
        }
        if(result.length>0){
            data=result[0]
            res.send({
                status:0,
                message:'获取指定评论成功',
                data: data
                }
            )
        }else{
            return res.cc('没有找到相关记录')
        }
    })
}

exports.getCommentsCount = (req, res) => {
    data = {}
    sql = 'select count(1) as c_count from tt_comment where article_id=?'
    db.query(sql, [req.query.target], (err, result) => {
        if (err) {
            return res.cc(err)
        }
        data.count = result[0].c_count
        res.send({
            status: 0,
            message: '获取评论数量成功',
            data: data
        })
    })
}
exports.getArticles = (req, res) => {
    console.log('获取文章列表')
    data = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        per_page: req.query.per_page ? parseInt(req.query.per_page) : 2
    }
    const sql_exe1 = new Promise((resolve) => {
        sql = `select a.id                                                                    as art_id,
                      a.title,
                      u.id                                                                    as aut_id,
                      u.name                                                                  as aut_name,
                      (select count(1) from tt_comment where article_id = a.id)               as comm_count,
                      a.pubdate,
                      cover_1,
                      cover_2,
                      cover_3,
                      (select count(1) from tt_islike where like_type = 0 and like_id = a.id) as like_count,
                      (select count(1) from tt_user2article where article_id = a.id)          as collect_count,
                      (select count(1)
                       from tt_islike
                       where like_type = 0
                         and like_id = a.id
                         and user_id = u.id)                                                  as is_liking
               from tt_article a
                        join tt_user u on a.auth_id = u.id
               where a.auth_id = ? limit ${data.per_page * (data.page - 1)}
                   , ${data.per_page}`
        db.query(sql, [req.params.user_id], (err, result) => {
            if (err) {
                res.cc(err)
            }
            data.results = result
            resolve()
        })
    })
    sql_exe1.then(() => {
        data.results.forEach((item, index) => {
            let cover = {images: []}
            if (item.is_liking == 1) {
                item.is_liking = true
            } else {
                item.is_liking = false
            }
            if (!item.cover_1) {
                cover.type = 0

            } else if (item.cover_3) {
                cover.type = 3
                cover.images.push(item.cover_1)
                cover.images.push(item.cover_2)
                cover.images.push(item.cover_3)

            } else {
                cover.type = 1
                cover.images.push(item.cover_1)
            }
            delete item.cover_1
            delete item.cover_2
            delete item.cover_3
            item.cover = cover

        })
        sql = 'select count(1) as total_count from tt_article a where a.auth_id=?'
        db.query(sql, [req.params.user_id], (err, result) => {
            if (err) {
                return res.cc(err)
            }
            data.totle_count = result[0].total_count
            return res.send({
                status: 0, message: '获取用户文章列表成功', data: data
            })
        })

    })
}

exports.getChannelArticles = async (req, res) => {
    console.log('获取频道文章列表')
    data = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        per_page: req.query.per_page ? parseInt(req.query.per_page) : 2
    }
    //如果没有now_id,则查询最新的文章id并赋值,如果没有文章,则为0
    if (req.query.now_id === undefined) {
        await new Promise((resolve, reject) => {
            sql = 'select a.id from tt_article a order by id desc'
            db.query(sql, [], (err, result) => {
                if (err) {
                    res.cc(err)
                    reject(err)
                }
                if (result.length > 0) {
                    req.query.now_id = result[0].id
                } else {
                    req.query.now_id = 0
                }
                resolve()
            })
        })
    }
    const sql_exe1 = new Promise((resolve) => {
        sql = `select a.id                                                      as art_id,
                      a.title,
                      u.id                                                      as aut_id,
                      u.name                                                    as aut_name,
                      (select count(1) from tt_comment where article_id = a.id) as comm_count,
                      a.pubdate,
                      cover_1,
                      cover_2,
                      cover_3
               from tt_article a
                        join tt_user u on a.auth_id = u.id
               where a.channel_id = ?
                 and a.id <= ?
               order by a.id desc limit ${data.per_page * (data.page - 1)}
                      , ${data.per_page}`
        db.query(sql, [req.query.channel, req.query.now_id], (err, result) => {
            if (err) {
                res.cc(err)
            }
            data.results = result
            resolve()
        })
    })
    sql_exe1.then(async () => {
        data.results.forEach((item, index) => {
            let cover = {images: []}
            if (!item.cover_1) {
                cover.type = 0

            } else if (item.cover_3) {
                cover.type = 3
                cover.images.push(item.cover_1)
                cover.images.push(item.cover_2)
                cover.images.push(item.cover_3)

            } else {
                cover.type = 1
                cover.images.push(item.cover_1)
            }
            delete item.cover_1
            delete item.cover_2
            delete item.cover_3
            item.cover = cover

        })
        await new Promise(resolve => {
            sql = 'select count(1) as total_count from tt_article a where a.channel_id=?'
            db.query(sql, [req.query.channel], (err, result) => {
                if (err) {
                    return res.cc(err)
                }
                data.total_count = result[0].total_count
                //如果查询结果>1,则将最后一个文章的id赋值为now_id;如果无查询结果,now_id=0
                if (data.results.length >= 1) {
                    data.now_id = data.results[data.results.length - 1].art_id - 1
                } else {
                    data.now_id = 0
                }
                resolve()
            })
        })
        return res.send({
            status: 0, message: '获取频道文章列表成功', data: data
        })

    })
}

exports.getArticleDetail = (req, res) => {
    console.log('文章详情')
    data = {}
    sql = `select a.id                                                                                    as art_id,
                  a.title,
                  a.pubdate,
                  a.auth_id                                                                               as aut_id,
                  u.name                                                                                  as aut_name,
                  u.photo                                                                                 as aut_photo,
                  (select count(1)
                   from tt_user2user
                   where from_user_id = ?
                     and to_user_id = u.id)                                                               as is_followed,
                  (select count(1) from tt_islike where user_id = ? and like_type = 0 and like_id = a.id) as attitude,
                  a.content,
                  (select count(1)
                   from tt_user2article
                   where user_id = ?
                     and article_id = a.id)                                                               as is_collected
           from tt_article a
                    join tt_user u on a.auth_id = u.id
           where a.id = ?`
    db.query(sql, [req.user.id, req.user.id, req.user.id, req.params.article_id], (err, result) => {
        if (err) {
            return res.cc(err)
        }
        if (result.length === 0) {
            return res.cc('资源不存在', 404)
        }
        data.results = result
        data.results.forEach((item, index) => {
            if (item.is_followed == 1) {
                item.is_followed = true
            } else {
                item.is_followed = false
            }
            if (item.attitude == 1) {
                item.attitude = true
            } else {
                item.attitude = false
            }
            if (item.is_collected == 1) {
                item.is_collected = true
            } else {
                item.is_collected = false
            }

        })
        res.send({
            status: 0,
            message: '获取文章详细信息成功',
            data: data
        })
    })
}

exports.searchArticles = (req, res) => {
    console.log('搜索文章')
    const data = {}
    sql = "select id,title from tt_article where title like ? order by id desc "
    db.query(sql, [`%${req.query.keys}%`], (err, result) => {
        if (err) {
            res.cc(err)
        }
        // console.log(result)
        data.result = result
        res.send({
            status: 0,
            message: '获取搜索列表成功',
            data: data
        })
    })
}