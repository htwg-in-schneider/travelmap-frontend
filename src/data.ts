export interface Trip {
  id: number
  title: string
  date: string
  text: string
  countryCode: string | null
  latitude: number | null
  longitude: number | null
  commentCount: number
  ownerName: string | null
  canEdit: boolean
}

export interface Comment {
  id: number
  text: string
  authorName: string | null
  canDelete: boolean
}
