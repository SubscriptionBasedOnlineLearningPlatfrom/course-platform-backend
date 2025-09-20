import { supabase } from "../../config/supabaseClient.js";
import { z } from 'zod';
import { createReplyModel, studentCommentsModel, updateReplyModel } from "../../models/instructor/commentModel.js";

export const viewStudentsComments = async (req, res) => {
    try {
        const instructor_id = req.instructorId;

        const withReplies = await studentCommentsModel(instructor_id);
        
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

        const {comment_id, instructor_id, reply_text} = parsed.data;
        const data = createReplyModel(comment_id, instructor_id, reply_text);
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

        const reply_id = req.params.replyId;

        const parsed = updateReplySchema.safeParse({
            reply_text: req.body.reply_text
        })

        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error });
        }

        const {reply_text} = parsed.data;

        const data = updateReplyModel(reply_id,reply_text);
        
        return res.json(data);

    } catch (error) {
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }
}

// delete a reply
export const deleteReply = async (req, res) => {

    try {
        const reply_id = req.params.reply_id;

        deleteReply(reply_id);

        return res.status(200).send()
    } catch (error) {
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }

}