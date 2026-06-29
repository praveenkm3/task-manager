import { Router } from "express";
import { fetchTasks,updateTask,fetchStatusTasks ,fetchAdminCreatedTasks} from "../controllers/userController.ts";


const router=Router();

router.get('/fetch-tasks',fetchTasks);
router.get('/fetch-tasks/:id',fetchTasks);
router.patch('/update-task/',updateTask);
router.get('/fetch-tasks-status',fetchStatusTasks);
router.get('/fetch-tasks-admin',fetchAdminCreatedTasks);
export default router;
