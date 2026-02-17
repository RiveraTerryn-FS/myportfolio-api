import express from "express";
import {
    getAllUsers,
    getUser,
    editUser,
    deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/", getUser);
router.put("/:userId", editUser);
router.delete("/:userId", deleteUser);

export default router;