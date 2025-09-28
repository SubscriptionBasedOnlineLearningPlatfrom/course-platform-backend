import { supabase } from "../../config/supabaseClient.js";

// create models 
export const studentCommentsModel = async (instructor_id) => {
    const { data: comments, commentError } = await supabase
        .from('students_comments_for_instructor')
        .select('*')
        .eq('instructor_id', instructor_id);

    if (commentError) {
        throw new Error(commentError.message);
    }

    const { data: replies, repliesError } = await supabase
        .from('instructor_replies_for_comments')
        .select('*')
        .order("updated_at", { ascending: false });

    if (repliesError) {
        throw new Error(repliesError.message);
    }

    const repliesByComment = (replies || []).reduce((acc, reply) => {
        (acc[reply.comment_id] ||= []).push(reply);
        return acc;
    }, {})

    const withReplies = (comments || []).reduce((acc, comment) => {
        acc[comment.comment_id] = {
            ...comment,
            replies: repliesByComment[comment.comment_id] || []
        }
        return acc;

    }, {})
    return withReplies;
}

export const createReplyModel = async (comment_id, instructor_id, reply_text) => {
    const { data, error } = await supabase
        .from("instructor_replies")
        .insert(comment_id, instructor_id, reply_text)
        .select('*')
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export const updateReplyModel = async (reply_id, reply_text) => {
    const { data, error } = await supabase
        .from("instructor_replies")
        .update({ reply_text: reply_text, updated_at: new Date().toISOString() })
        .eq('reply_id', reply_id)
        .select('*')
        .single();

    if (error) {
        throw new Error(error.message);
    }
    return data;
}

export const deleteReplyModel = async (reply_id) => {
    const { error } = await supabase
        .from("instructor_replies")
        .delete()
        .eq("reply_id", reply_id);

    if (error) {
        throw new Error(error.message);
    }
}