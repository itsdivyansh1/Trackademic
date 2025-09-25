"use client";
import { Award } from "@/assets/outline/Award";
import { BookOpen } from "@/assets/outline/BookeOpen";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHomeFeed } from "@/lib/home";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, ExternalLink, FileText } from "lucide-react";
import React from "react";

const Home = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["homeFeed"],
    queryFn: getHomeFeed,
  });

  console.log(data);

  const cardData = {
    title: "Data Science Certification Completed",
    description:
      "Successfully completed the Advanced Data Science certification program with distinction.",
    author: "John Doe Smith Jr.", // Long name to test the fix
    verified: true,
  };
  const isPDF = (fileUrl: string) => {
    return fileUrl.toLowerCase().includes(".pdf");
  };

  // Function to get file name from URL
  const getFileName = (fileUrl: string) => {
    const urlParts = fileUrl.split("/");
    const fileNameWithQuery = urlParts[urlParts.length - 1];
    const fileName = fileNameWithQuery.split("?")[0];
    return decodeURIComponent(fileName);
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // State to track image loading errors
  const [imageErrors, setImageErrors] = React.useState<Set<string>>(new Set());

  // Handle image load error
  const handleImageError = (achievementId: string) => {
    setImageErrors((prev) => new Set([...prev, achievementId]));
  };

  return (
    <div className="flex w-full gap-2 p-6">
      {/* Left */}
      <div className="flex w-[75%] flex-col gap-6">
        {/* First Card Row - Fixed Layout */}
        {data?.feed.map((item: any) => (
          <div className="flex flex-row justify-center gap-4" key={item.id}>
            {/* Fixed width profile section */}
            <div className="flex w-20 flex-shrink-0 flex-col items-end gap-2">
              <div className="relative">
                {/* <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold">
                  JD
                </div> */}
                <Avatar className="flex size-12">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>
                    {item.user.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {item.user.isApproved ? (
                  <BadgeCheck className="absolute -right-1 -bottom-1 h-5 w-5 text-green-600" />
                ) : (
                  <BadgeCheck className="absolute -right-1 -bottom-1 h-5 w-5 text-red-600" />
                )}
              </div>
              <div className="w-full text-right">
                <p className="text-xs font-medium" title={cardData.author}>
                  {item.user.name}
                </p>
              </div>
            </div>

            {/* Card with original w-1/2 width */}
            <Card className="w-1/2 gap-2 rounded-md py-2 backdrop-blur-sm">
              <CardHeader className="pt-2 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-1 justify-between">
                    <CardTitle className="text-lg leading-tight font-bold">
                      {item.title}
                    </CardTitle>
                    <div>
                      {item.feedType === "achievement" ? (
                        <Award className="size-4" />
                      ) : (
                        <BookOpen className="size-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Meta Information */}
                <div className="mt-1 flex items-center gap-4 text-xs">
                  <span className="text-muted-foreground">
                    {formatDate(item.updatedAt)}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="mt-0 pt-0">
                {/* Description */}
                <p className="mb-4 text-sm leading-relaxed">
                  {item.description}
                </p>

                <div className="relative mb-4">
                  {isPDF(item.fileUrl) ? (
                    // PDF Display - Embedded in card
                    <div className="bg-background overflow-hidden rounded-lg border">
                      <iframe
                        src={`${item.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="h-64 w-full"
                        title={item.title}
                        style={{ border: "none" }}
                      />
                      <div className="bg-muted/50 flex items-center justify-between p-2 text-xs">
                        <span className="text-muted-foreground truncate">
                          {getFileName(item.fileUrl)}
                        </span>
                        <div className="flex gap-2">
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary inline-flex items-center gap-1 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Open
                          </a>
                          <a
                            href={item.fileUrl}
                            download
                            className="text-primary inline-flex items-center gap-1 hover:underline"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Image Display
                    <div className="bg-muted hover:border-muted-foreground/20 overflow-hidden rounded-lg border transition-colors">
                      {!imageErrors.has(item.id) ? (
                        <img
                          alt={item.title}
                          src={item.fileUrl}
                          className="h-64 w-full object-cover"
                          onError={() => handleImageError(item.id)}
                        />
                      ) : (
                        <div className="bg-muted flex h-64 w-full items-center justify-center">
                          <div className="text-center">
                            <FileText className="text-muted-foreground mx-auto mb-2 h-12 w-12" />
                            <p className="text-muted-foreground text-sm">
                              Failed to load image
                            </p>
                            <button
                              onClick={() => {
                                setImageErrors((prev) => {
                                  const newSet = new Set(prev);
                                  newSet.delete(item.id);
                                  return newSet;
                                });
                              }}
                              className="text-primary mt-2 text-xs hover:underline"
                            >
                              Retry
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Right */}
      <div className="max-h-screen flex-1 rounded-lg">
        <h1>Filter</h1>
        <p>Newest</p>
      </div>
    </div>
  );
};

export default Home;
