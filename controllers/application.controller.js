import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";

export const applyJob = async (req, res) => {
  try {
    console.log("📨 applyJob route hit");

    const userId = req.id;
    const jobId = req.params.id;

    console.log("🔐 userId:", userId);
    console.log("💼 jobId:", jobId);

    if (!jobId) {
      return res.status(400).json({
        message: "Job id is required",
        success: false,
      });
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: userId,
    });

    if (existingApplication) {
      return res.status(409).json({
        message: "You have already applied for the job",
        success: false,
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }

    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,
    });

    job.applications.push(newApplication._id);
    await job.save();

    return res.status(201).json({
      message: "Job applied successfully",
      success: true,
    });
  } catch (error) {
    console.log("❌ Error in applyJob:", error);
    return res.status(500).json({
      message: "Server error while applying for the job",
      success: false,
      error: error.message,
    });
  }
};


export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.id; //logged in user id
    const application = await Application.find({ applicant: userId })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "job",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "company",
          options: { sort: { createdAt: -1 } },
        },
      });

    if (!application) {
      return res.status(404).json({
        message: "No Application",
        success: false,
      });
    }
    return res.status(200).json({
      application,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;

    const applications = await Application.find({ job: jobId })
      .sort({ createdAt: -1 })
      .populate({
        path: "applicant",
        select: "fullname email phoneNumber profile", // ✅ INCLUDE resume from profile
      });

    console.log("✅ Applications with populated applicants:", applications);

    

    return res.status(200).json({
      totalApplicants: applications.length,
      applicants: applications,
      success: true,
    });
  } catch (error) {
    console.error("❌ Error fetching applicants:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body; //logged in user id
    const applicationId = req.params.id;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
        success: false,
      });
    }

    //find the application by application Id
    const application = await Application.findOne({ _id: applicationId });
    if (!application) {
      return res.status(404).json({
        message: "Application not found",
        success: false,
      });
    }

    //update the status
    application.status = status.toLowerCase();
    await application.save();

    return res.status(200).json({
      message: "Status updated successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateShortlistStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const application = await Application.findById(id);
    if (!application) return res.status(404).json({ error: "Not found" });

    application.status = status.toLowerCase();
    await application.save();

    console.log(`🎯 Application ${id} marked as ${status}`);
    res.status(200).json({ message: "Status updated", application });
  } catch (err) {
    console.error("❌ Error updating shortlist status:", err);
    res.status(500).json({ error: "Server error" });
  }
};
