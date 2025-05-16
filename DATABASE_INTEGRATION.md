# Database Integration Guide

This guide explains how to integrate the database service with your main application and use the data.json file.

## Project Structure

The project uses TypeScript and includes the following key files:
- `src/main.ts`: Main application entry point
- `src/database.service.ts`: Database service implementation
- `data.json`: Product data source

## Database Integration Steps

### 1. Understanding the Data Structure

The `data.json` file contains an array of product objects with the following structure:

```typescript
interface Product {
    image: {
        thumbnail: string;
        mobile: string;
        tablet: string;
        desktop: string;
    };
    name: string;
    category: string;
    price: number;
}
```

### 2. Database Service Implementation

The database service (`database.service.ts`) provides methods to interact with the product data:

```typescript
// Example usage of database service
import { DatabaseService } from './database.service';

const db = new DatabaseService();

// Get all products
const allProducts = db.getAllProducts();

// Get products by category
const waffleProducts = db.getProductsByCategory('Waffle');

// Get product by name
const specificProduct = db.getProductByName('Waffle with Berries');
```

### 3. Integration with Main Application

To integrate the database service with your main application (`main.ts`):

```typescript
import { DatabaseService } from './database.service';

// Initialize the database service
const db = new DatabaseService();

// Example: Display all products
function displayProducts() {
    const products = db.getAllProducts();
    // Implement your display logic here
}

// Example: Filter products by category
function filterByCategory(category: string) {
    const filteredProducts = db.getProductsByCategory(category);
    // Implement your filtering logic here
}
```

### 4. Using the Data

The data.json file is automatically loaded by the DatabaseService. You don't need to manually import it. The service handles all data operations.

### 5. Available Database Methods

The DatabaseService provides the following methods:

- `getAllProducts()`: Returns all products
- `getProductsByCategory(category: string)`: Returns products filtered by category
- `getProductByName(name: string)`: Returns a specific product by name
- `getProductsByPriceRange(min: number, max: number)`: Returns products within a price range
- `searchProducts(query: string)`: Searches products by name or category

### 6. Error Handling

The database service includes error handling for common scenarios:

```typescript
try {
    const product = db.getProductByName('Non-existent Product');
} catch (error) {
    console.error('Product not found:', error);
}
```

## Best Practices

1. Always use the DatabaseService methods instead of directly accessing data.json
2. Implement proper error handling when using database methods
3. Use TypeScript interfaces for type safety
4. Cache database results when appropriate to improve performance

## Example Implementation

Here's a complete example of how to use the database service in your application:

```typescript
import { DatabaseService } from './database.service';

class ProductManager {
    private db: DatabaseService;

    constructor() {
        this.db = new DatabaseService();
    }

    async displayAllProducts() {
        try {
            const products = this.db.getAllProducts();
            // Implement your display logic
            return products;
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }

    async filterProductsByCategory(category: string) {
        try {
            const products = this.db.getProductsByCategory(category);
            // Implement your filtering logic
            return products;
        } catch (error) {
            console.error('Error filtering products:', error);
            return [];
        }
    }
}
```

## Troubleshooting

If you encounter any issues:

1. Ensure data.json is properly formatted and located in the root directory
2. Check that all required fields are present in the data
3. Verify that the DatabaseService is properly imported
4. Check the console for any error messages

## Additional Resources

- TypeScript Documentation: https://www.typescriptlang.org/docs/
- JSON Schema Documentation: https://json-schema.org/ 