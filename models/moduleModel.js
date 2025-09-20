import { supabase } from '../config/supabaseClient.js';

export const createModule = async (courseId, title) => {
  // Get the last module order for this course
  const { data: lastModule, error: fetchError } = await supabase
    .from('modules')
    .select('module_order')
    .eq('course_id', courseId)
    .order('module_order', { ascending: false })
    .limit(1)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError; // ignore "no rows" error

  const nextOrder = lastModule ? lastModule.module_order + 1 : 1;

  const { data, error } = await supabase
    .from('modules')
    .insert([{ course_id: courseId, module_title: title, module_order: nextOrder }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getModulesByCourse = async (courseId) => {
  // Fetch modules with lessons nested
  const { data, error } = await supabase
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

  if (error) throw error;

  // Make sure lessons is always an array
  const modules = data.map((mod) => ({
    ...mod,
    chapters: mod.lessons || [],
    lessons: undefined, // remove lessons key if want
  }));

  return modules;
};


export const removeModule = async (moduleId) => {
  // delete lessons first (if any)
  const { error: lessonError } = await supabase
    .from('lessons')
    .delete()
    .eq('module_id', moduleId);

  if (lessonError) throw new Error(lessonError.message);

  // delete module
  const { data, error } = await supabase
    .from('modules')
    .delete()
    .eq('module_id', moduleId)
    .select();

  if (error) throw new Error(error.message);

  // check safely
  return data && data.length > 0;
};

