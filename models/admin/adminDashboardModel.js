import { supabase } from "../../config/supabaseClient.js";

// Plan prices
const PLAN_PRICES = {
  Basic: 7000,
  Pro: 10000
};

// =====================
// Fetch Dashboard Stats
// =====================
export const getDashboardStats = async () => {
  // Counts for students, instructors, courses
  const [{ count: totalStudents }, { count: totalInstructors }, { count: totalCourses }] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('instructors').select('*', { count: 'exact', head: true }),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
  ]);

  // 1 month ago
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const oneMonthAgoISO = oneMonthAgo.toISOString();

  // Active subscriptions updated in the last month
  const { count: activeSubscriptions, error: activeSubscriptionsError } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .gte('updated_at', oneMonthAgoISO);

  if (activeSubscriptionsError) throw activeSubscriptionsError;

  // Fetch all payments to calculate revenue
  const { data: payments, error: paymentError } = await supabase
    .from('payments')
    .select('plan');

  if (paymentError) throw paymentError;
  // Calculate revenue per plan
  const revenueByPlan = payments?.reduce((acc, p) => {
    const plan = p.plan;
    if (plan && PLAN_PRICES[plan]) {
      acc[plan] = (acc[plan] || 0) + PLAN_PRICES[plan];
    }
    return acc;
  }, {});

  // Total revenue
  const totalRevenue = Object.values(revenueByPlan || {}).reduce((sum, v) => sum + v, 0);

  // Certificates issued
  const { count: certificatesIssued } = await supabase
    .from('certificates')
    .select('*', { count: 'exact', head: true });

  // Mock analytics
  const completionRate = 78;
  const monthlyGrowth = 12.5;

  return {
    totalStudents,
    totalInstructors,
    totalCourses,
    activeSubscriptions,
    totalRevenue,
    revenueByPlan,
    certificatesIssued,
    completionRate,
    monthlyGrowth
  };
};

// =====================
// Revenue Chart Data
// =====================
export const getRevenueData = async () => {
  const { data, error } = await supabase
    .from('payments')
    .select('plan, created_at');

  if (error) throw error;

  // Group revenue by month
  const monthly = {};
  data?.forEach(p => {
    const month = new Date(p.created_at).toLocaleString('default', { month: 'short' });
    const amount = PLAN_PRICES[p.plan] || 0;
    monthly[month] = (monthly[month] || 0) + amount;
  });

  return Object.entries(monthly).map(([month, revenue]) => ({ month, revenue }));
};

// =====================
// Enrollment Growth Data
// =====================
export const getEnrollmentData = async () => {
  const { data, error } = await supabase
    .from('enrollments')
    .select('enrollment_date, student_id, course_id');

  if (error) throw error;

  const monthly = {};
  data?.forEach(e => {
    const month = new Date(e.enrollment_date).toLocaleString('default', { month: 'short' });
    monthly[month] = monthly[month] || { students: 0, courses: 0 };
    monthly[month].students += 1;
  });

  return Object.entries(monthly).map(([month, stats]) => ({
    month,
    students: stats.students,
    instructors: 0
  }));
};

// =====================
// Course Distribution
// =====================
export const getCourseDistribution = async () => {
  const { data, error } = await supabase.from('courses').select('category');
  if (error) throw error;

  const counts = {};
  data?.forEach(c => {
    counts[c.category] = (counts[c.category] || 0) + 1;
  });

  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  return Object.keys(counts).map((cat, idx) => ({
    name: cat,
    value: counts[cat],
    color: colors[idx % colors.length]
  }));
};


