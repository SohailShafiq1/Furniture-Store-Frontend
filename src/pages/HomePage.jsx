import Header from '../components/Header/Header';
import HeroSection from '../components/HeroSection/HeroSection';
import TopSpringPicks from '../components/TopSpringPicks/TopSpringPicks';
import Sectionals from '../components/Sectionals/Sectionals';
import PromoBanners from '../components/PromoBanners/PromoBanners';
import BedroomSets from '../components/BedroomSets/BedroomSets';
import ShopByCategory from '../components/ShopByCategory/ShopByCategory';
import DiningTable from '../components/BedroomSets/DiningTable';

export default function HomePage() {
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
    </div>
  );
}
