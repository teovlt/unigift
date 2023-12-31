import mongoose from 'mongoose'
import User from '../models/UserModel.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const generateAccessToken = (req, res) => {
  return jwt.sign({ id: req.body }, process.env.SECRET_ACCESS_TOKEN, { expiresIn: '30d' })
}

const register = async (req, res) => {
  const { email, username, password } = req.body
  if (!username || !email || !password) {
    return res.status(404).json({ error: 'Missing fields' })
  }

  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ error: 'This email is already taken' })
    } else if (await User.findOne({ username })) {
      return res.status(400).json({ error: 'This username is already taken' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({ email: email, username: username, password: hashedPassword })
    const accessToken = generateAccessToken(user._id)

    res.cookie('__access__token', accessToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    })

    res.status(200).json({ user: user, accessToken: accessToken })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const login = async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(404).json({ error: 'Missing fields' })
  }

  try {
    const user = await User.findOne({ username })

    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken = generateAccessToken(user._id)

      res.cookie('__access__token', accessToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      })
      res.status(200).json({ user: user, accessToken: accessToken })
    } else {
      res.status(400).json({ error: 'Invalid credentials' })
    }
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const logout = async (req, res) => {
  try {
    res.clearCookie('__access__token')
    res.status(200).json({ message: 'Signed out succesfully' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

export default {
  login,
  register,
  logout,
}
