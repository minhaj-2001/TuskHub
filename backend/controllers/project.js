import Project from "../models/project.js";
import ProjectStage from "../models/projectStage.js";
import StageConnection from "../models/stageConnection.js";
import User from "../models/user.js";

// Helper function to create a Date object at noon to avoid timezone issues
const createLocalDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  // Set time to noon to avoid DST issues
  date.setHours(12, 0, 0, 0);
  return date;
};

// Helper function to format date as YYYY-MM-DD in local timezone
const formatDateToLocal = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Create a new project
export const createProject = async (req, res) => {
  try {
    const { project_name, description, status, created_at } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Only managers can create projects
    if (userRole !== "manager") {
      return res.status(403).json({ success: false, error: "Only managers can create projects" });
    }
    
    // Create a Date object at noon to avoid timezone issues
    const createdAtDate = createLocalDate(created_at);
    
    const newProject = new Project({
      project_name,
      description,
      status: status || "Pending",
      created_at: createdAtDate,
      owner: userId
    });
    
    await newProject.save();
    res.status(201).json({ success: true, project: newProject });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get all projects
export const getAllProjects = async (req, res) => {
  try {
    const { year, month } = req.query;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    let query = {};
    
    // Filter by year if provided and not "all"
    if (year && year !== "all") {
      const yearNum = parseInt(year);
      if (!isNaN(yearNum)) {
        const startDate = new Date(yearNum, 0, 1); // January 1st of the year
        const endDate = new Date(yearNum + 1, 0, 1); // January 1st of the next year
        
        query.created_at = {
          $gte: startDate,
          $lt: endDate
        };
      }
    }
    
    // Filter by month if provided (year must also be provided)
    if (year && month && year !== "all") {
      const yearNum = parseInt(year);
      const monthNum = parseInt(month) - 1; // JavaScript months are 0-indexed
      if (!isNaN(yearNum) && !isNaN(monthNum)) {
        const startDate = new Date(yearNum, monthNum, 1); // First day of the month
        const endDate = new Date(yearNum, monthNum + 1, 1); // First day of the next month
        
        query.created_at = {
          $gte: startDate,
          $lt: endDate
        };
      }
    }
    
    // Role-based access control
    if (userRole === "manager") {
      // Managers can see their own projects
      query.owner = userId;
    } else if (userRole === "user") {
      // Users can see projects of their manager
      const manager = await User.findById(userId);
      if (manager && manager.referredBy) {
        query.owner = manager.referredBy;
      } else {
        // If user doesn't have a manager, they can't see any projects
        return res.status(200).json([]);
      }
    }
    
    console.log("Query for projects:", query); // Debug log
    
    const projects = await Project.find(query)
      .populate({
        path: 'stages',
        populate: {
          path: 'stage',
          model: 'Stage'
        }
      })
      .populate('owner', 'name email')
      .sort({ created_at: -1 }); // Sort by creation date, newest first
    
    // Format dates to YYYY-MM-DD for frontend in local timezone
    const formattedProjects = projects.map(project => {
      const formattedProject = project.toObject();
      formattedProject.created_at = formatDateToLocal(project.created_at);
      
      // Format stage dates
      if (formattedProject.stages && formattedProject.stages.length > 0) {
        formattedProject.stages = formattedProject.stages.map(stage => {
          const formattedStage = { ...stage };
          if (stage.start_date) {
            formattedStage.start_date = formatDateToLocal(stage.start_date);
          }
          if (stage.completion_date) {
            formattedStage.completion_date = formatDateToLocal(stage.completion_date);
          }
          return formattedStage;
        });
      }
      
      return formattedProject;
    });
    
    console.log("Formatted projects:", formattedProjects); // Debug log
    
    res.status(200).json(formattedProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Error fetching projects", error: error.message });
  }
};

// Get a single project with stages
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    let query = { _id: id };
    
    // Role-based access control
    if (userRole === "manager") {
      // Managers can only access their own projects
      query.owner = userId;
    } else if (userRole === "user") {
      // Users can only access projects of their manager
      const manager = await User.findById(userId);
      if (manager && manager.referredBy) {
        query.owner = manager.referredBy;
      } else {
        return res.status(403).json({ message: "Access denied" });
      }
    }
    
    const project = await Project.findOne(query)
      .populate({
        path: 'stages',
        populate: {
          path: 'stage',
          model: 'Stage'
        }
      })
      .populate('owner', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Format dates
    const formattedProject = {
      ...project.toObject(),
      created_at: formatDateToLocal(project.created_at),
      stages: project.stages.map(stage => ({
        ...stage.toObject(),
        start_date: formatDateToLocal(stage.start_date),
        completion_date: formatDateToLocal(stage.completion_date)
      }))
    };
    
    res.status(200).json(formattedProject);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Error fetching project", error });
  }
};



// Add this function to handle project status updates
export const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    console.log("Updating project status:", { id, status }); // Debug log
    
    // Check if user has permission to update this project
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Only managers can update projects, and only their own projects
    if (userRole !== "manager" || project.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Validate status
    const validStatuses = ['Pending', 'Ongoing', 'Completed', 'Archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    
    // Update project status
    project.status = status;
    await project.save();
    
    // Format date to YYYY-MM-DD for frontend in local timezone
    const formattedProject = {
      ...project.toObject(),
      created_at: formatDateToLocal(project.created_at)
    };
    
    res.status(200).json(formattedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating project status", error });
  }
};



// Update a project
// backend/controllers/project.js
// Update the updateProject function to handle status updates

export const updateProject = async (req, res) => {
  const { id } = req.params;
  const { project_name, description, status, created_at } = req.body;
  const userId = req.user._id;
  const userRole = req.user.role;
  
  try {
    console.log("Updating project:", { id, project_name, description, status, created_at });
    
    // Check if user has permission to update this project
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Only managers can update projects, and only their own projects
    if (userRole !== "manager" || project.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Build update object dynamically based on provided fields
    const updateData = {};
    if (project_name) updateData.project_name = project_name;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;
    if (created_at) {
      // Create a Date object at noon to avoid timezone issues
      updateData.created_at = createLocalDate(created_at);
    }
    
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate({
      path: 'stages',
      populate: {
        path: 'stage',
        model: 'Stage'
      }
    }).populate('owner', 'name email');
    
    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Format date to YYYY-MM-DD for frontend in local timezone
    const formattedProject = {
      ...updatedProject.toObject(),
      created_at: formatDateToLocal(updatedProject.created_at)
    };
    
    res.status(200).json(formattedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating project", error });
  }
};

// Delete a project
export const deleteProject = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;
  
  try {
    // Check if user has permission to delete this project
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Only managers can delete projects, and only their own projects
    if (userRole !== "manager" || project.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Delete all project stages and connections
    await ProjectStage.deleteMany({ project: id });
    await StageConnection.deleteMany({ project: id });
    
    const deletedProject = await Project.findByIdAndDelete(id);
    
    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting project", error });
  }
};


// Add a helper function to update project status based on stages
// const updateProjectStatusBasedOnStages = async (projectId) => {
//   try {
//     // Get all stages for the project
//     const projectStages = await ProjectStage.find({ project: projectId });
    
//     if (projectStages.length === 0) {
//       // If no stages, set status to Pending
//       await Project.findByIdAndUpdate(projectId, { status: "Pending" });
//       return;
//     }
    
//     // Check if all stages are completed
//     const allCompleted = projectStages.every(stage => stage.status === 'Completed');
    
//     // Check if any stage is ongoing
//     const anyOngoing = projectStages.some(stage => stage.status === 'Ongoing');
    
//     let newStatus;
//     if (allCompleted) {
//       newStatus = "Completed";
//     } else if (anyOngoing) {
//       newStatus = "Ongoing";
//     } else {
//       newStatus = "Pending";
//     }
    
//     await Project.findByIdAndUpdate(projectId, { status: newStatus });
//   } catch (error) {
//     console.error("Error updating project status:", error);
//   }
// };

const updateProjectStatusBasedOnStages = async (projectId) => {
  try {
    // Get all stages for the project
    const projectStages = await ProjectStage.find({ project: projectId });
    
    if (projectStages.length === 0) {
      // If no stages, set status to Pending
      await Project.findByIdAndUpdate(projectId, { status: "Pending" });
      return;
    }
    
    // Check if any stage is ongoing
    const anyOngoing = projectStages.some(stage => stage.status === 'Ongoing');
    
    // Check if all stages are completed
    const allCompleted = projectStages.every(stage => stage.status === 'Completed');
    
    let newStatus;
    if (anyOngoing) {
      newStatus = "Ongoing";
    } else if (allCompleted) {
      // Keep the current status if all stages are completed
      // Don't automatically change to "Completed"
      const project = await Project.findById(projectId);
      newStatus = project.status;
    } else {
      newStatus = "Pending";
    }
    
    // Only update if the status is different
    const project = await Project.findById(projectId);
    if (project.status !== newStatus) {
      await Project.findByIdAndUpdate(projectId, { status: newStatus });
    }
  } catch (error) {
    console.error("Error updating project status:", error);
  }
};



// Update the addStageToProject function
// export const addStageToProject = async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const { stageId, status, start_date, completion_date } = req.body;
//     const userId = req.user._id;
//     const userRole = req.user.role;
    
//     // Check if user has permission to add stages to this project
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Only managers can add stages to projects, and only their own projects
//     if (userRole !== "manager" || project.owner.toString() !== userId.toString()) {
//       return res.status(403).json({ message: "Access denied" });
//     }
    
//     // Get the current highest order number
//     const highestOrderStage = await ProjectStage.findOne({ project: projectId })
//       .sort({ order: -1 });
    
//     const order = highestOrderStage ? highestOrderStage.order + 1 : 1;
    
//     // Create new project stage
//     const newProjectStage = new ProjectStage({
//       project: projectId,
//       stage: stageId,
//       status,
//       // Save dates based on status
//       start_date: (status === 'Ongoing' || status === 'Completed') && start_date ? createLocalDate(start_date) : undefined,
//       completion_date: status === 'Completed' && completion_date ? createLocalDate(completion_date) : undefined,
//       order
//     });
    
//     await newProjectStage.save();
    
//     // Add stage to project
//     project.stages.push(newProjectStage._id);
//     await project.save();
    
//     // Update project status based on stages
//     await updateProjectStatusBasedOnStages(projectId);
    
//     // Populate stage details
//     const populatedStage = await ProjectStage.findById(newProjectStage._id)
//       .populate('stage');
    
//     // Format dates
//     const formattedStage = {
//       ...populatedStage.toObject(),
//       start_date: formatDateToLocal(populatedStage.start_date),
//       completion_date: formatDateToLocal(populatedStage.completion_date)
//     };
    
//     res.status(201).json(formattedStage);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error adding stage to project", error });
//   }
// };




// backend/controllers/project.js

// Update the addStageToProject function
export const addStageToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { stageId, status, start_date, completion_date } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Check if user has permission to add stages to this project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Only managers can add stages to projects, and only their own projects
    if (userRole !== "manager" || project.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Get the current highest order number
    const highestOrderStage = await ProjectStage.findOne({ project: projectId })
      .sort({ order: -1 });
    
    const order = highestOrderStage ? highestOrderStage.order + 1 : 1;
    
    // Create new project stage
    const newProjectStage = new ProjectStage({
      project: projectId,
      stage: stageId,
      status,
      // Save dates based on status
      start_date: (status === 'Ongoing' || status === 'Completed') && start_date ? createLocalDate(start_date) : undefined,
      completion_date: status === 'Completed' && completion_date ? createLocalDate(completion_date) : undefined,
      order
    });
    
    await newProjectStage.save();
    
    // Add stage to project
    project.stages.push(newProjectStage._id);
    await project.save();
    
    // Update project status based on stages
    await updateProjectStatusBasedOnStages(projectId);
    
    // Populate stage details
    const populatedStage = await ProjectStage.findById(newProjectStage._id)
      .populate('stage');
    
    // Format dates
    const formattedStage = {
      ...populatedStage.toObject(),
      start_date: formatDateToLocal(populatedStage.start_date),
      completion_date: formatDateToLocal(populatedStage.completion_date)
    };
    
    res.status(201).json(formattedStage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding stage to project", error });
  }
};




// Update the updateProjectStage function
// export const updateProjectStage = async (req, res) => {
//   try {
//     const { projectId, stageId } = req.params;
//     const { status, start_date, completion_date } = req.body;
//     const userId = req.user._id;
//     const userRole = req.user.role;
    
//     // Check if user has permission to update stages in this project
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Only managers can update stages in projects, and only their own projects
//     if (userRole !== "manager" || project.owner.toString() !== userId.toString()) {
//       return res.status(403).json({ message: "Access denied" });
//     }
    
//     const projectStage = await ProjectStage.findOne({ 
//       _id: stageId, 
//       project: projectId 
//     });
    
//     if (!projectStage) {
//       return res.status(404).json({ message: "Project stage not found" });
//     }
    
//     // Update fields
//     if (status) projectStage.status = status;
    
//     // Update dates based on status
//     if (status === 'Ongoing') {
//       if (start_date) projectStage.start_date = createLocalDate(start_date);
//       // Clear completion date when changing to ongoing
//       projectStage.completion_date = undefined;
//     } else if (status === 'Completed') {
//       // For completed status, both dates are required
//       if (start_date) projectStage.start_date = createLocalDate(start_date);
//       if (completion_date) projectStage.completion_date = createLocalDate(completion_date);
//     }
    
//     await projectStage.save();
    
//     // Update project status based on stages
//     await updateProjectStatusBasedOnStages(projectId);
    
//     // Populate stage details
//     const populatedStage = await ProjectStage.findById(projectStage._id)
//       .populate('stage');
    
//     // Format dates
//     const formattedStage = {
//       ...populatedStage.toObject(),
//       start_date: formatDateToLocal(populatedStage.start_date),
//       completion_date: formatDateToLocal(populatedStage.completion_date)
//     };
    
//     res.status(200).json(formattedStage);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error updating project stage", error });
//   }
// };




// backend/controllers/project.js

// Update the updateProjectStage function
export const updateProjectStage = async (req, res) => {
  try {
    const { projectId, stageId } = req.params;
    const { status, start_date, completion_date } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Check if user has permission to update stages in this project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Only managers can update stages in projects, and only their own projects
    if (userRole !== "manager" || project.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const projectStage = await ProjectStage.findOne({ 
      _id: stageId, 
      project: projectId 
    });
    
    if (!projectStage) {
      return res.status(404).json({ message: "Project stage not found" });
    }
    
    // Update fields
    if (status) projectStage.status = status;
    
    // Update dates based on status
    if (status === 'Ongoing') {
      if (start_date) projectStage.start_date = createLocalDate(start_date);
      // Clear completion date when changing to ongoing
      projectStage.completion_date = undefined;
    } else if (status === 'Completed') {
      // For completed status, both dates are required
      if (start_date) projectStage.start_date = createLocalDate(start_date);
      if (completion_date) projectStage.completion_date = createLocalDate(completion_date);
    }
    
    await projectStage.save();
    
    // Update project status based on stages
    await updateProjectStatusBasedOnStages(projectId);
    
    // Populate stage details
    const populatedStage = await ProjectStage.findById(projectStage._id)
      .populate('stage');
    
    // Format dates
    const formattedStage = {
      ...populatedStage.toObject(),
      start_date: formatDateToLocal(populatedStage.start_date),
      completion_date: formatDateToLocal(populatedStage.completion_date)
    };
    
    res.status(200).json(formattedStage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating project stage", error });
  }
};


// Update the deleteProjectStage function
// export const deleteProjectStage = async (req, res) => {
//   try {
//     const { projectId, stageId } = req.params;
//     const userId = req.user._id;
//     const userRole = req.user.role;
    
//     // Check if user has permission to delete stages from this project
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Only managers can delete stages from projects, and only their own projects
//     if (userRole !== "manager" || project.owner.toString() !== userId.toString()) {
//       return res.status(403).json({ message: "Access denied" });
//     }
    
//     const projectStage = await ProjectStage.findOne({ 
//       _id: stageId, 
//       project: projectId 
//     });
    
//     if (!projectStage) {
//       return res.status(404).json({ message: "Project stage not found" });
//     }
    
//     // Delete all connections related to this stage
//     await StageConnection.deleteMany({ 
//       $or: [
//         { from_stage: stageId },
//         { to_stage: stageId }
//       ]
//     });
    
//     // Remove stage from project
//     await Project.findByIdAndUpdate(projectId, {
//       $pull: { stages: stageId }
//     });
    
//     // Delete the stage
//     await ProjectStage.findByIdAndDelete(stageId);
    
//     // Update project status based on remaining stages
//     await updateProjectStatusBasedOnStages(projectId);
    
//     res.status(200).json({ message: "Project stage deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error deleting project stage", error });
//   }
// };








// backend/controllers/project.js

// Update the deleteProjectStage function
export const deleteProjectStage = async (req, res) => {
  try {
    const { projectId, stageId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Check if user has permission to delete stages from this project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Only managers can delete stages from projects, and only their own projects
    if (userRole !== "manager" || project.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const projectStage = await ProjectStage.findOne({ 
      _id: stageId, 
      project: projectId 
    });
    
    if (!projectStage) {
      return res.status(404).json({ message: "Project stage not found" });
    }
    
    // Delete all connections related to this stage
    await StageConnection.deleteMany({ 
      $or: [
        { from_stage: stageId },
        { to_stage: stageId }
      ]
    });
    
    // Remove stage from project
    await Project.findByIdAndUpdate(projectId, {
      $pull: { stages: stageId }
    });
    
    // Delete the stage
    await ProjectStage.findByIdAndDelete(stageId);
    
    // Update project status based on remaining stages
    await updateProjectStatusBasedOnStages(projectId);
    
    res.status(200).json({ message: "Project stage deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting project stage", error });
  }
};








// Create a connection between stages
export const createStageConnection = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { fromStageId, toStageId } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Check if user has permission to create connections in this project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Only managers can create connections in projects, and only their own projects
    if (userRole !== "manager" || project.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Check if both stages exist and belong to the project
    const fromStage = await ProjectStage.findOne({ 
      _id: fromStageId, 
      project: projectId 
    });
    
    const toStage = await ProjectStage.findOne({ 
      _id: toStageId, 
      project: projectId 
    });
    
    if (!fromStage || !toStage) {
      return res.status(404).json({ message: "One or both stages not found" });
    }
    
    // Check if connection already exists
    const existingConnection = await StageConnection.findOne({
      from_stage: fromStageId,
      to_stage: toStageId,
      project: projectId
    });
    
    if (existingConnection) {
      return res.status(400).json({ message: "Connection already exists" });
    }
    
    // Create new connection
    const newConnection = new StageConnection({
      from_stage: fromStageId,
      to_stage: toStageId,
      project: projectId
    });
    
    await newConnection.save();
    
    // Add connection to both stages
    fromStage.connections.push(newConnection._id);
    toStage.connections.push(newConnection._id);
    
    await fromStage.save();
    await toStage.save();
    
    res.status(201).json(newConnection);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating stage connection", error });
  }
};

// Get all connections for a project
export const getProjectStageConnections = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Check if user has permission to view connections for this project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Role-based access control
    if (userRole === "manager") {
      // Managers can only access their own projects
      if (project.owner.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else if (userRole === "user") {
      // Users can only access projects of their manager
      const manager = await User.findById(userId);
      if (!manager || !manager.referredBy || project.owner.toString() !== manager.referredBy.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    }
    
    const connections = await StageConnection.find({ project: projectId })
      .populate({
        path: 'from_stage',
        populate: {
          path: 'stage',
          model: 'Stage'
        }
      })
      .populate({
        path: 'to_stage',
        populate: {
          path: 'stage',
          model: 'Stage'
        }
      });
    
    res.status(200).json(connections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching stage connections", error });
  }
};

// Get available years from projects
export const getProjectYears = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    let query = {};
    
    // Role-based access control
    if (userRole === "manager") {
      // Managers can see their own projects
      query.owner = userId;
    } else if (userRole === "user") {
      // Users can see projects of their manager
      const manager = await User.findById(userId);
      if (manager && manager.referredBy) {
        query.owner = manager.referredBy;
      } else {
        // If user doesn't have a manager, they can't see any projects
        return res.status(200).json([]);
      }
    }
    
    // Get distinct years from project creation dates
    const projects = await Project.find(query, { created_at: 1 });
    const yearsSet = new Set();
    
    projects.forEach(project => {
      if (project.created_at) {
        const year = new Date(project.created_at).getFullYear();
        yearsSet.add(year);
      }
    });
    
    const years = Array.from(yearsSet).sort((a, b) => b - a); // Sort in descending order
    
    console.log("Available years:", years); // Debug log
    
    res.status(200).json(years);
  } catch (error) {
    console.error("Error fetching project years:", error);
    res.status(500).json({ message: "Error fetching project years", error: error.message });
  }
};











// // backend/controllers/project.js
// import Project from "../models/project.js";
// import ProjectStage from "../models/projectStage.js";
// import StageConnection from "../models/stageConnection.js";

// // Helper function to create a Date object at noon to avoid timezone issues
// const createLocalDate = (dateString) => {
//   if (!dateString) return null;
//   const date = new Date(dateString);
//   // Set time to noon to avoid DST issues
//   date.setHours(12, 0, 0, 0);
//   return date;
// };

// // Helper function to format date as YYYY-MM-DD in local timezone
// const formatDateToLocal = (date) => {
//   if (!date) return null;
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// };

// // Create a new project
// export const createProject = async (req, res) => {
//   try {
//     const { project_name, description, status, created_at } = req.body;
    
//     // Create a Date object at noon to avoid timezone issues
//     const createdAtDate = createLocalDate(created_at);
    
//     const newProject = new Project({
//       project_name,
//       description,
//       status: status || "Pending",
//       created_at: createdAtDate
//     });
    
//     await newProject.save();
//     res.status(201).json({ success: true, project: newProject });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// };

// // Get all projects
// export const getAllProjects = async (req, res) => {
//   try {
//     const { year, month } = req.query;
    
//     let query = {};
    
//     // Filter by year if provided and not "all"
//     if (year && year !== "all") {
//       const yearNum = parseInt(year);
//       if (!isNaN(yearNum)) {
//         const startDate = new Date(yearNum, 0, 1); // January 1st of the year
//         const endDate = new Date(yearNum + 1, 0, 1); // January 1st of the next year
        
//         query.created_at = {
//           $gte: startDate,
//           $lt: endDate
//         };
//       }
//     }
    
//     // Filter by month if provided (year must also be provided)
//     if (year && month && year !== "all") {
//       const yearNum = parseInt(year);
//       const monthNum = parseInt(month) - 1; // JavaScript months are 0-indexed
//       if (!isNaN(yearNum) && !isNaN(monthNum)) {
//         const startDate = new Date(yearNum, monthNum, 1); // First day of the month
//         const endDate = new Date(yearNum, monthNum + 1, 1); // First day of the next month
        
//         query.created_at = {
//           $gte: startDate,
//           $lt: endDate
//         };
//       }
//     }
    
//     console.log("Query for projects:", query); // Debug log
    
//     const projects = await Project.find(query)
//       .populate({
//         path: 'stages',
//         populate: {
//           path: 'stage',
//           model: 'Stage'
//         }
//       })
//       .sort({ created_at: -1 }); // Sort by creation date, newest first
    
//     // Format dates to YYYY-MM-DD for frontend in local timezone
//     const formattedProjects = projects.map(project => {
//       const formattedProject = project.toObject();
//       formattedProject.created_at = formatDateToLocal(project.created_at);
      
//       // Format stage dates
//       if (formattedProject.stages && formattedProject.stages.length > 0) {
//         formattedProject.stages = formattedProject.stages.map(stage => {
//           const formattedStage = { ...stage };
//           if (stage.start_date) {
//             formattedStage.start_date = formatDateToLocal(stage.start_date);
//           }
//           if (stage.completion_date) {
//             formattedStage.completion_date = formatDateToLocal(stage.completion_date);
//           }
//           return formattedStage;
//         });
//       }
      
//       return formattedProject;
//     });
    
//     console.log("Formatted projects:", formattedProjects); // Debug log
    
//     res.status(200).json(formattedProjects);
//   } catch (error) {
//     console.error("Error fetching projects:", error);
//     res.status(500).json({ message: "Error fetching projects", error: error.message });
//   }
// };

// // Get available years from projects
// export const getProjectYears = async (req, res) => {
//   try {
//     // Get distinct years from project creation dates
//     const projects = await Project.find({}, { created_at: 1 });
//     const yearsSet = new Set();
    
//     projects.forEach(project => {
//       if (project.created_at) {
//         const year = new Date(project.created_at).getFullYear();
//         yearsSet.add(year);
//       }
//     });
    
//     const years = Array.from(yearsSet).sort((a, b) => b - a); // Sort in descending order
    
//     console.log("Available years:", years); // Debug log
    
//     res.status(200).json(years);
//   } catch (error) {
//     console.error("Error fetching project years:", error);
//     res.status(500).json({ message: "Error fetching project years", error: error.message });
//   }
// };

// // Keep other functions unchanged...
// // Get a single project with stages
// export const getProjectById = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const project = await Project.findById(id)
//       .populate({
//         path: 'stages',
//         populate: {
//           path: 'stage',
//           model: 'Stage'
//         }
//       });
    
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Format dates
//     const formattedProject = {
//       ...project.toObject(),
//       created_at: formatDateToLocal(project.created_at),
//       stages: project.stages.map(stage => ({
//         ...stage.toObject(),
//         start_date: formatDateToLocal(stage.start_date),
//         completion_date: formatDateToLocal(stage.completion_date)
//       }))
//     };
    
//     res.status(200).json(formattedProject);
//   } catch (error) {
//     console.error("Error fetching project:", error);
//     res.status(500).json({ message: "Error fetching project", error });
//   }
// };

// // Update a project
// export const updateProject = async (req, res) => {
//   const { id } = req.params;
//   const { project_name, description, status, created_at } = req.body;
  
//   try {
//     console.log("Updating project:", { id, project_name, description, status, created_at });
    
//     // Build update object dynamically based on provided fields
//     const updateData = {};
//     if (project_name) updateData.project_name = project_name;
//     if (description !== undefined) updateData.description = description;
//     if (status) updateData.status = status;
//     if (created_at) {
//       // Create a Date object at noon to avoid timezone issues
//       updateData.created_at = createLocalDate(created_at);
//     }
    
//     const updatedProject = await Project.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true }
//     ).populate({
//       path: 'stages',
//       populate: {
//         path: 'stage',
//         model: 'Stage'
//       }
//     });
    
//     if (!updatedProject) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Format date to YYYY-MM-DD for frontend in local timezone
//     const formattedProject = {
//       ...updatedProject.toObject(),
//       created_at: formatDateToLocal(updatedProject.created_at)
//     };
    
//     res.status(200).json(formattedProject);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error updating project", error });
//   }
// };

// // Delete a project
// export const deleteProject = async (req, res) => {
//   const { id } = req.params;
  
//   try {
//     // Delete all project stages and connections
//     await ProjectStage.deleteMany({ project: id });
//     await StageConnection.deleteMany({ project: id });
    
//     const deletedProject = await Project.findByIdAndDelete(id);
    
//     if (!deletedProject) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     res.status(200).json({ message: "Project deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error deleting project", error });
//   }
// };

// // Add a stage to a project
// export const addStageToProject = async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const { stageId, status, start_date, completion_date } = req.body;
    
//     // Check if project exists
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Get the current highest order number
//     const highestOrderStage = await ProjectStage.findOne({ project: projectId })
//       .sort({ order: -1 });
    
//     const order = highestOrderStage ? highestOrderStage.order + 1 : 1;
    
//     // Create new project stage
//     const newProjectStage = new ProjectStage({
//       project: projectId,
//       stage: stageId,
//       status,
//       start_date: status === 'Ongoing' ? createLocalDate(start_date) : undefined,
//       completion_date: status === 'Completed' ? createLocalDate(completion_date) : undefined,
//       order
//     });
    
//     await newProjectStage.save();
    
//     // Add stage to project
//     project.stages.push(newProjectStage._id);
//     await project.save();
    
//     // Populate stage details
//     const populatedStage = await ProjectStage.findById(newProjectStage._id)
//       .populate('stage');
    
//     // Format dates
//     const formattedStage = {
//       ...populatedStage.toObject(),
//       start_date: formatDateToLocal(populatedStage.start_date),
//       completion_date: formatDateToLocal(populatedStage.completion_date)
//     };
    
//     res.status(201).json(formattedStage);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error adding stage to project", error });
//   }
// };

// // Update a project stage
// export const updateProjectStage = async (req, res) => {
//   try {
//     const { projectId, stageId } = req.params;
//     const { status, start_date, completion_date } = req.body;
    
//     const projectStage = await ProjectStage.findOne({ 
//       _id: stageId, 
//       project: projectId 
//     });
    
//     if (!projectStage) {
//       return res.status(404).json({ message: "Project stage not found" });
//     }
    
//     // Update fields
//     if (status) projectStage.status = status;
//     if (start_date) projectStage.start_date = createLocalDate(start_date);
//     if (completion_date) projectStage.completion_date = createLocalDate(completion_date);
    
//     await projectStage.save();
    
//     // Populate stage details
//     const populatedStage = await ProjectStage.findById(projectStage._id)
//       .populate('stage');
    
//     // Format dates
//     const formattedStage = {
//       ...populatedStage.toObject(),
//       start_date: formatDateToLocal(populatedStage.start_date),
//       completion_date: formatDateToLocal(populatedStage.completion_date)
//     };
    
//     res.status(200).json(formattedStage);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error updating project stage", error });
//   }
// };

// // Delete a project stage
// export const deleteProjectStage = async (req, res) => {
//   try {
//     const { projectId, stageId } = req.params;
    
//     const projectStage = await ProjectStage.findOne({ 
//       _id: stageId, 
//       project: projectId 
//     });
    
//     if (!projectStage) {
//       return res.status(404).json({ message: "Project stage not found" });
//     }
    
//     // Delete all connections related to this stage
//     await StageConnection.deleteMany({ 
//       $or: [
//         { from_stage: stageId },
//         { to_stage: stageId }
//       ]
//     });
    
//     // Remove stage from project
//     await Project.findByIdAndUpdate(projectId, {
//       $pull: { stages: stageId }
//     });
    
//     // Delete the stage
//     await ProjectStage.findByIdAndDelete(stageId);
    
//     res.status(200).json({ message: "Project stage deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error deleting project stage", error });
//   }
// };

// // Create a connection between stages
// export const createStageConnection = async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const { fromStageId, toStageId } = req.body;
    
//     // Check if both stages exist and belong to the project
//     const fromStage = await ProjectStage.findOne({ 
//       _id: fromStageId, 
//       project: projectId 
//     });
    
//     const toStage = await ProjectStage.findOne({ 
//       _id: toStageId, 
//       project: projectId 
//     });
    
//     if (!fromStage || !toStage) {
//       return res.status(404).json({ message: "One or both stages not found" });
//     }
    
//     // Check if connection already exists
//     const existingConnection = await StageConnection.findOne({
//       from_stage: fromStageId,
//       to_stage: toStageId,
//       project: projectId
//     });
    
//     if (existingConnection) {
//       return res.status(400).json({ message: "Connection already exists" });
//     }
    
//     // Create new connection
//     const newConnection = new StageConnection({
//       from_stage: fromStageId,
//       to_stage: toStageId,
//       project: projectId
//     });
    
//     await newConnection.save();
    
//     // Add connection to both stages
//     fromStage.connections.push(newConnection._id);
//     toStage.connections.push(newConnection._id);
    
//     await fromStage.save();
//     await toStage.save();
    
//     res.status(201).json(newConnection);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error creating stage connection", error });
//   }
// };

// // Get all connections for a project
// export const getProjectStageConnections = async (req, res) => {
//   try {
//     const { projectId } = req.params;
    
//     const connections = await StageConnection.find({ project: projectId })
//       .populate({
//         path: 'from_stage',
//         populate: {
//           path: 'stage',
//           model: 'Stage'
//         }
//       })
//       .populate({
//         path: 'to_stage',
//         populate: {
//           path: 'stage',
//           model: 'Stage'
//         }
//       });
    
//     res.status(200).json(connections);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error fetching stage connections", error });
//   }
// };











// // backend/controllers/project.js
// import Project from "../models/project.js";
// import ProjectStage from "../models/projectStage.js";
// import StageConnection from "../models/stageConnection.js";

// // Helper function to create a Date object at noon to avoid timezone issues
// const createLocalDate = (dateString) => {
//   if (!dateString) return null;
//   const date = new Date(dateString);
//   // Set time to noon to avoid DST issues
//   date.setHours(12, 0, 0, 0);
//   return date;
// };

// // Helper function to format date as YYYY-MM-DD in local timezone
// const formatDateToLocal = (date) => {
//   if (!date) return null;
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// };

// // Create a new project
// export const createProject = async (req, res) => {
//   try {
//     const { project_name, description, status, created_at } = req.body;
    
//     // Create a Date object at noon to avoid timezone issues
//     const createdAtDate = createLocalDate(created_at);
    
//     const newProject = new Project({
//       project_name,
//       description,
//       status: status || "Pending",
//       created_at: createdAtDate
//     });
    
//     await newProject.save();
//     res.status(201).json({ success: true, project: newProject });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// };

// // Get all projects
// export const getAllProjects = async (req, res) => {
//   try {
//     const { year, month } = req.query;
    
//     let query = {};
    
//     // Filter by year if provided
//     if (year) {
//       const yearNum = parseInt(year);
//       const startDate = new Date(yearNum, 0, 1); // January 1st of the year
//       const endDate = new Date(yearNum + 1, 0, 1); // January 1st of the next year
      
//       query.created_at = {
//         $gte: startDate,
//         $lt: endDate
//       };
//     }
    
//     // Filter by month if provided (year must also be provided)
//     if (year && month) {
//       const yearNum = parseInt(year);
//       const monthNum = parseInt(month) - 1; // JavaScript months are 0-indexed
//       const startDate = new Date(yearNum, monthNum, 1); // First day of the month
//       const endDate = new Date(yearNum, monthNum + 1, 1); // First day of the next month
      
//       query.created_at = {
//         $gte: startDate,
//         $lt: endDate
//       };
//     }
    
//     const projects = await Project.find(query)
//       .populate({
//         path: 'stages',
//         populate: {
//           path: 'stage',
//           model: 'Stage'
//         }
//       })
//       .sort({ created_at: -1 }); // Sort by creation date, newest first
    
//     // Format dates to YYYY-MM-DD for frontend in local timezone
//     const formattedProjects = projects.map(project => {
//       const formattedProject = project.toObject();
//       formattedProject.created_at = formatDateToLocal(project.created_at);
      
//       // Format stage dates
//       if (formattedProject.stages && formattedProject.stages.length > 0) {
//         formattedProject.stages = formattedProject.stages.map(stage => {
//           const formattedStage = { ...stage };
//           if (stage.start_date) {
//             formattedStage.start_date = formatDateToLocal(stage.start_date);
//           }
//           if (stage.completion_date) {
//             formattedStage.completion_date = formatDateToLocal(stage.completion_date);
//           }
//           return formattedStage;
//         });
//       }
      
//       return formattedProject;
//     });
    
//     res.status(200).json(formattedProjects);
//   } catch (error) {
//     console.error("Error fetching projects:", error);
//     res.status(500).json({ message: "Error fetching projects", error });
//   }
// };

// // Get a single project with stages
// export const getProjectById = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const project = await Project.findById(id)
//       .populate({
//         path: 'stages',
//         populate: {
//           path: 'stage',
//           model: 'Stage'
//         }
//       });
    
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Format dates
//     const formattedProject = {
//       ...project.toObject(),
//       created_at: formatDateToLocal(project.created_at),
//       stages: project.stages.map(stage => ({
//         ...stage.toObject(),
//         start_date: formatDateToLocal(stage.start_date),
//         completion_date: formatDateToLocal(stage.completion_date)
//       }))
//     };
    
//     res.status(200).json(formattedProject);
//   } catch (error) {
//     console.error("Error fetching project:", error);
//     res.status(500).json({ message: "Error fetching project", error });
//   }
// };

// // Update a project
// export const updateProject = async (req, res) => {
//   const { id } = req.params;
//   const { project_name, description, status, created_at } = req.body;
  
//   try {
//     console.log("Updating project:", { id, project_name, description, status, created_at });
    
//     // Build update object dynamically based on provided fields
//     const updateData = {};
//     if (project_name) updateData.project_name = project_name;
//     if (description !== undefined) updateData.description = description;
//     if (status) updateData.status = status;
//     if (created_at) {
//       // Create a Date object at noon to avoid timezone issues
//       updateData.created_at = createLocalDate(created_at);
//     }
    
//     const updatedProject = await Project.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true }
//     ).populate({
//       path: 'stages',
//       populate: {
//         path: 'stage',
//         model: 'Stage'
//       }
//     });
    
//     if (!updatedProject) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Format date to YYYY-MM-DD for frontend in local timezone
//     const formattedProject = {
//       ...updatedProject.toObject(),
//       created_at: formatDateToLocal(updatedProject.created_at)
//     };
    
//     res.status(200).json(formattedProject);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error updating project", error });
//   }
// };

// // Delete a project
// export const deleteProject = async (req, res) => {
//   const { id } = req.params;
  
//   try {
//     // Delete all project stages and connections
//     await ProjectStage.deleteMany({ project: id });
//     await StageConnection.deleteMany({ project: id });
    
//     const deletedProject = await Project.findByIdAndDelete(id);
    
//     if (!deletedProject) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     res.status(200).json({ message: "Project deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error deleting project", error });
//   }
// };

// // Add a stage to a project
// export const addStageToProject = async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const { stageId, status, start_date, completion_date } = req.body;
    
//     // Check if project exists
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Get the current highest order number
//     const highestOrderStage = await ProjectStage.findOne({ project: projectId })
//       .sort({ order: -1 });
    
//     const order = highestOrderStage ? highestOrderStage.order + 1 : 1;
    
//     // Create new project stage
//     const newProjectStage = new ProjectStage({
//       project: projectId,
//       stage: stageId,
//       status,
//       start_date: status === 'Ongoing' ? createLocalDate(start_date) : undefined,
//       completion_date: status === 'Completed' ? createLocalDate(completion_date) : undefined,
//       order
//     });
    
//     await newProjectStage.save();
    
//     // Add stage to project
//     project.stages.push(newProjectStage._id);
//     await project.save();
    
//     // Populate stage details
//     const populatedStage = await ProjectStage.findById(newProjectStage._id)
//       .populate('stage');
    
//     // Format dates
//     const formattedStage = {
//       ...populatedStage.toObject(),
//       start_date: formatDateToLocal(populatedStage.start_date),
//       completion_date: formatDateToLocal(populatedStage.completion_date)
//     };
    
//     res.status(201).json(formattedStage);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error adding stage to project", error });
//   }
// };

// // Update a project stage
// export const updateProjectStage = async (req, res) => {
//   try {
//     const { projectId, stageId } = req.params;
//     const { status, start_date, completion_date } = req.body;
    
//     const projectStage = await ProjectStage.findOne({ 
//       _id: stageId, 
//       project: projectId 
//     });
    
//     if (!projectStage) {
//       return res.status(404).json({ message: "Project stage not found" });
//     }
    
//     // Update fields
//     if (status) projectStage.status = status;
//     if (start_date) projectStage.start_date = createLocalDate(start_date);
//     if (completion_date) projectStage.completion_date = createLocalDate(completion_date);
    
//     await projectStage.save();
    
//     // Populate stage details
//     const populatedStage = await ProjectStage.findById(projectStage._id)
//       .populate('stage');
    
//     // Format dates
//     const formattedStage = {
//       ...populatedStage.toObject(),
//       start_date: formatDateToLocal(populatedStage.start_date),
//       completion_date: formatDateToLocal(populatedStage.completion_date)
//     };
    
//     res.status(200).json(formattedStage);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error updating project stage", error });
//   }
// };

// // Delete a project stage
// export const deleteProjectStage = async (req, res) => {
//   try {
//     const { projectId, stageId } = req.params;
    
//     const projectStage = await ProjectStage.findOne({ 
//       _id: stageId, 
//       project: projectId 
//     });
    
//     if (!projectStage) {
//       return res.status(404).json({ message: "Project stage not found" });
//     }
    
//     // Delete all connections related to this stage
//     await StageConnection.deleteMany({ 
//       $or: [
//         { from_stage: stageId },
//         { to_stage: stageId }
//       ]
//     });
    
//     // Remove stage from project
//     await Project.findByIdAndUpdate(projectId, {
//       $pull: { stages: stageId }
//     });
    
//     // Delete the stage
//     await ProjectStage.findByIdAndDelete(stageId);
    
//     res.status(200).json({ message: "Project stage deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error deleting project stage", error });
//   }
// };

// // Create a connection between stages
// export const createStageConnection = async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const { fromStageId, toStageId } = req.body;
    
//     // Check if both stages exist and belong to the project
//     const fromStage = await ProjectStage.findOne({ 
//       _id: fromStageId, 
//       project: projectId 
//     });
    
//     const toStage = await ProjectStage.findOne({ 
//       _id: toStageId, 
//       project: projectId 
//     });
    
//     if (!fromStage || !toStage) {
//       return res.status(404).json({ message: "One or both stages not found" });
//     }
    
//     // Check if connection already exists
//     const existingConnection = await StageConnection.findOne({
//       from_stage: fromStageId,
//       to_stage: toStageId,
//       project: projectId
//     });
    
//     if (existingConnection) {
//       return res.status(400).json({ message: "Connection already exists" });
//     }
    
//     // Create new connection
//     const newConnection = new StageConnection({
//       from_stage: fromStageId,
//       to_stage: toStageId,
//       project: projectId
//     });
    
//     await newConnection.save();
    
//     // Add connection to both stages
//     fromStage.connections.push(newConnection._id);
//     toStage.connections.push(newConnection._id);
    
//     await fromStage.save();
//     await toStage.save();
    
//     res.status(201).json(newConnection);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error creating stage connection", error });
//   }
// };

// // Get all connections for a project
// export const getProjectStageConnections = async (req, res) => {
//   try {
//     const { projectId } = req.params;
    
//     const connections = await StageConnection.find({ project: projectId })
//       .populate({
//         path: 'from_stage',
//         populate: {
//           path: 'stage',
//           model: 'Stage'
//         }
//       })
//       .populate({
//         path: 'to_stage',
//         populate: {
//           path: 'stage',
//           model: 'Stage'
//         }
//       });
    
//     res.status(200).json(connections);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error fetching stage connections", error });
//   }
// };








// // backend/controllers/project.js
// import Project from "../models/project.js";
// import ProjectStage from "../models/projectStage.js";
// import StageConnection from "../models/stageConnection.js";

// // Helper function to create a Date object at noon to avoid timezone issues
// const createLocalDate = (dateString) => {
//   if (!dateString) return null;
//   const date = new Date(dateString);
//   // Set time to noon to avoid DST issues
//   date.setHours(12, 0, 0, 0);
//   return date;
// };

// // Helper function to format date as YYYY-MM-DD in local timezone
// const formatDateToLocal = (date) => {
//   if (!date) return null;
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// };

// // Create a new project
// export const createProject = async (req, res) => {
//   try {
//     const { project_name, description, status, created_at } = req.body;
    
//     // Create a Date object at noon to avoid timezone issues
//     const createdAtDate = createLocalDate(created_at);
    
//     const newProject = new Project({
//       project_name,
//       description,
//       status: status || "Pending",
//       created_at: createdAtDate
//     });
    
//     await newProject.save();
//     res.status(201).json({ success: true, project: newProject });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// };

// // Get all projects
// export const getAllProjects = async (req, res) => {
//   try {
//     const projects = await Project.find();
    
//     // Format dates to YYYY-MM-DD for frontend in local timezone
//     const formattedProjects = projects.map(project => ({
//       ...project.toObject(),
//       created_at: formatDateToLocal(project.created_at)
//     }));
    
//     res.status(200).json(formattedProjects);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching projects", error });
//   }
// };

// // Get a single project with stages
// export const getProjectById = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const project = await Project.findById(id)
//       .populate({
//         path: 'stages',
//         populate: {
//           path: 'stage',
//           model: 'Stage'
//         }
//       });
    
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Format dates
//     const formattedProject = {
//       ...project.toObject(),
//       created_at: formatDateToLocal(project.created_at),
//       stages: project.stages.map(stage => ({
//         ...stage.toObject(),
//         start_date: formatDateToLocal(stage.start_date),
//         completion_date: formatDateToLocal(stage.completion_date)
//       }))
//     };
    
//     res.status(200).json(formattedProject);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching project", error });
//   }
// };

// // Update a project
// export const updateProject = async (req, res) => {
//   const { id } = req.params;
//   const { project_name, description, status, created_at } = req.body;
  
//   try {
//     console.log("Updating project:", { id, project_name, description, status, created_at });
    
//     // Build update object dynamically based on provided fields
//     const updateData = {};
//     if (project_name) updateData.project_name = project_name;
//     if (description !== undefined) updateData.description = description;
//     if (status) updateData.status = status;
//     if (created_at) {
//       // Create a Date object at noon to avoid timezone issues
//       updateData.created_at = createLocalDate(created_at);
//     }
    
//     const updatedProject = await Project.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true }
//     );
    
//     if (!updatedProject) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Format date to YYYY-MM-DD for frontend in local timezone
//     const formattedProject = {
//       ...updatedProject.toObject(),
//       created_at: formatDateToLocal(updatedProject.created_at)
//     };
    
//     res.status(200).json(formattedProject);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error updating project", error });
//   }
// };

// // Delete a project
// export const deleteProject = async (req, res) => {
//   const { id } = req.params;
  
//   try {
//     // Delete all project stages and connections
//     await ProjectStage.deleteMany({ project: id });
//     await StageConnection.deleteMany({ project: id });
    
//     const deletedProject = await Project.findByIdAndDelete(id);
    
//     if (!deletedProject) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     res.status(200).json({ message: "Project deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting project", error });
//   }
// };

// // Add a stage to a project
// export const addStageToProject = async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const { stageId, status, start_date, completion_date } = req.body;
    
//     // Check if project exists
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Get the current highest order number
//     const highestOrderStage = await ProjectStage.findOne({ project: projectId })
//       .sort({ order: -1 });
    
//     const order = highestOrderStage ? highestOrderStage.order + 1 : 1;
    
//     // Create new project stage
//     const newProjectStage = new ProjectStage({
//       project: projectId,
//       stage: stageId,
//       status,
//       start_date: status === 'Ongoing' ? createLocalDate(start_date) : undefined,
//       completion_date: status === 'Completed' ? createLocalDate(completion_date) : undefined,
//       order
//     });
    
//     await newProjectStage.save();
    
//     // Add stage to project
//     project.stages.push(newProjectStage._id);
//     await project.save();
    
//     // Populate stage details
//     const populatedStage = await ProjectStage.findById(newProjectStage._id)
//       .populate('stage');
    
//     // Format dates
//     const formattedStage = {
//       ...populatedStage.toObject(),
//       start_date: formatDateToLocal(populatedStage.start_date),
//       completion_date: formatDateToLocal(populatedStage.completion_date)
//     };
    
//     res.status(201).json(formattedStage);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error adding stage to project", error });
//   }
// };

// // Update a project stage
// export const updateProjectStage = async (req, res) => {
//   try {
//     const { projectId, stageId } = req.params;
//     const { status, start_date, completion_date } = req.body;
    
//     const projectStage = await ProjectStage.findOne({ 
//       _id: stageId, 
//       project: projectId 
//     });
    
//     if (!projectStage) {
//       return res.status(404).json({ message: "Project stage not found" });
//     }
    
//     // Update fields
//     if (status) projectStage.status = status;
//     if (start_date) projectStage.start_date = createLocalDate(start_date);
//     if (completion_date) projectStage.completion_date = createLocalDate(completion_date);
    
//     await projectStage.save();
    
//     // Populate stage details
//     const populatedStage = await ProjectStage.findById(projectStage._id)
//       .populate('stage');
    
//     // Format dates
//     const formattedStage = {
//       ...populatedStage.toObject(),
//       start_date: formatDateToLocal(populatedStage.start_date),
//       completion_date: formatDateToLocal(populatedStage.completion_date)
//     };
    
//     res.status(200).json(formattedStage);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error updating project stage", error });
//   }
// };

// // Delete a project stage
// export const deleteProjectStage = async (req, res) => {
//   try {
//     const { projectId, stageId } = req.params;
    
//     const projectStage = await ProjectStage.findOne({ 
//       _id: stageId, 
//       project: projectId 
//     });
    
//     if (!projectStage) {
//       return res.status(404).json({ message: "Project stage not found" });
//     }
    
//     // Delete all connections related to this stage
//     await StageConnection.deleteMany({ 
//       $or: [
//         { from_stage: stageId },
//         { to_stage: stageId }
//       ]
//     });
    
//     // Remove stage from project
//     await Project.findByIdAndUpdate(projectId, {
//       $pull: { stages: stageId }
//     });
    
//     // Delete the stage
//     await ProjectStage.findByIdAndDelete(stageId);
    
//     res.status(200).json({ message: "Project stage deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error deleting project stage", error });
//   }
// };

// // Create a connection between stages
// export const createStageConnection = async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const { fromStageId, toStageId } = req.body;
    
//     // Check if both stages exist and belong to the project
//     const fromStage = await ProjectStage.findOne({ 
//       _id: fromStageId, 
//       project: projectId 
//     });
    
//     const toStage = await ProjectStage.findOne({ 
//       _id: toStageId, 
//       project: projectId 
//     });
    
//     if (!fromStage || !toStage) {
//       return res.status(404).json({ message: "One or both stages not found" });
//     }
    
//     // Check if connection already exists
//     const existingConnection = await StageConnection.findOne({
//       from_stage: fromStageId,
//       to_stage: toStageId,
//       project: projectId
//     });
    
//     if (existingConnection) {
//       return res.status(400).json({ message: "Connection already exists" });
//     }
    
//     // Create new connection
//     const newConnection = new StageConnection({
//       from_stage: fromStageId,
//       to_stage: toStageId,
//       project: projectId
//     });
    
//     await newConnection.save();
    
//     // Add connection to both stages
//     fromStage.connections.push(newConnection._id);
//     toStage.connections.push(newConnection._id);
    
//     await fromStage.save();
//     await toStage.save();
    
//     res.status(201).json(newConnection);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error creating stage connection", error });
//   }
// };

// // Get all connections for a project
// export const getProjectStageConnections = async (req, res) => {
//   try {
//     const { projectId } = req.params;
    
//     const connections = await StageConnection.find({ project: projectId })
//       .populate({
//         path: 'from_stage',
//         populate: {
//           path: 'stage',
//           model: 'Stage'
//         }
//       })
//       .populate({
//         path: 'to_stage',
//         populate: {
//           path: 'stage',
//           model: 'Stage'
//         }
//       });
    
//     res.status(200).json(connections);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error fetching stage connections", error });
//   }
// };







// // backend/controllers/project.js
// import Project from "../models/project.js";
// import ProjectStage from "../models/projectStage.js";
// import StageConnection from "../models/stageConnection.js";

// // Helper function to create a Date object at noon to avoid timezone issues
// const createLocalDate = (dateString) => {
//   const date = new Date(dateString);
//   // Set time to noon to avoid DST issues
//   date.setHours(12, 0, 0, 0);
//   return date;
// };

// // Helper function to format date as YYYY-MM-DD in local timezone
// const formatDateToLocal = (date) => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// };

// // Create a new project
// export const createProject = async (req, res) => {
//   try {
//     const { project_name, description, status, created_at } = req.body;
    
//     // Create a Date object at noon to avoid timezone issues
//     const createdAtDate = createLocalDate(created_at);
    
//     const newProject = new Project({
//       project_name,
//       description,
//       status: status || "Pending",
//       created_at: createdAtDate
//     });
    
//     await newProject.save();
//     res.status(201).json({ success: true, project: newProject });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// };

// // Get all projects
// export const getAllProjects = async (req, res) => {
//   try {
//     const projects = await Project.find();
    
//     // Format dates to YYYY-MM-DD for frontend in local timezone
//     const formattedProjects = projects.map(project => ({
//       ...project.toObject(),
//       created_at: formatDateToLocal(project.created_at)
//     }));
    
//     res.status(200).json(formattedProjects);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching projects", error });
//   }
// };

// // Get a single project with stages
// export const getProjectById = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const project = await Project.findById(id)
//       .populate({
//         path: 'stages',
//         populate: {
//           path: 'stage',
//           model: 'Stage'
//         }
//       });
    
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Format dates
//     const formattedProject = {
//       ...project.toObject(),
//       created_at: formatDateToLocal(project.created_at),
//       stages: project.stages.map(stage => ({
//         ...stage.toObject(),
//         start_date: stage.start_date ? formatDateToLocal(stage.start_date) : null,
//         completion_date: stage.completion_date ? formatDateToLocal(stage.completion_date) : null
//       }))
//     };
    
//     res.status(200).json(formattedProject);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching project", error });
//   }
// };

// // Update a project
// export const updateProject = async (req, res) => {
//   const { id } = req.params;
//   const { project_name, description, status, created_at } = req.body;
  
//   try {
//     // Create a Date object at noon to avoid timezone issues
//     const createdAtDate = createLocalDate(created_at);
    
//     const updatedProject = await Project.findByIdAndUpdate(
//       id,
//       { project_name, description, status, created_at: createdAtDate },
//       { new: true }
//     );
    
//     if (!updatedProject) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Format date to YYYY-MM-DD for frontend in local timezone
//     const formattedProject = {
//       ...updatedProject.toObject(),
//       created_at: formatDateToLocal(updatedProject.created_at)
//     };
    
//     res.status(200).json(formattedProject);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating project", error });
//   }
// };

// // Delete a project
// export const deleteProject = async (req, res) => {
//   const { id } = req.params;
  
//   try {
//     // Delete all project stages and connections
//     await ProjectStage.deleteMany({ project: id });
//     await StageConnection.deleteMany({ project: id });
    
//     const deletedProject = await Project.findByIdAndDelete(id);
    
//     if (!deletedProject) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     res.status(200).json({ message: "Project deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting project", error });
//   }
// };

// // Add a stage to a project
// export const addStageToProject = async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const { stageId, status, start_date, completion_date } = req.body;
    
//     // Check if project exists
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Get the current highest order number
//     const highestOrderStage = await ProjectStage.findOne({ project: projectId })
//       .sort({ order: -1 });
    
//     const order = highestOrderStage ? highestOrderStage.order + 1 : 1;
    
//     // Create new project stage
//     const newProjectStage = new ProjectStage({
//       project: projectId,
//       stage: stageId,
//       status,
//       start_date: status === 'Ongoing' ? createLocalDate(start_date) : undefined,
//       completion_date: status === 'Completed' ? createLocalDate(completion_date) : undefined,
//       order
//     });
    
//     await newProjectStage.save();
    
//     // Add stage to project
//     project.stages.push(newProjectStage._id);
//     await project.save();
    
//     // Populate stage details
//     const populatedStage = await ProjectStage.findById(newProjectStage._id)
//       .populate('stage');
    
//     // Format dates
//     const formattedStage = {
//       ...populatedStage.toObject(),
//       start_date: populatedStage.start_date ? formatDateToLocal(populatedStage.start_date) : null,
//       completion_date: populatedStage.completion_date ? formatDateToLocal(populatedStage.completion_date) : null
//     };
    
//     res.status(201).json(formattedStage);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error adding stage to project", error });
//   }
// };

// // Update a project stage
// export const updateProjectStage = async (req, res) => {
//   try {
//     const { projectId, stageId } = req.params;
//     const { status, start_date, completion_date } = req.body;
    
//     const projectStage = await ProjectStage.findOne({ 
//       _id: stageId, 
//       project: projectId 
//     });
    
//     if (!projectStage) {
//       return res.status(404).json({ message: "Project stage not found" });
//     }
    
//     // Update fields
//     if (status) projectStage.status = status;
//     if (start_date) projectStage.start_date = createLocalDate(start_date);
//     if (completion_date) projectStage.completion_date = createLocalDate(completion_date);
    
//     await projectStage.save();
    
//     // Populate stage details
//     const populatedStage = await ProjectStage.findById(projectStage._id)
//       .populate('stage');
    
//     // Format dates
//     const formattedStage = {
//       ...populatedStage.toObject(),
//       start_date: populatedStage.start_date ? formatDateToLocal(populatedStage.start_date) : null,
//       completion_date: populatedStage.completion_date ? formatDateToLocal(populatedStage.completion_date) : null
//     };
    
//     res.status(200).json(formattedStage);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error updating project stage", error });
//   }
// };

// // Delete a project stage
// export const deleteProjectStage = async (req, res) => {
//   try {
//     const { projectId, stageId } = req.params;
    
//     const projectStage = await ProjectStage.findOne({ 
//       _id: stageId, 
//       project: projectId 
//     });
    
//     if (!projectStage) {
//       return res.status(404).json({ message: "Project stage not found" });
//     }
    
//     // Delete all connections related to this stage
//     await StageConnection.deleteMany({ 
//       $or: [
//         { from_stage: stageId },
//         { to_stage: stageId }
//       ]
//     });
    
//     // Remove stage from project
//     await Project.findByIdAndUpdate(projectId, {
//       $pull: { stages: stageId }
//     });
    
//     // Delete the stage
//     await ProjectStage.findByIdAndDelete(stageId);
    
//     res.status(200).json({ message: "Project stage deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error deleting project stage", error });
//   }
// };

// // Create a connection between stages
// export const createStageConnection = async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const { fromStageId, toStageId } = req.body;
    
//     // Check if both stages exist and belong to the project
//     const fromStage = await ProjectStage.findOne({ 
//       _id: fromStageId, 
//       project: projectId 
//     });
    
//     const toStage = await ProjectStage.findOne({ 
//       _id: toStageId, 
//       project: projectId 
//     });
    
//     if (!fromStage || !toStage) {
//       return res.status(404).json({ message: "One or both stages not found" });
//     }
    
//     // Check if connection already exists
//     const existingConnection = await StageConnection.findOne({
//       from_stage: fromStageId,
//       to_stage: toStageId,
//       project: projectId
//     });
    
//     if (existingConnection) {
//       return res.status(400).json({ message: "Connection already exists" });
//     }
    
//     // Create new connection
//     const newConnection = new StageConnection({
//       from_stage: fromStageId,
//       to_stage: toStageId,
//       project: projectId
//     });
    
//     await newConnection.save();
    
//     // Add connection to both stages
//     fromStage.connections.push(newConnection._id);
//     toStage.connections.push(newConnection._id);
    
//     await fromStage.save();
//     await toStage.save();
    
//     res.status(201).json(newConnection);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error creating stage connection", error });
//   }
// };

// // Get all connections for a project
// export const getProjectStageConnections = async (req, res) => {
//   try {
//     const { projectId } = req.params;
    
//     const connections = await StageConnection.find({ project: projectId })
//       .populate({
//         path: 'from_stage',
//         populate: {
//           path: 'stage',
//           model: 'Stage'
//         }
//       })
//       .populate({
//         path: 'to_stage',
//         populate: {
//           path: 'stage',
//           model: 'Stage'
//         }
//       });
    
//     res.status(200).json(connections);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error fetching stage connections", error });
//   }
// };








// import Project from "../models/project.js";

// // Helper function to create a Date object at noon to avoid timezone issues
// const createLocalDate = (dateString) => {
//   const date = new Date(dateString);
//   // Set time to noon to avoid DST issues
//   date.setHours(12, 0, 0, 0);
//   return date;
// };

// // Helper function to format date as YYYY-MM-DD in local timezone
// const formatDateToLocal = (date) => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// };

// // Create a new project
// export const createProject = async (req, res) => {
//   try {
//     const { project_name, description, status, created_at } = req.body;
    
//     // Create a Date object at noon to avoid timezone issues
//     const createdAtDate = createLocalDate(created_at);
    
//     const newProject = new Project({
//       project_name,
//       description,
//       status: status || "Pending",
//       created_at: createdAtDate
//     });
    
//     await newProject.save();
//     res.status(201).json({ success: true, project: newProject });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// };

// // Get all projects
// export const getAllProjects = async (req, res) => {
//   try {
//     const projects = await Project.find();
    
//     // Format dates to YYYY-MM-DD for frontend in local timezone
//     const formattedProjects = projects.map(project => ({
//       ...project.toObject(),
//       created_at: formatDateToLocal(project.created_at)
//     }));
    
//     res.status(200).json(formattedProjects);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching projects", error });
//   }
// };

// // Update a project
// export const updateProject = async (req, res) => {
//   const { id } = req.params;
//   const { project_name, description, status, created_at } = req.body;
  
//   try {
//     // Create a Date object at noon to avoid timezone issues
//     const createdAtDate = createLocalDate(created_at);
    
//     const updatedProject = await Project.findByIdAndUpdate(
//       id,
//       { 
//         project_name, 
//         description, 
//         status, 
//         created_at: createdAtDate
//       },
//       { new: true }
//     );
    
//     if (!updatedProject) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Format date to YYYY-MM-DD for frontend in local timezone
//     const formattedProject = {
//       ...updatedProject.toObject(),
//       created_at: formatDateToLocal(updatedProject.created_at)
//     };
    
//     res.status(200).json(formattedProject);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating project", error });
//   }
// };

// // Delete a project
// export const deleteProject = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const deletedProject = await Project.findByIdAndDelete(id);
//     if (!deletedProject) {
//       return res.status(404).json({ message: "Project not found" });
//     }
//     res.status(200).json({ message: "Project deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting project", error });
//   }
// };