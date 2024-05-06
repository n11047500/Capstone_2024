import React, {useState} from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import Footer from './components/Footer';
import './App.css';
import large_planter_tray from './assets/large_planter_tray.jpg';
import desktop_planter_box from './assets/desktop_planter_box.jpg';
import accessibility_planter_box from './assets/accessibility_planter_box.jpg';
import small_standard_planter_box from './assets/small_standard_planter_box.jpg';
import mini_standard_planter_box from './assets/mini_standard_planter_box.jpg';
import mini_wicking_planter_box from './assets/mini_wicking_planter_box.jpg';
import insta_garden_range from './assets/insta_garden_range.jpg';
import large_standard_planter_box from './assets/large_standard_planter_box.jpg';
import large_wicking_planter_box from './assets/large_wicking_planter_box.jpg';
import medium_standard_planter_box from './assets/medium_standard_planter_box.jpg';
import medium_wicking_planter_box from './assets/medium_wicking_planter_box.jpg';
import side_table from './assets/side_table.jpg';
import small_planter_tray from './assets/small_planter_tray.jpg';
import small_wicking_planter_box from './assets/small_wicking_planter_box.jpg';
import trellis from './assets/trellis.jpg';


function App() {
  const [sortType, setSortType] = useState('');

  const products = [
    { id : 1, title: 'Mini Standard Planter Box', price: '$290.00', image: mini_standard_planter_box},
    { id : 2, title: 'Small Standard Planter Box', price: '$350.00', image: small_standard_planter_box},
    { id : 3, title: 'Medium Standard Planter Box', price: '$420.00', image: medium_standard_planter_box },
    { id : 4, title: 'Large Standard Planter Box', price: '$495.00', image: large_standard_planter_box },
    { id : 5, title: 'Mini Wicking Planter Box', price: '$480.00', image: mini_wicking_planter_box},
    { id : 6, title: 'Small Wicking Planter Box', price: '$520.00', image: small_wicking_planter_box },
    { id : 7, title: 'Medium Wicking Planter Box', price: '$720.00', image: medium_wicking_planter_box },
    { id : 8, title: 'Large Wicking Planter Box', price: '$950.00', image: large_wicking_planter_box },
    { id : 9, title: 'Small Planter Tray', price: '$65.00', image: small_planter_tray },
    { id: 10, title: 'Large Planter Tray', price: '$95.00', image: large_planter_tray },
    { id: 11, title: 'Desktop Planter Box', price: '$79.00', image: desktop_planter_box},
    { id: 12, title: 'Accessibility Planter Box', price: '$495.00', image: accessibility_planter_box},
    { id : 13, title: 'Insta Garden Range', price: '$250.00', image: insta_garden_range },
    { id : 14, title: 'Side Table', price: '$85.00', image: side_table },
    { id : 15, title: 'Trellis', price: '$110.00', image: trellis }
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
    <div className="App">
      <Header/>
      <div className="header-bar">
        <div className="sort-container">
          <select className="sort-dropdown" value={sortType} onChange={e => setSortType(e.target.value)}>
            <option value="">Featured</option>
            <option value="title">Title</option>
            <option value="price">Price</option>
          </select>
        </div>
      </div>
      <div className="product-container">
        {sortedProducts.map(product => (
          <ProductCard key={product.id} title={product.title} price={product.price} image={product.image} />
        ))}
      </div>
      <Footer/>
    </div>
  );
}

export default App;
