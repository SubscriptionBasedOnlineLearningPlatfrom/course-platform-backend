import { supabase } from '../../config/supabaseClient.js';


export const getModulesByCourse = async (courseId, studentId) => {
  //fetch the course name
  const { data: courseData, error: courseError } = await supabase
    .from('courses')
    .select('course_title')
    .eq('course_id', courseId)
    .single();

  if (courseError) throw courseError;

  //fetch modules with lessons
  const { data: moduleData, error: moduleError } = await supabase
    .from('modules')
    .select(`
      module_id,
      module_title,
      module_order,
      lessons(
        lesson_id,
        lesson_title,
        video_url,
        assignment_url,
        note_url
      )
    `)
    .eq('course_id', courseId)
    .order('module_order', { ascending: true });

  if (moduleError) throw moduleError;

  //fetch student's progress for these modules
  const { data: progressData, error: progressError } = await supabase
    .from('course_progress')
    .select('module_id, is_completed')
    .eq('student_id', studentId)
    .in(
      'module_id',
      moduleData.map((mod) => mod.module_id)
    );

  if (progressError) throw progressError;

  //combine results
  const modules = moduleData.map((mod) => {
    const progress = progressData.find((p) => p.module_id === mod.module_id);
    return {
      ...mod,
      course_title: courseData.course_title,
      chapters: mod.lessons || [],
      lessons: undefined,
      is_completed: progress ? progress.is_completed : false, 
    };
  });

  return modules;
};
