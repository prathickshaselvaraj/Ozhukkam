import { Router } from "express";
import {
  listHabits,
  createHabit,
  setHabitLog,
  updateHabit,
  deleteHabit
} from "../controllers/habits.controller.js";
import auth from "../middleware/auth.js";

const router = Router();

router.use(auth);

router.get("/", listHabits);
router.post("/", createHabit);
router.put("/:id/log", setHabitLog);
router.put("/:id", updateHabit);
router.delete("/:id", deleteHabit);

export default router;