export interface Trip {
  id: number
  title: string
  date: string
  createdAt: string
  text: string
  countryCode: string | null
  latitude: number | null
  longitude: number | null
  publicTrip: boolean
  commentCount: number
  ownerId: number | null
  ownerName: string | null
  authorUsername: string | null
  authorAvatarUrl: string | null
  likeCount: number
  likedByMe: boolean
  canEdit: boolean
  canDelete: boolean
  imageUrls: string[]
}

export interface Comment {
  id: number
  text: string
  createdAt: string
  authorName: string | null
  authorUsername: string | null
  authorAvatarUrl: string | null
  authorId: number | null
  canDelete: boolean
}

export interface UserSummary {
  id: number
  username: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  tripCount: number
  followerCount: number
  followingCount: number
  following: boolean
  isMe: boolean
}
