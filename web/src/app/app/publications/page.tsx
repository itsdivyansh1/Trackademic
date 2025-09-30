"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Plus,
  Search,
  TrendingUp,
  BarChart3,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Eye,
  Edit,
  MoreVertical,
  ExternalLink,
  Trash2,
  Globe,
  Lock,
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getUserPublications, deletePublication, updatePublication } from "@/lib/publication";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";

// Mock publications data
const publications = [
  {
    id: "1",
    title: "Machine Learning Applications in Climate Change Prediction: A Comprehensive Analysis",
    authors: ["Dr. Sarah Chen", "Prof. Michael Rodriguez", "Dr. James Liu"],
    journal: "Nature Climate Change",
    status: "published",
    publishedDate: "2024-01-15",
    submittedDate: "2023-10-20",
    type: "journal-article",
    doi: "10.1038/s41558-024-01234-5",
    citations: 45,
    downloads: 1200,
    views: 3400,
    abstract: "This comprehensive study explores the application of advanced machine learning algorithms to improve the accuracy and reliability of climate change predictions. We present novel approaches that integrate multiple data sources and demonstrate significant improvements over existing methods.",
    keywords: ["Machine Learning", "Climate Change", "Data Analysis", "Prediction Models"],
    funding: ["NSF Grant DMS-2023456", "DOE Climate Research Initiative"],
    impact: {
      altmetric: 85,
      mentions: 23,
      tweets: 156,
    }
  },
  {
    id: "2",
    title: "Neural Networks for Drug Discovery: Recent Advances and Future Directions",
    authors: ["Dr. Elena Vasquez", "Dr. James Liu", "Alexandra Thompson"],
    journal: "Journal of Chemical Information and Modeling",
    status: "accepted",
    acceptedDate: "2024-02-10",
    submittedDate: "2023-11-15",
    type: "review-article",
    doi: "10.1021/acs.jcim.4c00123",
    citations: 12,
    downloads: 890,
    views: 2100,
    abstract: "We provide a systematic review of recent developments in applying neural network architectures to pharmaceutical research, with particular focus on drug-target interaction prediction and molecular property estimation.",
    keywords: ["Neural Networks", "Drug Discovery", "Pharmaceutical Research", "Deep Learning"],
    funding: ["NIH Grant R01-GM123456"],
    impact: {
      altmetric: 45,
      mentions: 12,
      tweets: 78,
    }
  },
  {
    id: "3", 
    title: "Quantum Computing Algorithms for Optimization Problems in Logistics",
    authors: ["Prof. Michael Rodriguez", "Dr. Sarah Chen"],
    journal: "Quantum Information Processing",
    status: "under-review",
    submittedDate: "2024-01-20",
    type: "journal-article",
    citations: 0,
    downloads: 0,
    views: 0,
    abstract: "This paper presents novel quantum computing algorithms designed to solve complex optimization problems in logistics and supply chain management, demonstrating potential quantum advantage for real-world applications.",
    keywords: ["Quantum Computing", "Optimization", "Logistics", "Supply Chain"],
    funding: ["DARPA Quantum Computing Grant"],
    reviewComments: "Minor revisions requested",
    estimatedDecision: "2024-03-15"
  },
  {
    id: "4",
    title: "Sustainable Urban Planning Using AI-Driven Analytics",
    authors: ["Alexandra Thompson", "Dr. Elena Vasquez"],
    journal: "Urban Studies",
    status: "rejected",
    rejectedDate: "2024-01-05",
    submittedDate: "2023-09-30",
    type: "journal-article",
    citations: 0,
    downloads: 0,
    views: 0,
    abstract: "An investigation into how artificial intelligence can be leveraged to create more sustainable urban planning solutions, focusing on traffic optimization and resource allocation.",
    keywords: ["Urban Planning", "AI", "Sustainability", "Smart Cities"],
    funding: ["City Planning Institute Grant"],
    rejectionReason: "Methodology concerns - recommended revision and resubmission"
  },
  {
    id: "5",
    title: "Advances in Biomedical Imaging Through Deep Learning",
    authors: ["Dr. James Liu", "Dr. Sarah Chen", "Prof. Michael Rodriguez"],
    journal: "Medical Image Analysis", 
    status: "draft",
    lastModified: "2024-02-20",
    type: "journal-article",
    citations: 0,
    downloads: 0,
    views: 0,
    abstract: "This work explores cutting-edge deep learning techniques for medical image analysis, with applications in diagnostic imaging and treatment planning.",
    keywords: ["Medical Imaging", "Deep Learning", "Diagnostics", "Healthcare AI"],
    funding: ["NIH Medical Imaging Grant"],
    completionStatus: 75
  }
];


function renderAuthors(a: any): string {
  if (Array.isArray(a)) return a.join(", ");
  if (typeof a === "string") {
    try {
      const parsed = JSON.parse(a);
      if (Array.isArray(parsed)) return parsed.join(", ");
      if (parsed && typeof parsed === "object") return Object.values(parsed).map(String).join(", ");
      return a;
    } catch {
      return a;
    }
  }
  if (a && typeof a === "object") return Object.values(a).map(String).join(", ");
  return "";
}

