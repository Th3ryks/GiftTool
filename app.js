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

/* --- ROUTING SYSTEM --- */
// Simplified initialization without routing
function initApp() {
    // Show main container by default
    const mainContainer = document.getElementById('main-container');
    if (mainContainer) {
        mainContainer.style.display = 'block';
        initMainPage();
    }
    
    // Hide last container by default
    const lastContainer = document.getElementById('last-container');
    if (lastContainer) {
        lastContainer.style.display = 'none';
    }
}

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
            return `${formatPrice(value)} TON`;
        case 'USD':
            return `$${formatPrice(value)}`;
        case 'STARS':
            return `${Math.round(value)} ⭐`;
        default:
            return `${formatPrice(value)} ${currency}`;
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
        
        // First: Fetch TG Market data
        await fetchAndDisplayMarketplace('TG Market', fetchTgMarketData, tonPrice);
        
        // Then: Fetch other marketplaces simultaneously
        const otherMarketplaces = [
            { name: 'Portals', fetchFunction: fetchPortalsData },
            { name: 'MRKT', fetchFunction: fetchMrktData },
            { name: 'Tonnel', fetchFunction: fetchTonnelData }
        ];
        
        await Promise.all(otherMarketplaces.map(marketplace => 
            fetchAndDisplayMarketplace(marketplace.name, marketplace.fetchFunction, tonPrice)
        ));
        
    } catch (error) {
        console.error('Failed to get gift prices:', error);
        showError('Failed to get gift prices. Please try again.');
    } finally {
        isLoadingPrices = false;
    }
}

