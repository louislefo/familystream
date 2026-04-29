import axios from 'axios'
import * as tmdb from './tmdb'

// ============================================================================
// IMDb API Service with TMDB Fallback
// Strategy: Try the free public IMDb API (imdbapi.dev) first.
//           If it fails, fall back to the TMDB API (requires API key).
// All responses are normalized to the TMDB-compatible format used by the UI.
// ============================================================================

const IMDB_BASE = 'https://api.imdbapi.dev'

const imdbClient = axios.create({
  baseURL: IMDB_BASE,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Normalization helpers ───────────────────────────────────────────────────
// Converts a single IMDb API title object into the TMDB-like shape the UI expects.

function normalizeTitle(t) {
  if (!t) return null
  const isMovie = t.type === 'movie' || t.type === 'MOVIE' || t.type === 'tvMovie'
  const isSeries = t.type === 'tvSeries' || t.type === 'TV_SERIES'
    || t.type === 'tvMiniSeries' || t.type === 'TV_MINI_SERIES'

  return {
    // Core identifiers
    id: t.id, // tt1234567
    imdb_id: t.id,

    // Titles
    title: isMovie ? (t.primaryTitle || t.originalTitle || '') : undefined,
    name: isSeries ? (t.primaryTitle || t.originalTitle || '') : undefined,

    // Media type (TMDB convention: 'movie' or 'tv')
    media_type: isSeries ? 'tv' : 'movie',

    // Synopsis
    overview: t.plot || '',

    // Images — IMDb API returns absolute URLs in primaryImage.url
    poster_path: t.primaryImage?.url || null,
    backdrop_path: t.primaryImage?.url || null,

    // Rating
    vote_average: t.rating?.aggregateRating || 0,
    vote_count: t.rating?.voteCount || 0,

    // Dates
    release_date: t.startYear ? `${t.startYear}-01-01` : '',
    first_air_date: t.startYear ? `${t.startYear}-01-01` : '',

    // Runtime (API returns seconds, UI expects minutes)
    runtime: t.runtimeSeconds ? Math.round(t.runtimeSeconds / 60) : null,

    // Genres — IMDb returns string[], TMDB uses {id, name}[]
    genres: (t.genres || []).map((g, i) => ({ id: i, name: g })),
    genre_ids: [],

    // Cast/crew (already in a usable format from the detail endpoint)
    credits: {
      cast: (t.stars || []).map(s => ({
        id: s.id,
        name: s.displayName,
        profile_path: s.primaryImage?.url || null,
        character: '',
      })),
    },

    // External IDs (the id IS the imdb_id)
    external_ids: { imdb_id: t.id },

    // Videos — not directly available from IMDb title details
    videos: { results: [] },

    // Similar — not directly available
    similar: { results: [] },

    // For series: seasons will be fetched separately
    seasons: [],

    // Keep raw type for internal use
    _imdbType: t.type,
  }
}

// Converts a list response from IMDb API to TMDB-like paginated format.
function normalizeListResponse(data) {
  const titles = (data.titles || []).map(normalizeTitle).filter(Boolean)
  return {
    results: titles,
    total_results: data.totalCount || titles.length,
    // IMDb uses token-based pagination, not page numbers.
    // We set total_pages to 2 if there's a next page, 1 otherwise.
    total_pages: data.nextPageToken ? 999 : 1,
    _nextPageToken: data.nextPageToken || null,
  }
}

// ── Fallback wrapper ────────────────────────────────────────────────────────
// Tries the IMDb API function first; falls back to the TMDB equivalent on error.

async function withFallback(imdbFn, tmdbFn) {
  try {
    return await imdbFn()
  } catch (err) {
    console.warn('[IMDb API] Failed, falling back to TMDB:', err.message)
    return await tmdbFn()
  }
}

// ── Image URL helpers ───────────────────────────────────────────────────────
// IMDb API returns absolute image URLs, so no path building is needed.
// However, for TMDB fallback data, we still need the TMDB helper.

export const posterUrl = (path, size = 'w500') => {
  if (!path) return null
  // If it's already an absolute URL (from IMDb), return as-is
  if (path.startsWith('http')) return path
  // Otherwise it's a TMDB relative path
  return `https://image.tmdb.org/t/p/${size}${path}`
}

export const backdropUrl = (path, size = 'original') => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `https://image.tmdb.org/t/p/${size}${path}`
}

// ── Movies ──────────────────────────────────────────────────────────────────

export const getTrending = (type = 'all', period = 'week') =>
  withFallback(
    async () => {
      const { data } = await imdbClient.get('/titles', {
        params: { sortBy: 'SORT_BY_POPULARITY', sortOrder: 'ASC' },
      })
      return normalizeListResponse(data)
    },
    () => tmdb.getTrending(type, period),
  )

export const getPopularMovies = (page = 1) =>
  withFallback(
    async () => {
      const { data } = await imdbClient.get('/titles', {
        params: { types: 'MOVIE', sortBy: 'SORT_BY_POPULARITY', sortOrder: 'ASC' },
      })
      return normalizeListResponse(data)
    },
    () => tmdb.getPopularMovies(page),
  )

export const getTopRatedMovies = (page = 1) =>
  withFallback(
    async () => {
      const { data } = await imdbClient.get('/titles', {
        params: {
          types: 'MOVIE',
          sortBy: 'SORT_BY_USER_RATING',
          sortOrder: 'DESC',
          minVoteCount: 50000,
        },
      })
      return normalizeListResponse(data)
    },
    () => tmdb.getTopRatedMovies(page),
  )

export const getNowPlayingMovies = (page = 1) =>
  withFallback(
    async () => {
      const { data } = await imdbClient.get('/titles', {
        params: {
          types: 'MOVIE',
          sortBy: 'SORT_BY_RELEASE_DATE',
          sortOrder: 'DESC',
        },
      })
      return normalizeListResponse(data)
    },
    () => tmdb.getNowPlayingMovies(page),
  )

export const getMoviesByGenre = (genreId, page = 1) =>
  withFallback(
    async () => {
      const { data } = await imdbClient.get('/titles', {
        params: {
          types: 'MOVIE',
          genres: genreId,
          sortBy: 'SORT_BY_POPULARITY',
          sortOrder: 'ASC',
        },
      })
      return normalizeListResponse(data)
    },
    () => tmdb.getMoviesByGenre(genreId, page),
  )

export const getMovieDetails = (id) =>
  withFallback(
    async () => {
      const { data } = await imdbClient.get(`/titles/${id}`)
      const normalized = normalizeTitle(data)

      // Fetch seasons if it's a series (shouldn't happen for movies, but safe)
      // Fetch credits for richer cast data
      try {
        const { data: creditsData } = await imdbClient.get(`/titles/${id}/credits`, {
          params: { categories: 'actor', pageSize: 10 },
        })
        if (creditsData.credits) {
          normalized.credits.cast = creditsData.credits.map(c => ({
            id: c.name?.id,
            name: c.name?.displayName,
            profile_path: c.name?.primaryImage?.url || null,
            character: (c.characters || []).join(', '),
          }))
        }
      } catch { /* credits are optional */ }

      return normalized
    },
    () => tmdb.getMovieDetails(id),
  )

// ── Series ──────────────────────────────────────────────────────────────────

export const getPopularSeries = (page = 1) =>
  withFallback(
    async () => {
      const { data } = await imdbClient.get('/titles', {
        params: { types: 'TV_SERIES', sortBy: 'SORT_BY_POPULARITY', sortOrder: 'ASC' },
      })
      return normalizeListResponse(data)
    },
    () => tmdb.getPopularSeries(page),
  )

export const getTopRatedSeries = (page = 1) =>
  withFallback(
    async () => {
      const { data } = await imdbClient.get('/titles', {
        params: {
          types: 'TV_SERIES',
          sortBy: 'SORT_BY_USER_RATING',
          sortOrder: 'DESC',
          minVoteCount: 50000,
        },
      })
      return normalizeListResponse(data)
    },
    () => tmdb.getTopRatedSeries(page),
  )

export const getAiringTodaySeries = (page = 1) =>
  withFallback(
    async () => {
      const { data } = await imdbClient.get('/titles', {
        params: {
          types: 'TV_SERIES',
          sortBy: 'SORT_BY_RELEASE_DATE',
          sortOrder: 'DESC',
        },
      })
      return normalizeListResponse(data)
    },
    () => tmdb.getAiringTodaySeries(page),
  )

export const getSeriesDetails = (id) =>
  withFallback(
    async () => {
      const { data } = await imdbClient.get(`/titles/${id}`)
      const normalized = normalizeTitle(data)

      // Fetch seasons list
      try {
        const { data: seasonsData } = await imdbClient.get(`/titles/${id}/seasons`)
        if (seasonsData.seasons) {
          normalized.seasons = seasonsData.seasons.map(s => ({
            season_number: parseInt(s.season) || 0,
            episode_count: s.episodeCount || 0,
          }))
        }
      } catch { /* seasons are optional */ }

      // Fetch credits
      try {
        const { data: creditsData } = await imdbClient.get(`/titles/${id}/credits`, {
          params: { categories: 'actor', pageSize: 10 },
        })
        if (creditsData.credits) {
          normalized.credits.cast = creditsData.credits.map(c => ({
            id: c.name?.id,
            name: c.name?.displayName,
            profile_path: c.name?.primaryImage?.url || null,
            character: (c.characters || []).join(', '),
          }))
        }
      } catch { /* credits are optional */ }

      return normalized
    },
    () => tmdb.getSeriesDetails(id),
  )

export const getSeriesSeason = (seriesId, season) =>
  withFallback(
    async () => {
      const { data } = await imdbClient.get(`/titles/${seriesId}/episodes`, {
        params: { season: String(season), pageSize: 50 },
      })
      return {
        episodes: (data.episodes || []).map(ep => ({
          id: ep.id,
          name: ep.title || '',
          overview: ep.plot || '',
          episode_number: ep.episodeNumber,
          season_number: parseInt(ep.season) || season,
          still_path: ep.primaryImage?.url || null,
          vote_average: ep.rating?.aggregateRating || 0,
          runtime: ep.runtimeSeconds ? Math.round(ep.runtimeSeconds / 60) : null,
        })),
      }
    },
    () => tmdb.getSeriesSeason(seriesId, season),
  )

// ── Search ──────────────────────────────────────────────────────────────────

export const searchMulti = (query, page = 1) =>
  withFallback(
    async () => {
      const { data } = await imdbClient.get('/search/titles', {
        params: { query, limit: 20 },
      })
      // Search response uses { titles: [...] }
      const titles = (data.titles || []).map(normalizeTitle).filter(Boolean)
      return {
        results: titles,
        total_results: titles.length,
        total_pages: 1,
      }
    },
    () => tmdb.searchMulti(query, page),
  )

export const searchMovies = (query, page = 1) =>
  withFallback(
    async () => {
      const { data } = await imdbClient.get('/search/titles', {
        params: { query, limit: 20 },
      })
      const titles = (data.titles || [])
        .map(normalizeTitle)
        .filter(t => t && t.media_type === 'movie')
      return {
        results: titles,
        total_results: titles.length,
        total_pages: 1,
      }
    },
    () => tmdb.searchMovies(query, page),
  )

export const searchSeries = (query, page = 1) =>
  withFallback(
    async () => {
      const { data } = await imdbClient.get('/search/titles', {
        params: { query, limit: 20 },
      })
      const titles = (data.titles || [])
        .map(normalizeTitle)
        .filter(t => t && t.media_type === 'tv')
      return {
        results: titles,
        total_results: titles.length,
        total_pages: 1,
      }
    },
    () => tmdb.searchSeries(query, page),
  )

// ── Genres ───────────────────────────────────────────────────────────────────
// IMDb API uses "interests" not genres. Fall back to TMDB for genre lists.

export const getMovieGenres = () => tmdb.getMovieGenres()
export const getSeriesGenres = () => tmdb.getSeriesGenres()

// ── VidAPI embed URL builder ────────────────────────────────────────────────
// These work with IMDb IDs directly (which is what imdbapi.dev returns).

export const getEmbedUrl = (item) => {
  const BASE = 'https://vaplayer.ru/embed'
  const isMovie = item.media_type === 'movie' || item.title

  // Prefer the IMDb ID (tt...) since we already have it from the IMDb API
  const id = item.imdb_id || item.id
  if (isMovie) {
    return `${BASE}/movie/${id}?primaryColor=%236366f1&lang=en`
  } else {
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
