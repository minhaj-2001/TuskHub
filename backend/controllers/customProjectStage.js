// backend/controllers/customProjectStage.js
import CustomProjectStage from "../models/customProjectStage.js";
import Project from "../models/project.js";
import User from "../models/user.js";

// Create a custom project stage
export const createCustomProjectStage = async (req, res) => {
  try {
    const { stage_name, description, project } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Only managers can create custom stages
    if (userRole !== "manager") {
      return res.status(403).json({ success: false, error: "Only managers can create custom stages" });
    }
    
    // Check if project exists and user has permission
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    
    if (projectDoc.owner.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }
    
    const newCustomStage = new CustomProjectStage({
      stage_name,
      description,
      project,
      owner: userId
    });
    
    await newCustomStage.save();
    res.status(201).json({ success: true, customStage: newCustomStage });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get custom stages for a project
export const getCustomProjectStages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Check if project exists and user has permission
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    
    // Role-based access control
    if (userRole === "manager") {
      // Managers can see custom stages for their projects
      if (project.owner.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, error: "Access denied" });
      }
    } else if (userRole === "user") {
      // Users can see custom stages for their manager's projects
      const manager = await User.findById(userId);
      if (manager && manager.referredBy) {
        if (project.owner.toString() !== manager.referredBy.toString()) {
          return res.status(403).json({ success: false, error: "Access denied" });
        }
      } else {
        return res.status(403).json({ success: false, error: "Access denied" });
      }
    }
    
    const customStages = await CustomProjectStage.find({ project: projectId })
      .populate('owner', 'name email');
    
    res.status(200).json({ success: true, customStages });
  } catch (error) {
    console.error("Error fetching custom project stages:", error);
    res.status(500).json({ success: false, error: "Error fetching custom project stages" });
  }
};