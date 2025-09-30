import { s3 } from "../../config/doSpaces.js";
import { profileModel, uploadProfile } from "../../models/student/profileModel.js";

// get profile for navbar
export const getProfile = async (req, res) => {
    try {
        const studentId = req.studentId;
        const profile = await profileModel(studentId);

        res.json(profile);

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

export const uploadProfileImage = async (req, res) => {
    try {
        const file = req.file;
        const studentId = req.studentId;
        const fileName = `${Date.now()}-${file.originalname}`;

        const params = {
            Bucket: "onlinelearningplatform",
            Key: `images/student_profiles/${fileName}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: "public-read", // make URL public
        }
        const uploadResult = await s3.upload(params).promise();
        const imageUrl = uploadResult.Location;

        const profile =await uploadProfile(imageUrl, studentId);

        res.json({profile});
    } catch (error) {
         return res.status(500).json({ error });
    }
}