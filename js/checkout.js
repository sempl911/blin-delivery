// JavaScript для страницы оформления заказа

class CheckoutPage {
    constructor() {
        this.init();
    }
    
    init() {
        // Загружаем товары из корзины
        this.loadOrderItems();
        
        // Назначаем обработчики событий
        this.setupEventListeners();
        
        // Генерируем номер заказа
        this.generateOrderNumber();
    }
    
    // Загрузка товаров в заказе
    loadOrderItems() {
        UIComponents.renderCheckoutOrderItems();
    }
    
    // Настройка обработчиков событий
    setupEventListeners() {
        // Изменение способа доставки
        document.querySelectorAll('input[name="delivery"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateDeliveryOptions();
                this.updateTotals();
            });
        });
        
        // Обработка формы оформления заказа
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitOrder();
            });
        }
        
        // Кнопка печати заказа
        const printOrderBtn = document.getElementById('printOrderBtn');
        if (printOrderBtn) {
            printOrderBtn.addEventListener('click', () => {
                this.printOrder();
            });
        }
        
        // Обновление сумм при изменении данных
        document.addEventListener('change', () => {
            this.updateTotals();
        });
    }
    
    // Обновление стилей выбранного способа доставки
    updateDeliveryOptions() {
        document.querySelectorAll('.delivery-option').forEach(option => {
            option.classList.remove('active');
        });
        
        const selectedOption = document.querySelector('input[name="delivery"]:checked');
        if (selectedOption) {
            selectedOption.closest('.delivery-option').classList.add('active');
        }
    }
    
    // Обновление итоговых сумм
    updateTotals() {
        const checkoutCart = JSON.parse(localStorage.getItem('checkoutCart')) || [];
        UIComponents.updateCheckoutTotals(checkoutCart);
    }
    
    // Генерация номера заказа
    generateOrderNumber() {
        // Простая генерация номера заказа
        const orderNumber = 'BL' + Date.now().toString().slice(-8);
        localStorage.setItem('currentOrderNumber', orderNumber);
        return orderNumber;
    }
    
    // Отправка заказа
    submitOrder() {
        // Получаем данные формы
        const formData = new FormData(document.getElementById('checkoutForm'));
        const orderData = {};
        
        for (let [key, value] of formData.entries()) {
            orderData[key] = value;
        }
        
        // Получаем данные корзины
        const checkoutCart = JSON.parse(localStorage.getItem('checkoutCart')) || [];
        
        if (checkoutCart.length === 0) {
            UIComponents.showNotification('Ваша корзина пуста', 'error');
            return;
        }
        
        // Рассчитываем итоговую сумму
        const subtotal = checkoutCart.reduce((sum, item) => {
            return sum + (item.pancake.price * item.quantity);
        }, 0);
        
        const deliveryCost = orderData.delivery === 'delivery' ? 200 : 0;
        const total = subtotal + deliveryCost;
        
        // Формируем полные данные заказа
        const fullOrderData = {
            orderNumber: localStorage.getItem('currentOrderNumber') || this.generateOrderNumber(),
            customer: orderData,
            items: checkoutCart,
            subtotal: subtotal,
            deliveryCost: deliveryCost,
            total: total,
            date: new Date().toISOString()
        };
        
        // В реальном приложении здесь был бы AJAX запрос к серверу
        // Для демо сохраняем в localStorage
        this.saveOrder(fullOrderData);
        
        // Показываем модальное окно успеха
        UIComponents.showOrderSuccessModal(fullOrderData.orderNumber);
        
        // Очищаем корзину
        localStorage.removeItem('checkoutCart');
        localStorage.removeItem('pancakeCart');
        
        // Очищаем форму
        document.getElementById('checkoutForm').reset();
    }
    
    // Сохранение заказа
    saveOrder(orderData) {
        // Получаем существующие заказы
        const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
        
        // Добавляем новый заказ
        existingOrders.push(orderData);
        
        // Сохраняем обратно в localStorage
        localStorage.setItem('orders', JSON.stringify(existingOrders));
        
        // Также можно сохранить последний заказ отдельно для быстрого доступа
        localStorage.setItem('lastOrder', JSON.stringify(orderData));
        
        console.log('Заказ сохранен:', orderData);
    }
    
    // Печать заказа
    printOrder() {
        const lastOrder = JSON.parse(localStorage.getItem('lastOrder'));
        
        if (!lastOrder) {
            UIComponents.showNotification('Нет данных о заказе для печати', 'error');
            return;
        }
        
        // Создаем окно для печати
        const printWindow = window.open('', '_blank');
        
        // Формируем HTML для печати
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Заказ №${lastOrder.orderNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #d35400; }
                    .order-info { margin-bottom: 30px; }
                    .order-items { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .order-items th, .order-items td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    .order-items th { background-color: #f2f2f2; }
                    .totals { margin-top: 30px; font-size: 1.2em; }
                    .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                    .grand-total { font-weight: bold; font-size: 1.3em; margin-top: 20px; padding-top: 20px; border-top: 2px solid #000; }
                    .footer { margin-top: 50px; text-align: center; color: #666; font-size: 0.9em; }
                </style>
            </head>
            <body>
                <h1>Заказ №${lastOrder.orderNumber}</h1>
                <div class="order-info">
                    <p><strong>Дата:</strong> ${new Date(lastOrder.date).toLocaleString('ru-RU')}</p>
                    <p><strong>Клиент:</strong> ${lastOrder.customer.name}</p>
                    <p><strong>Телефон:</strong> ${lastOrder.customer.phone}</p>
                    <p><strong>Адрес доставки:</strong> ${lastOrder.customer.address}</p>
                    <p><strong>Способ оплаты:</strong> ${this.getPaymentMethodName(lastOrder.customer.payment)}</p>
                    <p><strong>Способ получения:</strong> ${lastOrder.customer.delivery === 'delivery' ? 'Доставка курьером' : 'Самовывоз'}</p>
                </div>
                
                <table class="order-items">
                    <thead>
                        <tr>
                            <th>Товар</th>
                            <th>Количество</th>
                            <th>Цена</th>
                            <th>Сумма</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lastOrder.items.map(item => `
                            <tr>
                                <td>${item.pancake.name}</td>
                                <td>${item.quantity}</td>
                                <td>${item.pancake.price} ₽</td>
                                <td>${item.pancake.price * item.quantity} ₽</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="totals">
                    <div class="total-row">
                        <span>Сумма заказа:</span>
                        <span>${lastOrder.subtotal} ₽</span>
                    </div>
                    <div class="total-row">
                        <span>Доставка:</span>
                        <span>${lastOrder.deliveryCost === 0 ? 'Бесплатно' : lastOrder.deliveryCost + ' ₽'}</span>
                    </div>
                    <div class="total-row grand-total">
                        <span>Итого к оплате:</span>
                        <span>${lastOrder.total} ₽</span>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Спасибо за заказ!</p>
                    <p>Блиноман - доставка блинов с начинкой</p>
                    <p>Телефон: 8 (800) 123-45-67</p>
                </div>
            </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        
        // Даем время на загрузку контента
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }
    
    // Получение названия способа оплаты
    getPaymentMethodName(paymentCode) {
        const paymentMethods = {
            'cash': 'Наличными при получении',
            'card': 'Картой при получении',
            'online': 'Онлайн оплата картой'
        };
        
        return paymentMethods[paymentCode] || paymentCode;
    }
}

// Инициализация страницы оформления заказа
document.addEventListener('DOMContentLoaded', () => {
    new CheckoutPage();
});