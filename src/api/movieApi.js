import axios from 'axios';

const BASE_URL = 'https://phimapi.com';
const BASE_IMAGE_URL = 'https://phimimg.com';

export const getNewMovies = async (page = 1, limit = 12) => {
  try {
 
    const response = await axios.get(`${BASE_URL}/danh-sach/phim-moi-cap-nhat?page=${page}`);
  
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin phim mới:', error);
    throw error;
  }
};

export const getMoviesByYear = async (year = 2025, page = 1, limit = 12) => {
  try {
   
    const response = await axios.get(`${BASE_URL}/v1/api/nam/${year}`, {
      params: { page, limit }
    });
  
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy phim năm ${year}:`, error);
    throw error;
  }
};

// Unified approach for all categories
export const getCategoryMovies = async (category, page = 1, limit = 10) => {
  try {
  
    
    // Special handling for new movies only
    if (category === 'phim-moi-cap-nhat') {
      return getNewMovies(page);
    }

    // All other categories use the same endpoint pattern
    const url = `${BASE_URL}/v1/api/danh-sach/${category}`;
    
    const response = await axios.get(url, { 
      params: { page, limit }
    });
    
    // Ensure pagination data is properly structured
    if (response.data && response.data.data) {
      // If pagination info exists but is incomplete, fix it
      if (response.data.data.params && response.data.data.params.pagination) {
        const pagination = response.data.data.params.pagination;
        
        // Calculate totalPages if not provided or incorrect
        if (!pagination.totalPages || pagination.totalPages < 1) {
          const totalItems = pagination.totalItems || 100;
          const itemsPerPage = pagination.totalItemsPerPage || limit;
          pagination.totalPages = Math.ceil(totalItems / itemsPerPage);
          
      
        }
        
        // Ensure currentPage is set
        if (!pagination.currentPage) {
          pagination.currentPage = page;
        }
        
      } else if (response.data.data.items) {
        // If no pagination info exists but we have items, create basic pagination
        const estimatedTotal = response.data.data.items.length * 50; // Assuming many more pages
        
        response.data.data.params = {
          ...response.data.data.params,
          pagination: {
            currentPage: page,
            totalItemsPerPage: limit,
            totalItems: estimatedTotal,
            totalPages: Math.ceil(estimatedTotal / limit)
          }
        };
        
      }
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching category ${category}:`, error);
    throw error;
  }
};

export const fetchMovieDetail = async (slug) => {
  try {
    const response = await axios.get(`${BASE_URL}/phim/${slug}`);
    if (!response.data.status) {
      throw new Error(response.data.msg || 'Failed to fetch movie');
    }
    return response.data;  // Trả về toàn bộ response data
  } catch (error) {
    console.error('Error fetching movie detail:', error);
    throw error;
  }
};

export const searchMovies = async (params) => {
  try {
    // Extract all possible parameters with defaults
    const {
      keyword,
      page = 1,
      limit = 24,
      sort_field,
      sort_type,
      sort_lang,
      category,
      country,
      year
    } = params;

    // Build query parameters object
    const queryParams = {
      keyword,
      page,
      limit
    };

    // Add optional parameters if provided
    if (sort_field) queryParams.sort_field = sort_field;
    if (sort_type) queryParams.sort_type = sort_type;
    if (sort_lang) queryParams.sort_lang = sort_lang;
    if (category) queryParams.category = category;
    if (country) queryParams.country = country;
    if (year) queryParams.year = year;

    const response = await axios.get(`${BASE_URL}/v1/api/tim-kiem`, { params: queryParams });

    if (response.data?.status === 'success') {
      const items = response.data.data.items.map(item => ({
        ...item,
        poster_url: item.poster_url?.startsWith('http') 
          ? item.poster_url 
          : `${BASE_IMAGE_URL}/${item.poster_url}`,
        thumb_url: item.thumb_url?.startsWith('http') 
          ? item.thumb_url 
          : `${BASE_IMAGE_URL}/${item.thumb_url}`,
        _id: item._id || `${item.slug}-${Date.now()}`
      }));
      
      return {
        status: 'success',
        data: {
          items,
          params: response.data.data.params,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(response.data.data.params.pagination.totalItems / limit),
            totalItems: response.data.data.params.pagination.totalItems
          }
        }
      };
    }
    return { status: 'error', msg: 'Không tìm thấy kết quả' };
  } catch (error) {
    console.error('Search API Error:', error);
    throw new Error('Không thể tìm kiếm phim. Vui lòng thử lại sau.');
  }
};

export const getSimilarMovies = async (movieDetail, limit = 12) => {
  try {
    if (!movieDetail || !movieDetail.category || !movieDetail.category.length) {
      throw new Error('Movie has no category information');
    }

    // Get the primary category and country
    const primaryCategory = movieDetail.category[0].slug;
    
    // Build the query parameters
    const params = {
      page: 1,
      limit: limit,
      sort_field: 'modified.time', // Get most recently updated similar movies
      sort_type: 'desc'
    };

    // Add country filter if available
    if (movieDetail.country && movieDetail.country.length > 0) {
      params.country = movieDetail.country[0].slug;
    }

    // Make API call to get similar movies by category
    const response = await axios.get(`${BASE_URL}/v1/api/the-loai/${primaryCategory}`, { params });

    if (!response.data.status) {
      throw new Error(response.data.msg || 'Failed to fetch similar movies');
    }

    // Process the response to normalize image URLs and filter out the current movie
    const similarMovies = response.data.data.items
      .filter(movie => movie._id !== movieDetail._id) // Filter out the current movie
      .map(movie => ({
        ...movie,
        poster_url: movie.poster_url?.startsWith('http') 
          ? movie.poster_url 
          : `${BASE_IMAGE_URL}/${movie.poster_url}`,
        thumb_url: movie.thumb_url?.startsWith('http') 
          ? movie.thumb_url 
          : `${BASE_IMAGE_URL}/${movie.thumb_url}`
      }));

    return {
      status: 'success',
      data: {
        items: similarMovies.slice(0, limit), // Make sure we don't exceed the limit
        total: similarMovies.length
      }
    };
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    return {
      status: 'error',
      msg: error.message || 'Failed to fetch similar movies',
      data: { items: [] }
    };
  }
};