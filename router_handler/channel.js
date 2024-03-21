const db = require('../db/index')

//获取用户频道列表
exports.channels = (req, res) => {
    data = {
        channels: []
    }
    sql = 'select c.id,c.name from tt_user2channel u2c join tt_channel c on u2c.channel_id = c.id where u2c.user_id=? order by u2c.seq,c.id'
    db.query(sql, req.user.id, (err, result) => {
        if (err) {
            return res.cc(err)
        }
        if (result.length > 0) {
            data.channels = result
        } else {
            data.channels = [{id: 1, name: '新闻', seq: 1}, {id: 2, name: '财经', seq: 2}, {id: 3, name: '科技', seq: 3}]
        }
        res.send({
            status: 0,
            message: '获取频道列表成功',
            data: data
        })
    })

}

exports.update = (req, res) => {
    data = {
        channels: []
    }
    channels = req.body.channels
    let sql_exe1 = new Promise(resolve => {
        sql1 = 'delete from tt_user2channel where user_id=?'
        db.query(sql1, req.user.id, (err, result) => {
            if (err) {
                return res.cc(err)
            }
            resolve()
        })
    })
    sql_exe1.then(() => {
        let sql_exe2 = new Promise(resolve => {
            sql2 = "insert into tt_user2channel(user_id,channel_id,seq) values ?"
            const new_channels = channels.map(obj => [req.user.id, obj.id, obj.seq])
            db.query(sql2, [new_channels], (err, result) => {
                if (err) {
                    return res.cc(err)
                }
                resolve()
            })
        })
        sql_exe2.then(()=>{
            sql3='select channel_id,seq from tt_user2channel where user_id=?'
            db.query(sql3,[req.user.id],(err,result)=>{
                if(err){
                    return res.cc(err)
                }
                if(result.length>0){
                    data.channels=result
                }
                return res.send({
                    status: 0,
                    message: '更改用户频道信息成功',
                    data:data
                })
            })
        })
    })
}

