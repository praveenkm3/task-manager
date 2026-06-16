import { Router } from "express";
import { addTask,fetchTasks} from "../controllers/adminController.ts";
const router=Router();

router.post('/add-task',addTask);
router.get('/fetch-tasks',fetchTasks);

export default router;
