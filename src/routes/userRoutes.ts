import { Router } from "express";
import {
  fetchTasks,
  updateTask,
  fetchStatusTasks,
  fetchAdminCreatedTasks,
  SpecificTask,
  fetchPriorityCount,
  fetchDates
} from "../controllers/userController.ts";

const router = Router();

router.post("/fetch-tasks", fetchTasks);
router.get("/fetch-tasks/:id", fetchTasks);
router.get("/fetch-specific-task/:id", SpecificTask);
router.patch("/update-task/", updateTask);
router.get("/fetch-tasks-status", fetchStatusTasks);
router.get("/fetch-tasks-admin", fetchAdminCreatedTasks);
router.get("/fetch-priority-count", fetchPriorityCount);
router.get("/fetch-dates", fetchDates);


export default router;
