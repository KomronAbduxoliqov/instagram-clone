export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_private: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PublicUser {
  id: number;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_private: boolean;
}

export interface Post {
  id: number;
  user_id: number;
  caption: string | null;
  location: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface PostMedia {
  id: number;
  post_id: number;
  media_url: string;
  media_type: "image" | "video";
  position: number;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  parent_id: number | null;
  content: string;
  created_at: Date;
}

export interface JwtPayload {
  userId: number;
  username: string;
}

// Express Request'ga user qo'shish uchun (auth middleware)
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
