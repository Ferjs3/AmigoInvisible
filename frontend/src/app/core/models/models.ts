export interface UserResponse {
  id: number;
  username: string;
  displayName: string;
  avatarIcon: string | null;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export type RoomStatus = 'OPEN' | 'SEALED' | 'DISCARDED';
export type ParticipantStatus = 'PENDING' | 'READY';

export interface RoomSummary {
  id: number;
  name: string;
  icon: string | null;
  code: string;
  status: RoomStatus;
  eventDate: string | null;
  isAdmin: boolean;
  participantCount: number;
}

export interface RoomPreview {
  name: string;
  icon: string | null;
  adminDisplayName: string;
  eventDate: string | null;
  suggestedBudget: number | null;
  participantCount: number;
  canJoin: boolean;
}

export interface ParticipantResponse {
  userId: number;
  displayName: string;
  avatarIcon: string | null;
  status: ParticipantStatus;
  isMe: boolean;
}

export interface RoomDetail {
  id: number;
  name: string;
  icon: string | null;
  code: string;
  status: RoomStatus;
  suggestedBudget: number | null;
  eventDate: string | null;
  place: string | null;
  notes: string | null;
  isAdmin: boolean;
  participants: ParticipantResponse[];
}

export interface ExclusionResponse {
  id: number;
  giverId: number;
  giverDisplayName: string;
  receiverId: number;
  receiverDisplayName: string;
}

export interface MyAssignment {
  receiverId: number;
  receiverDisplayName: string;
}

export interface WishlistItem {
  id: number;
  userId: number;
  displayName: string;
  title: string;
  note: string | null;
  url: string | null;
  updatedAt: string;
}

export interface QuestionResponse {
  id: number;
  questionText: string;
  answerText: string | null;
  answered: boolean;
  createdAt: string;
}

export interface AskedQuestionResponse {
  id: number;
  targetUserId: number;
  targetDisplayName: string;
  questionText: string;
  answerText: string | null;
  answered: boolean;
  createdAt: string;
}

export interface BudgetVoteStatus {
  open: boolean;
  tieVotePending: boolean;
  votedCount: number;
  totalParticipants: number;
  options: number[];
  myVote: number | null;
  tiedAmounts: number[];
  currentBudget: number | null;
}
