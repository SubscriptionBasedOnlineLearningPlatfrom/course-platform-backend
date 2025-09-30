import { profileModel } from "../../models/student/profileModel.js";

// get profile for navbar
export const getProfile = async (req,res) => {
    try {
        const studentId = req.studentId;
        const profile =await profileModel(studentId);

        res.json(profile);

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}