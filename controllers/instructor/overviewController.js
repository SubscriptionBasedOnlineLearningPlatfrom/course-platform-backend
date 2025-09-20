import { supabase } from "../../config/supabaseClient.js";

// Enrollement Overview
export const EnrollementOverview = async (req,res) => {

    try {
        const instructorId = req.instructorId;

        const {data,error} = await supabase
                                    .from('v_enrollment_overview')
                                    .select('*')
                                    .eq('instructor_id', instructorId);
        if(error){
            return res.status(500).json({error : error.message});
        }

        res.json(data);

    } catch (error) {
        console.log(error)
        res.status(500).json({error : "Internal server error", details : error.message});
    }
    

}

// view created courses
export const viewCreatedCourses = async (req,res,next) => {
    try {
        const instructorId = req.instructorId;

        const {data,error} = await supabase
                                    .from('v_created_courses')
                                    .select('*')
                                    .eq('instructor_id',instructorId);
        
        if(error){
            return res.status(500).json({error : error.message});
        }

        res.json(data);

    } catch (error) {
        return res.status(500).json({error : "Internal server error", details : error.message })
    }
}

export const editCreatedCourse = async (req,res,next) => {
    try {
        const courseId = req.params.courseId;
        const { course_title, course_description, category } = req.body;

        const {data,error} = await supabase
                                    .from('courses')
                                    .update({ course_title, course_description, category, updated_at: new Date().toISOString() })
                                    .eq('course_id', courseId)
                                    .single();
        if(error){
            return res.status(500).json({error : error.message});
        }
        res.json(data);

    } catch (error) {
        return res.status(500).json({error : "Internal server error", details : error.message })
    }
}
