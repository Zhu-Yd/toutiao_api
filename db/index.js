const mysql=require("mysql")
const db=mysql.createPool({
    host:"192.168.1.66",
    user:"Ddshop",
    password:"Ss910219@",
    database:"bigevent"
})

module.exports=db