import { supabase } from "../../config/supabaseClient.js";
import { courseDetailsByCourseId } from "../../models/courseModel.js";
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

export const enrollment = async (req, res) => {
    try {
        const parsed = enrollmentSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error })
        }

        const { course_id, student_id } = parsed.data;

        const { data, error } = await supabase
            .from('enrollments')
            .insert({ course_id, student_id })
            .select("*")
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({error:"Internal Server Error", details:error.message});
    }

}

export const fetchRelatedCourses = async (req, res) => {
    try {
        const { data: courses, error } = await supabase
            .from("course_details")
            .select("*")
            .eq("category",req.params.category)
            .limit(3);

        if (error) {
            return res.status(500).json({ error: error.message });
        }   
        return res.status(200).json({ courses });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

export const viewCommentsWithReplies = async (req,res) => {
    try {
        const courseId = req.params.courseId;
        const { data: comments, error: commentsError } = await supabase
            .from("student_comments")
            .select("*")
            .eq("course_id", courseId)
            .order("created_at", { ascending: false });

        if (commentsError) {
            return res.status(500).json({ error: commentsError });
        }

        const { data: studentReplies, error: studentRepliesError } = await supabase
            .from("student_comment_replies")
            .select("*")
            .order("created_at", { ascending: false });

        if (studentRepliesError) {
            return res.status(500).json({ error: studentRepliesError });
        }

        const repliesByComment = {};

        const { data: instructorReplies, error: instructorRepliesError } = await supabase
            .from("instructor_replies_for_student_comments")
            .select("*")
            .order("created_at", { ascending: false });

        if (instructorRepliesError) {
            return res.status(500).json({ error: instructorRepliesError });
        }

        [...(studentReplies || []), ...(instructorReplies || [])].forEach(reply => {
            if (!repliesByComment[reply.comment_id]) {
                repliesByComment[reply.comment_id] = [];
            }
            repliesByComment[reply.comment_id].push(reply);
        });

        const commentsWithReplies = (comments || []).map(comment => ({
            ...comment,
            replies: repliesByComment[comment.comment_id] || []
        }));

        return res.json({ comments: commentsWithReplies });

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
        
}

export const postComment = async (req, res) => {
    try {
        const course_id = req.params.courseId;
        console.log(course_id)
        const { student_id, rating, comment_text } = req.body;

        const { data, error } = await supabase
            .from("comments")
            .insert({ course_id, student_id, rating, comment_text, comment_date: new Date() })
            .select("*")
            .single();

        if (error) {
            console.log(error);
            return res.status(500).json({ error: error.message });
        }
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }   
}

export const postReply = async (req, res) => {
    try {
        
        const { comment_id, student_id, reply_text } = req.body;
        const { data, error } = await supabase
            .from("comment_replies")
            .insert({ comment_id, student_id, reply_text })
            .select("*")
            .single();
        if (error) {
            console.log(error);
            return res.status(500).json({ error: error.message });
        }
        return res.status(200).json(data);
    }
    catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }   
}