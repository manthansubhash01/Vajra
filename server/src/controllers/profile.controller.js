const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

const updateAddress = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { address },
      { new: true, select: "-password" },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Address updated successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update address" });
  }
};

const updatePhone = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone is required" });
    }

    // Check if phone already exists for another user
    const existingUser = await User.findOne({
      phone,
      _id: { $ne: req.userId },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Phone number already in use" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { phone },
      { new: true, select: "-password" },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Phone updated successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update phone" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isCorrectPassword = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCorrectPassword) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update password" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to get profile" });
  }
};

module.exports = {
  updateAddress,
  updatePhone,
  updatePassword,
  getProfile,
};
