import axios from 'axios'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE = 'https://image.tmdb.org/t/p'
const rawApiKey = import.meta.env.VITE_TMDB_API_KEY || ''
// Remove quotes if the user accidentally put them in docker-compose.yml
const API_KEY = rawApiKey.replace(/^["']|["']$/g, '').trim()

// If the key is very long (JWT), it's a Read Access Token (v4). Otherwise, it's an API Key (v3).
const isBearerToken = API_KEY.length > 50

const tmdb = axios.create({
  baseURL: TMDB_BASE,
  params: {
    ...(isBearerToken ? {} : { api_key: API_KEY }),
    language: 'en-US',
  },
  headers: {
    ...(isBearerToken ? { Authorization: `Bearer ${API_KEY}` } : {}),
  }
})

// Image URL helpers
export const posterUrl = (path, size = 'w500') =>
  path ? `${TMDB_IMAGE}/${size}${path}` : null

export const backdropUrl = (path, size = 'original') =>
  path ? `${TMDB_IMAGE}/${size}${path}` : null

// Movies
export const getTrending = (type = 'all', period = 'week') =>
  tmdb.get(`/trending/${type}/${period}`).then(r => r.data)

export const getPopularMovies = (page = 1) =>
  tmdb.get('/movie/popular', { params: { page } }).then(r => r.data)

export const getTopRatedMovies = (page = 1) =>
  tmdb.get('/movie/top_rated', { params: { page } }).then(r => r.data)

export const getNowPlayingMovies = (page = 1) =>
  tmdb.get('/movie/now_playing', { params: { page } }).then(r => r.data)

export const getMoviesByGenre = (genreId, page = 1) =>
  tmdb.get('/discover/movie', {
    params: { with_genres: genreId, sort_by: 'popularity.desc', page },
  }).then(r => r.data)

export const getMovieDetails = (id) =>
  tmdb.get(`/movie/${id}`, {
    params: { append_to_response: 'external_ids,credits,videos,similar' },
  }).then(r => r.data)

// Series
export const getPopularSeries = (page = 1) =>
  tmdb.get('/tv/popular', { params: { page } }).then(r => r.data)

export const getTopRatedSeries = (page = 1) =>
  tmdb.get('/tv/top_rated', { params: { page } }).then(r => r.data)

export const getAiringTodaySeries = (page = 1) =>
  tmdb.get('/tv/airing_today', { params: { page } }).then(r => r.data)

export const getSeriesDetails = (id) =>
  tmdb.get(`/tv/${id}`, {
    params: { append_to_response: 'external_ids,credits,videos,similar' },
  }).then(r => r.data)

export const getSeriesSeason = (seriesId, season) =>
  tmdb.get(`/tv/${seriesId}/season/${season}`).then(r => r.data)

// Search
export const searchMulti = (query, page = 1) =>
  tmdb.get('/search/multi', { params: { query, page } }).then(r => r.data)

export const searchMovies = (query, page = 1) =>
  tmdb.get('/search/movie', { params: { query, page } }).then(r => r.data)

export const searchSeries = (query, page = 1) =>
  tmdb.get('/search/tv', { params: { query, page } }).then(r => r.data)

// Genres
export const getMovieGenres = () =>
  tmdb.get('/genre/movie/list').then(r => r.data)

export const getSeriesGenres = () =>
  tmdb.get('/genre/tv/list').then(r => r.data)

// VidAPI embed URL builder
export const getEmbedUrl = (item) => {
  const BASE = 'https://vaplayer.ru/embed'
  const isMovie = item.media_type === 'movie' || item.title

  if (isMovie) {
    const id = item.imdb_id || item.tmdb_id || item.id
    const prefix = String(id).startsWith('tt') ? '' : ''
    return `${BASE}/movie/${id}?primaryColor=%236366f1&lang=en`
  } else {
    const id = item.imdb_id || item.tmdb_id || item.id
    return `${BASE}/tv/${id}/1/1?primaryColor=%236366f1&lang=en`
  }
}

export const buildMovieEmbedUrl = (tmdbId, imdbId) => {
  const id = imdbId || tmdbId
  return `https://vaplayer.ru/embed/movie/${id}?primaryColor=%236366f1&lang=en`
}

export const buildSeriesEmbedUrl = (tmdbId, imdbId, season = 1, episode = 1) => {
  const id = imdbId || tmdbId
  return `https://vaplayer.ru/embed/tv/${id}/${season}/${episode}?primaryColor=%236366f1&lang=en`
}
