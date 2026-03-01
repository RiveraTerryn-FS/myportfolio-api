import express from "express";
import { authenticateToken, isAdmin } from "../middleware/authenticate.js";
import {
  getUsers,
  deleteUser,
  restoreUser,
  updateUser
} from "../controllers/adminController.js";

const router = express.Router();

router.use(authenticateToken, isAdmin);

router.get("/users", getUsers);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/restore", restoreUser);

export default router;