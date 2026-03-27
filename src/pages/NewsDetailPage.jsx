import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config/api';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './NewsDetailPage.css';

export default function NewsDetailPage() {
  const { newsId } = useParams();
  const [news, setNews] = useState(null);
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNews();
  }, [newsId]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/home-content/news/${newsId}`);
      setNews(res.data);

      const allRes = await axios.get(`${BACKEND_URL}/api/home-content/news/get-all`);
      setAllNews(allRes.data);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('News not found');
    } finally {
      setLoading(false);
    }
  };

  const getRelatedNews = () => {
    return allNews.filter(item => item._id !== newsId).slice(0, 3);
  };

  if (loading) return <><Header /><div style={{ padding: '60px 20px', textAlign: 'center' }}>Loading...</div><Footer /></>;
  if (error || !news) return (
    <>
      <Header />
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>{error || 'News not found'}</h2>
        <Link to="/news">Back to all news</Link>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Header />
      <article className="news-detail-page">
        <div className="news-detail-container">
          <div className="news-detail-hero">
            <img 
              src={news.image.startsWith('http') ? news.image : `${BACKEND_URL}/${news.image}`}
              alt={news.title}
              className="news-detail-image"
            />
          </div>

          <div className="news-detail-content">
            <h1 className="news-detail-title">{news.title}</h1>
            
            <div className="news-detail-meta">
              <span className="news-detail-date">
                {new Date(news.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>

            <div className="news-detail-body">
              {news.description}
            </div>

            <div className="news-detail-share">
              <button onClick={() => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank');
              }} className="share-btn facebook">
                Share on Facebook
              </button>
              <button onClick={() => {
                window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${news.title}`, '_blank');
              }} className="share-btn twitter">
                Share on Twitter
              </button>
              <button onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }} className="share-btn copy">
                Copy Link
              </button>
            </div>

            <Link to="/news" className="back-link">← Back to all news</Link>
          </div>

          {getRelatedNews().length > 0 && (
            <div className="related-news">
              <h3>More News</h3>
              <div className="related-news-grid">
                {getRelatedNews().map((item) => (
                  <Link key={item._id} to={`/news/${item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="related-news-card">
                      <div className="related-news-image">
                        <img 
                          src={item.image.startsWith('http') ? item.image : `${BACKEND_URL}/${item.image}`}
                          alt={item.title}
                        />
                      </div>
                      <h4>{item.title}</h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
      <Footer />
    </>
  );
}
