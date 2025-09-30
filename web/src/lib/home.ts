import { api } from "./api";

// Feed item interface matching the backend response
export interface FeedItem {
  id: string;
  feedType: "publication" | "achievement";
  feedDate: string;
  title: string;
  abstract?: string;
  description?: string;
  authors?: string | string[];
  journalConference?: string;
  publicationYear?: number;
  doi?: string;
  publishedAt?: string;
  visibility: "PUBLIC" | "PRIVATE";
  fileUrl?: string;
  category?: string;
  date?: string;
  updatedAt?: string;
  user?: {
    id: string;
    name: string;
    email?: string;
    isApproved?: boolean;
    profileImage?: string | null;
  };
}

// Home feed response structure
export interface HomeFeedResponse {
  feed: FeedItem[];
}

// Main function to get home feed - using /feed route (as per your backend routes)
export const getHomeFeed = async (): Promise<HomeFeedResponse> => {
  try {
    const res = await api.get("/feed");
    return res.data as HomeFeedResponse;
  } catch (error) {
    console.error("Error fetching home feed:", error);
    throw error;
  }
};

// Helper function to get only publications from feed
export const getPublicPublications = async (): Promise<FeedItem[]> => {
  try {
    const homeFeed = await getHomeFeed();
    return homeFeed.feed.filter((item) => item.feedType === "publication");
  } catch (error) {
    console.error("Error fetching publications from home feed:", error);
    throw error;
  }
};

// Helper function to get only achievements from feed
export const getPublicAchievements = async (): Promise<FeedItem[]> => {
  try {
    const homeFeed = await getHomeFeed();
    return homeFeed.feed.filter((item) => item.feedType === "achievement");
  } catch (error) {
    console.error("Error fetching achievements from home feed:", error);
    throw error;
  }
};
