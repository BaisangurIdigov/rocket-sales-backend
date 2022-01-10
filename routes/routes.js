const { controller } = require("../controllers/controller")
const { Router } = require("express")
const router = Router()

router.get("/api/leads", controller.dataOutput)

module.exports = router
