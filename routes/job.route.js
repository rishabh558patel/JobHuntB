import express from "express";
import { postJob } from "../controllers/job.controller.js";
import {
  getAdminJobs,
  getAllJobs,
  getJobById,
} from "../controllers/job.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { updateJob } from "../controllers/job.controller.js"; // Make sure this exists


const router = express.Router();

router.route("/post").post(isAuthenticated, postJob);
router.route("/get").get(isAuthenticated, getAllJobs);
router.route("/getAdminJobs").get(isAuthenticated, getAdminJobs);
router.route("/get/:id").get(isAuthenticated, getJobById);
router.route("/update/:id").put(isAuthenticated, updateJob); // Add this

export default router;

