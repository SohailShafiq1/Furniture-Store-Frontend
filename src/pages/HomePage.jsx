import Header from '../components/Header/Header';
import HeroSection from '../components/HeroSection/HeroSection';
import ShopByCategory from '../components/ShopByCategory/ShopByCategory';

export default function HomePage() {
  return (
    <div className="home-page">
      <Header />
      <HeroSection />
      <ShopByCategory />
    </div>
  );
}
