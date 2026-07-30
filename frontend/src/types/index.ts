export interface User {
  id: number;
  username: string;
  email?: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_private: boolean;
  created_at?: string;
}

export interface UserProfile extends User {
  post_count: number;
  follower_count: number;
  following_count: number;
  is_following: boolean;
  is_pending: boolean;
}

export interface PostMedia {
  id: number;
  media_url: string;
  media_type: "image" | "video";
  position: number;
}

export interface Post {
  id: number;
  user_id: number;
  username: string;
  avatar_url: string | null;
  caption: string | null;
  location: string | null;
  created_at: string;
  media: PostMedia[];
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
  saved_by_me: boolean;
}

export interface PostGridItem {
  id: number;
  created_at: string;
  cover_media: string | null;
  cover_type: "image" | "video" | null;
  media_count: number;
  like_count: number;
  comment_count: number;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  username: string;
  avatar_url: string | null;
  parent_id: number | null;
  content: string;
  created_at: string;
  like_count: number;
  liked_by_me: boolean;
}

export interface Story {
  id: number;
  media_url: string;
  media_type: "image" | "video";
  created_at: string;
  expires_at: string;
  viewed_by_me: boolean;
}

export interface StoryGroup {
  user_id: number;
  username: string;
  avatar_url: string | null;
  stories: Story[];
}

export interface Notification {
  id: number;
  type: "like" | "comment" | "follow" | "follow_request" | "mention";
  is_read: boolean;
  created_at: string;
  post_id: number | null;
  post_thumbnail: string | null;
  actor_id: number;
  actor_username: string;
  actor_avatar: string | null;
}

export interface Conversation {
  id: number;
  is_group: boolean;
  group_name: string | null;
  created_at: string;
  participants: { id: number; username: string; avatar_url: string | null }[];
  last_message: { content: string; sender_id: number; created_at: string } | null;
  unread_count: number;
}

export interface Message {
  id: number;
  conversation_id?: number;
  content: string;
  media_url: string | null;
  created_at: string;
  sender_id: number;
  sender_username: string;
  sender_avatar: string | null;
}
