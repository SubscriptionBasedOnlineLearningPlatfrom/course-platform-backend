import { supabase } from "../../config/supabaseClient.js";

// Fetch all courses
export const getAllCourses = async (searchQuery = null) => {
    let query = supabase.from("courses").select("*");

    if (searchQuery) {
        // Search for courses that START WITH the typed letters
        query = query.or(`course_title.ilike.${searchQuery}%,category.ilike.${searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
};

// Fetch courses with real ratings calculated from comments
export const getCoursesWithRealRatings = async () => {
    const { data, error } = await supabase
        .from("courses")
        .select(`
            *,
            comments (rating)
        `);

    if (error) throw error;

    // Calculate average rating for each course
    const coursesWithRatings = data.map(course => {
        const ratings = course.comments || [];
        let averageRating = 0;
        let totalComments = ratings.length;

        if (totalComments > 0) {
            const sum = ratings.reduce((acc, comment) => acc + (comment.rating || 0), 0);
            averageRating = sum / totalComments;
        }

        return {
            ...course,
            real_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
            comment_count: totalComments,
            comments: undefined // Remove comments array to keep response clean
        };
    });

    return coursesWithRatings;
};

// Get featured courses based on real ratings (top 3 highest rated)
export const getFeaturedCourses = async () => {
    const coursesWithRatings = await getCoursesWithRealRatings();

    // Sort by real rating (desc) and comment count (desc) as tiebreaker
    const sortedCourses = coursesWithRatings
        .filter(course => course.comment_count > 0) // Only courses with comments
        .sort((a, b) => {
            if (b.real_rating !== a.real_rating) {
                return b.real_rating - a.real_rating;
            }
            return b.comment_count - a.comment_count;
        });

    // Return top 3 courses, or fallback to any 3 courses if none have ratings
    return sortedCourses.length >= 3 ? sortedCourses.slice(0, 3) : coursesWithRatings.slice(0, 3);
};

//get course details by courseId
export const courseDetailsByCourseId = async (courseId) => {
    const { data: course, error: courseError } = await supabase
        .from("course_details")
        .select("*")
        .eq("course_id", courseId)
        .single();

    if (courseError) {
        throw new Error(courseError.message);
    }

    const { data: modules, error: modulesError } = await supabase
        .from("modules_lessons")
        .select('*')
        .eq("course_id", courseId)
        .order("module_order", { ascending: true })

    if (modulesError) {
        throw new Error(modulesError.message);
    }
    return { course, modules };
}

// Create a new enrollment
export const createEnrollment = async (course_id, student_id) => {
    const { data, error } = await supabase
        .from('enrollments')
        .insert([{ course_id, student_id }])
        .select("*")
        .single();

    if (error) {
        throw new Error(error.message);
    }
    return data;
}

export const checkEnrollment = async (course_id, student_id) => {
    const { data, error } = await supabase
        .from("enrollments")
        .select("*")
        .eq("course_id", course_id)
        .eq("student_id", student_id);

    if (error) {
        throw new Error(error.message);
    }

    return data.length > 0;
}

export const getRelatedCourses = async (category) => {
    const { data: courses, error } = await supabase
        .from("course_details")
        .select("*")
        .eq("category", category)
        .limit(3);

    if (error) {
        throw new Error(error.message);
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
        throw new Error(commentsError.message);
    }

    const { data: studentReplies, error: studentRepliesError } = await supabase
        .from("student_comment_replies")
        .select("*")
        .order("created_at", { ascending: false });

    if (studentRepliesError) {
        throw new Error(studentRepliesError.message);
    }

    const repliesByComment = {};

    const { data: instructorReplies, error: instructorRepliesError } = await supabase
        .from("instructor_replies_for_student_comments")
        .select("*")
        .order("created_at", { ascending: false });

    if (instructorRepliesError) {
        throw new Error(instructorRepliesError.message);
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
        throw new Error(error.message);
    }
    return data;
}

// Edit a comment
export const editComment = async (comment_id, updatedText, updatedRating) => {
    const { data, error } = await supabase
        .from("comments")
        .update({
            comment_text: updatedText,
            rating: updatedRating,
            comment_date: new Date()
        })
        .eq("comment_id", comment_id)
        .select("*")
        .single();

    if (error) {
        throw new Error(error.message);
    }
    return data;
}

// Delete a comment
export const deleteComment = async (comment_id) => {
    const { data, error } = await supabase
        .from("comments")
        .delete()
        .eq("comment_id", comment_id)
        .select("*")
        .single();

    if (error) {
        throw new Error(error.message);
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
        throw new Error(error.message);
    }
    return data;
}

// Edit a reply
export const editReply = async (reply_id, updatedText) => {
    const { data, error } = await supabase
        .from("comment_replies")
        .update({ reply_text: updatedText })
        .eq("reply_id", reply_id)
        .select("*")
        .single();

    if (error) throw new Error(error.message);
    return data;
}

// Delete a reply
export const deleteReply = async (reply_id) => {
    const { data, error } = await supabase
        .from("comment_replies")
        .delete()
        .eq("reply_id", reply_id)
        .select("*")
        .single();

    if (error) throw new Error(error.message);
    return data;
}


// get progress percentage 
export const progressPercentage = async (studentId, courseId) => {
    const { data: lessons, error: lessonsError } = await supabase
        .from("course_lessons_connected_by_modules")
        .select("*")
        .eq("course_id", courseId);

    if (lessonsError) throw lessonsError;

    const totalLessons = lessons.length;

    // 2. Fetch student progress for this course
    const { data: progress, error: progressError } = await supabase
        .from("course_progress")
        .select("*")
        .eq("student_id", studentId)
        .eq("course_id", courseId);

    if (progressError) throw progressError;

    // 3. Count completed lessons
    let completedLessons = 0;
    lessons.forEach((lesson) => {
        const progressItem = progress.find(
            (p) => p.module_id === lesson.module_id
        );
        if (progressItem && progressItem.is_completed) completedLessons++;
    });
    // 4. Calculate percentage
    const progressPercentage =
        totalLessons === 0 ? 0 : (completedLessons / totalLessons) * 100;

    const { data: progressData, error: progressDataError } = await supabase
        .from("enrollments")
        .update({ progress: progressPercentage })
        .eq("course_id", courseId)
        .eq("student_id", studentId)
        .select()
        .single();

    return progressData;
}


export const addQuizMarks = async (courseId, studentId, newMark) => {
    // 1. Fetch current marks
    const { data: enrollment, error: fetchError } = await supabase
        .from('enrollments')
        .select('quizMarks')
        .eq('course_id', courseId)
        .eq('student_id', studentId)
        .single();

    if (fetchError) {
        console.error('Error fetching:', fetchError);
        return;
    }

    // 2. Add new mark to array
    const currentMarks = enrollment.quizMarks || [];
    const updatedMarks = [...currentMarks, newMark];

    // 3. Update back to database
    const { data, error: updateError } = await supabase
        .from('enrollments')
        .update({ quizMarks: updatedMarks })
        .eq('course_id', courseId)
        .eq('student_id', studentId);

    if (updateError) {
        throw new Error(error.message)
    }
}

export const getTotalMarks = async (courseId, studentId) => {
    const { data: quiz, error: quizError } = await supabase
        .from('course_lessons_connected_by_modules')
        .select('quiz_id')
        .eq('course_id', courseId);

    if (quizError) {
        throw new Error(quizError.message);
    }

    const totalQuiz = quiz.length;
    if (totalQuiz === 0) return 0;

    const { data: enrollment, error } = await supabase
        .from('enrollments')
        .select('quizMarks')
        .eq('course_id', courseId)
        .eq('student_id', studentId)
        .single();
    if (error) {
        throw new Error(error.message);
    }
    const marksArray = enrollment.quizMarks || [];
    const Marks = marksArray.reduce((acc, mark) => acc + mark, 0);
    const totalMarks = Marks / totalQuiz;
    return totalMarks;
}