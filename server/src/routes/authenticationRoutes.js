import express from 'express'
import authenticationController from '../controllers/authenticationController.js'

const router = express.Router()

//Login to the app
router.post('/login', authenticationController.login)

//Register
router.post('/register', authenticationController.register)

router.get('/logout', authenticationController.logout)

export default router
