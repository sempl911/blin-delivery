// Интеграция с Google Sheets для управления товарами

const GoogleSheets = {
    // Публичный URL шаблона Google таблицы
    defaultSheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQbSQwL_dNqXrUyQh9aEaOrbvYsjq0eH67IuMPlDZRQkQyN6J0oI-9dS9bXoN6VlB0VZ7U7v1X1JZ/pub?output=csv',
    
    // Загрузка данных из Google Sheets
    loadFromSheets: async function(sheetUrl = null) {
        const url = sheetUrl || this.defaultSheetUrl;
        
        try {
            UIComponents.showNotification('Загружаем данные из Google Sheets...', 'info');
            
            // Для CORS используем прокси
            const proxyUrl = 'https://api.allorigins.win/get?url=';
            const response = await fetch(proxyUrl + encodeURIComponent(url));
            const data = await response.json();
            
            // Парсим CSV данные
            const csvData = data.contents;
            const pancakes = this.parseCSV(csvData);
            
            if (pancakes.length > 0) {
                // Обновляем хранилище блинов
                PancakeStore.updatePancakes(pancakes);
                
                // Обновляем UI
                UIComponents.renderPancakes(PancakeStore.getAllPancakes());
                UIComponents.showNotification(`Загружено ${pancakes.length} блинов из Google Sheets`, 'success');
                
                // Сохраняем в localStorage
                localStorage.setItem('pancakesFromSheets', JSON.stringify(pancakes));
            } else {
                UIComponents.showNotification('Не удалось загрузить данные из таблицы', 'error');
            }
        } catch (error) {
            console.error('Ошибка при загрузке из Google Sheets:', error);
            UIComponents.showNotification('Ошибка при загрузке данных. Проверьте URL таблицы.', 'error');
        }
    },
    
    // Парсинг CSV данных
    // Обновленный парсер CSV
// Обновленный парсер для поддержки локальных фото
parseCSV: function(csvText) {
    const lines = csvText.split('\n');
    const result = [];
    
    if (lines.length < 2) return result;
    
    // Парсим заголовки
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Маппинг русских названий колонок
    const columnMapping = {
        'название': ['название', 'name', 'товар', 'продукт', 'title'],
        'описание': ['описание', 'description', 'опис', 'desc'],
        'цена': ['цена', 'price', 'стоимость', 'cost', 'руб'],
        'категория': ['категория', 'category', 'тип', 'вид', 'type'],
        'фото': ['фото', 'photo', 'изображение', 'картинка', 'image', 'img', 'иконка', 'icon'],
        'вес': ['вес', 'weight', 'г', 'грамм', 'граммы'],
        'белки': ['белки', 'protein', 'белок', 'протеин'],
        'жиры': ['жиры', 'fat', 'жир'],
        'углеводы': ['углеводы', 'carbs', 'углевод', 'carbohydrates']
    };
    
    // Находим индексы колонок
    const columnIndexes = {};
    Object.keys(columnMapping).forEach(key => {
        columnIndexes[key] = -1;
        for (const possibleName of columnMapping[key]) {
            const index = headers.findIndex(h => h === possibleName);
            if (index !== -1) {
                columnIndexes[key] = index;
                break;
            }
        }
    });
    
    // Проверяем обязательные колонки
    if (columnIndexes['название'] === -1 || columnIndexes['цена'] === -1) {
        console.error('Обязательные колонки "Название" и "Цена" не найдены');
        UIComponents.showNotification('Ошибка: в таблице должны быть колонки "Название" и "Цена"', 'error');
        return result;
    }
    
    // Парсим строки с данными
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = this.parseCSVLine(lines[i]);
        
        // Извлекаем данные по индексам
        const name = values[columnIndexes['название']] ? values[columnIndexes['название']].trim() : null;
        const price = values[columnIndexes['цена']] ? this.parsePrice(values[columnIndexes['цена']]) : 0;
        
        // Пропускаем если нет названия или цены
        if (!name || price <= 0) continue;
        
        // Собираем данные товара
        const pancakeData = {
            name: name,
            description: values[columnIndexes['описание']] ? values[columnIndexes['описание']].trim() : 'Вкусный блин с начинкой',
            price: price,
            category: values[columnIndexes['категория']] ? values[columnIndexes['категория']].trim() : 'Другие',
            image: values[columnIndexes['фото']] ? values[columnIndexes['фото']].trim() : 'fas fa-pancakes',
            weight: values[columnIndexes['вес']] ? parseInt(values[columnIndexes['вес']]) : null,
            protein: values[columnIndexes['белки']] ? parseFloat(values[columnIndexes['белки']]) : null,
            fat: values[columnIndexes['жиры']] ? parseFloat(values[columnIndexes['жиры']]) : null,
            carbs: values[columnIndexes['углеводы']] ? parseFloat(values[columnIndexes['углеводы']]) : null
        };
        
        // Очищаем и нормализуем фото-путь
        if (pancakeData.image) {
            // Убираем кавычки если есть
            pancakeData.image = pancakeData.image.replace(/['"]/g, '').trim();
            
            // Если фото не указано или указано как "-", используем иконку по умолчанию
            if (!pancakeData.image || pancakeData.image === '-' || pancakeData.image === 'нет') {
                pancakeData.image = 'fas fa-pancakes';
            }
        }
        
        // Создаем объект Pancake
        const pancake = new Pancake(
            i, // ID из номера строки
            pancakeData.name,
            pancakeData.description,
            pancakeData.price,
            pancakeData.image,
            pancakeData.category,
            pancakeData.weight,
            pancakeData.protein,
            pancakeData.fat,
            pancakeData.carbs
        );
        
        result.push(pancake);
    }
    
    return result;
},

// Парсинг цены из строки
parsePrice: function(priceString) {
    if (!priceString) return 0;
    
    // Удаляем всё кроме цифр, точек и запятых
    const cleaned = priceString.toString().replace(/[^\d.,]/g, '');
    
    // Заменяем запятую на точку
    const normalized = cleaned.replace(',', '.');
    
    const price = parseFloat(normalized);
    return isNaN(price) ? 0 : price;
},

// Парсинг строки CSV с учетом кавычек
// В файле js/googleSheets.js
parseCSV: function(csvText) {
    console.log("Начинаем парсинг CSV...");
    console.log("Данные для парсинга:", csvText.substring(0, 500));
    
    const lines = csvText.split('\n');
    console.log("Всего строк:", lines.length);
    
    if (lines.length < 2) {
        console.error("В таблице меньше 2 строк");
        return [];
    }
    
    // Получаем заголовки и приводим к нижнему регистру
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    console.log("Заголовки:", headers);
    
    const result = [];
    
    // Парсим каждую строку данных
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        console.log(`Парсим строку ${i}:`, lines[i]);
        
        // Простой парсинг CSV (без учета кавычек для теста)
        const values = lines[i].split(',').map(v => v.trim());
        console.log("Значения в строке:", values);
        
        // Находим индексы полей
        const nameIndex = headers.findIndex(h => 
            h.includes('name') || h.includes('title') || h.includes('product')
        );
        
        const descIndex = headers.findIndex(h => 
            h.includes('description') || h.includes('desc')
        );
        
        const priceIndex = headers.findIndex(h => 
            h.includes('price') || h.includes('cost') || h.includes('amount')
        );
        
        const categoryIndex = headers.findIndex(h => 
            h.includes('category') || h.includes('type')
        );
        
        const imageIndex = headers.findIndex(h => 
            h.includes('image') || h.includes('photo') || h.includes('picture')
        );
        
        console.log("Индексы полей:", {nameIndex, descIndex, priceIndex, categoryIndex, imageIndex});
        
        // Проверяем обязательные поля
        if (nameIndex === -1 || priceIndex === -1) {
            console.error(`Строка ${i}: нет обязательных полей name или price`);
            continue;
        }
        
        // Собираем данные товара
        const pancakeData = {
            name: values[nameIndex] || 'Блин',
            description: values[descIndex] || 'Вкусный блин с начинкой',
            price: this.parsePrice(values[priceIndex]),
            category: values[categoryIndex] || 'Other',
            image: values[imageIndex] || 'fas fa-pancakes'
        };
        
        console.log("Данные товара:", pancakeData);
        
        // Создаем объект Pancake
        const pancake = new Pancake(
            i, // ID из номера строки
            pancakeData.name,
            pancakeData.description,
            pancakeData.price,
            pancakeData.image,
            pancakeData.category
        );
        
        result.push(pancake);
    }
    
    console.log("Всего распарсено товаров:", result.length);
    return result;
},

parsePrice: function(priceString) {
    if (!priceString) return 0;
    
    // Удаляем все нецифровые символы кроме точки
    const cleaned = priceString.toString().replace(/[^\d.]/g, '');
    const price = parseFloat(cleaned);
    
    console.log("Парсим цену:", priceString, "->", cleaned, "->", price);
    
    return isNaN(price) ? 0 : price;
},
    
    // Загрузка из localStorage (если ранее импортировали)
    loadFromLocalStorage: function() {
        const savedPancakes = localStorage.getItem('pancakesFromSheets');
        if (savedPancakes) {
            try {
                const pancakesData = JSON.parse(savedPancakes);
                PancakeStore.updatePancakes(pancakesData);
                return true;
            } catch (error) {
                console.error('Ошибка при загрузке из localStorage:', error);
            }
        }
        return false;
    },
    
    // Инициализация
    init: function() {
        // Пробуем загрузить из localStorage
        const loadedFromStorage = this.loadFromLocalStorage();
        
        // Если не загрузилось из localStorage, используем стандартные данные
        if (!loadedFromStorage) {
            UIComponents.renderPancakes(PancakeStore.getAllPancakes());
        } else {
            UIComponents.renderPancakes(PancakeStore.getAllPancakes());
        }
    }
};