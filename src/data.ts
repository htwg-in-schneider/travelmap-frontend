export const userName = 'Philipp'

export interface Trip {
  id: number
  location: string
  date: string
  text: string
  flag: string
}

export const trips: Trip[] = [
  {
    id: 1,
    location: 'Tokio',
    date: 'Mai 2025',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    flag: '🇯🇵',
  },
  {
    id: 2,
    location: 'Paris',
    date: 'Aug. 2024',
    text: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    flag: '🇫🇷',
  },
  {
    id: 3,
    location: 'New York',
    date: 'Jul. 2023',
    text: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    flag: '🇺🇸',
  },
  {
    id: 4,
    location: 'Kapstadt',
    date: 'März 2022',
    text: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    flag: '🇿🇦',
  },
  {
    id: 5,
    location: 'Rio de Janeiro',
    date: 'Dez. 2021',
    text: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
    flag: '🇧🇷',
  },
  {
    id: 6,
    location: 'Sydney',
    date: 'Jan. 2020',
    text: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos.',
    flag: '🇦🇺',
  },
  {
    id: 7,
    location: 'Reykjavik',
    date: 'Okt. 2019',
    text: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.',
    flag: '🇮🇸',
  },
  {
    id: 8,
    location: 'Bangkok',
    date: 'Apr. 2018',
    text: 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.',
    flag: '🇹🇭',
  },
  {
    id: 9,
    location: 'Kairo',
    date: 'Feb. 2017',
    text: 'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae.',
    flag: '🇪🇬',
  },
  {
    id: 10,
    location: 'Lima',
    date: 'Nov. 2016',
    text: 'Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur.',
    flag: '🇵🇪',
  },
]
