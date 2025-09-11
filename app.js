"use strict";

/* --- TELEGRAM WEBAPP INITIALIZATION --- */
let tg = null;
let user = null;
let isInTelegram = false;

// Initialize Telegram WebApp
if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    tg = window.Telegram.WebApp;
    user = tg.initDataUnsafe?.user;
    isInTelegram = true;
    
    // Configure WebApp
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();
    
    // Set theme colors
    if (tg.colorScheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Handle theme changes
    tg.onEvent('themeChanged', function() {
        if (tg.colorScheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    });
    

    

}

/* --- GLOBAL VARIABLES --- */
let collections = [];
let models = [];
let backdrops = [];
let tonPrice = 0;
let starsToUsdRate = 0.015; // 1 Star = $0.015
let tonToStarsRate = 0;
let selectedGift = null;
let selectedModel = null;
let selectedBackdrop = null;
let searchTimeout = null;

/* --- HELPER FUNCTIONS --- */
// Helper function to convert text to Title Case
function toTitleCase(str) {
    return str.toLowerCase().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

/* --- API CONFIGURATION --- */
const API_CONFIG = {
    giftSatellite: {
        baseUrl: 'https://gift-satellite.dev/api',
        headers: {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
            'authorization': 'query_id=AAHrXBBQAgAAAOtcEFDfF4gj&user=%7B%22id%22%3A5638216939%2C%22first_name%22%3A%22root%40Th3ryks%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22Th3ryks%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FvFns4cu0_gbu0IXUclyeHlYcJ0ApjE2KGwrbzgbtHAFS0TUFfd5S2rpSY2xt9UVw.svg%22%7D&auth_date=1752692006&signature=PAoHZRyI6sYYU9Uk5Pjh7ISKnGfkRyX6-jtR8QXn8h9SGJwGs5Ocd5W7emZ14HUA8SUS0vf0E6r8qlXZ746NDg&hash=670af0ff9f330b42ca5a4e8470cf70fa0ceb656b703f7a4d273267ca4753b1ac',
            'cache-control': 'no-cache',
            'dnt': '1',
            'pragma': 'no-cache',
            'priority': 'u=1, i',
            'referer': 'https://gift-satellite.dev/subscription/new',
            'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
        },
        cookies: {
            '__ddg9_': '104.28.193.185',
            '__ddg1_': 'a56NuTLTPAvZebPckH5O',
            '__ddg10_': '1757351571',
            '__ddg8_': 'jxR0812jobRgAqAp'
        }
    },
    searchSatellite: {
        baseUrl: 'https://search.gift-satellite.dev',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
            'Authorization': 'query_id=AAHrXBBQAgAAAOtcEFDfF4gj&user=%7B%22id%22%3A5638216939%2C%22first_name%22%3A%22root%40Th3ryks%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22Th3ryks%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FvFns4cu0_gbu0IXUclyeHlYcJ0ApjE2KGwrbzgbtHAFS0TUFfd5S2rpSY2xt9UVw.svg%22%7D&auth_date=1752692006&signature=PAoHZRyI6sYYU9Uk5Pjh7ISKnGfkRyX6-jtR8QXn8h9SGJwGs5Ocd5W7emZ14HUA8SUS0vf0E6r8qlXZ746NDg&hash=670af0ff9f330b42ca5a4e8470cf70fa0ceb656b703f7a4d273267ca4753b1ac',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'DNT': '1',
            'Origin': 'https://gift-satellite.dev',
            'Pragma': 'no-cache',
            'Referer': 'https://gift-satellite.dev/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"'
        }
    },
    tonApi: {
        baseUrl: 'https://tonapi.io/v2',
        headers: {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
            'cache-control': 'no-cache',
            'dnt': '1',
            'origin': 'https://gift-satellite.dev',
            'pragma': 'no-cache',
            'priority': 'u=1, i',
            'referer': 'https://gift-satellite.dev/',
            'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
        }
    }
};

/* --- INITIALIZATION --- */
document.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
});

async function initializeApp() {
    try {
        setupEventListeners();
        
        await Promise.all([
            loadCollections(),
            loadBackdrops()
        ]);
        
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        // Silently handle initialization errors - app can still work partially
    }
}

