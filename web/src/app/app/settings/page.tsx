"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database,
  CreditCard,
  Key,
  Monitor,
  Moon,
  Sun,
  Volume2,
  Mail,
  MessageSquare,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Download,
  Upload,
  LogOut
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProfile, logoutUser } from "@/lib/auth";
import { toast } from "sonner";
import { useTheme } from "next-themes";

// Mock settings data
const userSettings = {
  profile: {
    name: "Dr. Sarah Chen",
    email: "sarah.chen@university.edu",
    institution: "MIT Climate Lab",
    department: "Environmental Science",
    title: "Associate Professor",
    bio: "I'm a climate scientist specializing in machine learning applications for environmental research. My work focuses on improving climate prediction models through advanced data analysis techniques.",
    orcid: "0000-0002-1825-0097",
    website: "https://sarah-chen.com",
    profileImage: null,
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    achievementAlerts: true,
    publicationUpdates: true,
    collaborationRequests: true,
    weeklyDigest: false,
    mentionAlerts: true,
    deadlineReminders: true,
  },
  privacy: {
    profileVisibility: "public",
    publicationsVisibility: "public",
    achievementsVisibility: "public",
    collaborationsVisibility: "public",
    allowDirectMessages: true,
    showOnlineStatus: true,
    allowProfileIndexing: true,
  },
  preferences: {
    theme: "system",
    language: "en",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    emailFrequency: "immediate",
  },
  account: {
    createdAt: "2023-01-15",
    lastLogin: "2024-02-25",
    accountType: "faculty",
    subscription: "premium",
    storageUsed: 2.4, // GB
    storageLimit: 10, // GB
  }
};

