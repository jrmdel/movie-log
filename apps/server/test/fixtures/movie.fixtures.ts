import { ISearchTitleResponse, ITitle } from 'src/modules/movie/providers/imdb.model';

export const searchTitleResults: ISearchTitleResponse = {
  titles: [
    {
      id: 'tt0816692',
      type: 'movie',
      primaryTitle: 'Interstellar',
      originalTitle: 'Interstellar',
      primaryImage: {
        url: 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_.jpg',
        width: 2430,
        height: 3600,
      },
      startYear: 2014,
      rating: {
        aggregateRating: 8.7,
        voteCount: 2482295,
      },
    },
    {
      id: 'tt1675434',
      type: 'movie',
      primaryTitle: 'The Intouchables',
      originalTitle: 'Intouchables',
      primaryImage: {
        url: 'https://m.media-amazon.com/images/M/MV5BMTYxNDA3MDQwNl5BMl5BanBnXkFtZTcwNTU4Mzc1Nw@@._V1_.jpg',
        width: 1382,
        height: 2048,
      },
      startYear: 2011,
      rating: {
        aggregateRating: 8.5,
        voteCount: 1017757,
      },
    },
    {
      id: 'tt1839578',
      type: 'tvSeries',
      primaryTitle: 'Person of Interest',
      originalTitle: 'Person of Interest',
      primaryImage: {
        url: 'https://m.media-amazon.com/images/M/MV5BOTcxNDJiMTUtN2ZhZS00OGE1LWJmZmYtN2VhYThiZTBhYWM1XkEyXkFqcGc@._V1_.jpg',
        width: 517,
        height: 755,
      },
      startYear: 2011,
      endYear: 2016,
      rating: {
        aggregateRating: 8.5,
        voteCount: 203602,
      },
    },
    {
      id: 'tt0190332',
      type: 'movie',
      primaryTitle: 'Crouching Tiger, Hidden Dragon',
      originalTitle: 'Wo hu cang long',
      primaryImage: {
        url: 'https://m.media-amazon.com/images/M/MV5BMzRmMTU2OWEtZjI0Ni00MGRhLThjOTItZTJiNmM4MDk0ZWU2XkEyXkFqcGc@._V1_.jpg',
        width: 1989,
        height: 2947,
      },
      startYear: 2000,
      rating: {
        aggregateRating: 7.9,
        voteCount: 293026,
      },
    },
  ],
};

