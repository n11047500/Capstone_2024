import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import './Browse.css';
import large_planter_tray from '../assets/large_planter_tray.jpg';
import desktop_planter_box from '../assets/desktop_planter_box.jpg';
import accessibility_planter_box from '../assets/accessibility_planter_box.jpg';
import small_standard_planter_box from '../assets/small_standard_planter_box.jpg';
import mini_standard_planter_box from '../assets/mini_standard_planter_box.jpg';
import mini_wicking_planter_box from '../assets/mini_wicking_planter_box.jpg';
import insta_garden_range from '../assets/insta_garden_range.jpg';
import large_standard_planter_box from '../assets/large_standard_planter_box.jpg';
import large_wicking_planter_box from '../assets/large_wicking_planter_box.jpg';
import medium_standard_planter_box from '../assets/medium_standard_planter_box.jpg';
import medium_wicking_planter_box from '../assets/medium_wicking_planter_box.jpg';
import side_table from '../assets/side_table.jpg';
import small_planter_tray from '../assets/small_planter_tray.jpg';
import small_wicking_planter_box from '../assets/small_wicking_planter_box.jpg';
import trellis from '../assets/trellis.jpg';

const imageMap = {
  'Mini Standard Planter Box': mini_standard_planter_box,
  'Small Standard Planter Box': small_standard_planter_box,
  'Medium Standard Planter Box': medium_standard_planter_box,
  'Large Standard Planter Box': large_standard_planter_box,
  'Mini Wicking Planter Box': mini_wicking_planter_box,
  'Small Wicking Planter Box': small_wicking_planter_box,
  'Medium Wicking Planter Box': medium_wicking_planter_box,
  'Large Wicking Planter Box': large_wicking_planter_box,
  'Small Planter Tray': small_planter_tray,
  'Large Planter Tray': large_planter_tray,
  'Desktop Planter Box': desktop_planter_box,
  'Accessibility Planter Box': accessibility_planter_box,
  'Insta Garden Range': insta_garden_range,
  'Side Table': side_table,
  'Trellis': trellis,
};

function Browse() {
  const [products, setProducts] = useState([]);
  const [sortType, setSortType] = useState('');


  useEffect(() => {
    fetch('http://localhost:3001/products')
      .then(response => response.json())
      .then(data => {
        const productsWithImages = data.map(product => ({
          ...product,
          image: imageMap[product.Product_Name] || ''
        }));
        setProducts(productsWithImages);
      })
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortType) {
      case 'priceDesc':
        return parseFloat(b.Product_Price) - parseFloat(a.Product_Price);
      case 'priceAsc':
        return parseFloat(a.Product_Price) - parseFloat(b.Product_Price);
      case 'nameAsc':
        return a.Product_Name.localeCompare(b.Product_Name);
      case 'nameDesc':
        return b.Product_Name.localeCompare(a.Product_Name);
      default:
        return products;
    }
  });



  return (
    <div className="Browse">
      <Header/>
      <div className="header-bar">
        <div className="sort-container">
          <select className="sort-dropdown" value={sortType} onChange={e => setSortType(e.target.value)}>
            <option value="">Featured</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="nameAsc">Name: A-Z</option>
            <option value="nameDesc">Name: Z-A</option>
          </select>
        </div>
      </div>
      <div className="product-container">
        {sortedProducts.map(product => (
          <ProductCard
            key={product.Product_ID}
            title={product.Product_Name}
            price={`$${product.Product_Price}`}
            image={product.image}
          />
        ))}
      </div>
      <Footer/>
    </div>
  );
}

export default Browse;
