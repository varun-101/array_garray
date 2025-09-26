import { Router } from "express";
import { createMentor, getMentors, getMentorById, loginMentor } from "../controllers/mentorController.js";

const router = Router();

router.post("/", createMentor);
router.post("/login", loginMentor);
router.get("/", getMentors);
router.get("/:id", getMentorById);

export default router;