async function fetchAndDisplayMarketplace(marketplaceName, fetchFunction, tonPrice) {
    const maxRetries = 5;
    let attempt = 0;
    
    while (attempt < maxRetries) {
        try {
            const data = await fetchFunction();
            displayMarketplaceResults(marketplaceName, data, tonPrice);
            return;
        } catch (error) {
            attempt++;
            
            // Check if it's a 429 error (rate limit)
            if (error.message.includes('429') && attempt < maxRetries) {
                const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
                console.warn(`${marketplaceName} rate limited (429), retrying in ${waitTime/1000} seconds... (attempt ${attempt}/${maxRetries})`);
                await delay(waitTime);
                continue;
            }
            
            console.error(`Failed to fetch ${marketplaceName} data:`, error);
            displayMarketplaceResults(marketplaceName, [], tonPrice, true);
            return;
        }
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
            const url = new URL(`${API_CONFIG.giftSatellite.baseUrl}/tg-market/search/${encodeURIComponent(selectedGift.name)}`);
            url.searchParams.append('models', selectedModel ? selectedModel.name : '');
            url.searchParams.append('backdrops', selectedBackdrop ? selectedBackdrop.name : '');
            
            const response = await fetch(url, {
                method: 'GET',
                headers: API_CONFIG.giftSatellite.headers,
                mode: 'cors'
            });
            
            if (response.ok) {
                return await response.json();
            } else if (response.status === 429) {
                throw new Error(`429 - Rate limit exceeded`);
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
            const url = new URL(`${API_CONFIG.searchSatellite.baseUrl}/portals/api/search/${encodeURIComponent(selectedGift.name)}`);
            url.searchParams.append('models', selectedModel ? selectedModel.name : '');
            url.searchParams.append('backdrops', selectedBackdrop ? selectedBackdrop.name : '');
            
            const response = await fetch(url, {
                method: 'GET',
                headers: API_CONFIG.searchSatellite.headers,
                mode: 'cors'
            });
            
            if (response.ok) {
                return await response.json();
            } else if (response.status === 429) {
                throw new Error(`429 - Rate limit exceeded`);
            } else if (response.status === 500 && attempt < maxRetries) {
                console.warn(`Portals server error, retrying in ${attempt * 2} seconds...`);
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
    const url = new URL(`${API_CONFIG.searchSatellite.baseUrl}/mrkt/api/search/${encodeURIComponent(selectedGift.name)}`);
    url.searchParams.append('models', selectedModel ? selectedModel.name : '');
    url.searchParams.append('backdrops', selectedBackdrop ? selectedBackdrop.name : '');
    
    const response = await fetch(url, {
        method: 'GET',
        headers: API_CONFIG.searchSatellite.headers,
        mode: 'cors'
    });
    
    if (response.status === 429) {
        throw new Error(`429 - Rate limit exceeded`);
    }
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

async function fetchTonnelData() {
    const url = new URL(`${API_CONFIG.searchSatellite.baseUrl}/tonnel/api/search/${encodeURIComponent(selectedGift.name)}`);
    url.searchParams.append('models', selectedModel ? selectedModel.name : '');
    url.searchParams.append('backdrops', selectedBackdrop ? selectedBackdrop.name : '');
    
    const response = await fetch(url, {
        method: 'GET',
        headers: API_CONFIG.searchSatellite.headers
    });
    
    if (response.status === 429) {
        throw new Error(`429 - Rate limit exceeded`);
    }
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

async function getLastPurchases() {
    // Use modal elements
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
        
        // Hide search form in Last Purchases after getting results
        if (purchases.length > 0) {
            // Hide search section in last purchases container
            const purchaseSearchSection = document.querySelector('#last-purchases-container .search-section');
            if (purchaseSearchSection) {
                purchaseSearchSection.style.display = 'none';
            }
        }
        
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
        // Only close modal if clicking directly on the modal backdrop, not on modal content
        if (e.target.classList.contains('modal') && !e.target.closest('.modal-content')) {
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
        if (query.length < 1) {
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
    
    // Add grid class for >2 results
    const gridClass = gifts.length > 2 ? 'dropdown-grid' : '';
    dropdown.className = `search-dropdown ${gridClass}`;
    
    dropdown.innerHTML = gifts.map(gift => `
        <div class="dropdown-item vertical" onclick="selectGift('${gift._id}', '${gift.name.replace(/'/g, "\\'")}')">            <div style="position: relative; display: inline-block;">
                <img src="${gift.imageUrl}" 
                     alt="${gift.name}" 
                     class="dropdown-image"
                     style="display: ${gift.imageUrl ? 'block' : 'none'}">
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
    
    // Add grid class for >2 results
    const gridClass = models.length > 2 ? 'dropdown-grid' : '';
    dropdown.className = `search-dropdown ${gridClass}`;
    
    dropdown.innerHTML = models.map(model => `
        <div class="dropdown-item vertical" onclick="selectModel('${model._id}', '${model.name.replace(/'/g, "\\'")}')">            <img src="https://storage.googleapis.com/portals-market/gifts/${encodeURIComponent(selectedGift?.name?.replace(/[^a-zA-Z]/g, '').toLowerCase() || '')}/models/png/${encodeURIComponent(model.name?.replace(/[^a-zA-Z]/g, '').toLowerCase() || '')}.png" 
                 alt="${model.name}" 
                 class="dropdown-image"
                 style="display: block">
            <span>${model.name}</span>
            <small class="rarity">Rarity: ${model.rarity ? (model.rarity / 10).toFixed(1) : 'Unknown'}</small>
        </div>
    `).join('');
    
    dropdown.style.display = 'block';
}

function displayBackdropDropdown(backdrops, dropdown, input) {
    if (backdrops.length === 0) {
        dropdown.style.display = 'none';
        return;
    }
    
    // Add grid class for >2 results
    const gridClass = backdrops.length > 2 ? 'dropdown-grid' : '';
    dropdown.className = `search-dropdown ${gridClass}`;
    
    dropdown.innerHTML = backdrops.map(backdrop => `
        <div class="dropdown-item vertical" onclick="selectBackdrop('${backdrop._id}', '${backdrop.name.replace(/'/g, "\\'")}')">            <div class="backdrop-preview" style="
                background: linear-gradient(135deg, ${backdrop.hex?.centerColor || backdrop.color || '#333333'} 0%, ${backdrop.hex?.edgeColor || backdrop.color || '#333333'} 100%);
                width: 36px;
                height: 36px;
                border-radius: 8px;
                margin-bottom: 8px;
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
        modelInput.disabled = false;
        modelInput.placeholder = 'Select model...';
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
async function handlePurchaseGiftSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const dropdown = document.getElementById('purchase-gift-dropdown');
    
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    searchTimeout = setTimeout(async () => {
        if (query.length < 1) {
            if (dropdown) dropdown.style.display = 'none';
            return;
        }
        
        const filtered = collections.filter(gift => 
            gift.name.toLowerCase().includes(query)
        ).slice(0, 10);
        
        displayPurchaseGiftDropdown(filtered, dropdown, e.target);
        
        // Auto-load models and backdrops for the first matching gift
        if (filtered.length > 0) {
            const firstGift = filtered[0].name;
            try {
                // Load models and backdrops in parallel
                await Promise.all([
                    loadModels(firstGift),
                    loadBackdrops(firstGift)
                ]);
            } catch (error) {
                console.log(`Failed to preload data for ${firstGift}:`, error);
            }
        }
    }, 300);
}

async function handlePurchaseModelSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const dropdown = document.getElementById('purchase-model-dropdown');
    
    if (query.length < 1) {
        if (dropdown) dropdown.style.display = 'none';
        return;
    }
    
    // Get selected gift name
    const giftInput = document.getElementById('purchase-gift-search');
    const selectedGift = giftInput ? giftInput.value.trim() : '';
    
    if (!selectedGift) {
        if (dropdown) dropdown.style.display = 'none';
        return;
    }
    
    try {
        // Load models for the selected gift
        const giftModels = await loadModels(selectedGift);
        const filtered = giftModels.filter(model => 
            model.name.toLowerCase().includes(query)
        ).slice(0, 10);
        
        displayPurchaseModelDropdown(filtered, dropdown, e.target);
    } catch (error) {
        console.error('Failed to load models for search:', error);
        if (dropdown) dropdown.style.display = 'none';
    }
}

function handlePurchaseBackdropSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const dropdown = document.getElementById('purchase-backdrop-dropdown');
    
    if (query.length < 1) {
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
        <div class="dropdown-item" onclick="selectPurchaseGift('${gift._id}', '${gift.name.replace(/'/g, "\\'")}')">            <img src="${gift.imageUrl}" 
                 alt="${gift.name}" 
                 class="dropdown-image"
                 style="display: ${gift.imageUrl ? 'block' : 'none'}">
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
        <div class="dropdown-item vertical" onclick="selectPurchaseModel('${model._id}', '${model.name.replace(/'/g, "\\'")}')">            <img src="${selectedGift?.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjM2IiBoZWlnaHQ9IjM2IiByeD0iOCIgZmlsbD0iIzMzMzMzMyIvPgo8dGV4dCB4PSIxOCIgeT0iMjIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Pz88L3RleHQ+Cjwvc3ZnPgo='}" 
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
    
    // Add grid class for >2 results
    const gridClass = backdrops.length > 2 ? 'dropdown-grid' : '';
    dropdown.className = `dropdown ${gridClass}`;
    
    dropdown.innerHTML = backdrops.map(backdrop => `
        <div class="dropdown-item vertical" onclick="selectPurchaseBackdrop('${backdrop._id}', '${backdrop.name.replace(/'/g, "\\'")}')">            <div class="backdrop-preview" style="background: ${backdrop.color || '#333333'}; width: 36px; height: 36px; border-radius: 8px; margin-bottom: 8px; border: 2px solid var(--border); flex-shrink: 0;"></div>
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
    
    // Add grid class for >2 results
    const gridClass = models.length > 2 ? 'dropdown-grid' : '';
    dropdown.className = `dropdown ${gridClass}`;
    
    // Get gift name from purchase gift input
    const giftInput = document.getElementById('purchase-gift-search');
    const giftName = giftInput ? giftInput.value.trim() : '';
    
    dropdown.innerHTML = models.map(model => `
        <div class="dropdown-item vertical" onclick="selectPurchaseModel('${model._id}', '${model.name.replace(/'/g, "\'")}')">            <img src="https://storage.googleapis.com/portals-market/gifts/${encodeURIComponent(giftName?.replace(/[^a-zA-Z]/g, '').toLowerCase() || '')}/models/png/${encodeURIComponent(model.name?.replace(/[^a-zA-Z]/g, '').toLowerCase() || '')}.png" 
                 alt="${model.name}" 
                 class="dropdown-image"
                 style="display: block">
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
        <div class="dropdown-item vertical" onclick="selectPurchaseBackdrop('${backdrop._id}', '${backdrop.name.replace(/'/g, "\'")}')">            <div class="backdrop-preview" style="background: ${getBackdropStyle(backdrop.name)}; width: 36px; height: 36px; border-radius: 8px; margin-bottom: 8px; border: 2px solid var(--border); flex-shrink: 0;"></div>
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
function toggleLastPurchases() {
    const lastPurchasesContainer = document.getElementById('last-purchases-container');
    const isLastPurchasesVisible = lastPurchasesContainer && lastPurchasesContainer.style.display === 'block';
    
    if (isLastPurchasesVisible) {
        // If Last Purchases is currently visible, clear fields and results
        clearLastPurchasesData();
    } else {
        // If Search is visible, switch to Last Purchases
        openLastPurchases();
    }
}

function clearLastPurchasesData() {
    // Clear input fields
    const giftInput = document.getElementById('purchase-gift-search');
    const modelInput = document.getElementById('purchase-model-search');
    const backdropInput = document.getElementById('purchase-backdrop-search');
    
    if (giftInput) giftInput.value = '';
    if (modelInput) {
        modelInput.value = '';
        modelInput.disabled = true;
        modelInput.placeholder = 'First select a gift...';
    }
    if (backdropInput) backdropInput.value = '';
    
    // Clear results
    const purchasesResults = document.getElementById('purchases-results');
    if (purchasesResults) {
        purchasesResults.innerHTML = '';
        purchasesResults.style.display = 'none';
    }
    
    // Reset Get Purchases button
    const getPurchasesBtn = document.getElementById('get-purchases-btn');
    if (getPurchasesBtn) {
        getPurchasesBtn.innerHTML = '<span>📊</span> Get Purchases';
        getPurchasesBtn.onclick = getLastPurchases;
        getPurchasesBtn.disabled = true;
    }
    
    // Show the search form again
    const purchaseSearchSection = document.querySelector('#last-purchases-container .search-section');
    if (purchaseSearchSection) {
        purchaseSearchSection.style.display = 'block';
    }
}

function openLastPurchases() {
    // Set active tab
    setActiveTab('openLastPurchases');
    
    // Hide main search section but keep it accessible for return
    const searchSection = document.querySelector('.search-section');
    if (searchSection) {
        searchSection.style.display = 'none';
    }
    
    // Hide results section
    const resultsContainer = document.getElementById('results-section');
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
        resultsContainer.classList.remove('active');
    }
    
    // Show last purchases container
    const lastPurchasesContainer = document.getElementById('last-purchases-container');
    if (lastPurchasesContainer) {
        lastPurchasesContainer.style.display = 'block';
    }
    
    // Show the search form within Last Purchases
    const purchaseSearchSection = document.querySelector('#last-purchases-container .search-section');
    if (purchaseSearchSection) {
        purchaseSearchSection.style.display = 'block';
    }
    
    // Initialize purchase search functionality
    initializePurchaseSearch();
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
        
        // Clear input fields
        const giftInput = document.getElementById('purchase-gift-search');
        const modelInput = document.getElementById('purchase-model-search');
        const backdropInput = document.getElementById('purchase-backdrop-search');
        
        if (giftInput) giftInput.value = '';
        if (modelInput) {
            modelInput.value = '';
            modelInput.disabled = true;
            modelInput.placeholder = 'First select a gift...';
        }
        if (backdropInput) backdropInput.value = '';
        
        // Restore main search section visibility
        const mainSearchSection = document.querySelector('.search-section');
        if (mainSearchSection) {
            mainSearchSection.style.display = 'block';
        }
        
        // Restore action buttons visibility
        const actionButtons = document.querySelector('.action-buttons');
        if (actionButtons) {
            actionButtons.style.display = 'flex';
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
        <div class="dropdown-item vertical" onclick="selectPurchaseGift('${gift._id}', '${gift.name.replace(/'/g, "\\'")}')">            <div style="position: relative; display: inline-block;">
                <img src="${gift.imageUrl}" 
                 alt="${gift.name}" 
                 class="dropdown-image"
                 style="display: ${gift.imageUrl ? 'block' : 'none'}">
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
        
        // Enable model input
        const modelInput = document.getElementById('purchase-model-search');
        if (modelInput) {
            modelInput.disabled = false;
            modelInput.placeholder = 'Select model...';
            modelInput.value = '';
        }
        
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

function setActiveTab(tabName) {
    // Remove active class from all tabs
    const allTabs = document.querySelectorAll('.header-nav-btn');
    allTabs.forEach(tab => tab.classList.remove('active'));
    
    // Add active class to specified tab
    let activeTab;
    if (tabName === 'openLastPurchases') {
        activeTab = document.querySelector('.header-nav-btn[onclick*="toggleLastPurchases"]');
    } else {
        activeTab = document.querySelector(`.header-nav-btn[onclick*="${tabName}"]`);
    }
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

function showSearchMenu() {
    // Set active tab
    setActiveTab('showSearchMenu');
    
    // Hide last purchases container
    const lastPurchasesContainer = document.getElementById('last-purchases-container');
    if (lastPurchasesContainer) {
        lastPurchasesContainer.style.display = 'none';
    }
    
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
    
    // Clear Last Purchases results
    const purchasesResults = document.getElementById('purchases-results');
    if (purchasesResults) {
        purchasesResults.innerHTML = '';
        purchasesResults.style.display = 'none';
    }
    
    // Reset Get Purchases button
    const getPurchasesBtn = document.getElementById('get-purchases-btn');
    if (getPurchasesBtn) {
        getPurchasesBtn.innerHTML = '<span>📊</span> Get Purchases';
        getPurchasesBtn.onclick = getLastPurchases;
        getPurchasesBtn.disabled = true;
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
    if (modelInput) {
        modelInput.value = '';
        modelInput.disabled = true;
        modelInput.placeholder = 'First select a gift...';
    }
    
    // Clear Last Purchases input fields
    const purchaseGiftInput = document.getElementById('purchase-gift-search');
    const purchaseModelInput = document.getElementById('purchase-model-search');
    const purchaseBackdropInput = document.getElementById('purchase-backdrop-search');
    
    if (purchaseGiftInput) purchaseGiftInput.value = '';
    if (purchaseModelInput) purchaseModelInput.value = '';
    if (purchaseBackdropInput) purchaseBackdropInput.value = '';
    
    // Show Last Purchases search form again
    const purchaseSearchSection = document.querySelector('#last-purchases-container .search-section');
    if (purchaseSearchSection) {
        purchaseSearchSection.style.display = 'block';
    }
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

function formatPrice(price) {
    if (price === null || price === undefined || isNaN(price)) return 'N/A';
    const rounded = Math.round(price * 100) / 100;
    if (rounded % 1 === 0) {
        return rounded.toString();
    }
    const formatted = rounded.toFixed(2);
    return formatted.replace(/\.?0+$/, '');
}

// Price adjustment state tracking


async function refreshMarketplaceDisplay(marketplace) {
    if (!selectedGift) return;
    
    const currentTonPrice = window.tonPrice || 5.5;
    
    // Get the appropriate fetch function
    let fetchFunction;
    switch (marketplace) {
        case 'TG Market':
            fetchFunction = fetchTgMarketData;
            break;
        case 'Portals':
            fetchFunction = fetchPortalsData;
            break;
        case 'MRKT':
            fetchFunction = fetchMrktData;
            break;
        case 'Tonnel':
            fetchFunction = fetchTonnelData;
            break;
        default:
            return;
    }
    
    try {
        const data = await fetchFunction();
        displayMarketplaceResults(marketplace, data, currentTonPrice);
    } catch (error) {
        console.error(`Failed to refresh ${marketplace} data:`, error);
        displayMarketplaceResults(marketplace, [], currentTonPrice, true);
    }
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
    
    // Header with logo, name and price adjustment toggles
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
    `;
    
    const titleSection = document.createElement('div');
    titleSection.style.cssText = `
        display: flex;
        align-items: center;
    `;
    titleSection.innerHTML = `
        <span style="margin-right: 12px;">${getMarketplaceLogo(marketplace)}</span>
        ${marketplace}
    `;
    
    const toggleSection = document.createElement('div');
    toggleSection.style.cssText = `
        display: flex;
        gap: 8px;
        align-items: center;
    `;
    
    // Create appropriate toggle button based on marketplace

    
    header.appendChild(titleSection);
    header.appendChild(toggleSection);
    
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
            
            // Add 6% markup only for tonnel marketplace
            if (marketplace.toLowerCase().includes('tonnel')) {
                tonPrice_item = tonPrice_item * 1.06;
            }
            
            const usdPrice = tonPrice_item * tonPrice;
            const starsPrice = Math.round(usdPrice / 0.015);
            
            const imageUrl = item.slug ? 
                `https://nft.fragment.com/gift/${item.slug}.medium.jpg` : 
                selectedGift?.imageUrl;
            
            itemCard.innerHTML = `
                <div style="position: relative; display: inline-block; margin-bottom: 2px;">
                    <img src="${imageUrl}" 
                         alt="${item.name || selectedGift?.name || 'Gift'}" 
                         style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border); position: relative; z-index: 1;" 
                         style="display: ${selectedGift?.imageUrl ? 'block' : 'none'}">
                    ${item.link ? `<a href="${item.link}" target="_blank" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; opacity: 0;"></a>` : ''}
                </div>
                <div style="font-size: 10px; color: var(--text-primary); margin-bottom: 2px; font-weight: 500; margin-top: 1px;">
                    ${getTonIcon()} ${formatPrice(tonPrice_item)}
                </div>
                <div style="font-size: 10px; color: var(--text-secondary); margin-bottom: 2px;">
                    ${getUsdtIcon()} ${formatPrice(usdPrice)}
                </div>
                <div style="font-size: 10px; color: var(--text-secondary); margin-bottom: 2px;">
                    ${getStarsIcon()} ${starsPrice}
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
    // Use modal container
    const container = document.getElementById('purchases-results');
    if (!container) {
        console.error('purchases-results container not found');
        return;
    }
    
    container.innerHTML = '';
    
    // Make sure the container is visible
    container.style.display = 'block';
    container.style.visibility = 'visible';
    container.style.opacity = '1';
    
    if (purchases.length === 0) {
        container.innerHTML = '<p class="no-results">No recent purchases found</p>';
        return;
    }
    
    // Create responsive grid container
    const gridContainer = document.createElement('div');
    gridContainer.className = 'purchases-grid-container';
    
    for (const purchase of purchases) {
        const price = parseFloat(purchase.price) || 0;
        const isTon = purchase.isTon === true;
        
        // Use fragment.com image if slug is available
        const imageUrl = purchase.slug ? `https://nft.fragment.com/gift/${purchase.slug}.medium.jpg` : null;
        
        // Format date in modern style
        const purchaseDate = purchase.createdAt ? new Date(purchase.createdAt) : new Date(purchase.date);
        const formattedDate = purchaseDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit'
        }) + ' ' + purchaseDate.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const card = document.createElement('div');
        card.className = 'purchase-card';
        
        card.innerHTML = `
            <div class="purchase-card-header">
                <div class="gift-info">
                    <div class="gift-image-container">
                        <img src="${imageUrl}" 
                             alt="${purchase.collectionName || purchase.gift}" 
                             class="gift-image"
                             style="display: block">
                        ${purchase.slug ? `<a href="https://t.me/nft/${purchase.slug}" target="_blank" class="gift-link"></a>` : ''}
                    </div>
                    <div class="gift-details">
                        <div class="gift-name">🎁 ${purchase.collectionName || purchase.gift}</div>
                        <div class="purchase-date">📅 ${formattedDate}</div>
                    </div>
                </div>
                <div class="price-info">
                    ${isTon ? 
                        `<div class="price-ton">${getTonIcon()} ${formatPrice(price)}</div>` : 
                        `<div class="price-stars">${getStarsIcon()} ${price}</div>`
                    }
                </div>
            </div>
            <div class="purchase-card-body">
                <div class="backdrop-info">
                    <span class="info-label">🖼️ Backdrop:</span>
                    ${purchase.backdropName ? 
                        `<div class="backdrop-display">
                            <div class="backdrop-preview" style="background: ${getBackdropStyle(purchase.backdropName)};"></div>
                            <span>${purchase.backdropName}</span>
                        </div>` : 
                        '<span class="no-data">-</span>'
                    }
                </div>
                <div class="model-info">
                    <span class="info-label">👤 Model:</span>
                    ${purchase.modelName && (purchase.collectionName || purchase.gift) && (purchase.collectionName || purchase.gift).trim() !== '' ? 
                        `<div class="model-display">
                            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Crect width='36' height='36' fill='%23333' rx='8'/%3E%3Ctext x='18' y='22' text-anchor='middle' fill='white' font-size='10'%3E?%3C/text%3E%3C/svg%3E" 
                                 alt="${purchase.modelName}" 
                                 class="model-image"
                                 data-gift="${purchase.collectionName || purchase.gift}"
                                 data-model="${purchase.modelName}"
                                 onload="loadModelImage(this)"
                                 style="width: 36px; height: 36px; border-radius: 8px;">
                            <span>${purchase.modelName}</span>
                        </div>` : 
                        '<span class="no-data">-</span>'
                    }
                </div>
            </div>
        `;
        
        gridContainer.appendChild(card);
    }
    
    container.appendChild(gridContainer);
}

/* --- MODEL UTILITIES --- */
function loadModelImage(imgElement) {
    const giftName = imgElement.getAttribute('data-gift');
    const modelName = imgElement.getAttribute('data-model');
    
    if (!giftName || !modelName || giftName.trim() === '') return;
    
    // Load image asynchronously without blocking
    getModelImageUrl(giftName, modelName).then(url => {
        if (url && url !== imgElement.src) {
            imgElement.src = url;
        }
    }).catch(error => {
        console.log(`Failed to load model image for ${modelName}:`, error);
    });
}

async function getModelImageUrl(giftName, modelName) {
    if (!giftName || !modelName || giftName.trim() === '' || modelName.trim() === '') {
        return null;
    }
    
    // Create proper URL format: /gifts/{giftname}/models/png/{modelname}.png
    const giftNameFormatted = giftName.trim().replace(/[^a-zA-Z]/g, '').toLowerCase();
    const modelNameFormatted = modelName.trim().replace(/[^a-zA-Z]/g, '').toLowerCase();
    
    // Double check that formatted names are not empty
    if (!giftNameFormatted || !modelNameFormatted) {
        return null;
    }
    
    const imageUrl = `https://storage.googleapis.com/portals-market/gifts/${giftNameFormatted}/models/png/${modelNameFormatted}.png`;
    
    return imageUrl;
}

/* --- BACKDROP UTILITIES --- */
function getBackdropStyle(backdropName) {
    if (!backdropName || backdrops.length === 0) {
        return '#333333';
    }
    
    const backdrop = backdrops.find(b => b.name === backdropName);
    if (!backdrop) {
        return '#333333';
    }
    
    // Use gradient if hex colors are available
    if (backdrop.hex && backdrop.hex.centerColor && backdrop.hex.edgeColor) {
        return `linear-gradient(135deg, ${backdrop.hex.centerColor} 0%, ${backdrop.hex.edgeColor} 100%)`;
    }
    
    // Fallback to solid color
    return backdrop.color || '#333333';
}

/* --- CURRENCY ICONS --- */
function getTonIcon() {
    return `<svg width="12" height="12" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 2px;"><path d="M28 56C43.464 56 56 43.464 56 28C56 12.536 43.464 0 28 0C12.536 0 0 12.536 0 28C0 43.464 12.536 56 28 56Z" fill="#0098EA"></path><path d="M37.5603 15.6277H18.4386C14.9228 15.6277 12.6944 19.4202 14.4632 22.4861L26.2644 42.9409C27.0345 44.2765 28.9644 44.2765 29.7345 42.9409L41.5381 22.4861C43.3045 19.4251 41.0761 15.6277 37.5627 15.6277H37.5603ZM26.2548 36.8068L23.6847 31.8327L17.4833 20.7414C17.0742 20.0315 17.5795 19.1218 18.4362 19.1218H26.2524V36.8092L26.2548 36.8068ZM38.5108 20.739L32.3118 31.8351L29.7417 36.8068V19.1194H37.5579C38.4146 19.1194 38.9199 20.0291 38.5108 20.739Z" fill="white"></path></svg>`;
}

function getStarsIcon() {
    return `<svg width="12" height="12" viewBox="0 0 20 20" fill="none" style="display: inline-block; vertical-align: middle; margin-right: 2px;"><g clip-path="url(#clip0_4913_7387)"><mask id="svg-mdgig6tw3bc1mlcljdv-mask1" maskUnits="userSpaceOnUse" x="-2" y="-2" width="24" height="24" style="mask-type: luminance;"><path d="M21.416 -1.42493H-1.08398V21.0751H21.416V-1.42493Z" fill="white"></path></mask><g mask="url(#svg-mdgig6tw3bc1mlcljdv-mask1)"><mask id="svg-mdgig6tw3bc1mlcljdv-mask2" maskUnits="userSpaceOnUse" x="-2" y="-2" width="24" height="24" style="mask-type: luminance;"><path d="M-1.08398 -1.42493H21.416V21.0751H-1.08398V-1.42493Z" fill="white"></path></mask><g mask="url(#svg-mdgig6tw3bc1mlcljdv-mask2)"><path d="M7.26843 6.25162L9.28943 2.22541C9.52311 1.76121 10.0884 1.5749 10.5494 1.80857C10.7294 1.90015 10.8747 2.04857 10.9662 2.23172L12.8767 6.11583C13.0314 6.43477 13.3378 6.64951 13.6883 6.69056L17.6829 7.17055C18.2261 7.23686 18.6145 7.73264 18.5513 8.27894C18.5229 8.50314 18.4218 8.71156 18.2608 8.86945L15.0998 11.9862C14.9703 12.1125 14.9103 12.2894 14.9324 12.4694L15.4598 16.6756C15.5356 17.2787 15.1093 17.8282 14.5093 17.904C14.2819 17.9324 14.0546 17.8913 13.8525 17.7808L10.5147 15.9556C10.2715 15.823 9.98099 15.8198 9.73784 15.9461L6.27687 17.7208C5.79057 17.9703 5.1969 17.7745 4.94743 17.285C4.8527 17.1019 4.82112 16.8966 4.84954 16.6945L5.12427 14.7619C5.26006 13.8177 5.84425 12.9967 6.69055 12.5641L10.5305 10.6031C10.6315 10.5526 10.6726 10.4263 10.622 10.322C10.581 10.2431 10.4957 10.1957 10.4073 10.2084L5.70847 10.8841C4.99164 10.9852 4.26535 10.7831 3.7001 10.322L2.13698 9.04629C1.69173 8.68314 1.6191 8.02 1.98225 7.57159C2.15277 7.36317 2.39592 7.22739 2.66118 7.19265L6.6716 6.67793C6.92739 6.64319 7.15159 6.4853 7.26843 6.25162Z" fill="url(#svg-mdgig6tw3bc1mlcljdv-gradient1)"></path><path d="M10.8242 2.9422C10.4168 2.85062 9.98417 3.0464 9.78839 3.43797L7.76423 7.46419C7.64739 7.69787 7.42634 7.85576 7.1674 7.89049L3.15698 8.40837C2.89804 8.44311 2.6612 8.56942 2.49384 8.76837L3.97801 9.98097C4.44537 10.3631 5.05167 10.5304 5.64849 10.4452L10.3442 9.77255C10.6221 9.73466 10.8936 9.8736 11.0168 10.1231C11.1778 10.442 11.0515 10.8336 10.7326 10.9978L9.50734 11.623L10.9031 11.4209C10.9915 11.4083 11.0799 11.4557 11.1178 11.5346C11.1715 11.6388 11.1273 11.7651 11.0263 11.8157L7.18635 13.7767C6.34006 14.2093 5.75586 15.0303 5.62007 15.9745L5.44008 17.2282C5.60428 17.3924 5.86322 17.4366 6.07796 17.326L9.53261 15.5514C9.90839 15.3587 10.3536 15.365 10.7231 15.5671L14.0609 17.3924C14.1809 17.4587 14.3199 17.4839 14.4556 17.4682C14.8093 17.4239 15.0651 17.0955 15.0209 16.7324L14.4967 12.523C14.4588 12.2072 14.5662 11.8946 14.7904 11.6736L17.9513 8.55679C18.005 8.50311 18.0461 8.43995 18.0745 8.37048L14.1841 7.90312C13.8336 7.86207 13.5304 7.64418 13.3725 7.3284L13.2209 7.01578C12.902 6.87683 12.6399 6.63052 12.482 6.31159L10.8242 2.9422Z" fill="url(#svg-mdgig6tw3bc1mlcljdv-gradient2)"></path><path d="M10.7484 1.41397C10.0663 1.06977 9.23893 1.3445 8.89789 2.02659L6.87373 6.05596C6.8232 6.15701 6.72531 6.22649 6.61478 6.23912L2.60436 6.757C2.22542 6.80437 1.87806 7.00015 1.63807 7.29699C1.12334 7.93486 1.22124 8.86958 1.85596 9.38746L3.42223 10.6664C4.08222 11.2032 4.93167 11.44 5.77165 11.32L9.09051 10.8432L6.48847 12.1727C5.51271 12.6716 4.84325 13.6126 4.68852 14.6989L4.41063 16.6315C4.36958 16.9252 4.41695 17.222 4.55273 17.4873C4.90956 18.1915 5.77481 18.4725 6.479 18.1125L9.93681 16.3378C10.0505 16.2778 10.1863 16.281 10.3 16.3441L13.6378 18.1662C13.9188 18.3209 14.2441 18.3841 14.563 18.343C15.4061 18.2357 15.9998 17.462 15.8956 16.622L15.3714 12.4126C15.3651 12.3716 15.3809 12.3274 15.4093 12.299L18.5703 9.1822C18.8008 8.95168 18.9492 8.65169 18.9871 8.32959C19.0787 7.5433 18.5229 6.82963 17.7366 6.73489L13.7388 6.25491C13.5399 6.2328 13.363 6.10649 13.2715 5.92334L11.3641 2.03606C11.2315 1.76765 11.0136 1.54976 10.7484 1.41397ZM9.68418 2.42132C9.80734 2.17501 10.1073 2.07712 10.3505 2.20027C10.4452 2.24764 10.5242 2.32974 10.5715 2.42763L12.482 6.31175C12.7031 6.76332 13.1357 7.06962 13.6346 7.12962L17.6324 7.60961C17.9324 7.64435 18.1471 7.91908 18.1124 8.22538C18.0966 8.3517 18.0398 8.46854 17.9513 8.55695L14.7904 11.6737C14.5662 11.8948 14.4588 12.2074 14.4967 12.5232L15.0209 16.7325C15.0651 17.0957 14.8093 17.4241 14.4556 17.4683C14.3199 17.4841 14.1809 17.4588 14.0609 17.3925L10.7231 15.5673C10.3536 15.3652 9.90839 15.362 9.53261 15.5547L6.0748 17.3294C5.80638 17.4652 5.47797 17.3578 5.33903 17.0862C5.2885 16.9852 5.26956 16.8683 5.28534 16.7546L5.56007 14.8252C5.67376 14.0231 6.17269 13.3253 6.88952 12.959L10.7294 10.9979C11.0515 10.8337 11.1778 10.4422 11.0168 10.1232C10.8905 9.87376 10.6221 9.73482 10.3442 9.77271L5.64534 10.4453C5.04851 10.5306 4.44537 10.3632 3.97801 9.98113L2.41489 8.70221C2.15595 8.49064 2.1149 8.10854 2.32647 7.8496C2.42436 7.72961 2.56331 7.65066 2.71488 7.63171L6.72531 7.11383C7.12951 7.06331 7.48003 6.81384 7.66318 6.45069L9.68418 2.42132Z" fill="url(#svg-mdgig6tw3bc1mlcljdv-gradient3)"></path></g></g></g><defs><linearGradient id="svg-mdgig6tw3bc1mlcljdv-gradient1" x1="10.1547" y1="1.70752" x2="10.1547" y2="17.9134" gradientUnits="userSpaceOnUse"><stop stop-color="#FFF0C2"></stop><stop offset="1" stop-color="#FFEBBA"></stop></linearGradient><linearGradient id="svg-mdgig6tw3bc1mlcljdv-gradient2" x1="10.2842" y1="2.92009" x2="14.7304" y2="17.4713" gradientUnits="userSpaceOnUse"><stop stop-color="#FFD147"></stop><stop offset="1" stop-color="#FFB526"></stop></linearGradient><linearGradient id="svg-mdgig6tw3bc1mlcljdv-gradient3" x1="10.1547" y1="1.26556" x2="14.0546" y2="18.3525" gradientUnits="userSpaceOnUse"><stop stop-color="#E58F0D"></stop><stop offset="1" stop-color="#EB7814"></stop></linearGradient><clipPath id="clip0_4913_7387"><rect width="20" height="20" fill="white"></rect></clipPath></defs></svg>`;
}

function getUsdtIcon() {
    return `<svg width="12" height="12" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 2px;"><g fill="none" fill-rule="evenodd"><circle cx="16" cy="16" r="16" fill="#26A17B"></circle><path fill="#FFF" d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117"></path></g></svg>`;
}

/* --- UTILITY FUNCTIONS --- */
function formatPriceWithUsd(item) {
    if (!item || !item.price) return 'N/A';
    
    const price = parseFloat(item.price);
    if (isNaN(price)) return 'N/A';
    
    const tonPriceValue = window.tonPrice || 5.5;
    const usdPrice = formatPrice(price * tonPriceValue);
    return `${formatPrice(price)} TON (≈ $${usdPrice})`;
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
    const savingsPercent = formatPrice((savings / worstPrice) * 100);
    
    return `${formatPrice(savings)} TON (${savingsPercent}%)`;
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

/* --- PAGE INITIALIZATION FUNCTIONS --- */
function initMainPage() {
    // Initialize main search page
    loadCollections();
    loadBackdrops();
}

function initLastPage() {
    // Initialize last purchases page
    loadCollections();
    loadBackdrops();
    
    // Setup search functionality for last purchases page
    setupLastPageSearch();
}

function setupLastPageSearch() {
    const giftInput = document.getElementById('last-gift-search');
    const modelInput = document.getElementById('last-model-search');
    const backdropInput = document.getElementById('last-backdrop-search');
    const getBtn = document.getElementById('get-last-purchases-btn');
    
    if (giftInput) {
        giftInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                displayLastGiftDropdown(query);
            } else {
                hideDropdown('last-gift-dropdown');
                modelInput.disabled = true;
                modelInput.placeholder = 'First select a gift...';
                getBtn.disabled = true;
            }
        });
    }
    
    if (modelInput) {
        modelInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length >= 1 && selectedGift) {
                displayLastModelDropdown(query);
            } else {
                hideDropdown('last-model-dropdown');
            }
        });
    }
    
    if (backdropInput) {
        backdropInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length >= 1) {
                displayLastBackdropDropdown(query);
            } else {
                hideDropdown('last-backdrop-dropdown');
            }
        });
    }
}