export default function SettingsPage() {
  const { data: userData } = useQuery({ 
    queryKey: ["profile"], 
    queryFn: getProfile 
  });
  const user = userData?.user;
  const { theme, setTheme } = useTheme();

  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState("profile");
  const [settings, setSettings] = React.useState(userSettings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  const logout = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => (window.location.href = "/login"),
  });

  // Simulated save mutation
  const saveMutation = useMutation({
    mutationFn: async (updatedSettings: typeof userSettings) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return updatedSettings;
    },
    onSuccess: () => {
      toast.success("Settings saved successfully!");
      setHasUnsavedChanges(false);
    },
    onError: () => {
      toast.error("Failed to save settings. Please try again.");
    }
  });

  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  // Update user profile data when available
  React.useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          name: user.name || prev.profile.name,
          email: user.email || prev.profile.email,
          profileImage: user.profileImage || prev.profile.profileImage,
        }
      }));
    }
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              <Save className="size-4 mr-2" />
              {saveMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          )}
          <Button variant="outline" onClick={() => logout.mutate()}>
            <LogOut className="size-4 mr-2" />
            Log out
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="size-20">
                  <AvatarImage src={settings.profile.profileImage || undefined} />
                  <AvatarFallback className="text-lg">
                    {settings.profile.name.split(" ").map((n: string) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Upload className="size-4 mr-2" />
                    Upload Photo
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={settings.profile.name}
                    onChange={(e) => handleInputChange("profile", "name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => handleInputChange("profile", "email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution</Label>
                  <Input
                    id="institution"
                    value={settings.profile.institution}
                    onChange={(e) => handleInputChange("profile", "institution", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={settings.profile.department}
                    onChange={(e) => handleInputChange("profile", "department", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={settings.profile.title}
                    onChange={(e) => handleInputChange("profile", "title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orcid">ORCID ID</Label>
                  <Input
                    id="orcid"
                    value={settings.profile.orcid}
                    onChange={(e) => handleInputChange("profile", "orcid", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Personal Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={settings.profile.website}
                  onChange={(e) => handleInputChange("profile", "website", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={4}
                  value={settings.profile.bio}
                  onChange={(e) => handleInputChange("profile", "bio", e.target.value)}
                  placeholder="Tell us about your research interests and background..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="size-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { key: "emailNotifications", label: "Email Notifications", description: "Receive notifications via email" },
                  { key: "pushNotifications", label: "Push Notifications", description: "Receive push notifications in your browser" },
                  { key: "achievementAlerts", label: "Achievement Alerts", description: "Get notified when you earn new achievements" },
                  { key: "publicationUpdates", label: "Publication Updates", description: "Updates on citation counts and metrics" },
                  { key: "collaborationRequests", label: "Collaboration Requests", description: "New collaboration invitations and requests" },
                  { key: "mentionAlerts", label: "Mention Alerts", description: "When someone mentions you in discussions" },
                  { key: "deadlineReminders", label: "Deadline Reminders", description: "Reminders for submission deadlines" },
                  { key: "weeklyDigest", label: "Weekly Digest", description: "Weekly summary of your activity" },
                ].map((item) => (
                  <div key={item.key} className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Label htmlFor={item.key}>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                      id={item.key}
                      checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                      onCheckedChange={(checked) => handleInputChange("notifications", item.key, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5" />
                Privacy & Visibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                {[
                  { key: "profileVisibility", label: "Profile Visibility", description: "Who can see your profile information" },
                  { key: "publicationsVisibility", label: "Publications Visibility", description: "Who can see your publications" },
                  { key: "achievementsVisibility", label: "Achievements Visibility", description: "Who can see your achievements" },
                  { key: "collaborationsVisibility", label: "Collaborations Visibility", description: "Who can see your collaborations" },
                ].map((item) => (
                  <div key={item.key} className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Label htmlFor={item.key}>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Select
                      value={settings.privacy[item.key as keyof typeof settings.privacy] as string}
                      onValueChange={(value) => handleInputChange("privacy", item.key, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="colleagues">Colleagues</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}

                <Separator />

                {[
                  { key: "allowDirectMessages", label: "Allow Direct Messages", description: "Let others send you direct messages" },
                  { key: "showOnlineStatus", label: "Show Online Status", description: "Display when you're online" },
                  { key: "allowProfileIndexing", label: "Allow Profile Indexing", description: "Allow search engines to index your profile" },
                ].map((item) => (
                  <div key={item.key} className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Label htmlFor={item.key}>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                      id={item.key}
                      checked={settings.privacy[item.key as keyof typeof settings.privacy] as boolean}
                      onCheckedChange={(checked) => handleInputChange("privacy", item.key, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Settings */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="size-5" />
                Display & Language
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="theme">Theme</Label>
                    <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant={theme === "light" ? "default" : "outline"} 
                      onClick={() => {
                        setTheme("light");
                        handleInputChange("preferences", "theme", "light");
                      }}
                      size="sm"
                    >
                      <Sun className="mr-2 size-4" /> Light
                    </Button>
                    <Button 
                      variant={theme === "dark" ? "default" : "outline"} 
                      onClick={() => {
                        setTheme("dark");
                        handleInputChange("preferences", "theme", "dark");
                      }}
                      size="sm"
                    >
                      <Moon className="mr-2 size-4" /> Dark
                    </Button>
                    <Button 
                      variant={theme === "system" ? "default" : "outline"} 
                      onClick={() => {
                        setTheme("system");
                        handleInputChange("preferences", "theme", "system");
                      }}
                      size="sm"
                    >
                      <Monitor className="mr-2 size-4" /> System
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="language">Language</Label>
                    <p className="text-sm text-muted-foreground">Select your preferred language</p>
                  </div>
                  <Select
                    value={settings.preferences.language}
                    onValueChange={(value) => handleInputChange("preferences", "language", value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="timezone">Timezone</Label>
                    <p className="text-sm text-muted-foreground">Your local timezone</p>
                  </div>
                  <Select
                    value={settings.preferences.timezone}
                    onValueChange={(value) => handleInputChange("preferences", "timezone", value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <p className="text-sm text-muted-foreground">How dates are displayed</p>
                  </div>
                  <Select
                    value={settings.preferences.dateFormat}
                    onValueChange={(value) => handleInputChange("preferences", "dateFormat", value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
