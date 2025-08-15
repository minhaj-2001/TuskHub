import User from "../models/user.js";

const getReferredUsers = async (req, res) => {
  try {
    const managerId = req.user._id;
    const referredUsers = await User.find({ referredBy: managerId }).select("-password");
    
    res.status(200).json(referredUsers);
  } catch (error) {
    console.error("Error fetching referred users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const managerId = req.user._id;
    
    // Check if the user to be updated is referred by the current manager
    const user = await User.findOne({ _id: userId, referredBy: managerId });
    
    if (!user) {
      return res.status(404).json({ message: "User not found or not referred by you" });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.status(200).json({ 
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive 
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getReferralLink = async (req, res) => {
  try {
    const manager = await User.findById(req.user._id);
    
    if (!manager.referralLink) {
      // Generate referral link if it doesn't exist
      manager.referralLink = `${process.env.FRONTEND_URL}/sign-up?ref=${manager._id}`;
      await manager.save();
    }
    
    res.status(200).json({ referralLink: manager.referralLink });
  } catch (error) {
    console.error("Error getting referral link:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  getReferredUsers,
  toggleUserStatus,
  getReferralLink
};