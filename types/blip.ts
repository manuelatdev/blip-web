// types/blip.ts

export interface BlipUserInfo {
  userId: string | null;
  displayName: string;
  profilePictureUrl: string;
  isAdmin: boolean;
}

export interface BlipContent {
  value: string;
  imageUrl1: string | null;
  imageUrl2: string | null;
  imageUrl3: string | null;
  imageUrl4: string | null;
}

export interface BlipResponse {
  blipId: string;
  userInfo: BlipUserInfo;
  content: BlipContent;
  timestamp: string;
}

export interface DeleteBlipRequest {
  accessToken: string;
}

export interface BlipsResult {
  blips: BlipResponse[];
  success: boolean;
  error?: string;
}
