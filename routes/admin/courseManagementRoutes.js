import express from "express";
import { getCourses, deleteCourseById } from "../../controllers/admin/courseManagementController.js";

const router = express.Router();

router.get("/", getCourses); 
router.delete("/:id", deleteCourseById); 

export default router;
