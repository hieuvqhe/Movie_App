// Type definitions for movieApi.js

export interface Movie {
  _id: string;
  slug: string;
  name: string;
  origin_name?: string;
  year?: string;
  thumb_url?: string;
  poster_url?: string;
  type?: string;
  category?: string[];
  status?: string;
  modified?: {
    time: string;
  };
  episodes?: Array<{
    server_name: string;
    server_data: Array<{
      name: string;
      slug: string;
      filename: string;
      link_embed: string;
      link_m3u8: string;
    }>;
  }>;
}

// Updated to match the actual response structure
export interface MovieResponse {
  status: boolean | string;
  msg?: string;
  // The items can be at the top level OR in the data object
  items?: Movie[];
  pagination?: {
    totalItems: number;
    totalItemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
  // Keep data field for backward compatibility as some endpoints might use it
  data?: {
    items: Movie[];
    params?: {
      pagination: {
        totalItems: number;
        totalItemsPerPage: number;
        currentPage: number;
        totalPages: number;
      };
      [key: string]: any;
    };
    [key: string]: any;
  };
  movie?: Movie;
  [key: string]: any;
}

export interface SearchParams {
  keyword: string;
  page?: number;
  limit?: number;
}

export function getNewMovies(page?: number, limit?: number): Promise<MovieResponse>;
export function getMoviesByYear(year?: number, page?: number, limit?: number): Promise<MovieResponse>;
export function getCategoryMovies(category: string, page?: number, limit?: number): Promise<MovieResponse>;
export function fetchMovieDetail(slug: string): Promise<MovieResponse>;
export function searchMovies(keyword: string, page?: number, limit?: number): Promise<MovieResponse>;
