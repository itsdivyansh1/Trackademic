import { Request, Response } from "express";
import { prisma } from "../config/db.conf";

// USERS
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        department: true,
        stdId: true,
        role: true,
        isApproved: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
        // Don't include password in response
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Approve user (force true)
export const approveUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "User ID is required" });

    const user = await prisma.user.update({
      where: { id },
      data: { isApproved: true },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        department: true,
        stdId: true,
        role: true,
        isApproved: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    
    res.json({ 
      message: 'User approved successfully',
      user 
    });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
};

// Toggle approval (approve/disapprove)
export const toggleUserApproval = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "User ID is required" });

    const existing = await prisma.user.findUnique({ 
      where: { id },
      select: { id: true, isApproved: true, name: true }
    });
    
    if (!existing) return res.status(404).json({ error: "User not found" });

    const updated = await prisma.user.update({
      where: { id },
      data: { isApproved: !existing.isApproved },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        department: true,
        stdId: true,
        role: true,
        isApproved: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    res.json({
      message: `User ${updated.isApproved ? 'approved' : 'rejected'} successfully`,
      user: updated
    });
  } catch (error) {
    console.error('Error toggling user approval:', error);
    res.status(500).json({ error: 'Failed to update user approval status' });
  }
};

// Update user role
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!id) return res.status(400).json({ error: "User ID is required" });
    if (!role) return res.status(400).json({ error: "Role is required" });

    // Use Prisma enum values
    const allowedRoles = ["STUDENT", "FACULTY", "ADMIN"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ 
        error: "Invalid role",
        allowedRoles 
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ 
      where: { id },
      select: { id: true, name: true, role: true }
    });
    
    if (!existingUser) return res.status(404).json({ error: "User not found" });

    const updated = await prisma.user.update({
      where: { id },
      data: { role: role as any },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        department: true,
        stdId: true,
        role: true,
        isApproved: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    res.json({
      message: `User role updated from ${existingUser.role} to ${role} successfully`,
      user: updated
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "User ID is required" });

    // Check if user exists and get their info for the response
    const existingUser = await prisma.user.findUnique({ 
      where: { id },
      select: { id: true, name: true, email: true }
    });
    
    if (!existingUser) return res.status(404).json({ error: "User not found" });

    // Delete user (this will cascade delete related records)
    await prisma.user.delete({ where: { id } });
    
    res.json({ 
      message: `User ${existingUser.name} (${existingUser.email}) deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Get user statistics
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      approvedUsers,
      pendingUsers,
      studentCount,
      facultyCount,
      adminCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isApproved: true } }),
      prisma.user.count({ where: { isApproved: false } }),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'FACULTY' } }),
      prisma.user.count({ where: { role: 'ADMIN' } })
    ]);

    res.json({
      total: totalUsers,
      approved: approvedUsers,
      pending: pendingUsers,
      students: studentCount,
      faculty: facultyCount,
      admins: adminCount
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
};

// ---- ACHIEVEMENTS ----
export const getAllAchievements = async (req: Request, res: Response) => {
  try {
    const achievements = await prisma.achievement.findMany({
      include: { 
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
};

export const approveAchievement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Achievement ID is required" });

    const achievement = await prisma.achievement.update({
      where: { id },
      data: { 
        isApproved: true, 
        approvedById: (req.user as any).id 
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    res.json({
      message: 'Achievement approved successfully',
      achievement
    });
  } catch (error) {
    console.error('Error approving achievement:', error);
    res.status(500).json({ error: 'Failed to approve achievement' });
  }
};

export const rejectAchievement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Achievement ID is required" });

    const achievement = await prisma.achievement.update({
      where: { id },
      data: { 
        isApproved: false, 
        approvedById: null 
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    res.json({
      message: 'Achievement rejected successfully',
      achievement
    });
  } catch (error) {
    console.error('Error rejecting achievement:', error);
    res.status(500).json({ error: 'Failed to reject achievement' });
  }
};

// ---- PUBLICATIONS ----
export const getAllPublications = async (req: Request, res: Response) => {
  try {
    const publications = await prisma.researchPublication.findMany({
      include: { 
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(publications);
  } catch (error) {
    console.error('Error fetching publications:', error);
    res.status(500).json({ error: 'Failed to fetch publications' });
  }
};

export const approvePublication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Publication ID is required" });

    const publication = await prisma.researchPublication.update({
      where: { id },
      data: { 
        isApproved: true, 
        approvedById: (req.user as any).id 
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    res.json({
      message: 'Publication approved successfully',
      publication
    });
  } catch (error) {
    console.error('Error approving publication:', error);
    res.status(500).json({ error: 'Failed to approve publication' });
  }
};

export const rejectPublication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Publication ID is required" });

    const publication = await prisma.researchPublication.update({
      where: { id },
      data: { 
        isApproved: false, 
        approvedById: null 
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    res.json({
      message: 'Publication rejected successfully',
      publication
    });
  } catch (error) {
    console.error('Error rejecting publication:', error);
    res.status(500).json({ error: 'Failed to reject publication' });
  }
};

// Delete achievement
export const deleteAchievementAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Achievement ID is required" });

    const existing = await prisma.achievement.findUnique({ where: { id }, select: { id: true, title: true } });
    if (!existing) return res.status(404).json({ error: "Achievement not found" });

    await prisma.achievement.delete({ where: { id } });
    res.json({ message: `Achievement ${existing.title} deleted successfully` });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    res.status(500).json({ error: 'Failed to delete achievement' });
  }
};

// Delete publication
export const deletePublicationAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Publication ID is required" });

    const existing = await prisma.researchPublication.findUnique({ where: { id }, select: { id: true, title: true } });
    if (!existing) return res.status(404).json({ error: "Publication not found" });

    await prisma.researchPublication.delete({ where: { id } });
    res.json({ message: `Publication ${existing.title} deleted successfully` });
  } catch (error) {
    console.error('Error deleting publication:', error);
    res.status(500).json({ error: 'Failed to delete publication' });
  }
};
