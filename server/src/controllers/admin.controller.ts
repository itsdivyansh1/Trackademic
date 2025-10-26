import { Request, Response } from "express";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "../config/db.conf";
import { User as PrismaUser } from "@prisma/client";
import { S3_BUCKET_NAME } from "../config/index.conf";
import s3 from "../config/s3.config";
import * as XLSX from "xlsx";

// Helper function to add signed URLs
async function addSignedUrls(items: any[]) {
  return Promise.all(
    items.map(async (item) => {
      if (!item.fileUrl) return item;
      try {
        const command = new GetObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: item.fileUrl,
        });
        const signedUrl = await getSignedUrl(s3, command, {
          expiresIn: 60 * 5, // 5 minutes
        });
        return { ...item, fileUrl: signedUrl };
      } catch (err) {
        // If signed URL fails, return item as-is (no crash)
        return item;
      }
    })
  );
}

// Get all users for admin
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
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user statistics
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const approvedUsers = await prisma.user.count({ where: { isApproved: true } });
    const pendingUsers = await prisma.user.count({ where: { isApproved: false } });
    const students = await prisma.user.count({ where: { role: 'STUDENT' } });
    const faculty = await prisma.user.count({ where: { role: 'FACULTY' } });
    const admins = await prisma.user.count({ where: { role: 'ADMIN' } });

    res.json({
      total: totalUsers,
      approved: approvedUsers,
      pending: pendingUsers,
      students,
      faculty,
      admins
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
};

// Approve user
export const approveUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isApproved: true }
    });

    res.json({ message: 'User approved successfully', user: updatedUser });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
};

// Toggle user approval status
export const toggleUserApproval = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentAdminId = (req.user as PrismaUser)?.id;

    if (!id) return res.status(400).json({ error: "User ID is required" });

    // Prevent admin from modifying their own approval status
    if (currentAdminId === id) {
      return res.status(403).json({ error: "You cannot modify your own approval status" });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isApproved: !user.isApproved }
    });

    res.json({ 
      message: `User ${updatedUser.isApproved ? 'approved' : 'rejected'} successfully`, 
      user: updatedUser 
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
    const currentAdminId = (req.user as PrismaUser)?.id;

    if (!id) return res.status(400).json({ error: "User ID is required" });
    if (!role) return res.status(400).json({ error: "Role is required" });

    // Prevent admin from changing their own role
    if (currentAdminId === id) {
      return res.status(403).json({ error: "You cannot modify your own role" });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role }
    });

    res.json({ message: "User role updated successfully", user: updatedUser });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentAdminId = (req.user as PrismaUser)?.id;

    if (!id) return res.status(400).json({ error: "User ID is required" });

    // Prevent admin from deleting their own account
    if (currentAdminId === id) {
      return res.status(403).json({ error: "You cannot delete your own account" });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Get all achievements for admin
export const getAllAchievements = async (req: Request, res: Response) => {
  try {
    const achievements = await prisma.achievement.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Add signed URLs for file access
    const achievementsWithUrls = await addSignedUrls(achievements);
    res.json(achievementsWithUrls);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
};

// Approve achievement
export const approveAchievement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Achievement ID is required' });
    }

    const achievement = await prisma.achievement.findUnique({ where: { id } });
    
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    const updatedAchievement = await prisma.achievement.update({
      where: { id },
      data: { isApproved: true }
    });

    // Add signed URL for file access
    const achievementWithUrl = (await addSignedUrls([updatedAchievement]))[0];
    res.json({ message: 'Achievement approved successfully', achievement: achievementWithUrl });
  } catch (error) {
    console.error('Error approving achievement:', error);
    res.status(500).json({ error: 'Failed to approve achievement' });
  }
};

// Reject achievement
export const rejectAchievement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Achievement ID is required' });
    }

    const achievement = await prisma.achievement.findUnique({ where: { id } });
    
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    const updatedAchievement = await prisma.achievement.update({
      where: { id },
      data: { isApproved: false }
    });

    res.json({ message: 'Achievement rejected successfully', achievement: updatedAchievement });
  } catch (error) {
    console.error('Error rejecting achievement:', error);
    res.status(500).json({ error: 'Failed to reject achievement' });
  }
};

// Delete achievement (admin)
export const deleteAchievementAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Achievement ID is required' });
    }

    const achievement = await prisma.achievement.findUnique({ where: { id } });
    
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    await prisma.achievement.delete({ where: { id } });
    res.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    res.status(500).json({ error: 'Failed to delete achievement' });
  }
};

// Get all publications for admin
export const getAllPublications = async (req: Request, res: Response) => {
  try {
    const publications = await prisma.researchPublication.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Add signed URLs for file access
    const publicationsWithUrls = await addSignedUrls(publications);
    res.json(publicationsWithUrls);
  } catch (error) {
    console.error('Error fetching publications:', error);
    res.status(500).json({ error: 'Failed to fetch publications' });
  }
};

// Approve publication
export const approvePublication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Publication ID is required' });
    }

    const publication = await prisma.researchPublication.findUnique({ where: { id } });
    
    if (!publication) {
      return res.status(404).json({ error: 'Publication not found' });
    }

    const updatedPublication = await prisma.researchPublication.update({
      where: { id },
      data: { isApproved: true }
    });

    // Add signed URL for file access
    const publicationWithUrl = (await addSignedUrls([updatedPublication]))[0];
    res.json({ message: 'Publication approved successfully', publication: publicationWithUrl });
  } catch (error) {
    console.error('Error approving publication:', error);
    res.status(500).json({ error: 'Failed to approve publication' });
  }
};

