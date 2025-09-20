import { supabase } from '../config/supabaseClient.js';

// Add a chapter (lesson) to a module
export const createChapter = async (moduleId, lessonTitle) => {
  // Get last lesson order for this module
  const { data: lastLesson, error: fetchError } = await supabase
    .from('lessons')
    .select('lesson_order')
    .eq('module_id', moduleId)
    .order('lesson_order', { ascending: false })
    .limit(1)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError; // ignore "no rows" error

  const nextOrder = lastLesson ? lastLesson.lesson_order + 1 : 1;

  // Insert lesson
  const { data, error } = await supabase
    .from('lessons')
    .insert([
      {
        module_id: moduleId,
        lesson_title: lessonTitle,
        lesson_order: nextOrder,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete chapter (lesson)
export const removeChapter = async (lessonId) => {
  const { data, error } = await supabase
    .from('lessons')
    .delete()
    .eq('lesson_id', lessonId)
    .select();

  if (error) throw new Error(error.message);

  return data && data.length > 0;
};
