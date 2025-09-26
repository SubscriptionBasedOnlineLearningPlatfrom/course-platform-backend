import { courseDetailsByCourseId ,commentsReplies, createEnrollment, getRelatedCourses, createComment} from "../../models/student/courseModel.js";
import { z } from 'zod';

export const courseDetails = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const { course, modules } = await courseDetailsByCourseId(courseId);
        return res.json({ course, modules })

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error : ", details: error.message });
    }
}

const enrollmentSchema = z.object({
    course_id: z.uuid(),
    student_id: z.uuid()
})

// create a enrollment
export const enrollment = async (req, res) => {
    try {
        const parsed = enrollmentSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error })
        }

        const { course_id, student_id } = parsed.data;
        const data = await createEnrollment(course_id, student_id);
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({error:"Internal Server Error", details:error.message});
    }

}

// fetch courses which separate with categories
export const fetchRelatedCourses = async (req, res) => {
    try {
        const category = req.params.category;
        const courses = await getRelatedCourses(category); 
        return res.status(200).json({ courses });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

// fetch comments and replies for viewing students
export const viewCommentsWithReplies = async (req,res) => {
    try {
        const courseId = req.params.courseId;
        const comments =await commentsReplies(courseId);
        return res.json({ comments });

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
        
}

// create a comment
export const postComment = async (req, res) => {
    try {
        const course_id = req.params.courseId;
        const { student_id, rating, comment_text } = req.body;
        const data =await createComment(course_id, student_id, rating, comment_text);
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }   
}

// create a reply
export const postReply = async (req, res) => {
    try {
        const { comment_id, student_id, reply_text } = req.body;
        const data =await createReply(comment_id, student_id, reply_text);
        return res.status(200).json(data);

    }
    catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }   
}