/* --- API FUNCTIONS --- */
async function loadCollections() {
    try {
        const url = new URL(`${API_CONFIG.giftSatellite.baseUrl}/gift/collections`);
        url.searchParams.append('premarket', '0');
        
        const response = await fetch(url, {
            method: 'GET',
            headers: API_CONFIG.giftSatellite.headers,
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        collections = await response.json();
        console.log(`Loaded ${collections.length} collections`);
        
        // Load gift images from fragment.com
        await loadGiftImages();
    } catch (error) {
        console.error('Failed to load collections:', error);
        collections = [];
    }
}

async function loadGiftImages() {
    try {
        for (const gift of collections) {
            // Clean gift name: remove apostrophes, dashes, spaces, numbers, keep only English letters
            const cleanName = gift.name.replace(/[^a-zA-Z]/g, '').toLowerCase();
            if (cleanName) {
                gift.imageUrl = `https://fragment.com/file/gifts/${cleanName}/thumb.webp`;
            }
        }
        console.log('Gift images URLs generated');
    } catch (error) {
        console.error('Failed to generate gift image URLs:', error);
    }
}

async function loadModels(giftName) {
    try {
        const response = await fetch(`${API_CONFIG.giftSatellite.baseUrl}/gift/models/${encodeURIComponent(giftName)}`, {
            method: 'GET',
            headers: API_CONFIG.giftSatellite.headers,
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        models = Array.isArray(data) ? data.sort((a, b) => a.name.localeCompare(b.name)) : [];
        console.log(`Loaded ${models.length} models for ${giftName}`);
        return models;
    } catch (error) {
        console.error('Failed to load models:', error);
        models = [];
        return [];
    }
}

async function loadBackdrops() {
    try {
        const response = await fetch('https://cdn.changes.tg/gifts/backdrops.json', {
            method: 'GET',
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        backdrops = Array.isArray(data) ? data.sort((a, b) => a.name.localeCompare(b.name)) : [];
        console.log(`Loaded ${backdrops.length} backdrops`);
        return backdrops;
    } catch (error) {
        console.error('Failed to load backdrops:', error);
        backdrops = [];
        return [];
    }
}

// TON price loading removed - currency selector functionality disabled

function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;
    
    // Convert everything to USD first, then to target currency
    let usdAmount;
    
    switch (fromCurrency.toUpperCase()) {
        case 'TON':
            usdAmount = amount * tonPrice;
            break;
        case 'USD':
            usdAmount = amount;
            break;
        case 'STARS':
            usdAmount = amount * starsToUsdRate;
            break;
        default:
            return amount;
    }
    
    switch (toCurrency.toUpperCase()) {
        case 'TON':
            return tonPrice > 0 ? usdAmount / tonPrice : 0;
        case 'USD':
            return usdAmount;
        case 'STARS':
            return usdAmount / starsToUsdRate;
        default:
            return amount;
    }
}

function formatCurrency(amount, currency) {
    const value = parseFloat(amount);
    if (isNaN(value)) return 'N/A';
    
    switch (currency.toUpperCase()) {
        case 'TON':
            return `${value.toFixed(2)} TON`;
        case 'USD':
            return `$${value.toFixed(2)}`;
        case 'STARS':
            return `${Math.round(value)} ⭐`;
        default:
            return `${value.toFixed(2)} ${currency}`;
    }
}

function updateCurrencyDisplay() {
    // Currency display removed from main menu
}

// Currency selector functionality removed

// Flag to prevent multiple simultaneous requests
let isLoadingPrices = false;

async function getGiftPrices() {
    if (!selectedGift) {
        showError('Please select a gift first');
        return;
    }
    
    if (isLoadingPrices) {
        console.log('Already loading prices, skipping request');
        return;
    }
    
    try {
        isLoadingPrices = true;
        // Initialize results container
        initializeResultsContainer();
        
        // Get TON price first
        const tonPrice = await getTonPrice();
        
        // Fetch and display results sequentially with delays
        await fetchAndDisplayMarketplace('TG Market', fetchTgMarketData, tonPrice);
        await delay(2000); // Increased delay for TG Market
        
        await fetchAndDisplayMarketplace('Portals', fetchPortalsData, tonPrice);
        await delay(1000);
        
        await fetchAndDisplayMarketplace('MRKT', fetchMrktData, tonPrice);
        await delay(1000);
        
        await fetchAndDisplayMarketplace('Tonnel', fetchTonnelData, tonPrice);
        
    } catch (error) {
        console.error('Failed to get gift prices:', error);
        showError('Failed to get gift prices. Please try again.');
    } finally {
        isLoadingPrices = false;
    }
}

async function fetchAndDisplayMarketplace(marketplaceName, fetchFunction, tonPrice) {
    try {
        const data = await fetchFunction();
        displayMarketplaceResults(marketplaceName, data, tonPrice);
    } catch (error) {
        console.error(`Failed to fetch ${marketplaceName} data:`, error);
        displayMarketplaceResults(marketplaceName, [], tonPrice, true);
    }
}

// Helper function for delays
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to get TON price in USD
async function getTonPrice() {
    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT');
        const data = await response.json();
        return parseFloat(data.price);
    } catch (error) {
        console.error('Failed to get TON price:', error);
        return 5.5; // Fallback price
    }
}

async function fetchTgMarketData() {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const url = new URL(`${API_CONFIG.giftSatellite.baseUrl}/tg-market/search/${encodeURIComponent(toTitleCase(selectedGift.name))}`);
            url.searchParams.append('models', selectedModel ? toTitleCase(selectedModel.name) : '');
            url.searchParams.append('backdrops', selectedBackdrop ? selectedBackdrop.name : '');
            
            const response = await fetch(url, {
                method: 'GET',
                headers: API_CONFIG.giftSatellite.headers,
                mode: 'cors'
            });
            
            if (response.ok) {
                return await response.json();
            } else if (response.status === 429 && attempt < maxRetries) {
                console.warn(`TG Market rate limited, retrying in 0.1 seconds...`);
                await delay(100); // Quick retry for 429 errors
                continue;
            } else if (response.status === 500 && attempt < maxRetries) {
                console.warn(`TG Market server error, retrying in ${attempt * 2} seconds...`);
                await delay(attempt * 2000);
                continue;
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            if (attempt === maxRetries) {
                console.error('Failed to fetch TG Market data after retries:', error);
                return [];
            }
            await delay(2000); // Increased base delay
        }
    }
    return [];
}

async function fetchPortalsData() {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const url = new URL(`${API_CONFIG.searchSatellite.baseUrl}/portals/api/search/${encodeURIComponent(toTitleCase(selectedGift.name))}`);
            url.searchParams.append('models', selectedModel ? toTitleCase(selectedModel.name) : '');
            url.searchParams.append('backdrops', selectedBackdrop ? selectedBackdrop.name : '');
            
            const response = await fetch(url, {
                method: 'GET',
                headers: API_CONFIG.searchSatellite.headers,
                mode: 'cors'
            });
            
            if (response.ok) {
                return await response.json();
            } else if ((response.status === 429 || response.status === 500) && attempt < maxRetries) {
                console.warn(`Portals API error ${response.status}, retrying in ${attempt * 2} seconds...`);
                await delay(attempt * 2000);
                continue;
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            if (attempt === maxRetries) {
                console.error('Failed to fetch Portals data after retries:', error);
                return [];
            }
            await delay(1000);
        }
    }
    return [];
}

async function fetchMrktData() {
    try {
        const url = new URL(`${API_CONFIG.searchSatellite.baseUrl}/mrkt/api/search/${encodeURIComponent(toTitleCase(selectedGift.name))}`);
        url.searchParams.append('models', selectedModel ? toTitleCase(selectedModel.name) : '');
        url.searchParams.append('backdrops', selectedBackdrop ? selectedBackdrop.name : '');
        
        const response = await fetch(url, {
            method: 'GET',
            headers: API_CONFIG.searchSatellite.headers,
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch MRKT data:', error);
        return [];
    }
}

async function fetchTonnelData() {
    try {
        const url = new URL(`${API_CONFIG.searchSatellite.baseUrl}/tonnel/api/search/${encodeURIComponent(toTitleCase(selectedGift.name))}`);
        url.searchParams.append('models', selectedModel ? toTitleCase(selectedModel.name) : '');
        url.searchParams.append('backdrops', selectedBackdrop ? selectedBackdrop.name : '');
        
        const response = await fetch(url, {
            method: 'GET',
            headers: API_CONFIG.searchSatellite.headers
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch Tonnel data:', error);
        return [];
    }
}

async function getLastPurchases() {
    const giftInput = document.getElementById('purchase-gift-search');
    const modelInput = document.getElementById('purchase-model-search');
    const backdropInput = document.getElementById('purchase-backdrop-search');
    
    if (!giftInput.value.trim()) {
        showError('Please select a gift first');
        return;
    }
    
    try {
        showLoading('Getting last purchases...');
        
        // Correct API endpoint for last purchases
        const url = new URL('https://tg-stat.gift-satellite.dev/api/last-purchases');
        url.searchParams.append('collectionName', giftInput.value.trim());
        url.searchParams.append('limit', '15');
        
        if (modelInput.value.trim()) {
            url.searchParams.append('modelNames', modelInput.value.trim());
        } else {
            url.searchParams.append('modelNames', '');
        }
        
        if (backdropInput.value.trim()) {
            url.searchParams.append('backdropNames', backdropInput.value.trim());
        } else {
            url.searchParams.append('backdropNames', '');
        }
        
        const response = await fetch(url, {
            method: 'GET',
            headers: API_CONFIG.searchSatellite.headers
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const purchases = await response.json();
        await displayLastPurchases(purchases);
        hideLoading();
    } catch (error) {
        console.error('Failed to get last purchases:', error);
        showError('Failed to get last purchases. Please try again.');
        hideLoading();
    }
}

/* --- UI FUNCTIONS --- */
function setupEventListeners() {
    // Search functionality with autocomplete
    const giftSearch = document.getElementById('gift-search');
    const modelSearch = document.getElementById('model-search');
    const backdropSearch = document.getElementById('backdrop-search');
    
    if (giftSearch) {
        giftSearch.addEventListener('input', handleGiftSearch);
        giftSearch.addEventListener('focus', () => {
            if (giftSearch.value.length >= 2) {
                handleGiftSearch({ target: giftSearch });
            }
        });
    }
    
    if (modelSearch) {
        modelSearch.addEventListener('input', handleModelSearch);
        modelSearch.addEventListener('focus', () => {
            if (modelSearch.value.length >= 2) {
                handleModelSearch({ target: modelSearch });
            }
        });
    }
    
    if (backdropSearch) {
        backdropSearch.addEventListener('input', handleBackdropSearch);
        backdropSearch.addEventListener('focus', () => {
            if (backdropSearch.value.length >= 2) {
                handleBackdropSearch({ target: backdropSearch });
            }
        });
    }
    
    // Search button - using correct ID from HTML
    const getGiftsBtn = document.getElementById('get-gifts-btn');
    if (getGiftsBtn) {
        getGiftsBtn.addEventListener('click', getGiftPrices);
    }
    
    // Currency selector removed
    
    // Modal close buttons
    document.querySelectorAll('.close-btn').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Last purchases search
    const getPurchasesBtn = document.getElementById('get-purchases-btn');
    if (getPurchasesBtn) {
        getPurchasesBtn.addEventListener('click', getLastPurchases);
    }
    
    // Purchase modal search fields
    const purchaseGiftSearch = document.getElementById('purchase-gift-search');
    const purchaseModelSearch = document.getElementById('purchase-model-search');
    const purchaseBackdropSearch = document.getElementById('purchase-backdrop-search');
    
    if (purchaseGiftSearch) {
        purchaseGiftSearch.addEventListener('input', (e) => {
            handlePurchaseGiftSearch(e);
            updatePurchaseButton();
        });
    }
    
    if (purchaseModelSearch) {
        purchaseModelSearch.addEventListener('input', handlePurchaseModelSearch);
    }
    
    if (purchaseBackdropSearch) {
        purchaseBackdropSearch.addEventListener('input', handlePurchaseBackdropSearch);
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Update search button state
    updateSearchButton();
}

function handleGiftSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const dropdown = document.getElementById('gift-dropdown');
    
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    searchTimeout = setTimeout(() => {
        if (query.length < 2) {
            dropdown.style.display = 'none';
            return;
        }
        
        const filtered = collections.filter(gift => 
            gift.name.toLowerCase().includes(query)
        ).slice(0, 10);
        
        displayGiftDropdown(filtered, dropdown, e.target);
    }, 300);
}

function handleModelSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const dropdown = document.getElementById('model-dropdown');
    
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    searchTimeout = setTimeout(() => {
        if (query.length < 2) {
            dropdown.style.display = 'none';
            return;
        }
        
        if (!selectedGift) {
            dropdown.style.display = 'none';
            return;
        }
        
        // Load models for selected gift if not already loaded
        if (models.length === 0) {
            loadModels(selectedGift.name).then(() => {
                const filtered = models.filter(model => 
                    model.name.toLowerCase().includes(query)
                ).slice(0, 10);
                displayModelDropdown(filtered, dropdown, e.target);
            });
        } else {
            const filtered = models.filter(model => 
                model.name.toLowerCase().includes(query)
            ).slice(0, 10);
            displayModelDropdown(filtered, dropdown, e.target);
        }
    }, 300);
}

function handleBackdropSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const dropdown = document.getElementById('backdrop-dropdown');
    
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    searchTimeout = setTimeout(() => {
        if (query.length < 2) {
            dropdown.style.display = 'none';
            return;
        }
        
        // Load backdrops if not already loaded
        if (backdrops.length === 0) {
            loadBackdrops().then(() => {
                const filtered = backdrops.filter(backdrop => 
                    backdrop.name.toLowerCase().includes(query)
                ).slice(0, 10);
                displayBackdropDropdown(filtered, dropdown, e.target);
            });
        } else {
            const filtered = backdrops.filter(backdrop => 
                backdrop.name.toLowerCase().includes(query)
            ).slice(0, 10);
            displayBackdropDropdown(filtered, dropdown, e.target);
        }
    }, 300);
}

function displayGiftDropdown(gifts, dropdown, input) {
    if (gifts.length === 0) {
        dropdown.style.display = 'none';
        return;
    }
    
    dropdown.innerHTML = gifts.map(gift => `
        <div class="dropdown-item" onclick="selectGift('${gift._id}', '${gift.name.replace(/'/g, "\\'")}')">            <div style="position: relative; display: inline-block;">
                <img src="${gift.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjM2IiBoZWlnaHQ9IjM2IiByeD0iOCIgZmlsbD0iIzMzMzMzMyIvPgo8dGV4dCB4PSIxOCIgeT0iMjIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Pz88L3RleHQ+Cjwvc3ZnPgo='}" 
                     alt="${gift.name}" 
                     class="dropdown-image"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjM2IiBoZWlnaHQ9IjM2IiByeD0iOCIgZmlsbD0iIzMzMzMzMyIvPgo8dGV4dCB4PSIxOCIgeT0iMjIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Pz88L3RleHQ+Cjwvc3ZnPgo='">
            </div>
            <span>${gift.name}</span>
        </div>
    `).join('');
    
    dropdown.style.display = 'block';
}

function displayModelDropdown(models, dropdown, input) {
    if (models.length === 0) {
        dropdown.style.display = 'none';
        return;
    }
    
    dropdown.innerHTML = models.map(model => `
        <div class="dropdown-item" onclick="selectModel('${model._id}', '${model.name.replace(/'/g, "\\'")}')">            <img src="https://storage.googleapis.com/portals-market/gifts/${encodeURIComponent(selectedGift?.name?.replace(/[^a-zA-Z]/g, '').toLowerCase() || '')}/models/png/${encodeURIComponent(model.name?.replace(/[^a-zA-Z]/g, '').toLowerCase() || '')}.png" 
                 alt="${model.name}" 
                 class="dropdown-image"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjM2IiBoZWlnaHQ9IjM2IiByeD0iOCIgZmlsbD0iIzMzMzMzMyIvPgo8dGV4dCB4PSIxOCIgeT0iMjIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Pz88L3RleHQ+Cjwvc3ZnPgo='">
            <span>${model.name}</span>
            <small class="rarity">Rarity: ${model.rarity || 'Unknown'}</small>
        </div>
    `).join('');
    
    dropdown.style.display = 'block';
}

function displayBackdropDropdown(backdrops, dropdown, input) {
    if (backdrops.length === 0) {
        dropdown.style.display = 'none';
        return;
    }
    
    dropdown.innerHTML = backdrops.map(backdrop => `
        <div class="dropdown-item" onclick="selectBackdrop('${backdrop._id}', '${backdrop.name.replace(/'/g, "\\'")}')">            <div class="backdrop-preview" style="
                background: linear-gradient(135deg, ${backdrop.hex?.centerColor || backdrop.color || '#333333'} 0%, ${backdrop.hex?.edgeColor || backdrop.color || '#333333'} 100%);
                width: 36px;
                height: 36px;
                border-radius: 8px;
                margin-right: 12px;
                border: 2px solid ${backdrop.hex?.patternColor || '#555555'};
            "></div>
            <span style="color: ${backdrop.hex?.textColor || 'inherit'};">${backdrop.name}</span>
        </div>
    `).join('');
    
    dropdown.style.display = 'block';
}

function selectGift(id, name) {
    selectedGift = { _id: id, name: name };
    const giftInput = document.getElementById('gift-search');
    const giftDropdown = document.getElementById('gift-dropdown');
    
    // Telegram haptic feedback
    sendTelegramHaptic('selection');
    
    if (giftInput) {
        giftInput.value = name;
    }
    
    if (giftDropdown) {
        giftDropdown.style.display = 'none';
    }
    
    // Load models for selected gift
    loadModels(name);
    
    // Clear model and backdrop selections
    selectedModel = null;
    selectedBackdrop = null;
    models = []; // Clear models cache
    

    
    const modelInput = document.getElementById('model-search');
    const backdropInput = document.getElementById('backdrop-search');
    
    if (modelInput) {
        modelInput.value = '';
    }
    
    if (backdropInput) {
        backdropInput.value = '';
    }
    
    updateSearchButton();
}

function selectModel(id, name) {
    selectedModel = { _id: id, name: name };
    const modelInput = document.getElementById('model-search');
    const modelDropdown = document.getElementById('model-dropdown');
    
    if (modelInput) {
        modelInput.value = name;
    }
    
    if (modelDropdown) {
        modelDropdown.style.display = 'none';
    }
    
    updateSearchButton();
    console.log('Selected model:', selectedModel);
}

function selectBackdrop(id, name) {
    selectedBackdrop = { _id: id, name: name };
    const backdropInput = document.getElementById('backdrop-search');
    const backdropDropdown = document.getElementById('backdrop-dropdown');
    
    if (backdropInput) {
        backdropInput.value = name;
    }
    
    if (backdropDropdown) {
        backdropDropdown.style.display = 'none';
    }
    
    updateSearchButton();
    console.log('Selected backdrop:', selectedBackdrop);
}

// Purchase modal search handlers
function handlePurchaseGiftSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const dropdown = document.getElementById('purchase-gift-dropdown');
    
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    searchTimeout = setTimeout(() => {
        if (query.length < 2) {
            if (dropdown) dropdown.style.display = 'none';
            return;
        }
        
        const filtered = collections.filter(gift => 
            gift.name.toLowerCase().includes(query)
        ).slice(0, 10);
        
        displayPurchaseGiftDropdown(filtered, dropdown, e.target);
    }, 300);
}

function handlePurchaseModelSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const dropdown = document.getElementById('purchase-model-dropdown');
    
    if (query.length < 2) {
        if (dropdown) dropdown.style.display = 'none';
        return;
    }
    
    const filtered = models.filter(model => 
        model.name.toLowerCase().includes(query)
    ).slice(0, 10);
    
    displayPurchaseModelDropdown(filtered, dropdown, e.target);
}

function handlePurchaseBackdropSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const dropdown = document.getElementById('purchase-backdrop-dropdown');
    
    if (query.length < 2) {
        if (dropdown) dropdown.style.display = 'none';
        return;
    }
    
    const filtered = backdrops.filter(backdrop => 
        backdrop.name.toLowerCase().includes(query)
    ).slice(0, 10);
    
    displayPurchaseBackdropDropdown(filtered, dropdown, e.target);
}

// Purchase dropdown display functions
function displayPurchaseGiftDropdown(gifts, dropdown, input) {
    if (!dropdown || gifts.length === 0) {
        if (dropdown) dropdown.style.display = 'none';
        return;
    }
    
    dropdown.innerHTML = gifts.map(gift => `
        <div class="dropdown-item" onclick="selectPurchaseGift('${gift._id}', '${gift.name.replace(/'/g, "\\'")}')">            <img src="${gift.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjM2IiBoZWlnaHQ9IjM2IiByeD0iOCIgZmlsbD0iIzMzMzMzMyIvPgo8dGV4dCB4PSIxOCIgeT0iMjIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Pz88L3RleHQ+Cjwvc3ZnPgo='}" 
                 alt="${gift.name}" 
                 class="dropdown-image"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjM2IiBoZWlnaHQ9IjM2IiByeD0iOCIgZmlsbD0iIzMzMzMzMyIvPgo8dGV4dCB4PSIxOCIgeT0iMjIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+OgTwvdGV4dD4KPHN2Zz4K'">
            <span>${gift.name}</span>
        </div>
    `).join('');
    
    dropdown.style.display = 'block';
}

function displayPurchaseModelDropdown(models, dropdown, input) {
    if (!dropdown || models.length === 0) {
        if (dropdown) dropdown.style.display = 'none';
        return;
    }
    
    dropdown.innerHTML = models.map(model => `
        <div class="dropdown-item" onclick="selectPurchaseModel('${model._id}', '${model.name.replace(/'/g, "\\'")}')">            <img src="${selectedGift?.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjM2IiBoZWlnaHQ9IjM2IiByeD0iOCIgZmlsbD0iIzMzMzMzMyIvPgo8dGV4dCB4PSIxOCIgeT0iMjIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Pz88L3RleHQ+Cjwvc3ZnPgo='}" 
                 alt="${model.name}" 
                 class="dropdown-image"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjM2IiBoZWlnaHQ9IjM2IiByeD0iOCIgZmlsbD0iIzMzMzMzMyIvPgo8dGV4dCB4PSIxOCIgeT0iMjIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+OgTwvdGV4dD4KPHN2Zz4K'">
            <span>${model.name}</span>
        </div>
    `).join('');
    
    dropdown.style.display = 'block';
}

function displayPurchaseBackdropDropdown(backdrops, dropdown, input) {
    if (!dropdown || backdrops.length === 0) {
        if (dropdown) dropdown.style.display = 'none';
        return;
    }
    
    dropdown.innerHTML = backdrops.map(backdrop => `
        <div class="dropdown-item" onclick="selectPurchaseBackdrop('${backdrop._id}', '${backdrop.name.replace(/'/g, "\\'")}')">            <div class="backdrop-preview" style="background: ${backdrop.color || '#333333'}; width: 36px; height: 36px; border-radius: 8px; margin-right: 12px; border: 2px solid var(--border); flex-shrink: 0;"></div>
            <span>${backdrop.name}</span>
        </div>
    `).join('');
    
    dropdown.style.display = 'block';
}

// Purchase selection functions
function selectPurchaseGift(id, name) {
    const giftInput = document.getElementById('purchase-gift-search');
    const giftDropdown = document.getElementById('purchase-gift-dropdown');
    
    if (giftInput) {
        giftInput.value = name;
    }
    
    if (giftDropdown) {
        giftDropdown.style.display = 'none';
    }
    
    updatePurchaseButton();
}

function selectPurchaseModel(id, name) {
    const modelInput = document.getElementById('purchase-model-search');
    const modelDropdown = document.getElementById('purchase-model-dropdown');
    
    if (modelInput) {
        modelInput.value = name;
    }
    
    if (modelDropdown) {
        modelDropdown.style.display = 'none';
    }
}

function selectPurchaseBackdrop(id, name) {
    const backdropInput = document.getElementById('purchase-backdrop-search');
    const backdropDropdown = document.getElementById('purchase-backdrop-dropdown');
    
    if (backdropInput) {
        backdropInput.value = name;
    }
    
    if (backdropDropdown) {
        backdropDropdown.style.display = 'none';
    }
}

// Purchase dropdown display functions
function displayPurchaseGiftDropdown(gifts, dropdown, input) {
    if (!dropdown || gifts.length === 0) {
        if (dropdown) dropdown.style.display = 'none';
        return;
    }
    
    dropdown.innerHTML = gifts.map(gift => `
        <div class="dropdown-item" onclick="selectPurchaseGift('${gift._id}', '${gift.name.replace(/'/g, "\\'")}')">            <img src="${gift.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjM2IiBoZWlnaHQ9IjM2IiByeD0iOCIgZmlsbD0iIzMzMzMzMyIvPgo8dGV4dCB4PSIxOCIgeT0iMjIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Pz88L3RleHQ+Cjwvc3ZnPgo='}" 
                 alt="${gift.name}" 
                 class="gift-preview"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjM2IiBoZWlnaHQ9IjM2IiByeD0iOCIgZmlsbD0iIzMzMzMzMyIvPgo8dGV4dCB4PSIxOCIgeT0iMjIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+OgTwvdGV4dD4KPHN2Zz4K'">
            <span>${gift.name}</span>
        </div>
    `).join('');
    
    dropdown.style.display = 'block';
}

function displayPurchaseModelDropdown(models, dropdown, input) {
    if (!dropdown || models.length === 0) {
        if (dropdown) dropdown.style.display = 'none';
        return;
    }
    
    dropdown.innerHTML = models.map(model => `
        <div class="dropdown-item" onclick="selectPurchaseModel('${model._id}', '${model.name.replace(/'/g, "\\'")}')">            <img src="https://storage.googleapis.com/portals-market/gifts/${encodeURIComponent(selectedGift?.name?.replace(/[^a-zA-Z]/g, '').toLowerCase() || '')}/models/png/${encodeURIComponent(model.name?.replace(/[^a-zA-Z]/g, '').toLowerCase() || '')}.png" 
                 alt="${model.name}" 
                 class="model-preview"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjM2IiBoZWlnaHQ9IjM2IiByeD0iOCIgZmlsbD0iIzMzMzMzMyIvPgo8dGV4dCB4PSIxOCIgeT0iMjIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TU9EPC90ZXh0Pgo8L3N2Zz4K'">
            <span>${model.name}</span>
        </div>
    `).join('');
    
    dropdown.style.display = 'block';
}

function displayPurchaseBackdropDropdown(backdrops, dropdown, input) {
    if (!dropdown || backdrops.length === 0) {
        if (dropdown) dropdown.style.display = 'none';
        return;
    }
    
    dropdown.innerHTML = backdrops.map(backdrop => `
        <div class="dropdown-item" onclick="selectPurchaseBackdrop('${backdrop._id}', '${backdrop.name.replace(/'/g, "\'")}')">            <div class="backdrop-preview" style="background: ${backdrop.color || '#333333'}; width: 36px; height: 36px; border-radius: 8px; margin-right: 12px; border: 2px solid var(--border); flex-shrink: 0;"></div>
            <span>${backdrop.name}</span>
        </div>
    `).join('');
    
    dropdown.style.display = 'block';
}

// Button state management
function updateSearchButton() {
    const getGiftsBtn = document.getElementById('get-gifts-btn');
    if (getGiftsBtn) {
        getGiftsBtn.disabled = !selectedGift;
    }
}

function updatePurchaseButton() {
    const getPurchasesBtn = document.getElementById('get-purchases-btn');
    const giftInput = document.getElementById('purchase-gift-search');
    
    if (getPurchasesBtn && giftInput) {
        getPurchasesBtn.disabled = !giftInput.value.trim();
    }
}

// Modal functions
function openLastPurchases() {
    const modal = document.getElementById('purchases-modal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        
        // Initialize modal search functionality
        initializePurchaseSearch();
    }
}

function closePurchasesModal() {
    const modal = document.getElementById('purchases-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        
        // Clear results
        const resultsContainer = document.getElementById('purchases-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
    }
}

function initializePurchaseSearch() {
    // Initialize search functionality for the modal
    const giftInput = document.getElementById('purchase-gift-search');
    const modelInput = document.getElementById('purchase-model-search');
    const backdropInput = document.getElementById('purchase-backdrop-search');
    const getPurchasesBtn = document.getElementById('get-purchases-btn');
    
    if (giftInput) {
        giftInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                const filteredGifts = collections.filter(gift => 
                    gift.name.toLowerCase().includes(query.toLowerCase())
                );
                displayPurchaseGiftDropdown(filteredGifts, document.getElementById('purchase-gift-dropdown'), giftInput);
            } else {
                document.getElementById('purchase-gift-dropdown').style.display = 'none';
            }
        });
    }
    
    // Enable/disable button based on gift selection
    function updatePurchaseButtonState() {
        if (getPurchasesBtn) {
            getPurchasesBtn.disabled = !giftInput?.value.trim();
        }
    }
    
    if (giftInput) giftInput.addEventListener('input', updatePurchaseButtonState);
    updatePurchaseButtonState();
}

function displayPurchaseGiftDropdown(gifts, dropdown, input) {
    if (gifts.length === 0) {
        dropdown.style.display = 'none';
        return;
    }
    
    dropdown.innerHTML = gifts.map(gift => `
        <div class="dropdown-item" onclick="selectPurchaseGift('${gift._id}', '${gift.name.replace(/'/g, "\\'")}')">            <div style="position: relative; display: inline-block;">
                <img src="${gift.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjM2IiBoZWlnaHQ9IjM2IiByeD0iOCIgZmlsbD0iIzMzMzMzMyIvPgo8dGV4dCB4PSIxOCIgeT0iMjIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Pz88L3RleHQ+Cjwvc3ZnPgo='}" 
                     alt="${gift.name}" 
                     class="dropdown-image"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjM2IiBoZWlnaHQ9IjM2IiByeD0iOCIgZmlsbD0iIzMzMzMzMyIvPgo8dGV4dCB4PSIxOCIgeT0iMjIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Pz88L3RleHQ+Cjwvc3ZnPgo='">
            </div>
            <span>${gift.name}</span>
        </div>
    `).join('');
    
    dropdown.style.display = 'block';
}

function selectPurchaseGift(giftId, giftName) {
    const giftInput = document.getElementById('purchase-gift-search');
    const dropdown = document.getElementById('purchase-gift-dropdown');
    
    if (giftInput) {
        giftInput.value = giftName;
        dropdown.style.display = 'none';
        
        // Update button state
        const getPurchasesBtn = document.getElementById('get-purchases-btn');
        if (getPurchasesBtn) {
            getPurchasesBtn.disabled = false;
        }
    }
}

// Theme toggle function
function toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.textContent = newTheme === 'dark' ? '🌙 Dark' : '☀️ Light';
    }
    
    // Send haptic feedback
    sendTelegramHaptic('selection');
}

