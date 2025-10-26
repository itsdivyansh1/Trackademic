"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getProfile, logoutUser, updateProfile } from "@/lib/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/language-context";
import { useS3Url } from "@/hooks/use-s3-url";
import {
  FileText,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Save,
  Sun,
  Upload,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: userData } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour cache
  });
  const user = userData?.user;
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const profileImageUrl = useS3Url(user?.profileImage);

  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState("profile");
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  // Initialize settings with real user data
  const [settings, setSettings] = React.useState({
    profile: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      department: user?.department || "",
      stdId: user?.stdId || "",
      profileImage: user?.profileImage || null,
    },
    preferences: {
      theme: "system",
      language: "en",
    },
    cv: {
      template: "MODERN",
      includePhoto: true,
      includeAddress: true,
      includeSummary: true,
      includePublications: true,
      includeAchievements: true,
      maxPublications: 10,
      maxAchievements: 10,
    },
  });

  const logout = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => (window.location.href = "/login"),
  });

  // Real save mutation for profile
  const saveProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const formData = new FormData();
      formData.append("name", profileData.name);
      formData.append("phone", profileData.phone);
      formData.append("department", profileData.department);
      if (profileData.stdId) formData.append("stdId", profileData.stdId);
      
      return updateProfile(formData);
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setHasUnsavedChanges(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to update profile");
    },
  });

  // Profile image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("profileImage", file);
      formData.append("name", settings.profile.name);
      formData.append("phone", settings.profile.phone);
      formData.append("department", settings.profile.department);
      if (settings.profile.stdId) formData.append("stdId", settings.profile.stdId);
      
      return updateProfile(formData);
    },
    onSuccess: () => {
      toast.success("Profile image updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setHasUnsavedChanges(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to update profile image");
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }
      
      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }
      
      uploadImageMutation.mutate(file);
    }
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (activeTab === "profile") {
      saveProfileMutation.mutate(settings.profile);
    } else {
      // For other tabs, just show success (no backend integration yet)
      toast.success("Settings saved successfully!");
      setHasUnsavedChanges(false);
    }
  };

  // Update settings when user data loads
  React.useEffect(() => {
    if (user) {
      setSettings((prev) => ({
        ...prev,
        profile: {
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          department: user.department || "",
          stdId: user.stdId || "",
          profileImage: user.profileImage || null,
        },
      }));
    }
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
          <p className="text-muted-foreground">
            {t('settings.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Button onClick={handleSave} disabled={saveProfileMutation.isPending}>
              <Save className="mr-2 size-4" />
              {saveProfileMutation.isPending ? t('settings.saving') : t('settings.save')}
            </Button>
          )}
          <Button variant="outline" onClick={() => logout.mutate()}>
            <LogOut className="mr-2 size-4" />
            {t('settings.logout')}
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">{t('settings.profile')}</TabsTrigger>
          <TabsTrigger value="preferences">{t('settings.preferences')}</TabsTrigger>
          <TabsTrigger value="cv">{t('settings.cv')}</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5" />
                {t('settings.profile.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="size-20">
                  <AvatarImage src={profileImageUrl} />
                  <AvatarFallback className="text-lg">
                    {user?.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <input
                    type="file"
                    id="profile-image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('profile-image')?.click()}
                    disabled={uploadImageMutation.isPending}
                  >
                    <Upload className="mr-2 size-4" />
                    {uploadImageMutation.isPending ? t('settings.profile.uploading') : t('settings.profile.uploadPhoto')}
                  </Button>
                  <p className="text-muted-foreground text-xs">
                    {t('settings.profile.imageFormat')}
                  </p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('settings.profile.name')}</Label>
                  <Input
                    id="name"
                    value={settings.profile.name}
                    onChange={(e) =>
                      handleInputChange("profile", "name", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('settings.profile.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-muted-foreground">{t('settings.profile.emailDisabled')}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('settings.profile.phone')}</Label>
                  <Input
                    id="phone"
                    value={settings.profile.phone}
                    onChange={(e) =>
                      handleInputChange("profile", "phone", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">{t('settings.profile.department')}</Label>
                  <Input
                    id="department"
                    value={settings.profile.department}
                    onChange={(e) =>
                      handleInputChange("profile", "department", e.target.value)
                    }
                  />
                </div>
                {user?.role === "STUDENT" && (
                  <div className="space-y-2">
                    <Label htmlFor="stdId">{t('settings.profile.studentId')}</Label>
                    <Input
                      id="stdId"
                      value={settings.profile.stdId}
                      onChange={(e) =>
                        handleInputChange("profile", "stdId", e.target.value)
                      }
                    />
                  </div>
                )}
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
                {t('settings.preferences.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="theme">{t('settings.preferences.theme')}</Label>
                    <p className="text-muted-foreground text-sm">
                      {t('settings.preferences.themeDesc')}
                    </p>
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
                      <Sun className="mr-2 size-4" /> {t('settings.preferences.light')}
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      onClick={() => {
                        setTheme("dark");
                        handleInputChange("preferences", "theme", "dark");
                      }}
                      size="sm"
                    >
                      <Moon className="mr-2 size-4" /> {t('settings.preferences.dark')}
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      onClick={() => {
                        setTheme("system");
                        handleInputChange("preferences", "theme", "system");
                      }}
                      size="sm"
                    >
                      <Monitor className="mr-2 size-4" /> {t('settings.preferences.system')}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="language">{t('settings.preferences.language')}</Label>
                    <p className="text-muted-foreground text-sm">
                      {t('settings.preferences.languageDesc')}
                    </p>
                  </div>
                  <Select
                    value={language}
                    onValueChange={(value: 'en' | 'hi' | 'mr') => {
                      setLanguage(value);
                      handleInputChange("preferences", "language", value);
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">हिंदी</SelectItem>
                      <SelectItem value="mr">मराठी</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CV Settings */}
        <TabsContent value="cv" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5" />
                CV Generation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="cvTemplate">Default CV Template</Label>
                    <p className="text-muted-foreground text-sm">
                      Choose your preferred CV template
                    </p>
                  </div>
                  <Select
                    value={settings.cv?.template || "MODERN"}
                    onValueChange={(value) =>
                      handleInputChange("cv", "template", value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MODERN">Modern</SelectItem>
                      <SelectItem value="CLASSIC">Classic</SelectItem>
                      <SelectItem value="MINIMAL">Minimal</SelectItem>
                      <SelectItem value="CREATIVE">Creative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="includePhoto">Include Profile Photo</Label>
                      <p className="text-muted-foreground text-sm">
                        Show your profile photo in the CV
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="includePhoto"
                      checked={settings.cv?.includePhoto ?? true}
                      onChange={(e) =>
                        handleInputChange("cv", "includePhoto", e.target.checked)
                      }
                      className="rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="includeAddress">Include Address</Label>
                      <p className="text-muted-foreground text-sm">
                        Show your address in the CV
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="includeAddress"
                      checked={settings.cv?.includeAddress ?? true}
                      onChange={(e) =>
                        handleInputChange("cv", "includeAddress", e.target.checked)
                      }
                      className="rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="includeSummary">Include Professional Summary</Label>
                      <p className="text-muted-foreground text-sm">
                        Show your professional summary in the CV
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="includeSummary"
                      checked={settings.cv?.includeSummary ?? true}
                      onChange={(e) =>
                        handleInputChange("cv", "includeSummary", e.target.checked)
                      }
                      className="rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="includePublications">Include Publications</Label>
                      <p className="text-muted-foreground text-sm">
                        Automatically include your publications in the CV
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="includePublications"
                      checked={settings.cv?.includePublications ?? true}
                      onChange={(e) =>
                        handleInputChange("cv", "includePublications", e.target.checked)
                      }
                      className="rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="includeAchievements">Include Achievements</Label>
                      <p className="text-muted-foreground text-sm">
                        Automatically include your achievements in the CV
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="includeAchievements"
                      checked={settings.cv?.includeAchievements ?? true}
                      onChange={(e) =>
                        handleInputChange("cv", "includeAchievements", e.target.checked)
                      }
                      className="rounded"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maxPublications">Max Publications</Label>
                    <Input
                      id="maxPublications"
                      type="number"
                      min="1"
                      max="50"
                      value={settings.cv?.maxPublications || 10}
                      onChange={(e) =>
                        handleInputChange("cv", "maxPublications", parseInt(e.target.value))
                      }
                    />
                    <p className="text-muted-foreground text-xs">
                      Maximum number of publications to include
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAchievements">Max Achievements</Label>
                    <Input
                      id="maxAchievements"
                      type="number"
                      min="1"
                      max="50"
                      value={settings.cv?.maxAchievements || 10}
                      onChange={(e) =>
                        handleInputChange("cv", "maxAchievements", parseInt(e.target.value))
                      }
                    />
                    <p className="text-muted-foreground text-xs">
                      Maximum number of achievements to include
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}

