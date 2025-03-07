import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiCalendar, FiFlag, FiCheckCircle, FiSettings } from 'react-icons/fi';

export interface MovieDetailData {
  _id: string;
  name: string;
  origin_name?: string;
  content: string;
  status: string;
  time: string;
  quality: string;
  lang: string;
  year: string;
  actor: string[];
  director: string[];
  category: Array<{ id: string; name: string }>;
  country: Array<{ id: string; name: string }>;
}

interface MovieInfoProps {
  movieDetail: MovieDetailData;
}

const MovieInfo: React.FC<MovieInfoProps> = ({ movieDetail }) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const contentPreview = movieDetail.content.slice(0, 250);

  // Get status text
  const getStatusText = (status: string) => {
    return status === 'completed' ? 'Hoàn thành' : 'Đang chiếu';
  };

  return (
    <div className="mt-8 text-white">
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Nội dung phim</h3>
        <p className="text-gray-300 leading-relaxed">
          {showFullContent ? movieDetail.content : `${contentPreview}...`}
        </p>
        {movieDetail.content.length > 250 && (
          <button
            onClick={() => setShowFullContent(!showFullContent)}
            className="mt-3 text-red-500 hover:text-red-400 font-medium"
          >
            {showFullContent ? 'Thu gọn' : 'Xem thêm'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">Thông tin phim</h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-center">
              <FiCheckCircle className="mr-2 text-red-500" />
              <span className="font-medium mr-2">Trạng thái:</span> 
              {getStatusText(movieDetail.status)}
            </li>
            <li className="flex items-center">
              <FiClock className="mr-2 text-red-500" />
              <span className="font-medium mr-2">Thời lượng:</span> 
              {movieDetail.time}
            </li>
            <li className="flex items-center">
              <FiSettings className="mr-2 text-red-500" />
              <span className="font-medium mr-2">Chất lượng:</span> 
              {movieDetail.quality}
            </li>
            <li className="flex items-center">
              <FiFlag className="mr-2 text-red-500" />
              <span className="font-medium mr-2">Ngôn ngữ:</span> 
              {movieDetail.lang}
            </li>
            <li className="flex items-center">
              <FiCalendar className="mr-2 text-red-500" />
              <span className="font-medium mr-2">Năm phát hành:</span> 
              {movieDetail.year}
            </li>
          </ul>

          <h3 className="text-xl font-bold mt-6 mb-3">Thể loại</h3>
          <div className="flex flex-wrap gap-2">
            {movieDetail.category.map((cat) => (
              <Link 
                key={cat.id} 
                to={`/category/${cat.id}`}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm px-3 py-1 rounded-full transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <h3 className="text-xl font-bold mt-6 mb-3">Quốc gia</h3>
          <div className="flex flex-wrap gap-2">
            {movieDetail.country.map((country) => (
              <Link 
                key={country.id} 
                to={`/country/${country.id}`}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm px-3 py-1 rounded-full transition-colors"
              >
                {country.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Diễn viên</h3>
          {movieDetail.actor.length > 0 ? (
            <p className="text-gray-300">
              {movieDetail.actor.join(', ')}
            </p>
          ) : (
            <p className="text-gray-500 italic">Đang cập nhật</p>
          )}

          <h3 className="text-xl font-bold mt-6 mb-4">Đạo diễn</h3>
          {movieDetail.director.length > 0 ? (
            <p className="text-gray-300">
              {movieDetail.director.join(', ')}
            </p>
          ) : (
            <p className="text-gray-500 italic">Đang cập nhật</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieInfo;
