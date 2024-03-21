const {createClient} = require('redis');
const Redis = require('ioredis')

exports.createClientPromise = () => {
    return new Promise((resolve, reject) => {
        try {
            const client = createClient({
                url: "redis://:zyd910219@192.168.1.66:6379/0"
            }).connect();

            // 在 'ready' 事件触发时，表示连接准备就绪
            resolve(client)
        } catch (error) {
            console.error('Error :', error)
            reject(error)
        }

    })
}

exports.ioReids = new Redis({
    port: 6379, // Redis port
    host: "192.168.1.66", // Redis host
    //username: "default", // needs Redis >= 6
    password: "zyd910219",
    db: 0, // Defaults to 0
})
// 导出 Promise，确保在调用时可以等待连接准备就绪
// module.exports = ioReids