function initializeResultsContainer() {
    const resultsContainer = document.getElementById('results-section');
    if (!resultsContainer) {
        console.error('Results container not found');
        return;
    }
    resultsContainer.innerHTML = '';
    resultsContainer.classList.add('active'); // Make results section visible
    
    // Hide search section and show "Search New Gift" button in header
    const searchSection = document.querySelector('.search-section');
    if (searchSection) {
        searchSection.style.display = 'none';
    }
    
    // Show "Search New Gift" button in header
    const headerSearchBtn = document.querySelector('.search-new-gift-btn');
    if (headerSearchBtn) {
        headerSearchBtn.style.display = 'block';
    }
}

function showSearchMenu() {
    // Show search section
    const searchSection = document.querySelector('.search-section');
    if (searchSection) {
        searchSection.style.display = 'block';
    }
    
    // Hide "Search New Gift" button in header
    const headerSearchBtn = document.querySelector('.search-new-gift-btn');
    if (headerSearchBtn) {
        headerSearchBtn.style.display = 'none';
    }
    
    // Hide results section
    const resultsContainer = document.getElementById('results-section');
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
        resultsContainer.classList.remove('active');
    }
    
    // Reset selections
    selectedGift = null;
    selectedModel = null;
    selectedBackdrop = null;
    models = [];
    
    // Clear input fields
    const giftInput = document.getElementById('gift-search');
    const modelInput = document.getElementById('model-search');
    const backdropInput = document.getElementById('backdrop-search');
    
    if (giftInput) giftInput.value = '';
    if (modelInput) modelInput.value = '';
    if (backdropInput) backdropInput.value = '';
    
    // Update button state
    updateSearchButton();
}

