import { create } from 'zustand';

interface UIState {
  showMenu: boolean;
  showUserMenu: boolean;
  showLogoutModal: boolean;
  searchQuery: string;
  
  toggleMenu: (value?: boolean) => void;
  toggleUserMenu: (value?: boolean) => void;
  toggleLogoutModal: (value?: boolean) => void;
  setSearchQuery: (query: string) => void;
}

const useUIStore = create<UIState>((set) => ({
  showMenu: false,
  showUserMenu: false,
  showLogoutModal: false,
  searchQuery: '',
  
  toggleMenu: (value?: boolean) => 
    set((state) => ({ showMenu: value !== undefined ? value : !state.showMenu })),
    
  toggleUserMenu: (value?: boolean) => 
    set((state) => ({ showUserMenu: value !== undefined ? value : !state.showUserMenu })),
    
  toggleLogoutModal: (value?: boolean) => 
    set((state) => ({ showLogoutModal: value !== undefined ? value : !state.showLogoutModal })),
    
  setSearchQuery: (query: string) => 
    set({ searchQuery: query }),
}));

export default useUIStore;