// Reject publication
export const rejectPublication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Publication ID is required' });
    }

    const publication = await prisma.researchPublication.findUnique({ where: { id } });
    
    if (!publication) {
      return res.status(404).json({ error: 'Publication not found' });
    }

    const updatedPublication = await prisma.researchPublication.update({
      where: { id },
      data: { isApproved: false }
    });

    res.json({ message: 'Publication rejected successfully', publication: updatedPublication });
  } catch (error) {
    console.error('Error rejecting publication:', error);
    res.status(500).json({ error: 'Failed to reject publication' });
  }
};

// Delete publication (admin)
export const deletePublicationAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Publication ID is required' });
    }

    const publication = await prisma.researchPublication.findUnique({ where: { id } });
    
    if (!publication) {
      return res.status(404).json({ error: 'Publication not found' });
    }

    await prisma.researchPublication.delete({ where: { id } });
    res.json({ message: 'Publication deleted successfully' });
  } catch (error) {
    console.error('Error deleting publication:', error);
    res.status(500).json({ error: 'Failed to delete publication' });
  }
};

// Export all data to Excel
export const exportAllData = async (req: Request, res: Response) => {
  try {
    // Fetch all data
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
        createdAt: true,
        updatedAt: true
      }
    });

    const achievements = await prisma.achievement.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    const publications = await prisma.researchPublication.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Prepare Users data
    const usersData = users.map((user: any) => ({
      'ID': user.id,
      'Name': user.name,
      'Email': user.email,
      'Phone': user.phone,
      'Department': user.department,
      'Student ID': user.stdId || '',
      'Role': user.role,
      'Status': user.isApproved ? 'Approved' : 'Pending',
      'Created At': new Date(user.createdAt).toLocaleDateString(),
      'Updated At': new Date(user.updatedAt).toLocaleDateString()
    }));

    // Prepare Achievements data
    const achievementsData = achievements.map((achievement: any) => ({
      'ID': achievement.id,
      'Title': achievement.title,
      'Description': achievement.description,
      'Category': achievement.category,
      'Level': achievement.level,
      'Date': new Date(achievement.date).toLocaleDateString(),
      'User': achievement.user?.name || 'Unknown',
      'User Email': achievement.user?.email || 'Unknown',
      'Status': achievement.isApproved ? 'Approved' : 'Pending',
      'Created At': new Date(achievement.createdAt).toLocaleDateString(),
      'Updated At': new Date(achievement.updatedAt).toLocaleDateString()
    }));

    // Prepare Publications data
    const publicationsData = publications.map((publication: any) => ({
      'ID': publication.id,
      'Title': publication.title,
      'Authors': publication.authors,
      'Journal/Conference': publication.journalOrConference,
      'Publication Date': new Date(publication.publicationDate).toLocaleDateString(),
      'DOI': publication.doi || '',
      'Volume': publication.volume || '',
      'Issue': publication.issue || '',
      'Pages': publication.pages || '',
      'User': publication.user?.name || 'Unknown',
      'User Email': publication.user?.email || 'Unknown',
      'Status': publication.isApproved ? 'Approved' : 'Pending',
      'Created At': new Date(publication.createdAt).toLocaleDateString(),
      'Updated At': new Date(publication.updatedAt).toLocaleDateString()
    }));

    // Create worksheets
    const usersSheet = XLSX.utils.json_to_sheet(usersData);
    const achievementsSheet = XLSX.utils.json_to_sheet(achievementsData);
    const publicationsSheet = XLSX.utils.json_to_sheet(publicationsData);

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(workbook, usersSheet, 'Users');
    XLSX.utils.book_append_sheet(workbook, achievementsSheet, 'Achievements');
    XLSX.utils.book_append_sheet(workbook, publicationsSheet, 'Publications');

    // Create summary data
    const summaryData = [
      ['TRACKADEMIC DATA EXPORT SUMMARY'],
      ['Generated on:', new Date().toLocaleString()],
      [''],
      ['USERS STATISTICS'],
      ['Total Users:', users.length],
      ['Approved Users:', users.filter((u: any) => u.isApproved).length],
      ['Pending Users:', users.filter((u: any) => !u.isApproved).length],
      ['Students:', users.filter((u: any) => u.role === 'STUDENT').length],
      ['Faculty:', users.filter((u: any) => u.role === 'FACULTY').length],
      ['Admins:', users.filter((u: any) => u.role === 'ADMIN').length],
      [''],
      ['ACHIEVEMENTS STATISTICS'],
      ['Total Achievements:', achievements.length],
      ['Approved Achievements:', achievements.filter((a: any) => a.isApproved).length],
      ['Pending Achievements:', achievements.filter((a: any) => !a.isApproved).length],
      [''],
      ['PUBLICATIONS STATISTICS'],
      ['Total Publications:', publications.length],
      ['Approved Publications:', publications.filter((p: any) => p.isApproved).length],
      ['Pending Publications:', publications.filter((p: any) => !p.isApproved).length],
      [''],
      ['OVERALL STATISTICS'],
      ['Total Records:', users.length + achievements.length + publications.length],
      ['Total Approved:', 
        users.filter((u: any) => u.isApproved).length + 
        achievements.filter((a: any) => a.isApproved).length + 
        publications.filter((p: any) => p.isApproved).length
      ],
      ['Total Pending:', 
        users.filter((u: any) => !u.isApproved).length + 
        achievements.filter((a: any) => !a.isApproved).length + 
        publications.filter((p: any) => !p.isApproved).length
      ]
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set response headers
    const filename = `trackademic-export-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);

    // Send the Excel file
    res.send(excelBuffer);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
};