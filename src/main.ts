import './style.css'
import productData from '../data.json'
import { DatabaseService } from './database.service';
import type { Product, CartItem } from './database.service';

const images = import.meta.glob('../assets/images/*.{jpg,jpeg,png,svg}', { eager: true }) as Record<string, { default: string }>;

class App {
  db: DatabaseService;
  products: Product[] = [];
  orderConfirmed: boolean = false;

  constructor() {
    this.db = new DatabaseService();
    this.products = productData.map(product => ({
      ...product,
      image: {
        thumbnail: this.getImageUrl(product.image.thumbnail),
        mobile: this.getImageUrl(product.image.mobile),
        tablet: this.getImageUrl(product.image.tablet),
        desktop: this.getImageUrl(product.image.desktop)
      }
    })) as Product[];
    this.initializaApp();
  }

  getImageUrl(path: string): string {
    const imagePath = path.replace('./', '../');
    return images[imagePath]?.default || '';
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
                  <img src="${this.getImageUrl('./assets/images/icon-add-to-cart.svg')}" alt="Add to Cart" class="cart-icon">
                  Add to Cart
                </button>
              </div>
            `).join('')}
          </div>
        </main>
        <aside id="cart-container" class="cart-section">
          <div id="cart-items"></div>
          <div id="cart-total">Total: $0.00</div>
          <button id="checkout-button" class="checkout-button" style="display: none;">Checkout</button>
        </aside>
      </div>
      <div id="order-confirmation" class="order-confirmation" style="display: none;">
        <div class="confirmation-content">
          <img src="${this.getImageUrl('./assets/images/icon-order-confirmed.svg')}" alt="Order Confirmed" class="confirmation-icon">
          <h2>Thank you for your order!</h2>
          <p>Your order has been confirmed and will be shipped soon.</p>
          <button id="continue-shopping" class="continue-shopping">Continue Shopping</button>
        </div>
      </div>
    `;
  }

  addEventListeners() {
    document.addEventListener('click', async (e) => {
      let target = e.target as HTMLElement;

      if (target.tagName === 'IMG' && target.parentElement && target.parentElement.tagName === 'BUTTON') {
        target = target.parentElement as HTMLElement;
      }

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

      if (target.classList.contains('increase-quantity')) {
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

      if (target.id === 'checkout-button') {
        const cart: CartItem[] = await this.db.getCartItems();
        this.showOrderConfirmation(cart);
      }

      if (target.id === 'continue-shopping') {
        this.hideOrderConfirmation();
        await this.db.clearCart();
        await this.updateCartDisplay();
      }
    });
  }

  showOrderConfirmation(cart: CartItem[]) {
    const confirmation = document.getElementById('order-confirmation');
    if (!confirmation) return;

    const itemsHtml = cart.map(item => `
      <div class="order-item">
        <img src="${item.image.thumbnail}" alt="${item.name}" />
        <div>
          <div class="item-name">${item.name}</div>
          <div class="item-qty-price">${item.quantity}x @ $${item.price.toFixed(2)}</div>
        </div>
        <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    confirmation.innerHTML = `
      <div class="confirmation-content">
        <img src="${this.getImageUrl('./assets/images/icon-order-confirmed.svg')}" alt="Order Confirmed" class="confirmation-icon" />
        <h2>Order Confirmed</h2>
        <p>We hope you enjoy your food!</p>
        <div class="order-summary">${itemsHtml}</div>
        <div class="order-total">
          Order Total <span>$${total.toFixed(2)}</span>
        </div>
        <button class="start-new-order-btn" id="continue-shopping">Start New Order</button>
      </div>
    `;
    confirmation.style.display = 'flex';
  }

  hideOrderConfirmation() {
    const confirmation = document.getElementById('order-confirmation');
    if (confirmation) {
      confirmation.style.display = 'none';
    }
  }

  async updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartContainer = document.getElementById('cart-container');
    const checkoutButton = document.getElementById('checkout-button');
    if (!cartItems || !cartTotal || !cartContainer || !checkoutButton) return;

    const cart: CartItem[] = await this.db.getCartItems();
    const cartCount = cart.length;

    let previewImgHtml = '';
    if (cart.length === 0) {
      previewImgHtml = `<img src="${this.getImageUrl('./assets/images/illustration-empty-cart.svg')}" alt="Empty Cart" class="cart-preview-img" />`;
      checkoutButton.style.display = 'none';
    } else {
      const lastItem = cart[cart.length - 1];
      previewImgHtml = `<img src="${lastItem.image.thumbnail}" alt="${lastItem.name}" class="cart-preview-img" />`;
      checkoutButton.style.display = 'block';
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
        <div class="quantity-controls">
          <button class="decrease-quantity" data-name="${item.name}">
            <img src="${this.getImageUrl('./assets/images/icon-decrement-quantity.svg')}" alt="Decrease" class="quantity-icon">
          </button>
          <span>${item.quantity}</span>
          <button class="increase-quantity" data-name="${item.name}">
            <img src="${this.getImageUrl('./assets/images/icon-increment-quantity.svg')}" alt="Increase" class="quantity-icon">
          </button>
        </div>
        <span>$${(item.price * item.quantity).toFixed(2)}</span>
        <button class="remove-item" data-name="${item.name}">
          <img src="${this.getImageUrl('./assets/images/icon-remove-item.svg')}" alt="Remove" class="remove-icon">
        </button>
      </div>
    `).join('');

    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
  }
}

new App();