export const titleResult: ITitle = {
  id: 'tt1675434',
  type: 'movie',
  primaryTitle: 'The Intouchables',
  originalTitle: 'Intouchables',
  primaryImage: {
    url: 'https://m.media-amazon.com/images/M/MV5BMTYxNDA3MDQwNl5BMl5BanBnXkFtZTcwNTU4Mzc1Nw@@._V1_.jpg',
    width: 1382,
    height: 2048,
  },
  startYear: 2011,
  runtimeSeconds: 6720,
  genres: ['Comedy', 'Drama'],
  rating: {
    aggregateRating: 8.5,
    voteCount: 1017757,
  },
  metacritic: {
    score: 57,
    reviewCount: 31,
  },
  plot: 'After he becomes a quadriplegic from a paragliding accident, an aristocrat hires a young man from the projects to be his caregiver.',
  directors: [
    {
      id: 'nm0619923',
      displayName: 'Olivier Nakache',
      primaryImage: {
        url: 'https://m.media-amazon.com/images/M/MV5BMjI4MzIxMTQ1MV5BMl5BanBnXkFtZTcwNDk4NzgxOA@@._V1_.jpg',
        width: 1430,
        height: 2048,
      },
      primaryProfessions: ['director', 'producer', 'writer'],
    },
    {
      id: 'nm0865918',
      displayName: 'Éric Toledano',
      alternativeNames: ['Eric Toledano', 'Éric Tolédano'],
      primaryImage: {
        url: 'https://m.media-amazon.com/images/M/MV5BMTY4OTQzNjAwMl5BMl5BanBnXkFtZTcwMDU3NTg2OA@@._V1_.jpg',
        width: 1363,
        height: 2048,
      },
      primaryProfessions: ['director', 'producer', 'writer'],
    },
  ],
  writers: [
    {
      id: 'nm0619923',
      displayName: 'Olivier Nakache',
      primaryImage: {
        url: 'https://m.media-amazon.com/images/M/MV5BMjI4MzIxMTQ1MV5BMl5BanBnXkFtZTcwNDk4NzgxOA@@._V1_.jpg',
        width: 1430,
        height: 2048,
      },
      primaryProfessions: ['director', 'producer', 'writer'],
    },
    {
      id: 'nm0865918',
      displayName: 'Éric Toledano',
      alternativeNames: ['Eric Toledano', 'Éric Tolédano'],
      primaryImage: {
        url: 'https://m.media-amazon.com/images/M/MV5BMTY4OTQzNjAwMl5BMl5BanBnXkFtZTcwMDU3NTg2OA@@._V1_.jpg',
        width: 1363,
        height: 2048,
      },
      primaryProfessions: ['director', 'producer', 'writer'],
    },
    {
      id: 'nm4778840',
      displayName: 'Philippe Pozzo di Borgo',
      primaryProfessions: ['writer'],
    },
  ],
  stars: [
    {
      id: 'nm0167388',
      displayName: 'François Cluzet',
      primaryImage: {
        url: 'https://m.media-amazon.com/images/M/MV5BMTkyNjcyNjE0Nl5BMl5BanBnXkFtZTcwMTY5NTc1NA@@._V1_.jpg',
        width: 1363,
        height: 2048,
      },
      primaryProfessions: ['actor', 'soundtrack'],
    },
    {
      id: 'nm0494504',
      displayName: 'Anne Le Ny',
      alternativeNames: ['Anne Leny'],
      primaryImage: {
        url: 'https://m.media-amazon.com/images/M/MV5BZTA0YjE3ZjYtMTg0Yi00ZGZlLThjYWUtMWE4OWFkN2RjNjNiXkEyXkFqcGc@._V1_.jpg',
        width: 1783,
        height: 1783,
      },
      primaryProfessions: ['actress', 'director', 'writer'],
    },
    {
      id: 'nm1082477',
      displayName: 'Omar Sy',
      alternativeNames: ['Omar + Fred', 'Omar et Fred', 'Fred et Omar', 'Omar'],
      primaryImage: {
        url: 'https://m.media-amazon.com/images/M/MV5BMjI2MjE3MDQ3NV5BMl5BanBnXkFtZTcwOTY0NzU0Nw@@._V1_.jpg',
        width: 1366,
        height: 2048,
      },
      primaryProfessions: ['actor', 'producer', 'writer'],
    },
    {
      id: 'nm1109153',
      displayName: 'Audrey Fleurot',
      primaryImage: {
        url: 'https://m.media-amazon.com/images/M/MV5BMTYzNjA3ODAyOF5BMl5BanBnXkFtZTcwMTMwMDYxNw@@._V1_.jpg',
        width: 1362,
        height: 2048,
      },
      primaryProfessions: ['actress'],
    },
  ],
  originCountries: [
    {
      code: 'FR',
      name: 'France',
    },
  ],
  spokenLanguages: [
    {
      code: 'fra',
      name: 'French',
    },
    {
      code: 'eng',
      name: 'English',
    },
  ],
  interests: [
    {
      id: 'in0000032',
      name: 'Buddy Comedy',
      isSubgenre: true,
    },
    {
      id: 'in0000034',
      name: 'Comedy',
    },
    {
      id: 'in0000075',
      name: 'Docudrama',
      isSubgenre: true,
    },
    {
      id: 'in0000076',
      name: 'Drama',
    },
  ],
};
