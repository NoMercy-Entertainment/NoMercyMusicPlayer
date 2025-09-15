// Real music tracks from The Kyoto Connection "Wake Up" album
// Hosted on GitHub - NoMercy-Entertainment/media repository
// Creative Commons licensed music from FreeMusicArchive

export const BASE_URL = 'https://api.nomercy.tv/cors?url=https://github.com/NoMercy-Entertainment/media/raw/refs/heads/master/Music/Music';

export interface Track {
  id: string;
  name: string;
  path: string;
  artist_track: Array<{ name: string }>;
  album_track: Array<{ name: string }>;
  duration: number;
  year: number;
  cover: string;
}

export const wakeUpAlbum: Track[] = [
  {
    id: 'tkc-wake-up-01',
    name: 'Intro - The Way Of Waking Up (feat. Alan Watts)',
    path: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/01%20Intro%20-%20The%20Way%20Of%20Waking%20Up%20(feat.%20Alan%20Watts).mp3',
    artist_track: [{ name: 'The Kyoto Connection' }],
    album_track: [{ name: 'Wake Up' }],
    duration: 180,
    year: 2013,
    cover: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/01%20Intro%20-%20The%20Way%20Of%20Waking%20Up%20(feat.%20Alan%20Watts).jpg'
  },
  {
    id: 'tkc-wake-up-02',
    name: 'Geisha',
    path: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/02%20Geisha.mp3',
    artist_track: [{ name: 'The Kyoto Connection' }],
    album_track: [{ name: 'Wake Up' }],
    duration: 240,
    year: 2013,
    cover: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/02%20Geisha.jpg'
  },
  {
    id: 'tkc-wake-up-03',
    name: 'Voyage I - Waterfall',
    path: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/03%20Voyage%20I%20-%20Waterfall.mp3',
    artist_track: [{ name: 'The Kyoto Connection' }],
    album_track: [{ name: 'Wake Up' }],
    duration: 195,
    year: 2013,
    cover: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/03%20Voyage%20I%20-%20Waterfall.jpg'
  },
  {
    id: 'tkc-wake-up-04',
    name: 'The Music In You',
    path: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/04%20The%20Music%20In%20You.mp3',
    artist_track: [{ name: 'The Kyoto Connection' }],
    album_track: [{ name: 'Wake Up' }],
    duration: 220,
    year: 2013,
    cover: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/04%20The%20Music%20In%20You.jpg'
  },
  {
    id: 'tkc-wake-up-05',
    name: 'The Calm Before The Storm',
    path: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/05%20The%20Calm%20Before%20The%20Storm.mp3',
    artist_track: [{ name: 'The Kyoto Connection' }],
    album_track: [{ name: 'Wake Up' }],
    duration: 165,
    year: 2013,
    cover: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/05%20The%20Calm%20Before%20The%20Storm.jpg'
  },
  {
    id: 'tkc-wake-up-06',
    name: 'No Pain, No Gain',
    path: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/06%20No%20Pain%2C%20No%20Gain.mp3',
    artist_track: [{ name: 'The Kyoto Connection' }],
    album_track: [{ name: 'Wake Up' }],
    duration: 175,
    year: 2013,
    cover: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/06%20No%20Pain%2C%20No%20Gain.jpg'
  },
  {
    id: 'tkc-wake-up-07',
    name: 'Voyage II - Satori',
    path: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/07%20Voyage%20II%20-%20Satori.mp3',
    artist_track: [{ name: 'The Kyoto Connection' }],
    album_track: [{ name: 'Wake Up' }],
    duration: 200,
    year: 2013,
    cover: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/07%20Voyage%20II%20-%20Satori.jpg'
  },
  {
    id: 'tkc-wake-up-08',
    name: 'Reveal the Magic',
    path: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/08%20Reveal%20the%20Magic.mp3',
    artist_track: [{ name: 'The Kyoto Connection' }],
    album_track: [{ name: 'Wake Up' }],
    duration: 215,
    year: 2013,
    cover: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/08%20Reveal%20the%20Magic.jpg'
  },
  {
    id: 'tkc-wake-up-09',
    name: 'Hachiko (The Faithtful Dog)',
    path: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/09%20Hachiko%20(The%20Faithtful%20Dog).mp3',
    artist_track: [{ name: 'The Kyoto Connection' }],
    album_track: [{ name: 'Wake Up' }],
    duration: 190,
    year: 2013,
    cover: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/09%20Hachiko%20(The%20Faithtful%20Dog).jpg'
  },
  {
    id: 'tkc-wake-up-10',
    name: 'Wake Up',
    path: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/10%20Wake%20Up.mp3',
    artist_track: [{ name: 'The Kyoto Connection' }],
    album_track: [{ name: 'Wake Up' }],
    duration: 230,
    year: 2013,
    cover: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/10%20Wake%20Up.jpg'
  },
  {
    id: 'tkc-wake-up-11',
    name: 'Voyage III - The Space Between Us',
    path: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/11%20Voyage%20III%20-%20The%20Space%20Between%20Us.mp3',
    artist_track: [{ name: 'The Kyoto Connection' }],
    album_track: [{ name: 'Wake Up' }],
    duration: 185,
    year: 2013,
    cover: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/11%20Voyage%20III%20-%20The%20Space%20Between%20Us.jpg'
  },
  {
    id: 'tkc-wake-up-12',
    name: 'Ume No Kaori (feat. Sunawai)',
    path: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/12%20Ume%20No%20Kaori%20(feat.%20Sunawai).mp3',
    artist_track: [{ name: 'The Kyoto Connection' }],
    album_track: [{ name: 'Wake Up' }],
    duration: 205,
    year: 2013,
    cover: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/12%20Ume%20No%20Kaori%20(feat.%20Sunawai).jpg'
  },
  {
    id: 'tkc-wake-up-13',
    name: 'Outro - Totally Here and Now (feat. Alan Watts)',
    path: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/13%20Outro%20-%20Totally%20Here%20and%20Now%20(feat.%20Alan%20Watts).mp3',
    artist_track: [{ name: 'The Kyoto Connection' }],
    album_track: [{ name: 'Wake Up' }],
    duration: 270,
    year: 2013,
    cover: '/T/The%20Kyoto%20Connection/%5B2013%5D%20Wake%20Up/13%20Outro%20-%20Totally%20Here%20and%20Now%20(feat.%20Alan%20Watts).jpg'
  }
];

export default wakeUpAlbum;