import express from "express";
import { supabase } from "../config/supabaseClient.js";
import { verifyAdminToken, requireAdmin } from "./adminAuth.js";

const router = express.Router();

// Get all users (students, instructors, admins)
router.get("/all", verifyAdminToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", role = "all" } = req.query;
    const offset = (page - 1) * limit;

    let allUsers = [];

    // Fetch students
    if (role === "all" || role === "student") {
      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select("student_id, username, email, created_at")
        .order("created_at", { ascending: false });

      if (studentsError) {
        console.error("Error fetching students:", studentsError);
        // Try without created_at if it doesn't exist
        const { data: studentsFallback, error: studentsFallbackError } = await supabase
          .from("students")
          .select("student_id, username, email")
          .order("student_id", { ascending: false });

        if (studentsFallbackError) {
          console.error("Error fetching students (fallback):", studentsFallbackError);
        } else {
          const studentUsers = studentsFallback?.map(student => ({
            id: student.student_id,
            name: student.username,
            email: student.email,
            role: "Student",
            status: "active",
            created_at: null,
            user_type: "student"
          })) || [];
          allUsers = [...allUsers, ...studentUsers];
        }
      } else {
        const studentUsers = students?.map(student => ({
          id: student.student_id,
          name: student.username,
          email: student.email,
          role: "Student",
          status: "active",
          created_at: student.created_at,
          user_type: "student"
        })) || [];
        allUsers = [...allUsers, ...studentUsers];
      }
    }

    // Fetch instructors
    if (role === "all" || role === "instructor") {
      const { data: instructors, error: instructorsError } = await supabase
        .from("instructors")
        .select("instructor_id, username, email")
        .order("instructor_id", { ascending: false });

      if (instructorsError) {
        console.error("Error fetching instructors:", instructorsError);
      } else {
        const instructorUsers = instructors?.map(instructor => ({
          id: instructor.instructor_id,
          name: instructor.username,
          email: instructor.email,
          role: "Instructor",
          status: "active", // Assume active if no is_active column
          created_at: null, // No created_at column in instructors table
          user_type: "instructor"
        })) || [];

        allUsers = [...allUsers, ...instructorUsers];
      }
    }

    // Fetch admins
    if (role === "all" || role === "admin") {
      const { data: admins, error: adminsError } = await supabase
        .from("admin_users")
        .select("admin_id, username, email, full_name, created_at, is_active, role")
        .order("created_at", { ascending: false });

      if (adminsError) throw adminsError;

      const adminUsers = admins?.map(admin => ({
        id: admin.admin_id,
        name: admin.full_name || admin.username,
        email: admin.email,
        role: admin.role === "super_admin" ? "Super Admin" : "Admin",
        status: admin.is_active ? "active" : "inactive",
        created_at: admin.created_at,
        user_type: "admin"
      })) || [];

      allUsers = [...allUsers, ...adminUsers];
    }

    // Apply search filter
    if (search) {
      allUsers = allUsers.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply pagination
    const totalUsers = allUsers.length;
    const paginatedUsers = allUsers.slice(offset, offset + parseInt(limit));

    res.json({
      users: paginatedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Toggle user status (activate/deactivate)
router.patch("/:userType/:userId/status", verifyAdminToken, requireAdmin, async (req, res) => {
  try {
    const { userType, userId } = req.params;
    const { status } = req.body; // "active" or "inactive"

    // For now, since is_active column may not exist in students/instructors tables,
    // we'll return a message that this feature needs database schema update
    if (userType === "student" || userType === "instructor") {
      return res.json({
        message: `Status update feature not available for ${userType}s yet. Database schema needs to be updated to include is_active column.`,
        note: "This is a planned feature that requires database migration."
      });
    }

    const isActive = status === "active";

    let tableName, idField;
    switch (userType) {
      case "admin":
        tableName = "admin_users";
        idField = "admin_id";
        break;
      default:
        return res.status(400).json({ error: "Invalid user type" });
    }

    const { data, error } = await supabase
      .from(tableName)
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq(idField, userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: `Admin ${status === "active" ? "activated" : "deactivated"} successfully`,
      user: data
    });

  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ error: "Failed to update user status" });
  }
});

// Get user statistics
router.get("/stats", verifyAdminToken, requireAdmin, async (req, res) => {
  try {
    // Get student count
    const { count: studentCount, error: studentError } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true });

    if (studentError) {
      console.error("Error fetching student count:", studentError);
    }

    // Get instructor count
    const { count: instructorCount, error: instructorError } = await supabase
      .from("instructors")
      .select("*", { count: "exact", head: true });

    if (instructorError) {
      console.error("Error fetching instructor count:", instructorError);
    }

    // Get admin count
    const { count: adminCount, error: adminError } = await supabase
      .from("admin_users")
      .select("*", { count: "exact", head: true });

    if (adminError) {
      console.error("Error fetching admin count:", adminError);
    }

    // For now, assume all users are active since is_active column may not exist
    const activeStudents = studentCount || 0;
    const activeInstructors = instructorCount || 0;
    const activeAdmins = adminCount || 0;

    res.json({
      total: {
        students: studentCount || 0,
        instructors: instructorCount || 0,
        admins: adminCount || 0,
        all: (studentCount || 0) + (instructorCount || 0) + (adminCount || 0)
      },
      active: {
        students: activeStudents,
        instructors: activeInstructors,
        admins: activeAdmins,
        all: activeStudents + activeInstructors + activeAdmins
      }
    });

  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Failed to fetch user statistics" });
  }
});

export default router;