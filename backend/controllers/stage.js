import Stage from "../models/stage.js";
import Project from "../models/project.js";
import ProjectStage from "../models/projectStage.js";

// Create a new stage (can be global or project-specific)
export const createStage = async (req, res) => {
  try {
    const { stage_name, description, isCustom, projectId } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Only managers can create stages
    if (userRole !== "manager") {
      return res.status(403).json({ success: false, error: "Only managers can create stages" });
    }

    // If it's a custom stage for a specific project, verify the project exists and user owns it
    if (isCustom && projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, error: "Project not found" });
      }
      
      if (project.owner.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, error: "You can only add custom stages to your own projects" });
      }
    }

    const newStage = new Stage({
      stage_name,
      description,
      owner: userId,
      isCustom: isCustom || false,
      projectSpecific: isCustom ? projectId : null,
    });

    await newStage.save();
    res.status(201).json({ success: true, stage: newStage });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get all stages (global and project-specific if projectId is provided)
export const getAllStages = async (req, res) => {
  try {
    const { projectId } = req.query;
    const userId = req.user._id;
    const userRole = req.user.role;

    let query = { isCustom: false }; // Default to global stages

    // If projectId is provided and user is a manager, include custom stages for that project
    if (projectId && userRole === "manager") {
      // Verify the project exists and user owns it
      const project = await Project.findById(projectId);
      if (project && project.owner.toString() === userId.toString()) {
        query = {
          $or: [
            { isCustom: false },
            { isCustom: true, projectSpecific: projectId }
          ]
        };
      }
    }

    const stages = await Stage.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(stages);
  } catch (error) {
    console.error("Error fetching stages:", error);
    res.status(500).json({ message: "Error fetching stages", error: error.message });
  }
};

// Get a single stage by ID
export const getStageById = async (req, res) => {
  try {
    const { id } = req.params;
    const stage = await Stage.findById(id).populate('owner', 'name email');
    
    if (!stage) {
      return res.status(404).json({ message: "Stage not found" });
    }
    
    res.status(200).json(stage);
  } catch (error) {
    console.error("Error fetching stage:", error);
    res.status(500).json({ message: "Error fetching stage", error });
  }
};

// Update a stage
export const updateStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage_name, description } = req.body;
    const userId = req.user._id;

    const stage = await Stage.findById(id);
    if (!stage) {
      return res.status(404).json({ message: "Stage not found" });
    }

    // Only the owner can update the stage
    if (stage.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    stage.stage_name = stage_name;
    stage.description = description;
    await stage.save();

    res.status(200).json(stage);
  } catch (error) {
    console.error("Error updating stage:", error);
    res.status(500).json({ message: "Error updating stage", error });
  }
};

// Delete a stage
export const deleteStage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const stage = await Stage.findById(id);
    if (!stage) {
      return res.status(404).json({ message: "Stage not found" });
    }

    // Only the owner can delete the stage
    if (stage.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if the stage is being used in any project
    const projectStages = await ProjectStage.find({ "stage._id": id });
    if (projectStages.length > 0) {
      return res.status(400).json({ 
        message: "Cannot delete stage that is being used in projects" 
      });
    }

    await Stage.findByIdAndDelete(id);
    res.status(200).json({ message: "Stage deleted successfully" });
  } catch (error) {
    console.error("Error deleting stage:", error);
    res.status(500).json({ message: "Error deleting stage", error });
  }
};

// Delete a custom stage from a specific project (also removes from database)

// Add this new function (keep all existing functions)
// Keep all existing functions and update the delete function name
export const deleteCustomStageFromProject = async (req, res) => {
  try {
    const { stageId, projectId } = req.body;
    const userId = req.user._id;

    // Verify the project exists and user owns it
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    if (project.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Verify the stage exists and is a custom stage for this project
    const stage = await Stage.findById(stageId);
    if (!stage) {
      return res.status(404).json({ message: "Stage not found" });
    }

    if (!stage.isCustom || stage.projectSpecific?.toString() !== projectId) {
      return res.status(400).json({ 
        message: "Can only delete custom stages specific to this project" 
      });
    }

    // Remove the stage from any project stages that might be using it
    await ProjectStage.deleteMany({ "stage._id": stageId });

    // Delete the stage from the database
    await Stage.findByIdAndDelete(stageId);

    res.status(200).json({ message: "Custom stage deleted successfully" });
  } catch (error) {
    console.error("Error deleting custom stage:", error);
    res.status(500).json({ message: "Error deleting custom stage", error: error.message });
  }
};