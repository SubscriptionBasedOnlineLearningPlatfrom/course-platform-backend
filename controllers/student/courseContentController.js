import { getModulesByCourse } from '../../models/student/courseContentModel.js';

export const listModules = async (req, res) => {
  try {
    const { courseId } = req.params;
    const modules = await getModulesByCourse(courseId);
    res.status(200).json({ modules });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch modules', error: err.message });
  }
};

