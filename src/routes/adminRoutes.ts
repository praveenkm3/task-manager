import { Router } from "express";
import { addTask,fetchTasks,fetchUsers,updateTask,deleteTask} from "../controllers/adminController.ts";
const router=Router();

router.post('/add-task',addTask);
router.get('/fetch-tasks',fetchTasks);
router.get('/fetch-tasks/:id',fetchTasks);
router.get('/fetch-users',fetchUsers);
router.put('/update-task',updateTask);
router.delete('/delete-task',deleteTask);

export default router;
