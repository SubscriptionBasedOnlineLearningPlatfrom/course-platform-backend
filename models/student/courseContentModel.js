import { supabase } from '../../config/supabaseClient.js';

export const getModulesByCourse = async (courseId) => {
  // fetch the course name
  const { data: courseData, error: courseError } = await supabase
    .from('courses')
    .select('course_title')
    .eq('course_id', courseId)
    .single();

  if (courseError) throw courseError;

  // fetch modules with lessons
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

  // Combine results
  const modules = moduleData.map((mod) => ({
    ...mod,
    course_title: courseData.course_title,
    chapters: mod.lessons || [],
    lessons: undefined,
  }));

  return modules;
};
