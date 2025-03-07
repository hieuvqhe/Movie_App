import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import useAuthStore from './store/authStore';
import Categories from './pages/CategoryPage';
import { Toaster } from 'react-hot-toast'; // Add this import
import FavoriteMoviePage from './pages/FavoriteMoviePage';

const App: React.FC = () => {
  const { checkLoginStatus } = useAuthStore();

  useEffect(() => {
    // Initialize authentication state when app loads
    checkLoginStatus();
  }, [checkLoginStatus]);

  return (
    <Router>
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: 'rgba(40, 167, 69, 0.9)',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: 'rgba(220, 53, 69, 0.9)',
            },
          },
        }}
      />
      
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/:slug" element={<MovieDetailPage />} />
          <Route path="/category/:category" element={<Categories />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/favorites" element={<FavoriteMoviePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
