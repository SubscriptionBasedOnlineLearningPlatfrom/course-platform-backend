import { supabase } from "../../config/supabaseClient.js";
import { z } from 'zod';

export const viewStudentsComments = async (req, res) => {
    try {
        const instructor_id = req.instructorId;

        const { data: comments, commentError } = await supabase
            .from('students_comments_for_instructor')
            .select('*')
            .eq('instructor_id', instructor_id);

        if (commentError) {
            return res.status().json({ error: error.message })
        }

        console.log(comments);
        const { data: replies, repliesError } = await supabase
            .from('instructor_replies_for_comments')
            .select('*')
            // .eq('instructor_id', instructor_id)
            .order("updated_at", { ascending: false });

        if (repliesError) {
            return res.status(500).json({ error: error.message })
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
        // console.log(JSON.stringify(withReplies, null, 2));
        return res.status(200).json(withReplies);


    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error : ", details: error.message })
    }
}


// create a reply for comments
const createReplySchema = z.object({
    comment_id: z.uuid(),
    instructor_id: z.uuid(),
    reply_text: z.string().min(1).max(5000)
})

export const createReplyForComment = async (req, res) => {
    try {
        const parsed = createReplySchema.safeParse({
            comment_id: req.params.commentId,
            instructor_id: req.instructorId,
            reply_text: req.body.reply_text
        })

        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error });
        }

        const { data, error } = await supabase
            .from("instructor_replies")
            .insert(parsed.data)
            .select('*')
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }
        console.log(data);
        return res.json(data);

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }
}

// update a reply
const updateReplySchema = z.object({
    reply_text: z.string().min(1).max(5000)
})

export const updateReplyForComment = async (req, res) => {
    try {
        const parsed = updateReplySchema.safeParse({
            reply_text: req.body.reply_text
        })

        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error });
        }

        const { data, error } = await supabase
            .from("instructor_replies")
            .update({ reply_text: parsed.data.reply_text, updated_at: new Date().toISOString() })
            .eq('reply_id', req.params.replyId)
            .select('*')
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.json(data);

    } catch (error) {
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }
}

// delete a reply
export const deleteReply = async (req, res) => {

    try {
        const { error } = await supabase
            .from("instructor_replies")
            .delete()
            .eq("reply_id", req.params.replyId);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).send()
    } catch (error) {
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }

}