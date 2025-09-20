import { createChapter, removeChapter } from '../../models/chapterModel.js';

export const addChapter = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { lesson_title } = req.body;

    if (!lesson_title) return res.status(400).json({ message: 'Chapter title is required' });

    const newChapter = await createChapter(moduleId, lesson_title);

    res.status(201).json({ message: 'Chapter created', chapter: newChapter });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add chapter', error: err.message });
  }
};

export const deleteChapter = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const deleted = await removeChapter(lessonId);

    if (!deleted) {
      return res.status(404).json({ message: 'Chapter not found or could not be deleted' });
    }

    res.status(200).json({ message: 'Chapter deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete chapter', error: err.message });
  }
};
