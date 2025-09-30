"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getProfile } from "@/lib/auth";
import { getHomeFeed, type FeedItem } from "@/lib/home";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  ExternalLink,
  Search,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

// Normalized interface for display
interface DisplayFeedItem {
  id: string;
  type: "publication" | "achievement";
  title: string;
  abstract?: string;
  description?: string;
  author: {
    name: string;
    username?: string;
    institution?: string;
    avatar?: string | null;
    isApproved?: boolean;
  };
  tags: string[];
  publishedAt: string;
  category?: string;
  fileUrl?: string;
  doi?: string;
  visibility: "PUBLIC" | "PRIVATE";
}

// Component for file thumbnail generation - always shows icons/logos
const FileThumbnail = ({
  fileUrl,
  title,
  type,
}: {
  fileUrl?: string;
  title: string;
  type: "publication" | "achievement";
}) => {
  if (type === "publication") {
    return (
      <div className="relative flex h-48 w-full items-center justify-center rounded-t-lg bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <BookOpen className="mx-auto mb-3 size-16 text-blue-500" />
          <span className="text-sm font-semibold text-blue-700">
            Publication
          </span>
          {fileUrl && (
            <div className="absolute top-3 right-3 rounded-full bg-blue-500 p-1 text-white">
              <ExternalLink className="size-3" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Achievement type
  return (
    <div className="relative flex h-48 w-full items-center justify-center rounded-t-lg bg-gradient-to-br from-amber-50 to-amber-100">
      <div className="text-center">
        <Award className="mx-auto mb-3 size-16 text-amber-500" />
        <span className="text-sm font-semibold text-amber-700">
          Achievement
        </span>
        {fileUrl && (
          <div className="absolute top-3 right-3 rounded-full bg-amber-500 p-1 text-white">
            <ExternalLink className="size-3" />
          </div>
        )}
      </div>
    </div>
  );
};

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedFilter, setSelectedFilter] = React.useState("all");

  // Fetch home feed data using the new API structure
  const { data: homeFeedData, isLoading: feedLoading } = useQuery({
    queryKey: ["homeFeed"],
    queryFn: getHomeFeed,
  });

  // Get current user for context (optional)
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getProfile,
  });

  // Transform feed data to display format
  const displayItems: DisplayFeedItem[] = React.useMemo(() => {
    if (!homeFeedData?.feed) return [];

    return homeFeedData.feed.map((item: FeedItem) => {
      // Handle authors field for publications
      let authorsStr = "";
      if (item.feedType === "publication" && item.authors) {
        if (Array.isArray(item.authors)) {
          authorsStr = item.authors.join(", ");
        } else if (typeof item.authors === "string") {
          try {
            const parsed = JSON.parse(item.authors);
            if (Array.isArray(parsed)) authorsStr = parsed.join(", ");
            else if (parsed && typeof parsed === "object")
              authorsStr = Object.values(parsed).map(String).join(", ");
            else authorsStr = item.authors;
          } catch {
            authorsStr = item.authors;
          }
        }
      }

      // Create tags array with proper filtering to ensure no undefined values
      const createTags = (): string[] => {
        if (item.feedType === "publication") {
          const tags: string[] = [];
          if (item.journalConference) tags.push(item.journalConference);
          if (item.publicationYear) tags.push(item.publicationYear.toString());
          return tags;
        } else {
          const tags: string[] = [];
          if (item.category) tags.push(item.category);
          return tags;
        }
      };

      // Create display item
      return {
        id: item.id,
        type: item.feedType,
        title: item.title,
        abstract: item.feedType === "publication" ? item.abstract : undefined,
        description:
          item.feedType === "achievement" ? item.description : undefined,
        author: {
          name: item.user?.name || authorsStr || "Unknown",
          username: item.user?.email,
          institution:
            item.feedType === "publication"
              ? item.journalConference
              : "Academic Community",
          avatar: item.user?.profileImage || null,
          isApproved: item.user?.isApproved || false,
        },
        tags: createTags(),
        publishedAt:
          item.feedDate ||
          item.updatedAt ||
          item.publishedAt ||
          item.date ||
          "",
        fileUrl: item.fileUrl,
        visibility: item.visibility,
        doi: item.doi,
        category: item.category,
      };
    });
  }, [homeFeedData]);

  const isLoading = feedLoading;

  // Filter items based on search and filter selection
  const filteredItems = displayItems.filter((item) => {
    if (selectedFilter !== "all" && item.type !== selectedFilter) return false;
    if (
      searchQuery &&
      !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.author.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="mb-2 text-3xl font-bold">
              Discover Academic Research
            </h1>
            <p className="text-muted-foreground mb-6">
              Explore publications, achievements, and research from the academic
              community
            </p>
          </div>
          <div className="mb-8 flex justify-center">
            <div className="relative w-full max-w-md">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3 xl:columns-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="mb-6 break-inside-avoid">
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardContent className="p-4">
                  <Skeleton className="mb-2 h-4 w-full" />
                  <Skeleton className="mb-3 h-4 w-3/4" />
                  <div className="mb-3 flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="mb-1 h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-3 text-4xl font-bold">Discover Academic Research</h1>
        <p className="text-muted-foreground mb-6 text-lg">
          Explore publications, achievements, and research from the academic
          community
        </p>

        {/* Search Bar */}
        <div className="mb-6 flex justify-center">
          <div className="relative w-full max-w-md">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-5 -translate-y-1/2" />
            <Input
              placeholder="Search research topics, authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-11 text-base"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant={selectedFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("all")}
            className="rounded-full"
          >
            All Content
          </Button>
          <Button
            variant={selectedFilter === "publication" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("publication")}
            className="rounded-full"
          >
            <BookOpen className="mr-2 size-4" />
            Publications
          </Button>
          <Button
            variant={selectedFilter === "achievement" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("achievement")}
            className="rounded-full"
          >
            <Award className="mr-2 size-4" />
            Achievements
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-center">
        <p className="text-muted-foreground text-sm">
          Showing {filteredItems.length}{" "}
          {selectedFilter === "all" ? "items" : selectedFilter + "s"}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {/* Pinterest-style Masonry Grid */}
      {filteredItems.length > 0 ? (
        <div className="columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3 xl:columns-4">
          {filteredItems.map((item) => (
            <Link
              key={item.id}
              href={{
                pathname: "/app/viewer",
                query: {
                  type: item.type,
                  id: item.id,
                  title: item.title,
                  ...(item.fileUrl ? { fileUrl: item.fileUrl } : {}),
                },
              }}
            >
              <Card className="mb-6 cursor-pointer break-inside-avoid py-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                {/* Thumbnail */}
                <div className="group relative">
                  <FileThumbnail
                    fileUrl={item.fileUrl}
                    title={item.title}
                    type={item.type}
                  />

                  {/* File indicator overlay */}
                  {item.fileUrl && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <ExternalLink className="size-3" />
                      View
                    </div>
                  )}

                  {/* Type badge */}
                  <div className="absolute top-3 left-3">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        item.type === "publication"
                          ? "bg-blue-500/90 text-white"
                          : "bg-amber-500/90 text-white"
                      }`}
                    >
                      {item.type === "publication" ? (
                        <>
                          <BookOpen className="mr-1 size-3" />
                          Publication
                        </>
                      ) : (
                        <>
                          <Award className="mr-1 size-3" />
                          Achievement
                        </>
                      )}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Title */}
                  <h3 className="mb-2 line-clamp-2 text-base leading-tight font-semibold">
                    {item.title}
                  </h3>

                  {/* Description/Abstract */}
                  <p className="text-muted-foreground mb-3 line-clamp-3 text-sm leading-relaxed">
                    {item.type === "publication"
                      ? item.abstract
                      : item.description}
                  </p>

                  {/* User Info */}
                  <div className="mb-3 flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarImage src={item.author?.avatar || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-xs text-white">
                        {(item.author?.name || "?")
                          .split(" ")
                          .filter(Boolean)
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">
                          {item.author?.name}
                        </p>
                        {item.author?.isApproved ? (
                          <div className="flex items-center">
                            <CheckCircle className="size-4 flex-shrink-0 text-green-500" />
                            <span className="ml-1 hidden text-xs text-green-600 sm:inline">
                              Verified
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <div className="size-4 flex-shrink-0 rounded-full bg-gray-300" />
                            <span className="ml-1 hidden text-xs text-gray-500 sm:inline">
                              Unverified
                            </span>
                          </div>
                        )}
                      </div>
                      {item.author?.username && (
                        <p className="text-muted-foreground truncate text-xs">
                          {item.author.username}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Institution & Date */}
                  <div className="text-muted-foreground mb-3 flex items-center justify-between text-xs">
                    <span className="mr-2 truncate">
                      {item.author?.institution}
                    </span>
                    <span className="flex flex-shrink-0 items-center gap-1">
                      <Calendar className="size-3" />
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {item.tags.slice(0, 2).map((tag, index) => (
                        <Badge
                          key={`${tag}-${index}`}
                          variant="outline"
                          className="px-2 py-0 text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 2 && (
                        <Badge variant="outline" className="px-2 py-0 text-xs">
                          +{item.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="bg-muted mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
            {selectedFilter === "publication" ? (
              <BookOpen className="text-muted-foreground size-8" />
            ) : selectedFilter === "achievement" ? (
              <Award className="text-muted-foreground size-8" />
            ) : (
              <Search className="text-muted-foreground size-8" />
            )}
          </div>
          <h3 className="mb-2 text-lg font-semibold">No content found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? `No results for "${searchQuery}"`
              : selectedFilter === "all"
                ? "No academic content available at the moment"
                : `No ${selectedFilter}s available`}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setSelectedFilter("all");
            }}
          >
            <Search className="mr-2 size-4" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
