import { transporter } from "../../config/nodemailer.js";
import { courseEnrollmentEmail } from "../../email-formats/courseEnrollment.js";
import { findUserById } from "../../models/student/authModel.js";
import { courseDetailsByCourseId, commentsReplies, createEnrollment, getRelatedCourses, createComment, createReply, checkEnrollment, editComment, deleteComment,deleteReply, editReply } from "../../models/student/courseModel.js";
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
        const student_id = req.studentId;
        const course_id = req.body.course_id;
        const student =await findUserById(student_id);
        const {course} =await courseDetailsByCourseId(course_id);
        const data = await createEnrollment(course_id, student_id);
        // Usage
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: student.email,
            subject: `Enrollment Successful – ${course.course_title}`,
            html: courseEnrollmentEmail(student.username, course.course_title)
        };

        await transporter.sendMail(mailOptions);
        
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }

}


export const checkCourseEnrollment = async (req, res) => {
    try {
        const studentId = req.studentId;
        const { courseId } = req.params;
        const isEnrolled = await checkEnrollment(courseId, studentId);

        if (!studentId) {
            return res.status(401).json({ error: 'Unauthorized - studentId missing' });
        }

        if (!courseId) {
            return res.status(400).json({ error: 'courseId is required in body' });
        }

        res.json({ isEnrolled })

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
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
export const viewCommentsWithReplies = async (req, res) => {
    try {
        const { courseId } = req.params;
        const comments = await commentsReplies(courseId);
        return res.json({ comments });

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }

}


// create a comment
export const postComment = async (req, res) => {
    try {
        const student_id = req.studentId;
        const course_id = req.params.courseId;
        const { rating, comment_text } = req.body;
        const data = await createComment(course_id, student_id, rating, comment_text);
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
export const editCommentByStudent = async (req, res) => {
    try {
        const comment_id = req.params.commentId;
        const { comment_text, rating } = req.body;
        const data = await editComment(comment_id, comment_text, rating);
        return res.status(200).json(data);

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}


// delete a reply
export const deleteCommentByStudent = async (req, res) => {
    try {
        const comment_id = req.params.commentId;
        if (!comment_id) {
            return res.status(400).json({ error: "reply_id is required" });
        }
        await deleteComment(comment_id);
        return res.status(200).send();
    } catch (error) {
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }
}


// create a reply
export const postReply = async (req, res) => {
    try {
        const student_id = req.studentId;
        const { comment_id, reply_text } = req.body;
        const data = await createReply(comment_id, student_id, reply_text);
        return res.status(200).json(data);

    }
    catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

export const editReplyByStudent = async (req, res) => {
    try {
        const reply_id = req.params.replyId;
        const { reply_text } = req.body;
        const data = await editReply(reply_id, reply_text);
        return res.status(200).json(data);

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}


// delete a reply
export const deleteReplyByStudent = async (req, res) => {
    try {
        const reply_id = req.params.replyId;
        if (!reply_id) {
            return res.status(400).json({ error: "reply_id is required" });
        }
        await deleteReply(reply_id);
        return res.status(200).send();
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }
}