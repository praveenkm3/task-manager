import { Router } from "express";
import {
  addTask,
  fetchTasks,
  fetchUsers,
  updateTask,
  deleteTask,
  fetchStatusTasksAdmin,
  fetchAdminAssignedTasks,
  SpecificTask,
  fetchPriorityCount,
  fetchDates
} from "../controllers/adminController.ts";
const router = Router();

router.post("/add-task", addTask);
router.post("/fetch-tasks", fetchTasks);
router.get("/fetch-specific-task/:id", SpecificTask);
router.get("/fetch-users", fetchUsers);
router.put("/update-task", updateTask);
router.delete("/delete-task", deleteTask);
router.get("/fetch-tasks-status", fetchStatusTasksAdmin);
router.get("/fetch-tasks-user", fetchAdminAssignedTasks);
router.get("/fetch-priority-count", fetchPriorityCount);
router.get("/fetch-dates", fetchDates);

export default router;
