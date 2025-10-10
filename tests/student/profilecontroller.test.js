import { getProfile, uploadProfileImage } from "../../controllers/student/profileController.js";
import * as profileModelModule from "../../models/student/profileModel.js";
import { s3 } from "../../config/doSpaces.js";

jest.mock("../../models/student/profileModel.js");
jest.mock("../../config/doSpaces.js");

describe("Profile Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      studentId: "student123",
      file: {
        originalname: "profile.png",
        buffer: Buffer.from("mockfile"),
        mimetype: "image/png",
      },
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should return profile data", async () => {
      const mockProfile = { id: "student123", name: "User" };
      profileModelModule.profileModel.mockResolvedValue(mockProfile);

      await getProfile(req, res);

      expect(profileModelModule.profileModel).toHaveBeenCalledWith("student123");
      expect(res.json).toHaveBeenCalledWith(mockProfile);
    });

    it("should handle errors with 500 response", async () => {
      profileModelModule.profileModel.mockRejectedValue(new Error("DB error"));

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Internal Server Error" }));
    });
  });

  describe("uploadProfileImage", () => {
    it("should upload image and update profile", async () => {
      const uploadReturn = { Location: "https://do-spaces.sfo.digitaloceanspaces.com/images/student_profiles/123-profile.png" };

      s3.upload.mockReturnValue({ promise: jest.fn().mockResolvedValue(uploadReturn) });
      profileModelModule.uploadProfile.mockResolvedValue({ id: "student123", imageUrl: uploadReturn.Location });

      await uploadProfileImage(req, res);

      expect(s3.upload).toHaveBeenCalledWith(expect.objectContaining({
        Bucket: "onlinelearningplatform",
        Key: expect.stringContaining("images/student_profiles/"),
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ACL: "public-read",
      }));
      expect(profileModelModule.uploadProfile).toHaveBeenCalledWith(uploadReturn.Location, "student123");
      expect(res.json).toHaveBeenCalledWith({ profile: { id: "student123", imageUrl: uploadReturn.Location } });
    });

    it("should handle errors with 500 response", async () => {
      s3.upload.mockReturnValue({ promise: jest.fn().mockRejectedValue(new Error("Upload error")) });

      await uploadProfileImage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(Error) }));
    });
  });
});
