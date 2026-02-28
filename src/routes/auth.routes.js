import express from "express"
import { login, signup } from "../controllers/auth.controller.js"
export const _route = express.Router()
_route.post("/signup", signup)
_route.post("/login", login)