import { Router } from "express";
import { fetchTasks,updateTask } from "../controllers/userController.ts";


const router=Router();

router.get('/fetch-tasks',fetchTasks);
router.get('/fetch-tasks/:id',fetchTasks)
router.patch('/update-task/',updateTask)
export default router;
