import express from "express";
import { 
  createComment, 
  getPostComments, 
  approveComment, 
  deleteComment 
} from "../controllers/commentController.js";

const router = express.Router();

router.post("/", createComment);
router.get("/post/:postId", getPostComments);
router.patch("/:id/approve", approveComment); 
router.delete("/:id", deleteComment);

export default router;