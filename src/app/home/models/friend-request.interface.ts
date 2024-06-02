export type FriendRequestStatusType =
  | 'not-sent'
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'waiting-for-current-user-response';

export interface FriendRequestStatus {
  status: FriendRequestStatusType;
}

export interface FriendRequest {
  id: number;
  creator: number;
  receiver: number;
  status?: FriendRequestStatusType;
  fullImagePath?: string;
}
