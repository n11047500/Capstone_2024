import React, {useState} from 'react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import './HomePage.css';
import desktop_planter_box from '../assets/desktop_planter_box.jpg';
import accessibility_planter_box from '../assets/accessibility_planter_box.jpg';
import small_standard_planter_box from '../assets/small_standard_planter_box.jpg';
import insta_garden_range from '../assets/insta_garden_range.jpg';
import medium_wicking_planter_box from '../assets/medium_wicking_planter_box.jpg';
import side_table from '../assets/side_table.jpg';
import top_image from '../assets/homepage_image1.jpg';
import home_icon from '../assets/home_icon.png';


function HomePage() {
  const [sortType] = useState('');

  const products = [
    { id : 2, title: 'Small Standard Planter Box', price: '$350.00', image: small_standard_planter_box},
    { id : 7, title: 'Medium Wicking Planter Box', price: '$720.00', image: medium_wicking_planter_box },
    { id: 11, title: 'Desktop Planter Box', price: '$79.00', image: desktop_planter_box},
    { id: 12, title: 'Accessibility Planter Box', price: '$495.00', image: accessibility_planter_box},
    { id : 13, title: 'Insta Garden Range', price: '$250.00', image: insta_garden_range },
    { id : 14, title: 'Side Table', price: '$85.00', image: side_table },
  ];

  const sortedProducts = products.sort((a, b) => {
    if (sortType === 'title') {
      return a.title.localeCompare(b.title);
    } else if (sortType === 'price') {
      return parseFloat(a.price.substring(1)) - parseFloat(b.price.substring(1));
    }
    return 0;
  });



  return (
    <div className="HomePage">
      <Header/>
      <img src={top_image} alt="planter_box" className="landpage_image" />
      <div className='motto_section'>
        <img src={home_icon} alt="Planter Icon" className="motto_image" />
        <h1 className='motto_text'>
        The painfree gardening solution suitable for Everybody.</h1>
      </div>
      <div className="home_porduct_container">
        {sortedProducts.map(product => (
          <ProductCard key={product.id} title={product.title} price={product.price} image={product.image} />
        ))}
      </div>
      <Footer/>
    </div>
  );
}

export default HomePage;
