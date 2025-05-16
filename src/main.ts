import './style.css'
import productData from '../data.json'
import { DatabaseService } from './database.service';
import type { Product, CartItem } from './database.service';

class App {
   db: DatabaseService;
   products: Product[] = [];

  constructor() {
    this.db = new DatabaseService();
    this.products = productData as Product[];
    this.initializaApp();
  }

   async initializaApp() {
    await this.db.initDatabase();
    this.mainpage();
    this.addEventListeners();
    await this.updateCartDisplay();
  }

   mainpage() {
    const app = document.querySelector<HTMLDivElement>('#app')!;
    app.innerHTML = `
      <div class="main-layout">
        <main class="products-section">
          <h1>Desserts</h1>
          <div id="products-container">
            ${this.products.map(product => `
              <div class="product-card">
                <img src="${product.image.thumbnail}" alt="${product.name}" class="product-image">
                <h3>${product.name}</h3>
                <p class="category">${product.category}</p>
                <p class="price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-name="${product.name}">
                  <i class="fa fa-cart-shopping"></i> Add to Cart
                </button>
              </div>
            `).join('')}
          </div>
        </main>
        <aside id="cart-container" class="cart-section">
          <div id="cart-items"></div>
          <div id="cart-total">Total: $0.00</div>
        </aside>
      </div>
    `;
  }

 addEventListeners() {
    document.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;

      if (target.classList.contains('add-to-cart')) {
        const productName = target.getAttribute('data-name');
        if (productName) {
          const product = this.products.find(p => p.name === productName);
          if (product) {
            await this.db.addItem(product);
            await this.updateCartDisplay();
          }
        }
      }

      if (target.classList.contains('decrease-quantity')) {
        const productName = target.getAttribute('data-name');
        if (productName) {
          await this.db.decreaseItem(productName);
          await this.updateCartDisplay();
        }
      }

      if (target.classList.contains('remove-item')) {
        const productName = target.getAttribute('data-name');
        if (productName) {
          await this.db.deleteItem(productName);
          await this.updateCartDisplay();
        }
      }
    });
  }

 async updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartContainer = document.getElementById('cart-container');
    if (!cartItems || !cartTotal || !cartContainer) return;

    const cart: CartItem[] = await this.db.getCartItems();
    const cartCount = cart.length;

    let previewImgHtml = '';
    if (cart.length === 0) {
      previewImgHtml = `<img src="../assets/images/illustration-empty-cart.svg" alt="Empty Cart" class="cart-preview-img" />`;
    } else {
      const lastItem = cart[cart.length - 1];
      previewImgHtml = `<img src="${lastItem.image.thumbnail}" alt="${lastItem.name}" class="cart-preview-img" />`;
    }
    cartContainer.querySelector('.cart-preview-img')?.remove();
    cartContainer.insertAdjacentHTML('afterbegin', previewImgHtml);

    if (cart.length === 0) {
      cartItems.innerHTML = `
        <div class="empty-cart-card">
          <div class="empty-cart-title">Your Cart (${cartCount})</div>
          <div class="empty-cart-text">Your added items will appear here</div>
        </div>
      `;
      cartTotal.textContent = `Total: $0.00`;
      return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image.thumbnail}" alt="${item.name}" />
                <span>${item.name}</span>
                <span>Quantity: ${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
                <button class="decrease-quantity" data-name="${item.name}">-</button>
                <button class="remove-item" data-name="${item.name}">×</button>
            </div>
        `).join('');

    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
  }
}


new App();
