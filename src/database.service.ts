

export interface Product {
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

export interface CartItem extends Product {
    quantity: number;
    id?: number;
}

export class DatabaseService {
    private db: IDBDatabase | null = null;
    private readonly DB_NAME = 'ShopDB';
    private readonly STORE_NAME = 'shop';

    constructor() {
        this.initDatabase();
    }

    public initDatabase(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, 1);

            // Handle errors
            request.onerror = () => reject(request.error);

            // On successful opening
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

           
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    const store = db.createObjectStore(this.STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    store.createIndex('name', 'name', { unique: true });
                }
            };
        });
    }

    async getCartItems(): Promise<CartItem[]> {
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result as CartItem[]);
            request.onerror = () => reject(request.error);
        });
    }

    async addItem(product: Product): Promise<void> {
        const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const index = store.index('name');

        return new Promise((resolve, reject) => {
            const getRequest = index.get(product.name);

            getRequest.onsuccess = () => {
                const existingItem = getRequest.result;

                if (existingItem) {
                    existingItem.quantity += 1;
                    const updateRequest = store.put(existingItem);

                    updateRequest.onsuccess = () => resolve();
                    updateRequest.onerror = () => reject(updateRequest.error);
                } else {
                    const newItem: CartItem = { ...product, quantity: 1 };
                    const addRequest = store.add(newItem);

                    addRequest.onsuccess = () => resolve();
                    addRequest.onerror = () => reject(addRequest.error);
                }
            };

            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async decreaseItem(name: string): Promise<void> {
        const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const index = store.index('name');

        return new Promise((resolve, reject) => {
            const getRequest = index.get(name);

            getRequest.onsuccess = () => {
                const item = getRequest.result;

                if (!item) return resolve();

                if (item.quantity > 1) {
                    item.quantity -= 1;
                    const updateRequest = store.put(item);

                    updateRequest.onsuccess = () => resolve();
                    updateRequest.onerror = () => reject(updateRequest.error);
                } else {
                    const deleteRequest = store.delete(item.id);
                    deleteRequest.onsuccess = () => resolve();
                    deleteRequest.onerror = () => reject(deleteRequest.error);
                }
            };

            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async deleteItem(name: string): Promise<void> {
        const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const index = store.index('name');

        return new Promise((resolve, reject) => {
            const getRequest = index.get(name);

            getRequest.onsuccess = () => {
                const item = getRequest.result;
                if (!item) return resolve();
                const deleteRequest = store.delete(item.id);
                deleteRequest.onsuccess = () => resolve();
                deleteRequest.onerror = () => reject(deleteRequest.error);
            };

            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async clearCart(): Promise<void> {
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}