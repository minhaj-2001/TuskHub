import Stage from "../models/stage.js";
import User from "../models/user.js";

// Helper function to format date as YYYY-MM-DD in local timezone
const formatDateToLocal = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get all stages
export const getAllStages = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    let query = {};
    
    // Role-based access control
    if (userRole === "manager") {
      // Managers can see their own stages
      query.owner = userId;
    } else if (userRole === "user") {
      // Users can see stages of their manager
      const manager = await User.findById(userId);
      if (manager && manager.referredBy) {
        query.owner = manager.referredBy;
      } else {
        // If user doesn't have a manager, they can't see any stages
        return res.status(200).json([]);
      }
    }
    
    const stages = await Stage.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    
    // Format dates
    const formattedStages = stages.map(stage => ({
      ...stage.toObject(),
      createdAt: formatDateToLocal(stage.createdAt),
      updatedAt: formatDateToLocal(stage.updatedAt)
    }));
    
    res.status(200).json(formattedStages);
  } catch (error) {
    console.error("Error fetching stages:", error);
    res.status(500).json({ message: "Error fetching stages", error: error.message });
  }
};

// Add a new stage
export const addStage = async (req, res) => {
  try {
    const { stage_name, description } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Only managers can add stages
    if (userRole !== "manager") {
      return res.status(403).json({ success: false, error: "Only managers can add stages" });
    }
    
    const newStage = new Stage({
      stage_name,
      description,
      owner: userId
    });
    
    await newStage.save();
    
    // Populate owner details
    const populatedStage = await Stage.findById(newStage._id).populate('owner', 'name email');
    
    res.status(201).json({ success: true, stage: populatedStage });
  } catch (error) {
    console.error("Error adding stage:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Update a stage
export const updateStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage_name, description } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Check if stage exists and belongs to the current manager
    const existingStage = await Stage.findOne({ _id: id, owner: userId });
    if (!existingStage) {
      return res.status(404).json({ success: false, error: "Stage not found" });
    }
    
    // Only managers can update stages
    if (userRole !== "manager") {
      return res.status(403).json({ success: false, error: "Only managers can update stages" });
    }
    
    const updatedStage = await Stage.findByIdAndUpdate(
      id,
      { stage_name, description },
      { new: true }
    ).populate('owner', 'name email');
    
    res.status(200).json({ success: true, stage: updatedStage });
  } catch (error) {
    console.error("Error updating stage:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Delete a stage
export const deleteStage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Check if stage exists and belongs to the current manager
    const existingStage = await Stage.findOne({ _id: id, owner: userId });
    if (!existingStage) {
      return res.status(404).json({ success: false, error: "Stage not found" });
    }
    
    // Only managers can delete stages
    if (userRole !== "manager") {
      return res.status(403).json({ success: false, error: "Only managers can delete stages" });
    }
    
    await Stage.findByIdAndDelete(id);
    
    res.status(200).json({ success: true, message: "Stage deleted successfully" });
  } catch (error) {
    console.error("Error deleting stage:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};










// import Stage from "../models/stage.js";

// // Get all stages
// export const getAllStages = async (req, res) => {
//   try {
//     const stages = await Stage.find();
//     res.status(200).json(stages);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching stages", error });
//   }
// };

// // Add a new stage
// export const addStage = async (req, res) => {
//   try {
//     const { stage_name, description } = req.body;
//     const newStage = new Stage({
//       stage_name,
//       description
//     });
//     await newStage.save();
//     res.status(201).json(newStage);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// };

// // Update an existing stage
// export const updateStage = async (req, res) => {
//   const { id } = req.params;
//   const { stage_name, description } = req.body;
//   try {
//     const updatedStage = await Stage.findByIdAndUpdate(
//       id,
//       { stage_name, description },
//       { new: true }
//     );
//     if (!updatedStage) {
//       return res.status(404).json({ message: "Stage not found" });
//     }
//     res.status(200).json(updatedStage);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating stage", error });
//   }
// };

// // Delete a stage
// export const deleteStage = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const deletedStage = await Stage.findByIdAndDelete(id);
//     if (!deletedStage) {
//       return res.status(404).json({ message: "Stage not found" });
//     }
//     res.status(200).json({ message: "Stage deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting stage", error });
//   }
// };