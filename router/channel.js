const express = require('express')
const router = express.Router()
const Handler = require("../router_handler/channel")


router.get("/channels", Handler.channels)

router.get("/getAllChannels",Handler.getAllChannels)

router.put("/channels",Handler.update)


module.exports = router