function getMarketplaceLogo(marketplace) {
    const logos = {
        'TG Market': '🛒',
        'Portals': '🌀',
        'MRKT': '🏪',
        'Tonnel': '🚇'
    };
    return logos[marketplace] || '🏬';
}

function displayMarketplaceResults(marketplace, items, tonPrice, hasError = false) {
    const resultsContainer = document.getElementById('results-section');
    if (!resultsContainer) return;
    
    // Remove existing section for this marketplace
    const existingSection = document.getElementById(`marketplace-${marketplace.replace(' ', '-')}`);
    if (existingSection) {
        existingSection.remove();
    }
    
    const marketSection = document.createElement('div');
    marketSection.id = `marketplace-${marketplace.replace(' ', '-')}`;
    marketSection.style.cssText = `
        margin-bottom: 15px;
        padding: 12px;
        background: var(--bg-secondary);
        border-radius: 12px;
        border: 1px solid var(--border);
    `;
    
    // Header with logo and name
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
    `;
    
    header.innerHTML = `
        <span style="margin-right: 12px;">${getMarketplaceLogo(marketplace)}</span>
        ${marketplace}
    `;
    
    marketSection.appendChild(header);
    
    if (hasError || !items || !Array.isArray(items) || items.length === 0) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            text-align: center;
            padding: 20px;
            color: var(--text-muted);
            font-size: 16px;
        `;
        errorDiv.innerHTML = hasError ? 
            '⚠️ Error loading data' : 
            '📭 No gifts found';
        marketSection.appendChild(errorDiv);
    } else {
        // Show only first 5 items
        const displayItems = items.slice(0, 5);
        
        // Create table-like grid
        const gridContainer = document.createElement('div');
        gridContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            margin-bottom: 10px;
        `;
        
        // Add responsive class for mobile
        gridContainer.className = 'marketplace-grid';
        
        displayItems.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.style.cssText = `
                background: var(--bg-primary);
                border-radius: 6px;
                padding: 8px;
                border: 1px solid var(--border);
                cursor: pointer;
                transition: transform 0.2s ease;
                text-align: center;
                min-width: 0;
            `;
            
            itemCard.onmouseover = () => itemCard.style.transform = 'translateY(-2px)';
            itemCard.onmouseout = () => itemCard.style.transform = 'translateY(0)';
            
            let tonPrice_item = parseFloat(item.price) || 0;
            // Add 6% markup for portals and tonnel marketplaces
            if (marketplace.toLowerCase().includes('portals') || marketplace.toLowerCase().includes('tonnel')) {
                tonPrice_item = tonPrice_item * 1.06;
            }
            const usdPrice = tonPrice_item * tonPrice;
            const starsPrice = Math.round(usdPrice / 0.015);
            
            const imageUrl = item.slug ? 
                `https://nft.fragment.com/gift/${item.slug}.medium.jpg` : 
                selectedGift?.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzMzMzMzMyIvPgo8dGV4dCB4PSIyMCIgeT0iMjQiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Pz88L3RleHQ+Cjwvc3ZnPgo=';
            
            itemCard.innerHTML = `
                <div style="position: relative; display: inline-block; margin-bottom: 2px;">
                    <img src="${imageUrl}" 
                         alt="${item.name || selectedGift?.name || 'Gift'}" 
                         style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border); position: relative; z-index: 1;" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzMzMzMzMyIvPgo8dGV4dCB4PSIyMCIgeT0iMjQiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Pz88L3RleHQ+Cjwvc3ZnPgo='">
                    ${item.link ? `<a href="${item.link}" target="_blank" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; opacity: 0;"></a>` : ''}
                </div>
                <div style="font-size: 10px; color: var(--text-primary); margin-bottom: 2px; font-weight: 500; margin-top: 1px;">
                    💎 ${tonPrice_item.toFixed(1)}
                </div>
                <div style="font-size: 10px; color: var(--text-secondary); margin-bottom: 2px;">
                    $ ${usdPrice.toFixed(2)}
                </div>
                <div style="font-size: 10px; color: var(--text-secondary); margin-bottom: 2px;">
                    ⭐️ ${starsPrice}
                </div>
            `;
            
            // Click handling now done via hidden link overlay
            
            gridContainer.appendChild(itemCard);
        });
        
        marketSection.appendChild(gridContainer);
    }
    
    resultsContainer.appendChild(marketSection);
}

function displayResults(results, tonPrice = 5.5) {
    // This function is kept for backward compatibility but not used
    console.log('displayResults called with:', results);
}



async function displayLastPurchases(purchases) {
    const container = document.getElementById('purchases-results');
    container.innerHTML = '';
    
    if (purchases.length === 0) {
        container.innerHTML = '<p class="no-results">No recent purchases found</p>';
        return;
    }
    
    // Get current TON price
    const currentTonPrice = await getTonPrice();
    
    purchases.forEach(purchase => {
        const purchaseDiv = document.createElement('div');
        purchaseDiv.className = 'purchase-item';
        
        const price = parseFloat(purchase.price) || 0;
        const isTon = purchase.isTon === true;
        
        // Use fragment.com image if slug is available
        const imageUrl = purchase.slug ? `https://nft.fragment.com/gift/${purchase.slug}.medium.jpg` : 
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzMzMzMzMyIvPgo8dGV4dCB4PSIyNCIgeT0iMjgiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Pz88L3RleHQ+Cjwvc3ZnPgo=';
        
        // Format date properly
        const purchaseDate = purchase.createdAt ? new Date(purchase.createdAt) : new Date(purchase.date);
        const formattedDate = purchaseDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        purchaseDiv.innerHTML = `
            <div style="position: relative; display: inline-block;">
                <img src="${imageUrl}" 
                     alt="${purchase.collectionName || purchase.gift}" 
                     class="purchase-image"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzMzMzMzMyIvPgo8dGV4dCB4PSIyNCIgeT0iMjgiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Pz88L3RleHQ+Cjwvc3ZnPgo='">
                ${purchase.slug ? `<a href="https://t.me/nft/${purchase.slug}" target="_blank" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; z-index: 1;">View NFT</a>` : ''}
            </div>
            <div class="purchase-details">
                <h4>${purchase.collectionName || purchase.gift}</h4>
                ${purchase.modelName ? `<p>Model: ${purchase.modelName}</p>` : ''}
                ${purchase.backdropName ? `<p>Backdrop: ${purchase.backdropName}</p>` : ''}
                ${purchase.patternName ? `<p>Pattern: ${purchase.patternName}</p>` : ''}
                <p class="purchase-date">${formattedDate}</p>
            </div>
            <div class="purchase-price">
                ${isTon ? 
                    `<span class="ton-price">💎 ${price.toFixed(2)} TON</span>` : 
                    `<span class="stars-price">⭐ ${price} Stars</span>`
                }
            </div>
        `;
        
        container.appendChild(purchaseDiv);
    });
}

/* --- UTILITY FUNCTIONS --- */
function formatPrice(item) {
    if (!item || !item.price) return 'N/A';
    
    const price = parseFloat(item.price);
    if (isNaN(price)) return 'N/A';
    
    const usdPrice = (price * tonPrice).toFixed(2);
    return `${price} TON (≈ $${usdPrice})`;
}

/* --- TELEGRAM MINI APP FUNCTIONS --- */

function clearSelection() {
    selectedGift = null;
    selectedModel = null;
    selectedBackdrop = null;
    

    
    // Clear UI
    const detailsContainer = document.getElementById('gift-details');
    if (detailsContainer) {
        detailsContainer.style.display = 'none';
    }
    
    // Show main grid
    const mainGrid = document.querySelector('.gifts-grid');
    if (mainGrid) {
        mainGrid.style.display = 'grid';
    }
}



function sendTelegramHaptic(type = 'impact', style = 'medium') {
    if (!isInTelegram || !tg || !tg.HapticFeedback) return;
    
    try {
        if (type === 'impact') {
            tg.HapticFeedback.impactOccurred(style); // light, medium, heavy
        } else if (type === 'notification') {
            tg.HapticFeedback.notificationOccurred(style); // error, success, warning
        } else if (type === 'selection') {
            tg.HapticFeedback.selectionChanged();
        }
    } catch (error) {
        console.log('Haptic feedback not available:', error);
    }
}

function showTelegramAlert(message, callback) {
    if (!isInTelegram || !tg) {
        alert(message);
        if (callback) callback();
        return;
    }
    
    tg.showAlert(message, callback);
}

function formatSavings(availablePrices) {
    if (availablePrices.length < 2) return '0 TON';
    
    const prices = availablePrices.map(mp => mp.price).sort((a, b) => a - b);
    const bestPrice = prices[0];
    const worstPrice = prices[prices.length - 1];
    const savings = worstPrice - bestPrice;
    const savingsPercent = ((savings / worstPrice) * 100).toFixed(1);
    
    return `${savings.toFixed(2)} TON (${savingsPercent}%)`;
}

function showLoading(message = 'Loading...') {
    const loadingEl = document.getElementById('loading');
    const loadingText = loadingEl.querySelector('.loading-text');
    if (loadingText) {
        loadingText.textContent = message;
    }
    loadingEl.style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

// Update theme toggle button text
const themeToggle = document.querySelector('.theme-toggle');
if (themeToggle) {
    themeToggle.textContent = savedTheme === 'dark' ? '🌙 Dark' : '☀️ Light';
}

// Store TON price globally for calculations
window.tonPrice = tonPrice;