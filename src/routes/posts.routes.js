import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createPost,
  getFeed,
  likePost,
  addComment,
  getPostComments,
  deletePost,
  unlikePost,
  deleteComment,
  updatePost
} from "../controllers/posts.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createPost);
router.get("/feed", getFeed); 
router.post("/:postId/like", likePost); 
router.post("/:postId/comment", addComment); 
router.delete("/:postId/uncomment",deleteComment)
router.get("/:postId/comments", getPostComments); 
router.delete("/:postId/unlike", unlikePost);
router.put("/:postId", updatePost)
router.delete("/:postId", deletePost);


export default router;
