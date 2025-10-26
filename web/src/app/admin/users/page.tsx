"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getProfile } from "@/lib/auth";
import {
  AlertTriangle,
  Building,
  Clock,
  Download,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  stdId: string | null;
  role: "STUDENT" | "FACULTY" | "ADMIN";
  isApproved: boolean;
  profileImage: string | null;
  createdAt: string;
  updatedAt: string;
};

type UserStats = {
  total: number;
  approved: number;
  pending: number;
  students: number;
  faculty: number;
  admins: number;
};

type ActionDialog = {
  isOpen: boolean;
  type: "approve" | "reject" | "delete" | "role" | null;
  user: User | null;
  newRole?: string;
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [actionDialog, setActionDialog] = useState<ActionDialog>({
    isOpen: false,
    type: null,
    user: null,
  });

  // Get current admin's ID to prevent self-modification
  const { data: currentUser } = useQuery({
    queryKey: ["current-admin"],
    queryFn: getProfile,
  });

  // Fetch users
  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery<User[]>({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:8080/api/v1/admin/users", {
        withCredentials: true,
      });
      return res.data;
    },
  });

  // Fetch user statistics
  const { data: userStats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["admin", "users", "stats"],
    queryFn: async () => {
      const res = await axios.get(
        "http://localhost:8080/api/v1/admin/users/stats",
        {
          withCredentials: true,
        },
      );
      return res.data;
    },
  });

  // Toggle approve/disapprove mutation
  const toggleApproveMutation = useMutation({
    mutationFn: async (user: User) => {
      const res = await axios.patch(
        `http://localhost:8080/api/v1/admin/users/${user.id}/toggle-approval`,
        {},
        { withCredentials: true },
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users", "stats"] });
      toast(
        `User ${data.user.isApproved ? "approved" : "rejected"} successfully`,
      );
    },
    onError: (error: any) => {
      toast(
        error.response?.data?.error || "Failed to update user approval status",
      );
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete(
        `http://localhost:8080/api/v1/admin/users/${id}`,
        {
          withCredentials: true,
        },
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users", "stats"] });
      toast(data.message || "User deleted successfully");
    },
    onError: (error: any) => {
      toast(error.response?.data?.error || "Failed to delete user");
    },
  });

  // Update role mutation
  const roleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await axios.patch(
        `http://localhost:8080/api/v1/admin/users/${id}/role`,
        { role },
        { withCredentials: true },
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users", "stats"] });
      toast(data.message || "User role updated successfully");
    },
    onError: (error: any) => {
      toast(error.response?.data?.error || "Failed to update user role");
    },
  });

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle action confirmation
  const handleAction = async (
    action: "approve" | "reject" | "delete" | "role",
    user: User,
    newRole?: string,
  ) => {
    switch (action) {
      case "approve":
      case "reject":
        toggleApproveMutation.mutate(user);
        break;
      case "delete":
        deleteMutation.mutate(user.id);
        break;
      case "role":
        if (newRole) {
          roleMutation.mutate({ id: user.id, role: newRole });
        }
        break;
    }
    setActionDialog({ isOpen: false, type: null, user: null });
  };

  const openActionDialog = (
    type: ActionDialog["type"],
    user: User,
    newRole?: string,
  ) => {
    setActionDialog({ isOpen: true, type, user, newRole });
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await axios.get("http://localhost:8080/api/v1/admin/export", {
        responseType: 'blob',
        withCredentials: true,
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `trackademic-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Data exported successfully!");
    } catch (error) {
      console.error('Export failed:', error);
      toast.error("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive";
      case "FACULTY":
        return "default";
      case "STUDENT":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return Shield;
      case "FACULTY":
        return GraduationCap;
      case "STUDENT":
        return Users;
      default:
        return Users;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const isLoading =
    toggleApproveMutation.isPending ||
    deleteMutation.isPending ||
    roleMutation.isPending;

  if (usersLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading users...</span>
        </div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
              <h3 className="mb-2 text-lg font-semibold">
                Error Loading Users
              </h3>
              <p className="text-muted-foreground">
                Failed to load users. Please try again.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10"
            />
          </div>
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            variant="outline"
            className="gap-2"
          >
            {isExporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Export All Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {userStats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
          <Card>
            <CardContent className="flex items-center p-4">
              <Users className="mr-3 h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{userStats.total}</p>
                <p className="text-muted-foreground text-xs">Total Users</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4">
              <UserCheck className="mr-3 h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{userStats.approved}</p>
                <p className="text-muted-foreground text-xs">Approved</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4">
              <Clock className="mr-3 h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{userStats.pending}</p>
                <p className="text-muted-foreground text-xs">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4">
              <Users className="mr-3 h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{userStats.students}</p>
                <p className="text-muted-foreground text-xs">Students</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4">
              <GraduationCap className="mr-3 h-8 w-8 text-indigo-600" />
              <div>
                <p className="text-2xl font-bold">{userStats.faculty}</p>
                <p className="text-muted-foreground text-xs">Faculty</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4">
              <Shield className="mr-3 h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{userStats.admins}</p>
                <p className="text-muted-foreground text-xs">Admins</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage user accounts and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">
                All Users ({filteredUsers.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({filteredUsers.filter((u) => u.isApproved).length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({filteredUsers.filter((u) => !u.isApproved).length})
              </TabsTrigger>
            </TabsList>

            {["all", "approved", "pending"].map((tab) => {
              const tabUsers = filteredUsers.filter((user) => {
                if (tab === "approved") return user.isApproved;
                if (tab === "pending") return !user.isApproved;
                return true;
              });

              return (
                <TabsContent value={tab} key={tab}>
                  <div className="space-y-4">
                    {tabUsers.length === 0 ? (
                      <Card>
                        <CardContent className="flex h-32 items-center justify-center">
                          <div className="text-muted-foreground text-center">
                            <Users className="mx-auto mb-2 h-12 w-12 opacity-50" />
                            <p>No users found</p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      tabUsers.map((user) => {
                        const RoleIcon = getRoleIcon(user.role);
                        const isCurrentUser = currentUser?.user?.id === user.id;
                        
                        return (
                          <Card key={user.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Avatar>
                                  <AvatarImage
                                    src={user.profileImage || undefined}
                                  />
                                  <AvatarFallback>
                                    {getInitials(user.name)}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <h3 className="font-medium">{user.name}</h3>
                                    <div className="flex items-center space-x-1">
                                      <RoleIcon className="h-4 w-4" />
                                      <Badge
                                        variant={getRoleBadgeColor(user.role)}
                                      >
                                        {user.role.toLowerCase()}
                                      </Badge>
                                    </div>
                                    <Badge
                                      variant={
                                        user.isApproved
                                          ? "default"
                                          : "destructive"
                                      }
                                    >
                                      {user.isApproved ? "Approved" : "Pending"}
                                    </Badge>
                                    {isCurrentUser && (
                                      <Badge variant="outline" className="text-xs">
                                        You
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="text-muted-foreground flex items-center space-x-4 text-sm">
                                    <div className="flex items-center">
                                      <Mail className="mr-1 h-3 w-3" />
                                      {user.email}
                                    </div>
                                    <div className="flex items-center">
                                      <Phone className="mr-1 h-3 w-3" />
                                      {user.phone}
                                    </div>
                                    <div className="flex items-center">
                                      <Building className="mr-1 h-3 w-3" />
                                      {user.department}
                                    </div>
                                    {user.stdId && (
                                      <span>ID: {user.stdId}</span>
                                    )}
                                    <span>
                                      Joined: {formatDate(user.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {isCurrentUser ? (
                                  <div className="text-muted-foreground text-sm">
                                    You cannot modify your own account
                                  </div>
                                ) : (
                                  <>
                                    {/* Role Change */}
                                    <Select
                                      value={user.role}
                                      onValueChange={(newRole) => {
                                        if (newRole !== user.role) {
                                          openActionDialog("role", user, newRole);
                                        }
                                      }}
                                      disabled={isLoading}
                                    >
                                      <SelectTrigger className="w-[120px]">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="STUDENT">
                                          Student
                                        </SelectItem>
                                        <SelectItem value="FACULTY">
                                          Faculty
                                        </SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                      </SelectContent>
                                    </Select>

                                    {/* Approval Toggle */}
                                    <Button
                                      variant={
                                        user.isApproved ? "outline" : "default"
                                      }
                                      size="sm"
                                      onClick={() =>
                                        openActionDialog(
                                          user.isApproved ? "reject" : "approve",
                                          user,
                                        )
                                      }
                                      disabled={isLoading}
                                    >
                                      {toggleApproveMutation.isPending ? (
                                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                      ) : user.isApproved ? (
                                        <>
                                          <UserX className="mr-1 h-4 w-4" /> Reject
                                        </>
                                      ) : (
                                        <>
                                          <UserCheck className="mr-1 h-4 w-4" />{" "}
                                          Approve
                                        </>
                                      )}
                                    </Button>

                                    {/* Delete */}
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        openActionDialog("delete", user)
                                      }
                                      disabled={isLoading}
                                    >
                                      {deleteMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialog.isOpen}
        onOpenChange={(open) =>
          !open &&
          !isLoading &&
          setActionDialog({ isOpen: false, type: null, user: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionDialog.type === "delete" && (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              Confirm Action
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === "approve" &&
                `Are you sure you want to approve ${actionDialog.user?.name}? They will gain access to the system.`}
              {actionDialog.type === "reject" &&
                `Are you sure you want to reject ${actionDialog.user?.name}? They will lose access to the system.`}
              {actionDialog.type === "delete" &&
                `Are you sure you want to delete ${actionDialog.user?.name}? This action cannot be undone and will permanently remove all their data.`}
              {actionDialog.type === "role" &&
                `Are you sure you want to change ${actionDialog.user?.name}'s role from ${actionDialog.user?.role.toLowerCase()} to ${actionDialog.newRole?.toLowerCase()}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setActionDialog({ isOpen: false, type: null, user: null })
              }
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant={
                actionDialog.type === "delete" ? "destructive" : "default"
              }
              onClick={() =>
                actionDialog.user &&
                handleAction(
                  actionDialog.type!,
                  actionDialog.user,
                  actionDialog.newRole,
                )
              }
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
