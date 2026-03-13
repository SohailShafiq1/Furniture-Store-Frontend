import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import Header from '../components/Header/Header';
import HeroSection from '../components/HeroSection/HeroSection';
import TopSpringPicks from '../components/TopSpringPicks/TopSpringPicks';
import Sectionals from '../components/Sectionals/Sectionals';
import PromoBanners from '../components/PromoBanners/PromoBanners';
import BedroomSets from '../components/BedroomSets/BedroomSets';
import ShopByCategory from '../components/ShopByCategory/ShopByCategory';
import DiningTable from '../components/BedroomSets/DiningTable';
import SlidingBanner from '../components/SlidingBanner/SlidingBanner';
import Inspiration from '../components/Inspiration/Inspiration';
import TopBrands from '../components/TopBrands/TopBrands';
import NewsUpdates from '../components/NewsUpdates/NewsUpdates';
import Footer from '../components/Footer/Footer';

export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useUserAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userJson = params.get('user');

    if (token && userJson) {
      try {
        const user = JSON.parse(decodeURIComponent(userJson));
        login(token, user);
        // Clear query params
        navigate('/', { replace: true });
      } catch (err) {
        console.error("Failed to parse social login data:", err);
      }
    }
  }, [location, login, navigate]);

  return (
    <div className="home-page">
      <Header />
      <HeroSection />
      <ShopByCategory />
      <TopSpringPicks />
      <Sectionals />
      <PromoBanners />
      <BedroomSets />
      <PromoBanners />
      <DiningTable/>
      <SlidingBanner />
      <Inspiration />
      <TopBrands />
      <NewsUpdates />
      <Footer />
    </div>
  );
}
