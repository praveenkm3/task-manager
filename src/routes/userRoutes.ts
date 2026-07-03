import { Router } from "express";
import {
  fetchTasks,
  updateTask,
  fetchStatusTasks,
  fetchAdminCreatedTasks,
  fetchTasksLength,
  SpecificTask,
} from "../controllers/userController.ts";

const router = Router();

router.post("/fetch-tasks", fetchTasks);
router.get("/fetch-tasks/:id", fetchTasks);
router.get("/fetch-specific-task/:id", SpecificTask);
router.get("/fetch-tasks-length", fetchTasksLength);
router.patch("/update-task/", updateTask);
router.get("/fetch-tasks-status", fetchStatusTasks);
router.get("/fetch-tasks-admin", fetchAdminCreatedTasks);
export default router;