export default function PublicationsPage() {
  const { data: userPublications, isLoading } = useQuery({ 
    queryKey: ["publications"], 
    queryFn: getUserPublications 
  });

  const [searchQuery, setSearchQuery] = React.useState("");
  const queryClient = useQueryClient();

  const publications = userPublications || [];

  // Delete publication mutation
  const deleteMutation = useMutation({
    mutationFn: deletePublication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications"] });
      toast.success("Publication deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete publication.");
    },
  });

  // Toggle visibility mutation
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, currentVisibility }: { id: string, currentVisibility: string }) => {
      const formData = new FormData();
      const newVisibility = currentVisibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
      formData.append('visibility', newVisibility);
      return updatePublication(id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications"] });
      toast.success("Publication visibility updated!");
    },
    onError: () => {
      toast.error("Failed to update visibility.");
    },
  });

  // Calculate real stats from data
  const publicationStats = {
    total: publications.length,
    published: 0, // Would filter by status if available
    underReview: 0, // Would filter by status if available
    totalCitations: 0, // Would sum citations if available
    totalDownloads: 0, // Would sum downloads if available
    hIndex: 0, // Would calculate from citation data
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading publications...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
      case "accepted": return "bg-blue-500/15 text-blue-700 dark:text-blue-400";
      case "under-review": return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
      case "rejected": return "bg-rose-500/15 text-rose-700 dark:text-rose-400";
      case "draft": return "bg-gray-500/15 text-gray-700 dark:text-gray-400";
      default: return "bg-gray-500/15 text-gray-700 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published": return CheckCircle;
      case "accepted": return CheckCircle;
      case "under-review": return Clock;
      case "rejected": return XCircle;
      case "draft": return FileText;
      default: return FileText;
    }
  };

  const filteredPublications = publications.filter((publication: any) => {
    if (searchQuery && !publication.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Publications</h1>
          <p className="text-muted-foreground">
            Manage your research publications and track their impact
          </p>
        </div>
        <Button asChild>
          <Link href="/app/publications/create">
            <Plus className="size-4 mr-2" />
            Add Publication
          </Link>
        </Button>
      </div>

      {/* Publication Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{publicationStats.total}</div>
                <div className="text-xs text-muted-foreground">Total Publications</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-5 text-emerald-500" />
              <div>
                <div className="text-2xl font-bold">{publicationStats.totalCitations}</div>
                <div className="text-xs text-muted-foreground">Total Citations</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-5 text-violet-500" />
              <div>
                <div className="text-2xl font-bold">{publicationStats.hIndex}</div>
                <div className="text-xs text-muted-foreground">H-Index</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Download className="size-5 text-amber-500" />
              <div>
                <div className="text-2xl font-bold">{publicationStats.totalDownloads.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Downloads</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search publications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Publications List */}
      {publications.length > 0 ? (
        <div className="space-y-4">
          {publications.map((publication: any) => (
            <Card
              key={publication.id}
              className="hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => {
                const params = new URLSearchParams({
                  type: 'publication',
                  id: publication.id,
                  title: publication.title,
                  ...(publication.fileUrl ? { fileUrl: publication.fileUrl } : {}),
                });
                window.open(`/app/viewer?${params.toString()}`, '_blank');
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-blue-500/10">
                      <BookOpen className="size-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{publication.title}</h3>
                      <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                        {publication.abstract && publication.abstract.length > 150
                          ? `${publication.abstract.substring(0, 150)}...`
                          : publication.abstract}
                      </p>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Authors:</span>
                          <span>{renderAuthors(publication.authors)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Year:</span>
                          <span>{publication.publicationYear}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {publication.visibility === 'PUBLIC' ? (
                            <Globe className="size-4 text-green-600" />
                          ) : (
                            <Lock className="size-4 text-gray-500" />
                          )}
                          <span className={publication.visibility === 'PUBLIC' ? 'text-green-600' : 'text-gray-500'}>
                            {publication.visibility}
                          </span>
                        </div>
                        {publication.journalConference && (
                          <Badge variant="outline">{publication.journalConference}</Badge>
                        )}
                        {publication.fileUrl && (
                          <button
                            onClick={(e) => { e.stopPropagation(); window.open(publication.fileUrl, '_blank'); }}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            <FileText className="size-4" />
                            <span className="text-sm">View attachment</span>
                          </button>
                        )}
                      </div>
                      {publication.doi && (
                        <div className="mt-2">
                          <a 
                            href={`https://doi.org/${publication.doi}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="size-3" />
                            DOI: {publication.doi}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/app/publications/edit/${publication.id}`} className="flex items-center">
                          <Edit className="size-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        onClick={() => toggleVisibilityMutation.mutate({ 
                          id: publication.id, 
                          currentVisibility: publication.visibility 
                        })}
                        disabled={toggleVisibilityMutation.isPending}
                      >
                        {publication.visibility === 'PUBLIC' ? (
                          <>
                            <Lock className="size-4 mr-2" />
                            Make Private
                          </>
                        ) : (
                          <>
                            <Globe className="size-4 mr-2" />
                            Make Public
                          </>
                        )}
                      </DropdownMenuItem>
                      
                      {publication.fileUrl && (
                        <DropdownMenuItem asChild>
                          <a href={publication.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                            <ExternalLink className="size-4 mr-2" />
                            View File
                          </a>
                        </DropdownMenuItem>
                      )}
                      
                      {publication.doi && (
                        <DropdownMenuItem asChild>
                          <a href={`https://doi.org/${publication.doi}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                            <ExternalLink className="size-4 mr-2" />
                            View DOI
                          </a>
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator />
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="size-4 mr-2 text-red-600" />
                            <span className="text-red-600">Delete</span>
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Publication</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &ldquo;{publication.title}&rdquo;? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(publication.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <BookOpen className="size-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No publications yet</h3>
          <p className="text-muted-foreground mb-4">
            Start building your academic portfolio by adding your first publication
          </p>
          <Button asChild>
            <Link href="/app/publications/create">
              <Plus className="size-4 mr-2" />
              Add Publication
            </Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
