import { Router } from "express";
import {
  addTask,
  fetchTasks,
  fetchUsers,
  updateTask,
  deleteTask,
  fetchStatusTasksAdmin,
  fetchAdminAssignedTasks,
  SpecificTask
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

export default router;
