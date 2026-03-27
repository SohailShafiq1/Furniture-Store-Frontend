import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config/api';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './NewsPage.css';

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/home-content/news/get-all`);
      setNews(res.data);
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <section className="news-updates">
        <div className="news-container">
          <h2 className="news-title">Luna Furniture News & Updates</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="news-grid">
              {news.map((item) => (
                <Link key={item._id} to={`/news/${item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="news-card">
                    <div className="news-image-wrapper">
                      <img 
                        src={item.image.startsWith('http') ? item.image : `${BACKEND_URL}/${item.image}`}
                        alt={item.title}
                        className="news-image"
                      />
                    </div>
                    <div className="news-content">
                      <h3 className="news-card-title">{item.title}</h3>
                      <p className="news-description">{item.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
