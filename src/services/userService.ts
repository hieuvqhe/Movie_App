import { getUserProfile, updateUserProfile } from '../api/userApi';

export interface UserProfile {
  id: string;
  userName: string;
  email?: string;
  dateJoined?: string;
  favoriteMovies?: any[];
  avatar?: string;
  [key: string]: any;
}

export const getUserProfileService = async (): Promise<{success: boolean; user?: UserProfile; message?: string}> => {
  try {
    const response = await getUserProfile();
    return { 
      success: true, 
      user: response.user as UserProfile 
    };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to fetch profile'
    };
  }
};

export const updateUserProfileService = async (data: {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  [key: string]: any;
}): Promise<{success: boolean; user?: UserProfile; message?: string}> => {
  try {
    const response = await updateUserProfile(data);
    return { 
      success: true, 
      user: response.user as UserProfile 
    };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to update profile'
    };
  }
};
