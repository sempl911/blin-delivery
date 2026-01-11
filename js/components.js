// Компоненты UI для приложения с Bootstrap

const UIComponents = {
    // Инициализация всех компонентов
    init: function() {
        this.renderPancakes(PancakeStore.getAllPancakes());
        this.updateCartUI();
        this.setupEventListeners();
        this.hideLoading();
    },
    
    // Скрытие индикатора загрузки
    hideLoading: function() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    },
    
    // Показ индикатора загрузки
    showLoading: function() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }
    },
    
    // Каталог блинов
    renderPancakes: function(pancakes) {
    const pancakesGrid = document.getElementById('pancakesGrid');
    
    if (!pancakesGrid) return;
    
    if (pancakes.length === 0) {
        pancakesGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-pancakes fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Блины загружаются...</h5>
            </div>
        `;
        return;
    }
    
    pancakesGrid.innerHTML = pancakes.map(pancake => `
        <div class="col-md-6 col-lg-4 col-xl-3 mb-4">
            <div class="card pancake-card h-100 shadow-sm" data-id="${pancake.id}" data-category="${pancake.category}">
                <div class="pancake-img rounded-top position-relative" style="height: 200px; overflow: hidden;">
                    ${pancake.getImageHtml()}
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title text-warning fw-bold mb-2">${pancake.name}</h5>
                    <p class="card-text text-muted flex-grow-1 mb-3" style="font-size: 0.9rem;">${pancake.description}</p>
                    
                    <!-- СОСТАВ (новое поле) -->
                    ${pancake.composition ? `
                    <div class="composition mb-3">
                        <div class="d-flex align-items-center mb-1">
                            <i class="fas fa-clipboard-list text-warning me-2 small"></i>
                            <h6 class="small fw-bold text-muted mb-0">Состав:</h6>
                        </div>
                        <p class="small text-muted mb-0" style="font-size: 0.85rem; line-height: 1.4;">${pancake.composition}</p>
                    </div>
                    ` : ''}
                    
                    <!-- Пищевая ценность, если есть -->
                    ${pancake.weight ? `
                    <div class="nutrition-info small text-muted mb-3">
                        <div class="d-flex align-items-center mb-1">
                            <i class="fas fa-weight text-warning me-2 small"></i>
                            <h6 class="small fw-bold text-muted mb-0">Пищевая ценность (${pancake.weight}г):</h6>
                        </div>
                        <div class="d-flex justify-content-between">
                            ${pancake.protein ? `<span><i class="fas fa-drumstick-bite text-muted me-1"></i>Б: ${pancake.protein}г</span>` : ''}
                            ${pancake.fat ? `<span><i class="fas fa-oil-can text-muted me-1"></i>Ж: ${pancake.fat}г</span>` : ''}
                            ${pancake.carbs ? `<span><i class="fas fa-bread-slice text-muted me-1"></i>У: ${pancake.carbs}г</span>` : ''}
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                        <div class="pancake-price fw-bold fs-5">${pancake.price} ₽</div>
                        <button class="btn btn-warning btn-add-to-cart" data-id="${pancake.id}">
                            <i class="fas fa-cart-plus me-1"></i>В корзину
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
},
    
    // Фильтрация по категориям
    setupCategoryFilters: function() {
        const filterButtons = document.querySelectorAll('#categoryFilters .btn');
        const pancakeCards = document.querySelectorAll('.pancake-card');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Убираем активный класс со всех кнопок
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Добавляем активный класс нажатой кнопке
                this.classList.add('active');
                
                const category = this.dataset.category;
                
                // Показываем/скрываем карточки в зависимости от категории
                pancakeCards.forEach(card => {
                    if (category === 'all' || card.dataset.category === category) {
                        card.parentElement.style.display = 'block';
                    } else {
                        card.parentElement.style.display = 'none';
                    }
                });
            });
        });
    },
    
    // Обновление корзины в UI
    updateCartUI: function() {
        const cartBadge = document.getElementById('cartBadge');
        const floatingCartCount = document.getElementById('floatingCartCount');
        const cartItems = document.getElementById('cartItems');
        const cartSummary = document.getElementById('cartSummary');
        const cartSubtotal = document.getElementById('cartSubtotal');
        const cartTotal = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');
        const floatingCheckoutBtn = document.getElementById('floatingCheckoutBtn');
        
        // Обновляем счетчики
        if (cartBadge) {
            cartBadge.textContent = cart.totalItems;
        }
        
        if (floatingCartCount) {
            floatingCartCount.textContent = cart.totalItems;
            
            // Показываем/скрываем плавающую кнопку
            if (floatingCheckoutBtn) {
                if (cart.totalItems > 0) {
                    floatingCheckoutBtn.style.display = 'flex';
                } else {
                    floatingCheckoutBtn.style.display = 'none';
                }
            }
        }
        
        // Обновляем содержимое корзины
        if (cartItems) {
            if (cart.items.length === 0) {
                cartItems.innerHTML = `
                    <div class="text-center py-5">
                        <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">Ваша корзина пуста</h5>
                        <p class="text-muted">Добавьте товары из меню</p>
                    </div>
                `;
                
                if (cartSummary) {
                    cartSummary.classList.add('d-none');
                }
            } else {
                cartItems.innerHTML = cart.items.map(item => `
                    <div class="cart-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="d-flex gap-3">
                                <div class="cart-item-img">
                                    <i class="${item.pancake.image}"></i>
                                </div>
                                <div>
                                    <h6 class="fw-bold mb-1">${item.pancake.name}</h6>
                                    <p class="text-muted mb-0">${item.pancake.price} ₽ × ${item.quantity}</p>
                                    <p class="fw-bold text-warning mb-0">${item.totalPrice} ₽</p>
                                </div>
                            </div>
                            <div class="cart-item-quantity">
                                <button class="quantity-btn decrease" data-id="${item.pancake.id}">-</button>
                                <span class="fw-bold">${item.quantity}</span>
                                <button class="quantity-btn increase" data-id="${item.pancake.id}">+</button>
                                <button class="btn btn-sm btn-outline-danger ms-2 remove-item" data-id="${item.pancake.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
                
                if (cartSummary) {
                    cartSummary.classList.remove('d-none');
                    
                    if (cartSubtotal) {
                        cartSubtotal.textContent = `${cart.totalPrice} ₽`;
                    }
                    
                    if (cartTotal) {
                        cartTotal.textContent = `${cart.totalPrice} ₽`;
                    }
                }
            }
        }
        
        // Обновляем ссылку оформления заказа
        if (checkoutBtn) {
            if (cart.totalItems > 0) {
                // Сохраняем данные корзины для страницы оформления
                localStorage.setItem('checkoutCart', JSON.stringify(cart.items.map(item => ({
                    pancake: item.pancake,
                    quantity: item.quantity
                }))));
            }
        }
    },
    
    // Показ модального окна с блином
    showPancakeModal: function(pancake) {
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    const modalTitle = document.getElementById('productModalTitle');
    const modalPrice = document.getElementById('productModalPrice');
    const modalDescription = document.getElementById('productModalDescription');
    const modalCategory = document.getElementById('productModalCategory');
    const modalImage = document.getElementById('productModalImage');
    const modalNutrition = document.getElementById('productModalNutrition');
    const modalCompositionContainer = document.getElementById('productModalCompositionContainer');
    const modalComposition = document.getElementById('productModalComposition');
    const addToCartModal = document.getElementById('addToCartModal');
    
    // Основная информация
    if (modalTitle) modalTitle.textContent = pancake.name;
    if (modalPrice) modalPrice.textContent = `${pancake.price} ₽`;
    if (modalDescription) modalDescription.textContent = pancake.description;
    if (modalCategory) modalCategory.textContent = pancake.category;
    
    // Фото
    if (modalImage) {
        modalImage.innerHTML = pancake.getImageHtml();
        if (pancake.isPhoto) {
            modalImage.querySelector('img').style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
        } else {
            modalImage.innerHTML = `
                <div class="no-photo-placeholder h-100 d-flex align-items-center justify-content-center">
                    <i class="${pancake.image} fa-5x"></i>
                </div>
            `;
        }
    }
    
    // СОСТАВ (новый блок)
    if (modalCompositionContainer && modalComposition) {
        if (pancake.composition && pancake.composition.trim() !== '') {
            modalComposition.textContent = pancake.composition;
            modalCompositionContainer.style.display = 'block';
        } else {
            modalCompositionContainer.style.display = 'none';
        }
    }
    
    // Пищевая ценность
    if (modalNutrition) {
        if (pancake.weight || pancake.protein || pancake.fat || pancake.carbs) {
            modalNutrition.style.display = 'block';
            
            if (pancake.weight) {
                document.getElementById('productModalWeight').textContent = `${pancake.weight}г`;
            }
            if (pancake.protein) {
                document.getElementById('productModalProtein').textContent = `${pancake.protein}г`;
            }
            if (pancake.fat) {
                document.getElementById('productModalFat').textContent = `${pancake.fat}г`;
            }
            if (pancake.carbs) {
                document.getElementById('productModalCarbs').textContent = `${pancake.carbs}г`;
            }
        } else {
            modalNutrition.style.display = 'none';
        }
    }
    
    // Кнопка добавления в корзину
    if (addToCartModal) {
        addToCartModal.dataset.id = pancake.id;
    }
    
    // Сброс количества
    const quantityElement = document.getElementById('productQty');
    if (quantityElement) quantityElement.value = 1;
    
    modal.show();
},
    
    // Показ уведомления
    showNotification: function(message, type = 'success', duration = 3000) {
        // Создаем контейнер для тостов, если его нет
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Определяем цвет в зависимости от типа
        const bgColor = type === 'success' ? 'bg-success' : 
                       type === 'error' ? 'bg-danger' : 
                       type === 'warning' ? 'bg-warning' : 'bg-info';
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 
                    type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
        
        // Создаем toast
        const toastId = 'toast-' + Date.now();
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white ${bgColor} border-0`;
        toast.id = toastId;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body d-flex align-items-center">
                    <i class="fas ${icon} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Инициализируем и показываем toast
        const bsToast = new bootstrap.Toast(toast, {
            delay: duration
        });
        bsToast.show();
        
        // Удаляем toast после скрытия
        toast.addEventListener('hidden.bs.toast', function () {
            toast.remove();
        });
    },
    
    // Настройка обработчиков событий
    setupEventListeners: function() {
        // Фильтры категорий
        this.setupCategoryFilters();
        
        // Клик по карточке товара
        document.addEventListener('click', (e) => {
            const pancakeCard = e.target.closest('.pancake-card');
            if (pancakeCard && !e.target.classList.contains('btn-add-to-cart')) {
                const pancakeId = parseInt(pancakeCard.dataset.id);
                const pancake = PancakeStore.getPancakeById(pancakeId);
                if (pancake) {
                    this.showPancakeModal(pancake);
                }
            }
        });
        
        // Кнопка "В корзину" на карточке
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-add-to-cart') || 
                e.target.closest('.btn-add-to-cart')) {
                const button = e.target.classList.contains('btn-add-to-cart') ? 
                    e.target : e.target.closest('.btn-add-to-cart');
                
                const pancakeId = parseInt(button.dataset.id);
                const pancake = PancakeStore.getPancakeById(pancakeId);
                
                if (pancake) {
                    cart.addItem(pancake, 1);
                    this.showNotification(`${pancake.name} добавлен в корзину`, 'success');
                    
                    // Анимация кнопки
                    button.classList.add('add-to-cart-animation');
                    setTimeout(() => {
                        button.classList.remove('add-to-cart-animation');
                    }, 300);
                }
            }
        });
        
        // Управление количеством в корзине
        document.addEventListener('click', (e) => {
            // Удаление товара
            if (e.target.classList.contains('remove-item') || 
                e.target.closest('.remove-item')) {
                const button = e.target.classList.contains('remove-item') ? 
                    e.target : e.target.closest('.remove-item');
                
                const pancakeId = parseInt(button.dataset.id);
                cart.removeItem(pancakeId);
                this.showNotification('Товар удален из корзины', 'info');
            }
            
            // Увеличение количества
            if (e.target.classList.contains('increase') || 
                e.target.closest('.increase')) {
                const button = e.target.classList.contains('increase') ? 
                    e.target : e.target.closest('.increase');
                
                const pancakeId = parseInt(button.dataset.id);
                const cartItem = cart.items.find(item => item.pancake.id === pancakeId);
                
                if (cartItem) {
                    cart.updateQuantity(pancakeId, cartItem.quantity + 1);
                }
            }
            
            // Уменьшение количества
            if (e.target.classList.contains('decrease') || 
                e.target.closest('.decrease')) {
                const button = e.target.classList.contains('decrease') ? 
                    e.target : e.target.closest('.decrease');
                
                const pancakeId = parseInt(button.dataset.id);
                const cartItem = cart.items.find(item => item.pancake.id === pancakeId);
                
                if (cartItem) {
                    cart.updateQuantity(pancakeId, cartItem.quantity - 1);
                }
            }
        });
        
        // Управление количеством в модальном окне
        document.addEventListener('click', (e) => {
            if (e.target.id === 'decreaseQty' || e.target.closest('#decreaseQty')) {
                const qtyInput = document.getElementById('productQty');
                if (qtyInput && parseInt(qtyInput.value) > 1) {
                    qtyInput.value = parseInt(qtyInput.value) - 1;
                }
            }
            
            if (e.target.id === 'increaseQty' || e.target.closest('#increaseQty')) {
                const qtyInput = document.getElementById('productQty');
                if (qtyInput && parseInt(qtyInput.value) < 20) {
                    qtyInput.value = parseInt(qtyInput.value) + 1;
                }
            }
            
            if (e.target.id === 'addToCartModal' || e.target.closest('#addToCartModal')) {
                const button = e.target.id === 'addToCartModal' ? 
                    e.target : e.target.closest('#addToCartModal');
                
                const pancakeId = parseInt(button.dataset.id);
                const pancake = PancakeStore.getPancakeById(pancakeId);
                const quantity = parseInt(document.getElementById('productQty').value) || 1;
                
                if (pancake) {
                    cart.addItem(pancake, quantity);
                    this.showNotification(`${pancake.name} (${quantity} шт.) добавлен в корзину`, 'success');
                    
                    // Закрываем модальное окно
                    const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
                    if (modal) {
                        modal.hide();
                    }
                }
            }
        });
        
        // Импорт из Google Sheets
        document.addEventListener('click', (e) => {
            if (e.target.id === 'importFromSheets' || e.target.closest('#importFromSheets')) {
                const urlInput = document.getElementById('sheetsUrlInput');
                if (urlInput) {
                    urlInput.style.display = urlInput.style.display === 'none' ? 'flex' : 'none';
                }
            }
            
            if (e.target.id === 'loadFromUrl' || e.target.closest('#loadFromUrl')) {
                const sheetsUrl = document.getElementById('sheetsUrl')?.value;
                if (sheetsUrl) {
                    GoogleSheets.loadFromSheets(sheetsUrl);
                } else {
                    GoogleSheets.loadFromSheets();
                }
            }
        });
    }
};

// Делаем функции доступными глобально
window.updateCartUI = () => UIComponents.updateCartUI();