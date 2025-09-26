import { supabase } from "../../config/supabaseClient.js";

// Fetch all courses
export const getAllCourses = async () => {
    const { data, error } = await supabase.from("courses").select("*");
    if (error) throw error;
    return data;
};

//get course details by courseId
export const courseDetailsByCourseId = async (courseId) => {
    const { data: course, error: courseError } = await supabase
                                                        .from("course_details")
                                                        .select("*")
                                                        .eq("course_id", courseId)
                                                        .single();

    if (courseError) {
        return res.status(500).json({ error: courseError });
    }

    const { data: modules, error: modulesError } = await supabase
                                                            .from("modules_lessons")
                                                            .select('*')
                                                            .eq("course_id", courseId)
                                                            .order("module_order", { ascending: true })

    if (modulesError) {
        return res.status(500).json({ error: modulesError });
    }
    return { course, modules };
}

// Create a new enrollment
export const createEnrollment = async (course_id, student_id) => {
    const { data, error } = await supabase
                                    .from('enrollments')
                                    .insert({ course_id, student_id })
                                    .select("*")
                                    .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }
    return data;
}

export const getRelatedCourses = async (category) => {
    const { data: courses, error } = await supabase
                                            .from("course_details")
                                            .select("*")
                                            .eq("category",category)
                                            .limit(3);

        if (error) {
            return res.status(500).json({ error: error.message });
        }  
        return courses; 
}

// Fetch comments with their replies for a specific course
export const commentsReplies = async (courseId) => {
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
        return commentsWithReplies;
}

//create a new comment
export const createComment = async (course_id, student_id, rating, comment_text) => {
    const { data, error } = await supabase
                                    .from("comments")
                                    .insert({ course_id, student_id, rating, comment_text, comment_date: new Date() })
                                    .select("*")
                                    .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }
        return data;
}

export const createReply = async (comment_id, student_id, reply_text) => {
    const { data, error } = await supabase
                                    .from("comment_replies")
                                    .insert({ comment_id, student_id, reply_text })
                                    .select("*")
                                    .single();
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        return data;
}