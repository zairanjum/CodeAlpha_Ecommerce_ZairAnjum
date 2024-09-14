'use strict';
const addEventOnElem = function (elem, type, callback) {
  if (elem.length > 1) {
    for (let i = 0; i < elem.length; i++) {
      elem[i].addEventListener(type, callback);
    }
  } else {
    elem.addEventListener(type, callback);
  }
};

const navToggler = document.querySelector("[data-nav-toggler]");
const navbar = document.querySelector("[data-navbar]");
const navbarLinks = document.querySelectorAll("[data-nav-link]");

const toggleNavbar = function () {
  navbar.classList.toggle("active");
  navToggler.classList.toggle("active");
};

addEventOnElem(navToggler, "click", toggleNavbar);

const closeNavbar = function () {
  navbar.classList.remove("active");
  navToggler.classList.remove("active");
};

addEventOnElem(navbarLinks, "click", closeNavbar);

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

const activeElemOnScroll = function () {
  if (window.scrollY > 100) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
};

addEventOnElem(window, "scroll", activeElemOnScroll);

async function fetchProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const products = await response.json();
    localStorage.setItem('cachedProducts', JSON.stringify(products));
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    const cachedProducts = localStorage.getItem('cachedProducts');
    return cachedProducts ? JSON.parse(cachedProducts) : [];
  }
}

function renderProducts(products) {
  const productList = document.querySelector('.grid-list');
  productList.innerHTML = '';

  if (products.length === 0) {
    productList.innerHTML = '<li>No products available at the moment.</li>';
    return;
  }

  products.forEach(product => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="product-card">
        <div class="card-banner img-holder" style="--width: 360; --height: 360;">
          <img src="${product.image1 || 'default-image.jpg'}" width="360" height="360" loading="lazy"
            alt="${product.name}" class="img-cover default">
          ${product.image2 ? `<img src="${product.image2}" width="360" height="360" loading="lazy" class="img-cover hover">` : ''}
          <button class="card-action-btn" aria-label="add to cart" title="Add To Cart" data-product-id="${product._id}">
            <ion-icon name="bag-add-outline" aria-hidden="true"></ion-icon>
          </button>
        </div>
        <div class="card-content">
          <h3 class="h3">
            <a href="#" class="card-title">${product.name}</a>
          </h3>
          <data class="card-price" value="${product.price}">$${product.price.toFixed(2)}</data>
        </div>
      </div>
    `;
    productList.appendChild(li);
  });

  const addToCartButtons = document.querySelectorAll('.card-action-btn');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', addToCart);
  });

  const productCards = document.querySelectorAll('.product-card');
  productCards.forEach(card => {
    const defaultImage = card.querySelector('.img-cover.default');
    const hoverImage = card.querySelector('.img-cover.hover');

    card.addEventListener('mouseenter', () => {
      if (hoverImage) hoverImage.style.opacity = '1';
      if (defaultImage) defaultImage.style.opacity = '0';
    });

    card.addEventListener('mouseleave', () => {
      if (hoverImage) hoverImage.style.opacity = '0';
      if (defaultImage) defaultImage.style.opacity = '1';
    });
  });
}

function showLoading() {
  const productList = document.querySelector('.grid-list');
  productList.innerHTML = '<li>Loading products...</li>';
}

function addToCart(event) {
  const productId = event.target.closest('button').getAttribute('data-product-id');

  if (!productId) {
    console.error('Product ID not found');
    return;
  }

  const cachedProducts = JSON.parse(localStorage.getItem('cachedProducts')) || [];
  const product = cachedProducts.find(p => p._id === productId);

  if (!product) {
    console.error('Product not found in the cached products');
    return;
  }

  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  cart.push(product);

  localStorage.setItem('cart', JSON.stringify(cart));

  updateCartBadge();

  alert(`${product.name} has been added to the cart!`);
}

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartBadge = document.querySelector('.btn-badge');
  if (cartBadge) {
    cartBadge.textContent = cart.length;
  }
}
window.addEventListener('load', async () => {
  showLoading();
  const products = await fetchProducts();
  renderProducts(products);
  updateCartBadge();
});
