// Главный файл приложения с Bootstrap

class PancakeApp {
    constructor() {
        this.init();
    }
    
     async init() {
        // Сначала загружаем данные из JSON
        await PancakeStore.loadFromJSON();
        
        // Проверяем, что данные загрузились
        console.log('Загружено блинов:', PancakeStore.getAllPancakes().length);
        
        // Потом инициализируем UI компоненты
        UIComponents.init();
        
        // Назначаем обработчики событий
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Кнопка открытия корзины
        const cartToggle = document.getElementById('cartToggle');
        if (cartToggle) {
            cartToggle.addEventListener('click', () => {
                const cartOffcanvas = new bootstrap.Offcanvas(document.getElementById('cartOffcanvas'));
                cartOffcanvas.show();
            });
        }
        
        // Плавная прокрутка для навигации
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                
                // Пропускаем внешние ссылки
                if (href.startsWith('http') || href.includes('checkout.html')) {
                    return;
                }
                
                e.preventDefault();
                
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                    
                    // Закрываем мобильное меню если открыто
                    const navbarCollapse = document.getElementById('navbarNav');
                    if (navbarCollapse.classList.contains('show')) {
                        const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                        bsCollapse.hide();
                    }
                }
            });
        });
    }
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new PancakeApp();
});