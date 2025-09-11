 
// src/components/CategoryFilters.js
import React from 'react';

const CategoryFilters = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <section className="categories">
      <div className="container">
        <h2 className="section-title">Browse by Category</h2>
        <div className="category-filters">
          <button
            className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => onCategoryChange('all')}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.slug ? 'active' : ''}`}
              onClick={() => onCategoryChange(category.slug)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryFilters;
