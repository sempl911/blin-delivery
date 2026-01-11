// Модели данных для приложения

class Pancake {
    constructor(id, name, description, price, image, category, weight = null, protein = null, fat = null, carbs = null,composition = '') {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.image = image;
        this.category = category;
        this.composition = composition;
        this.weight = weight;
        this.protein = protein;
        this.fat = fat;
        this.carbs = carbs;
        this.isPhoto = this.checkIfPhotoUrl(image);
        this.photoPath = this.resolvePhotoPath(image);
    }
    
    // Проверяем, является ли image фото
    checkIfPhotoUrl(image) {
        if (!image) return false;
        
        // Если это иконка Font Awesome
        if (image.startsWith('fas fa-') || image.startsWith('fab fa-') || image.startsWith('far fa-')) {
            return false;
        }
        
        // Если это явно указанный URL
        if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:image')) {
            return true;
        }
        
        // Если это файл изображения
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp'];
        const lowerImage = image.toLowerCase();
        return imageExtensions.some(ext => lowerImage.includes(ext));
    }
    
    // Определяем путь к фото
    resolvePhotoPath(image) {
        if (!image || !this.isPhoto) {
            return null;
        }
        
        // Если уже полный URL, оставляем как есть
        if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:image')) {
            return image;
        }
        
        // Если указано только имя файла, добавляем путь к папке с блинами
        if (image.includes('/')) {
            // Уже есть путь
            return image;
        } else {
            // Только имя файла - добавляем путь к папке data/blins/
            return `data/blins/${image}`;
        }
    }
    
    // Геттер для получения HTML изображения
    getImageHtml(additionalClasses = '') {
        if (this.isPhoto && this.photoPath) {
            return `<img src="${this.photoPath}" alt="${this.name}" class="img-fluid ${additionalClasses}" loading="lazy" onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNGRkNDMDAiLz48cGF0aCBkPSJNMTUwIDE1MEgyNTBNMjAwIDEwMFYyMDAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+'; this.alt='Изображение не загружено';">`;
        } else {
            const iconClass = this.image || 'fas fa-pancakes';
            return `<i class="${iconClass} ${additionalClasses}"></i>`;
        }
    }
}

class CartItem {
    constructor(pancake, quantity) {
        this.pancake = pancake;
        this.quantity = quantity;
    }
    
    get totalPrice() {
        return this.pancake.price * this.quantity;
    }
}

class Cart {
    constructor() {
        this.items = [];
        this.loadFromStorage();
    }
    
    addItem(pancake, quantity = 1) {
        const existingItem = this.items.find(item => item.pancake.id === pancake.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push(new CartItem(pancake, quantity));
        }
        
        this.saveToStorage();
        this.updateUI();
    }
    
    removeItem(pancakeId) {
        this.items = this.items.filter(item => item.pancake.id !== pancakeId);
        this.saveToStorage();
        this.updateUI();
    }
    
    updateQuantity(pancakeId, quantity) {
        const item = this.items.find(item => item.pancake.id === pancakeId);
        
        if (item) {
            if (quantity <= 0) {
                this.removeItem(pancakeId);
            } else {
                item.quantity = quantity;
                this.saveToStorage();
                this.updateUI();
            }
        }
    }
    
    get totalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }
    
    get totalPrice() {
        return this.items.reduce((total, item) => total + item.totalPrice, 0);
    }
    
    clear() {
        this.items = [];
        this.saveToStorage();
        this.updateUI();
    }
    
    saveToStorage() {
        const cartData = this.items.map(item => ({
            pancakeId: item.pancake.id,
            quantity: item.quantity
        }));
        localStorage.setItem('pancakeCart', JSON.stringify(cartData));
    }
    
    loadFromStorage() {
    const cartData = JSON.parse(localStorage.getItem('pancakeCart')) || [];
    
    // Убеждаемся, что PancakeStore уже инициализирован
    this.items = cartData.map(itemData => {
        const pancake = PancakeStore.getPancakeById(itemData.pancakeId);
        if (pancake) {
            return new CartItem(pancake, itemData.quantity);
        }
        return null;
    }).filter(item => item !== null);
}
    
     updateUI() {
        // Этот метод будет вызываться из ViewModel для обновления UI
        if (typeof window.updateCartUI === 'function') {
            window.updateCartUI();
        }
    }
}

class PancakeStore {
    // Заменяем статический массив на пустой
    static pancakes = [];

    static async loadFromJSON() {
    try {
        console.log('Загружаем данные из products.json...');
        const response = await fetch('data/products.json?v=' + Date.now());
        
        if (!response.ok) {
            throw new Error(`HTTP ошибка: ${response.status}`);
        }
        
        const productsData = await response.json();
        console.log('Получено товаров из JSON:', productsData.length);
        
        // Преобразуем JSON в объекты Pancake
        this.pancakes = productsData.map(item => new Pancake(
            item.id,
            item.name,
            item.description,
            item.price,
            item.image,
            item.category,
            item.weight,
            item.protein,
            item.fat,
            item.carbs,
            item.composition || '' // ← Добавляем состав (если есть в JSON)
        ));
        
        return true;
    } catch (error) {
        console.error('Ошибка загрузки JSON:', error);
        this.pancakes = [];
        return false;
    }
}

    // Остальные методы класса остаются без изменений
    static getPancakeById(id) {
        return this.pancakes.find(pancake => pancake.id === id);
    }
    
    static getAllPancakes() {
        return this.pancakes;
    }
    
    static getPancakesByCategory(category) {
        return this.pancakes.filter(pancake => pancake.category === category);
    }
    
    static updatePancakes(newPancakes) {
        this.pancakes = newPancakes.map(p => new Pancake(
            p.id || Date.now() + Math.random(),
            p.name || "Новый блин",
            p.description || "Описание блина",
            p.price || 0,
            p.image || "fas fa-pancakes",
            p.category || "Другие"
        ));
    }
}

// Создаем глобальный экземпляр корзины
const cart = new Cart();