function displayLastGiftDropdown(query) {
    const filteredGifts = collections.filter(gift => 
        gift.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
    
    const dropdown = document.getElementById('last-gift-dropdown');
    const resultsContainer = document.getElementById('last-gift-results');
    
    if (filteredGifts.length === 0) {
        dropdown.style.display = 'none';
        return;
    }
    
    const gridClass = filteredGifts.length > 2 ? 'dropdown-grid' : '';
    dropdown.className = `search-dropdown ${gridClass}`;
    
    resultsContainer.innerHTML = filteredGifts.map(gift => `
        <div class="dropdown-item vertical" onclick="selectLastGift('${gift.slug}', '${gift.name.replace(/'/g, "\\'")}')"> 
            <img src="https://nft.fragment.com/gift/${gift.slug}.medium.jpg" 
                 alt="${gift.name}" 
                 class="dropdown-image" 
                 style="display: ${gift.slug ? 'block' : 'none'}">
            <span>${gift.name}</span>
        </div>
    `).join('');
    
    dropdown.style.display = 'block';
}

function selectLastGift(slug, name) {
    selectedGift = { slug, name };
    
    const giftInput = document.getElementById('last-gift-search');
    const modelInput = document.getElementById('last-model-search');
    const getBtn = document.getElementById('get-last-purchases-btn');
    
    giftInput.value = name;
    hideDropdown('last-gift-dropdown');
    
    modelInput.disabled = false;
    modelInput.placeholder = 'Search models...';
    getBtn.disabled = false;
}

function displayLastModelDropdown(query) {
    if (!selectedGift) return;
    
    const filteredModels = models.filter(model => 
        model.giftSlug === selectedGift.slug &&
        model.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
    
    const dropdown = document.getElementById('last-model-dropdown');
    const resultsContainer = document.getElementById('last-model-results');
    
    if (filteredModels.length === 0) {
        dropdown.style.display = 'none';
        return;
    }
    
    const gridClass = filteredModels.length > 2 ? 'dropdown-grid' : '';
    dropdown.className = `search-dropdown ${gridClass}`;
    
    resultsContainer.innerHTML = filteredModels.map(model => `
        <div class="dropdown-item vertical" onclick="selectLastModel('${model.slug}', '${model.name.replace(/'/g, "\\'")}')"> 
            <img src="https://nft.fragment.com/model/${model.slug}.medium.jpg" 
                 alt="${model.name}" 
                 class="dropdown-image" 
                 style="display: block">
            <span>${model.name}</span>
        </div>
    `).join('');
    
    dropdown.style.display = 'block';
}

function selectLastModel(slug, name) {
    selectedModel = { slug, name };
    
    const modelInput = document.getElementById('last-model-search');
    modelInput.value = name;
    hideDropdown('last-model-dropdown');
}

function displayLastBackdropDropdown(query) {
    const filteredBackdrops = backdrops.filter(backdrop => 
        backdrop.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
    
    const dropdown = document.getElementById('last-backdrop-dropdown');
    const resultsContainer = document.getElementById('last-backdrop-results');
    
    if (filteredBackdrops.length === 0) {
        dropdown.style.display = 'none';
        return;
    }
    
    const gridClass = filteredBackdrops.length > 2 ? 'dropdown-grid' : '';
    dropdown.className = `search-dropdown ${gridClass}`;
    
    resultsContainer.innerHTML = filteredBackdrops.map(backdrop => `
        <div class="dropdown-item vertical" onclick="selectLastBackdrop('${backdrop.slug}', '${backdrop.name.replace(/'/g, "\\'")}')"> 
            <div class="backdrop-preview" style="background: ${backdrop.preview || '#333'};"></div>
            <span>${backdrop.name}</span>
        </div>
    `).join('');
    
    dropdown.style.display = 'block';
}

function selectLastBackdrop(slug, name) {
    selectedBackdrop = { slug, name };
    
    const backdropInput = document.getElementById('last-backdrop-search');
    backdropInput.value = name;
    hideDropdown('last-backdrop-dropdown');
}



// Initialize routing when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});