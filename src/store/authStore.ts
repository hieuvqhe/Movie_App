import { create } from 'zustand';
import { getUserProfile, loginApi, registerApi, updateUserProfile } from '../api/userApi';

interface User {
  id: string;
  userName: string;
  email?: string;
  fullName?: string;
  [key: string]: any;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  
  // Authentication methods
  checkLoginStatus: () => Promise<boolean>;
  login: (userName: string, password: string) => Promise<boolean>;
  register: (userName: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  clearError: () => void;
}

// Helper function to replace AsyncStorage with localStorage
const getToken = () => localStorage.getItem('accessToken');
const setToken = (token: string) => localStorage.setItem('accessToken', token);
const removeToken = () => localStorage.removeItem('accessToken');

const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,

  // Check if user is already logged in
  checkLoginStatus: async () => {
    set({ loading: true });
    try {
      const token = getToken();
      
      if (!token) {
        set({ isAuthenticated: false, user: null, loading: false });
        return false;
      }

      // Replace AsyncStorage calls with localStorage in getUserProfile function
      const userData = await getUserProfile();
      
      if (userData && userData.user) {
        set({ 
          isAuthenticated: true, 
          user: userData.user,
          loading: false,
          error: null
        });
        return true;
      } else {
        // Token exists but couldn't get profile - token might be invalid
        removeToken();
        set({ isAuthenticated: false, user: null, loading: false });
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid token if exists
      removeToken();
      set({ 
        isAuthenticated: false, 
        user: null, 
        loading: false,
        error: error instanceof Error ? error.message : 'Phiên đăng nhập hết hạn'
      });
      return false;
    }
  },

  // Login user - updated to handle accessToken
  login: async (userName, password) => {
    set({ loading: true, error: null });
    try {
      const response = await loginApi(userName, password);
      
      // Update this part to check for accessToken instead of token
      if (response && response.accessToken) {
        // Save the accessToken
        setToken(response.accessToken);
        
        try {
          // Get full user profile after login
          const userData = await getUserProfile();
          
          set({ 
            isAuthenticated: true, 
            user: userData.user, 
            loading: false,
            error: null
          });
          return true;
        } catch (profileError) {
          // If profile fetch fails, still consider user logged in
          console.error('Failed to fetch user profile:', profileError);
          set({
            isAuthenticated: true,
            loading: false,
            error: null
          });
          return true;
        }
      }
      
      set({ loading: false, error: 'Đăng nhập thất bại' });
      return false;
    } catch (error) {
      console.error('Login error:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Đăng nhập thất bại'
      });
      return false;
    }
  },

  // Register new user
  register: async (userName, password) => {
    set({ loading: true, error: null });
    try {
      const response = await registerApi(userName, password);
      
      if (response && response.success) {
        // Auto login after successful registration
        return get().login(userName, password);
      }
      
      set({ loading: false, error: 'Đăng ký thất bại' });
      return false;
    } catch (error) {
      // Properly handle and display the error message
      const errorMessage = error instanceof Error ? error.message : 'Đăng ký thất bại';
      set({ loading: false, error: errorMessage });
      return false;
    }
  },

  // Logout user
  logout: async () => {
    try {
      removeToken();
      set({ isAuthenticated: false, user: null, error: null });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Update user profile
  updateProfile: async (updates) => {
    set({ loading: true, error: null });
    try {
      const response = await updateUserProfile(updates);
      
      if (response && response.user) {
        set({ 
          user: response.user, 
          loading: false,
          error: null
        });
        return true;
      }
      
      set({ loading: false, error: 'Cập nhật thông tin thất bại' });
      return false;
    } catch (error) {
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Cập nhật thông tin thất bại'
      });
      return false;
    }
  },

  // Clear error state
  clearError: () => set({ error: null })
}));

export default useAuthStore;
