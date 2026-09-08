// --- API CONFIGURATION ---
const API_BASE = 'https://tower-9ucq.onrender.com';let authToken = localStorage.getItem('authToken') || null;
let currentUsername = localStorage.getItem('currentUsername') || null;

// API Functions
async function apiRequest(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (authToken) {
        headers['Authorization'] = authToken;
    }
    
    const options = {
        method,
        headers
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Authentication Functions
async function register(username, email, password) {
    try {
        const data = await apiRequest('/register', 'POST', { username, email, password });
        authToken = data.token;
        currentUsername = data.user.username;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUsername', currentUsername);
        
        playerData = data.user.gameData;
        
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function login(username, password) {
    try {
        const data = await apiRequest('/login', 'POST', { username, password });
        authToken = data.token;
        currentUsername = data.user.username;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUsername', currentUsername);
        
        playerData = data.user.gameData;
        
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function logout() {
    try {
        await apiRequest('/logout', 'POST', { token: authToken });
        authToken = null;
        currentUsername = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUsername');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function loadUserData() {
    try {
        const data = await apiRequest('/user');
        playerData = data.gameData;
        currentUsername = data.username;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function saveGameData() {
    try {
        await apiRequest('/save', 'POST', { gameData: playerData });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function verifySession() {
    try {
        const data = await apiRequest('/verify');
        if (data.valid) {
            currentUsername = data.username;
            await loadUserData();
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

// --- 1. GAME DATA & TOWER SPECIFICATIONS ---
const TOWER_DB = {
    scout: {
        id: "scout", name: "Scout", type: "damage", role: "Early-Game Defense",
        priceCoins: 0, // Free starter
        color: "#3498db", radius: 12,
        levels: [
            { costCash: 250, damage: 10, range: 100, cooldown: 1000 },
            { costCash: 350, damage: 15, range: 120, cooldown: 800 },
            { costCash: 800, damage: 30, range: 140, cooldown: 500 }
        ]
    },
    sniper: {
        id: "sniper", name: "Sniper", type: "damage", role: "Long Range Precision",
        priceCoins: 0, // Free starter
        color: "#9b59b6", radius: 12,
        levels: [
            { costCash: 300, damage: 25, range: 250, cooldown: 2000 },
            { costCash: 500, damage: 40, range: 300, cooldown: 1800 },
            { costCash: 900, damage: 70, range: 350, cooldown: 1500 }
        ]
    },
    soldier: {
        id: "soldier", name: "Soldier", type: "damage", role: "Basic Ranged Damage",
        priceCoins: 100,
        color: "#95a5a6", radius: 12,
        levels: [
            { costCash: 300, damage: 12, range: 110, cooldown: 900 },
            { costCash: 500, damage: 20, range: 130, cooldown: 750 },
            { costCash: 1000, damage: 35, range: 150, cooldown: 600 }
        ]
    },
    militant: {
        id: "militant", name: "Militant", type: "damage", role: "Rapid Fire",
        priceCoins: 200,
        color: "#7f8c8d", radius: 11,
        levels: [
            { costCash: 400, damage: 6, range: 90, cooldown: 400 },
            { costCash: 700, damage: 10, range: 100, cooldown: 300 },
            { costCash: 1400, damage: 18, range: 110, cooldown: 250 }
        ]
    },
    shotgunner: {
        id: "shotgunner", name: "Shotgunner", type: "splash", role: "Spread Damage",
        priceCoins: 350,
        color: "#c0392b", radius: 13,
        levels: [
            { costCash: 500, damage: 8, range: 80, cooldown: 1200, splash: 30, pellets: 5 },
            { costCash: 900, damage: 12, range: 90, cooldown: 1100, splash: 35, pellets: 6 },
            { costCash: 1800, damage: 20, range: 100, cooldown: 1000, splash: 40, pellets: 8 }
        ]
    },
    hunter: {
        id: "hunter", name: "Hunter", type: "damage", role: "Long Range",
        priceCoins: 250,
        color: "#27ae60", radius: 12,
        levels: [
            { costCash: 450, damage: 25, range: 180, cooldown: 1500 },
            { costCash: 800, damage: 50, range: 220, cooldown: 1300 },
            { costCash: 1600, damage: 100, range: 280, cooldown: 1100 }
        ]
    },
    pyromancer: {
        id: "pyromancer", name: "Pyromancer", type: "dot", role: "Burn Damage",
        priceCoins: 400,
        color: "#e74c3c", radius: 13,
        levels: [
            { costCash: 550, damage: 5, range: 85, cooldown: 800, burnDamage: 3, burnDuration: 3000 },
            { costCash: 950, damage: 8, range: 95, cooldown: 700, burnDamage: 5, burnDuration: 4000 },
            { costCash: 1900, damage: 15, range: 105, cooldown: 600, burnDamage: 8, burnDuration: 5000 }
        ]
    },
    freezer: {
        id: "freezer", name: "Freezer", type: "slow", role: "Crowd Control",
        priceCoins: 300,
        color: "#3498db", radius: 13,
        levels: [
            { costCash: 450, damage: 3, range: 90, cooldown: 1000, slowAmount: 0.5, slowDuration: 2000 },
            { costCash: 800, damage: 5, range: 100, cooldown: 900, slowAmount: 0.6, slowDuration: 2500 },
            { costCash: 1600, damage: 8, range: 110, cooldown: 800, slowAmount: 0.7, slowDuration: 3000 }
        ]
    },
    acepilot: {
        id: "acepilot", name: "Ace Pilot", type: "damage", role: "Aerial Attack",
        priceCoins: 500,
        color: "#f39c12", radius: 14,
        levels: [
            { costCash: 700, damage: 20, range: 120, cooldown: 1100 },
            { costCash: 1200, damage: 35, range: 140, cooldown: 950 },
            { costCash: 2400, damage: 60, range: 160, cooldown: 800 }
        ]
    },
    medic: {
        id: "medic", name: "Medic", type: "support", role: "Tower Healing",
        priceCoins: 350,
        color: "#2ecc71", radius: 15,
        levels: [
            { costCash: 500, healAmount: 5, range: 100, cooldown: 3000 },
            { costCash: 900, healAmount: 8, range: 120, cooldown: 2500 },
            { costCash: 1800, healAmount: 15, range: 140, cooldown: 2000 }
        ]
    },
    rocketeer: {
        id: "rocketeer", name: "Rocketeer", type: "splash", role: "Explosive Damage",
        priceCoins: 450,
        color: "#d35400", radius: 14,
        levels: [
            { costCash: 650, damage: 25, range: 100, cooldown: 1800, splash: 50 },
            { costCash: 1100, damage: 45, range: 110, cooldown: 1600, splash: 60 },
            { costCash: 2200, damage: 80, range: 120, cooldown: 1400, splash: 75 }
        ]
    },
    electroshocker: {
        id: "electroshocker", name: "Electroshocker", type: "chain", role: "Chain Lightning",
        priceCoins: 550,
        color: "#9b59b6", radius: 13,
        levels: [
            { costCash: 750, damage: 15, range: 95, cooldown: 1200, chainCount: 2 },
            { costCash: 1300, damage: 25, range: 105, cooldown: 1000, chainCount: 3 },
            { costCash: 2600, damage: 40, range: 115, cooldown: 900, chainCount: 4 }
        ]
    },
    trapper: {
        id: "trapper", name: "Trapper", type: "slow", role: "Area Slow",
        priceCoins: 400,
        color: "#8e44ad", radius: 14,
        levels: [
            { costCash: 550, damage: 2, range: 80, cooldown: 2000, slowAmount: 0.4, slowDuration: 3000 },
            { costCash: 950, damage: 3, range: 90, cooldown: 1800, slowAmount: 0.5, slowDuration: 3500 },
            { costCash: 1900, damage: 5, range: 100, cooldown: 1600, slowAmount: 0.6, slowDuration: 4000 }
        ]
    },
    paintballer: {
        id: "paintballer", name: "Paintballer", type: "splash", role: "Paint Splash",
        priceCoins: 200,
        color: "#e91e63", radius: 12,
        levels: [
            { costCash: 350, damage: 8, range: 85, cooldown: 1100, splash: 35 },
            { costCash: 600, damage: 14, range: 95, cooldown: 1000, splash: 45 },
            { costCash: 1200, damage: 25, range: 105, cooldown: 900, splash: 55 }
        ]
    },
    slimetrooper: {
        id: "slimetrooper", name: "Slime Trooper", type: "slow", role: "Slime Slow",
        priceCoins: 250,
        color: "#00bcd4", radius: 13,
        levels: [
            { costCash: 400, damage: 5, range: 80, cooldown: 900, slowAmount: 0.3, slowDuration: 2500 },
            { costCash: 700, damage: 8, range: 90, cooldown: 800, slowAmount: 0.4, slowDuration: 3000 },
            { costCash: 1400, damage: 12, range: 100, cooldown: 700, slowAmount: 0.5, slowDuration: 3500 }
        ]
    },
    boomerang: {
        id: "boomerang", name: "Boomerang", type: "damage", role: "Returning Attack",
        priceCoins: 300,
        color: "#ff9800", radius: 12,
        levels: [
            { costCash: 450, damage: 15, range: 100, cooldown: 1300 },
            { costCash: 800, damage: 25, range: 115, cooldown: 1100 },
            { costCash: 1600, damage: 40, range: 130, cooldown: 900 }
        ]
    },
    assassin: {
        id: "assassin", name: "Assassin", type: "damage", role: "High Burst",
        priceCoins: 600,
        color: "#212121", radius: 11,
        levels: [
            { costCash: 800, damage: 50, range: 90, cooldown: 2000 },
            { costCash: 1400, damage: 100, range: 100, cooldown: 1700 },
            { costCash: 2800, damage: 200, range: 110, cooldown: 1400 }
        ]
    },
    demoman: {
        id: "demoman", name: "Demoman", type: "splash", role: "Area Damage",
        priceCoins: 150,
        color: "#e67e22", radius: 14,
        levels: [
            { costCash: 400, damage: 15, range: 90, cooldown: 1500, splash: 40 },
            { costCash: 700, damage: 30, range: 100, cooldown: 1400, splash: 50 },
            { costCash: 1500, damage: 60, range: 110, cooldown: 1200, splash: 65 }
        ]
    },
    ranger: {
        id: "ranger", name: "Ranger", type: "damage", role: "Long Range DPS",
        priceCoins: 300,
        color: "#9b59b6", radius: 12,
        levels: [
            { costCash: 600, damage: 40, range: 200, cooldown: 2000 },
            { costCash: 1200, damage: 90, range: 250, cooldown: 1800 },
            { costCash: 2500, damage: 200, range: 350, cooldown: 1500 }
        ]
    },
    farm: {
        id: "farm", name: "Farm", type: "economy", role: "Money Generation",
        priceCoins: 250,
        color: "#f1c40f", radius: 16,
        levels: [
            { costCash: 300, income: 50, cooldown: 5000, range: 0 },
            { costCash: 800, income: 150, cooldown: 5000, range: 0 },
            { costCash: 2000, income: 400, cooldown: 5000, range: 0 }
        ]
    },
    accelerator: {
        id: "accelerator", name: "Accelerator", type: "damage", role: "Charging Attack",
        priceCoins: 2000,
        color: "#ff5722", radius: 14,
        levels: [
            { costCash: 1500, damage: 20, range: 100, cooldown: 1000, chargeRate: 0.1 },
            { costCash: 3000, damage: 40, range: 110, cooldown: 900, chargeRate: 0.15 },
            { costCash: 6000, damage: 80, range: 120, cooldown: 800, chargeRate: 0.2 }
        ]
    },
    engineer: {
        id: "engineer", name: "Engineer", type: "support", role: "Deployable Sentry",
        priceCoins: 1500,
        color: "#607d8b", radius: 15,
        levels: [
            { costCash: 1200, damage: 15, range: 90, cooldown: 1500, sentryCount: 1 },
            { costCash: 2500, damage: 25, range: 100, cooldown: 1300, sentryCount: 2 },
            { costCash: 5000, damage: 40, range: 110, cooldown: 1100, sentryCount: 3 }
        ]
    },
    minigunner: {
        id: "minigunner", name: "Minigunner", type: "damage", role: "Sustained DPS",
        priceCoins: 1800,
        color: "#3e2723", radius: 13,
        levels: [
            { costCash: 1400, damage: 8, range: 95, cooldown: 150 },
            { costCash: 2800, damage: 15, range: 105, cooldown: 120 },
            { costCash: 5600, damage: 30, range: 115, cooldown: 100 }
        ]
    },
    hacker: {
        id: "hacker", name: "Hacker", type: "special", role: "Enemy Manipulation",
        priceCoins: 2500,
        color: "#00bcd4", radius: 12,
        levels: [
            { costCash: 2000, damage: 10, range: 120, cooldown: 2000, hackChance: 0.1 },
            { costCash: 4000, damage: 20, range: 140, cooldown: 1800, hackChance: 0.2 },
            { costCash: 8000, damage: 40, range: 160, cooldown: 1600, hackChance: 0.3 }
        ]
    },
    executioner: {
        id: "executioner", name: "Executioner", type: "damage", role: "Execute Low HP",
        priceCoins: 2200,
        color: "#8b0000", radius: 14,
        levels: [
            { costCash: 1800, damage: 30, range: 100, cooldown: 1200, executeThreshold: 0.3 },
            { costCash: 3600, damage: 60, range: 110, cooldown: 1000, executeThreshold: 0.4 },
            { costCash: 7200, damage: 120, range: 120, cooldown: 900, executeThreshold: 0.5 }
        ]
    },
    turret: {
        id: "turret", name: "Turret", type: "damage", role: "Auto Turret",
        priceCoins: 1200,
        color: "#424242", radius: 11,
        levels: [
            { costCash: 1000, damage: 18, range: 110, cooldown: 800 },
            { costCash: 2000, damage: 35, range: 125, cooldown: 700 },
            { costCash: 4000, damage: 70, range: 140, cooldown: 600 }
        ]
    },
    cowboy: {
        id: "cowboy", name: "Cowboy", type: "damage", role: "Lasso Attack",
        priceCoins: 1600,
        color: "#795548", radius: 13,
        levels: [
            { costCash: 1300, damage: 25, range: 130, cooldown: 1400, lassoDuration: 1500 },
            { costCash: 2600, damage: 45, range: 150, cooldown: 1200, lassoDuration: 2000 },
            { costCash: 5200, damage: 85, range: 170, cooldown: 1000, lassoDuration: 2500 }
        ]
    },
    gatlinggun: {
        id: "gatlinggun", name: "Gatling Gun", type: "damage", role: "Extreme Firepower",
        priceCoins: 3000,
        color: "#212121", radius: 15,
        levels: [
            { costCash: 2500, damage: 12, range: 100, cooldown: 80 },
            { costCash: 5000, damage: 25, range: 115, cooldown: 60 },
            { costCash: 10000, damage: 50, range: 130, cooldown: 50 }
        ]
    },
    necromancer: {
        id: "necromancer", name: "Necromancer", type: "special", role: "Summon Minions",
        priceCoins: 2800,
        color: "#4a148c", radius: 14,
        levels: [
            { costCash: 2200, damage: 15, range: 110, cooldown: 3000, minionCount: 2 },
            { costCash: 4400, damage: 30, range: 125, cooldown: 2500, minionCount: 3 },
            { costCash: 8800, damage: 60, range: 140, cooldown: 2000, minionCount: 4 }
        ]
    },
    mercenarybase: {
        id: "mercenarybase", name: "Mercenary Base", type: "support", role: "Spawn Mercenaries",
        priceCoins: 3500,
        color: "#37474f", radius: 18,
        levels: [
            { costCash: 3000, damage: 20, range: 150, cooldown: 4000, mercCount: 1 },
            { costCash: 6000, damage: 40, range: 170, cooldown: 3500, mercCount: 2 },
            { costCash: 12000, damage: 80, range: 190, cooldown: 3000, mercCount: 3 }
        ]
    },
    commander: {
        id: "commander", name: "Commander", type: "support", role: "Attack Speed Buff",
        priceCoins: 4000,
        color: "#1a237e", radius: 16,
        levels: [
            { costCash: 3500, buffAmount: 0.2, range: 120, cooldown: 5000 },
            { costCash: 7000, buffAmount: 0.35, range: 140, cooldown: 4500 },
            { costCash: 14000, buffAmount: 0.5, range: 160, cooldown: 4000 }
        ]
    },
    djbooth: {
        id: "djbooth", name: "DJ Booth", type: "support", role: "Range & Economy Buff",
        priceCoins: 4500,
        color: "#e91e63", radius: 16,
        levels: [
            { costCash: 4000, rangeBuff: 0.15, incomeBuff: 0.1, range: 130, cooldown: 6000 },
            { costCash: 8000, rangeBuff: 0.25, incomeBuff: 0.2, range: 150, cooldown: 5500 },
            { costCash: 16000, rangeBuff: 0.4, incomeBuff: 0.3, range: 170, cooldown: 5000 }
        ]
    },
    crookboss: {
        id: "crookboss", name: "Crook Boss", type: "economy", role: "Coin Steal",
        priceCoins: 700, color: "#4e342e", radius: 13,
        levels: [
            { costCash: 550, damage: 10, range: 90, cooldown: 1300, income: 20 },
            { costCash: 1000, damage: 18, range: 100, cooldown: 1100, income: 40 },
            { costCash: 2000, damage: 32, range: 110, cooldown: 950, income: 80 }
        ]
    },
    militarybase: {
        id: "militarybase", name: "Military Base", type: "support", role: "Spawn Soldiers",
        priceCoins: 2600, color: "#556b2f", radius: 18,
        levels: [
            { costCash: 2200, damage: 18, range: 140, cooldown: 3500, unitCount: 1 },
            { costCash: 4400, damage: 32, range: 155, cooldown: 3000, unitCount: 2 },
            { costCash: 8800, damage: 55, range: 170, cooldown: 2600, unitCount: 3 }
        ]
    },
    mortar: {
        id: "mortar", name: "Mortar", type: "splash", role: "Long Range Bombardment",
        priceCoins: 1900, color: "#5d4037", radius: 15,
        levels: [
            { costCash: 1600, damage: 60, range: 260, cooldown: 2600, splash: 70 },
            { costCash: 3200, damage: 110, range: 300, cooldown: 2300, splash: 85 },
            { costCash: 6400, damage: 200, range: 340, cooldown: 2000, splash: 100 }
        ]
    },
    warden: {
        id: "warden", name: "Warden", type: "slow", role: "Lockdown Control",
        priceCoins: 2400, color: "#263238", radius: 14,
        levels: [
            { costCash: 2000, damage: 20, range: 110, cooldown: 1500, slowAmount: 0.5, slowDuration: 2500 },
            { costCash: 4000, damage: 35, range: 125, cooldown: 1300, slowAmount: 0.6, slowDuration: 3000 },
            { costCash: 8000, damage: 60, range: 140, cooldown: 1100, slowAmount: 0.7, slowDuration: 3500 }
        ]
    },
    tesla: {
        id: "tesla", name: "Tesla", type: "chain", role: "Electric Overload",
        priceCoins: 3200, color: "#00e5ff", radius: 13,
        levels: [
            { costCash: 2600, damage: 22, range: 100, cooldown: 900, chainCount: 3 },
            { costCash: 5200, damage: 38, range: 115, cooldown: 800, chainCount: 4 },
            { costCash: 10400, damage: 65, range: 130, cooldown: 700, chainCount: 5 }
        ]
    },
    pursuit: {
        id: "pursuit", name: "Pursuit", type: "damage", role: "Homing Pursuit",
        priceCoins: 2000, color: "#00695c", radius: 12,
        levels: [
            { costCash: 1600, damage: 30, range: 150, cooldown: 1400 },
            { costCash: 3200, damage: 55, range: 175, cooldown: 1200 },
            { costCash: 6400, damage: 100, range: 200, cooldown: 1000 }
        ]
    },
    brawler: {
        id: "brawler", name: "Brawler", type: "damage", role: "Melee Powerhouse",
        priceCoins: 5000, color: "#bf360c", radius: 14,
        levels: [
            { costCash: 4200, damage: 90, range: 60, cooldown: 700 },
            { costCash: 8500, damage: 160, range: 70, cooldown: 550 },
            { costCash: 17000, damage: 300, range: 80, cooldown: 400 }
        ]
    },
    gladiator: {
        id: "gladiator", name: "Gladiator", type: "damage", role: "Arena Champion",
        priceCoins: 6000, color: "#c62828", radius: 15,
        levels: [
            { costCash: 5000, damage: 100, range: 100, cooldown: 900 },
            { costCash: 10000, damage: 190, range: 115, cooldown: 750 },
            { costCash: 20000, damage: 350, range: 130, cooldown: 600 }
        ]
    },
    commando: {
        id: "commando", name: "Commando", type: "damage", role: "Elite Rifleman",
        priceCoins: 5500, color: "#33691e", radius: 13,
        levels: [
            { costCash: 4600, damage: 45, range: 160, cooldown: 350 },
            { costCash: 9200, damage: 80, range: 180, cooldown: 280 },
            { costCash: 18400, damage: 150, range: 200, cooldown: 220 }
        ]
    },
    slasher: {
        id: "slasher", name: "Slasher", type: "damage", role: "Bleed Melee",
        priceCoins: 4800, color: "#b71c1c", radius: 12,
        levels: [
            { costCash: 4000, damage: 55, range: 65, cooldown: 500, bleedDamage: 5, bleedDuration: 3000 },
            { costCash: 8000, damage: 95, range: 75, cooldown: 400, bleedDamage: 9, bleedDuration: 3500 },
            { costCash: 16000, damage: 170, range: 85, cooldown: 320, bleedDamage: 16, bleedDuration: 4000 }
        ]
    },
    frostblaster: {
        id: "frostblaster", name: "Frost Blaster", type: "slow", role: "Freeze Burst",
        priceCoins: 4200, color: "#4fc3f7", radius: 14,
        levels: [
            { costCash: 3500, damage: 25, range: 120, cooldown: 1600, slowAmount: 0.6, slowDuration: 3000 },
            { costCash: 7000, damage: 45, range: 135, cooldown: 1400, slowAmount: 0.7, slowDuration: 3500 },
            { costCash: 14000, damage: 80, range: 150, cooldown: 1200, slowAmount: 0.8, slowDuration: 4000 }
        ]
    },
    archer: {
        id: "archer", name: "Archer", type: "damage", role: "Piercing Shot",
        priceCoins: 800, color: "#6d4c41", radius: 12,
        levels: [
            { costCash: 500, damage: 18, range: 160, cooldown: 1000, pierce: 2 },
            { costCash: 900, damage: 32, range: 190, cooldown: 850, pierce: 3 },
            { costCash: 1800, damage: 55, range: 220, cooldown: 700, pierce: 4 }
        ]
    },
    swarmer: {
        id: "swarmer", name: "Swarmer", type: "damage", role: "Multi-Target Swarm",
        priceCoins: 3600, color: "#827717", radius: 13,
        levels: [
            { costCash: 3000, damage: 10, range: 110, cooldown: 300, targets: 3 },
            { costCash: 6000, damage: 18, range: 125, cooldown: 250, targets: 4 },
            { costCash: 12000, damage: 30, range: 140, cooldown: 200, targets: 5 }
        ]
    },
    toxicgunner: {
        id: "toxicgunner", name: "Toxic Gunner", type: "dot", role: "Poison Damage",
        priceCoins: 3300, color: "#7cb342", radius: 13,
        levels: [
            { costCash: 2800, damage: 8, range: 100, cooldown: 900, poisonDamage: 6, poisonDuration: 4000 },
            { costCash: 5600, damage: 14, range: 110, cooldown: 800, poisonDamage: 10, poisonDuration: 4500 },
            { costCash: 11200, damage: 24, range: 120, cooldown: 700, poisonDamage: 18, poisonDuration: 5000 }
        ]
    },
    sledger: {
        id: "sledger", name: "Sledger", type: "splash", role: "Ground Slam",
        priceCoins: 4000, color: "#455a64", radius: 15,
        levels: [
            { costCash: 3300, damage: 70, range: 80, cooldown: 1400, splash: 60 },
            { costCash: 6600, damage: 130, range: 90, cooldown: 1200, splash: 70 },
            { costCash: 13200, damage: 240, range: 100, cooldown: 1000, splash: 85 }
        ]
    },
    elfcamp: {
        id: "elfcamp", name: "Elf Camp", type: "support", role: "Ranged Support Unit",
        priceCoins: 2700, color: "#2e7d32", radius: 16,
        levels: [
            { costCash: 2200, damage: 12, range: 130, cooldown: 900, unitCount: 1 },
            { costCash: 4400, damage: 22, range: 145, cooldown: 800, unitCount: 2 },
            { costCash: 8800, damage: 38, range: 160, cooldown: 700, unitCount: 3 }
        ]
    },
    jester: {
        id: "jester", name: "Jester", type: "special", role: "Confuse Enemies",
        priceCoins: 3100, color: "#8e24aa", radius: 12,
        levels: [
            { costCash: 2600, damage: 8, range: 100, cooldown: 1500, confuseChance: 0.15 },
            { costCash: 5200, damage: 15, range: 115, cooldown: 1300, confuseChance: 0.25 },
            { costCash: 10400, damage: 26, range: 130, cooldown: 1100, confuseChance: 0.35 }
        ]
    },
    cryomancer: {
        id: "cryomancer", name: "Cryomancer", type: "slow", role: "Deep Freeze",
        priceCoins: 4600, color: "#26c6da", radius: 14,
        levels: [
            { costCash: 3800, damage: 30, range: 115, cooldown: 1300, slowAmount: 0.65, slowDuration: 3200 },
            { costCash: 7600, damage: 52, range: 130, cooldown: 1100, slowAmount: 0.75, slowDuration: 3700 },
            { costCash: 15200, damage: 90, range: 145, cooldown: 950, slowAmount: 0.85, slowDuration: 4200 }
        ]
    },
    hallowpunk: {
        id: "hallowpunk", name: "Hallow Punk", type: "dot", role: "Spectral Curse",
        priceCoins: 4400, color: "#5e35b1", radius: 13,
        levels: [
            { costCash: 3700, damage: 20, range: 105, cooldown: 1100, burnDamage: 10, burnDuration: 3500 },
            { costCash: 7400, damage: 35, range: 120, cooldown: 950, burnDamage: 16, burnDuration: 4000 },
            { costCash: 14800, damage: 60, range: 135, cooldown: 800, burnDamage: 28, burnDuration: 4500 }
        ]
    },
    harvester: {
        id: "harvester", name: "Harvester", type: "economy", role: "Soul Economy",
        priceCoins: 3000, color: "#4527a0", radius: 16,
        levels: [
            { costCash: 2500, income: 200, cooldown: 5000, range: 0 },
            { costCash: 5000, income: 450, cooldown: 5000, range: 0 },
            { costCash: 10000, income: 900, cooldown: 5000, range: 0 }
        ]
    },
    snowballer: {
        id: "snowballer", name: "Snowballer", type: "splash", role: "Rolling Snowball",
        priceCoins: 2300, color: "#e1f5fe", radius: 13,
        levels: [
            { costCash: 1900, damage: 20, range: 95, cooldown: 1200, splash: 45 },
            { costCash: 3800, damage: 36, range: 105, cooldown: 1050, splash: 55 },
            { costCash: 7600, damage: 65, range: 115, cooldown: 900, splash: 65 }
        ]
    },
    elementalist: {
        id: "elementalist", name: "Elementalist", type: "special", role: "Elemental Barrage",
        priceCoins: 5800, color: "#00838f", radius: 14,
        levels: [
            { costCash: 4800, damage: 50, range: 130, cooldown: 1000, elementCount: 2 },
            { costCash: 9600, damage: 90, range: 145, cooldown: 850, elementCount: 3 },
            { costCash: 19200, damage: 160, range: 160, cooldown: 700, elementCount: 4 }
        ]
    },
    fireworktechnician: {
        id: "fireworktechnician", name: "Firework Technician", type: "splash", role: "Aerial Fireworks",
        priceCoins: 3400, color: "#ff6f00", radius: 14,
        levels: [
            { costCash: 2800, damage: 35, range: 140, cooldown: 1500, splash: 55 },
            { costCash: 5600, damage: 62, range: 155, cooldown: 1300, splash: 65 },
            { costCash: 11200, damage: 110, range: 170, cooldown: 1100, splash: 78 }
        ]
    },
    biologist: {
        id: "biologist", name: "Biologist", type: "support", role: "Mutation Buff",
        priceCoins: 3900, color: "#558b2f", radius: 15,
        levels: [
            { costCash: 3200, buffAmount: 0.15, range: 110, cooldown: 4000 },
            { costCash: 6400, buffAmount: 0.25, range: 125, cooldown: 3500 },
            { costCash: 12800, buffAmount: 0.4, range: 140, cooldown: 3000 }
        ]
    },
    warlock: {
        id: "warlock", name: "Warlock", type: "dot", role: "Dark Curse",
        priceCoins: 5200, color: "#311b92", radius: 14,
        levels: [
            { costCash: 4300, damage: 40, range: 120, cooldown: 1200, burnDamage: 20, burnDuration: 4000 },
            { costCash: 8600, damage: 72, range: 135, cooldown: 1000, burnDamage: 34, burnDuration: 4500 },
            { costCash: 17200, damage: 130, range: 150, cooldown: 850, burnDamage: 60, burnDuration: 5000 }
        ]
    },
    spotlighttech: {
        id: "spotlighttech", name: "Spotlight Tech", type: "support", role: "Reveal & Mark",
        priceCoins: 2900, color: "#fdd835", radius: 16,
        levels: [
            { costCash: 2400, buffAmount: 0.2, range: 160, cooldown: 3000 },
            { costCash: 4800, buffAmount: 0.35, range: 180, cooldown: 2600 },
            { costCash: 9600, buffAmount: 0.5, range: 200, cooldown: 2200 }
        ]
    }
};

// Golden Tower variants with enhanced stats
const GOLDEN_TOWERS = {
    golden_scout: {
        id: "golden_scout", name: "Golden Scout", baseId: "scout",
        priceGems: 500, requiredLevel: 10,
        color: "#ffd700", radius: 13,
        statMultipliers: { damage: 1.5, range: 1.2, cooldown: 0.8 }
    },
    golden_soldier: {
        id: "golden_soldier", name: "Golden Soldier", baseId: "soldier",
        priceGems: 600, requiredLevel: 12,
        color: "#ffd700", radius: 13,
        statMultipliers: { damage: 1.4, range: 1.15, cooldown: 0.85 }
    },
    golden_demoman: {
        id: "golden_demoman", name: "Golden Demoman", baseId: "demoman",
        priceGems: 800, requiredLevel: 15,
        color: "#ffd700", radius: 15,
        statMultipliers: { damage: 1.6, splash: 1.3, cooldown: 0.9 }
    },
    golden_ranger: {
        id: "golden_ranger", name: "Golden Ranger", baseId: "ranger",
        priceGems: 1000, requiredLevel: 18,
        color: "#ffd700", radius: 13,
        statMultipliers: { damage: 1.5, range: 1.3, cooldown: 0.85 }
    },
    golden_farm: {
        id: "golden_farm", name: "Golden Farm", baseId: "farm",
        priceGems: 1200, requiredLevel: 20,
        color: "#ffd700", radius: 17,
        statMultipliers: { income: 2.0, cooldown: 0.8 }
    },
    golden_pyromancer: {
        id: "golden_pyromancer", name: "Golden Pyromancer", baseId: "pyromancer",
        priceGems: 1500, requiredLevel: 22,
        color: "#ffd700", radius: 14,
        statMultipliers: { damage: 1.5, burnDamage: 1.8, burnDuration: 1.3 }
    },
    golden_minigunner: {
        id: "golden_minigunner", name: "Golden Minigunner", baseId: "minigunner",
        priceGems: 2000, requiredLevel: 25,
        color: "#ffd700", radius: 14,
        statMultipliers: { damage: 1.6, cooldown: 0.7, range: 1.1 }
    },
    golden_commander: {
        id: "golden_commander", name: "Golden Commander", baseId: "commander",
        priceGems: 3000, requiredLevel: 30,
        color: "#ffd700", radius: 17,
        statMultipliers: { buffAmount: 1.5, range: 1.2, cooldown: 0.85 }
    },
    golden_crookboss: {
        id: "golden_crookboss", name: "Golden Crook Boss", baseId: "crookboss",
        priceGems: 1800, requiredLevel: 20,
        color: "#ffd700", radius: 15,
        statMultipliers: { damage: 1.5, income: 1.8, cooldown: 0.85 }
    },
    golden_cowboy: {
        id: "golden_cowboy", name: "Golden Cowboy", baseId: "cowboy",
        priceGems: 2200, requiredLevel: 24,
        color: "#ffd700", radius: 15,
        statMultipliers: { damage: 1.5, range: 1.2, cooldown: 0.85 }
    }
};

// --- 2. META PROGRESSION (Local Storage) ---
let playerData = {
    level: 1, xp: 0, coins: 0, gems: 0,
    ownedTowers: ["scout", "sniper"],
    goldenTowers: [],
    loadout: ["scout", "sniper"],
    dailyRewards: {
        lastClaimDate: null,
        streak: 0,
        claimedToday: false
    },
    quests: {
        active: [],
        completed: []
    },
    questProgress: {
        matchesWon: 0,
        wavesReached: 0,
        enemiesDefeated: 0,
        bossesDefeated: 0,
        towersPlaced: 0,
        towersUpgraded: 0
    }
};

// Daily rewards configuration
const DAILY_REWARDS = [
    { day: 1, coins: 50, gems: 0, xp: 20 },
    { day: 2, coins: 75, gems: 0, xp: 30 },
    { day: 3, coins: 100, gems: 5, xp: 40 },
    { day: 4, coins: 125, gems: 0, xp: 50 },
    { day: 5, coins: 150, gems: 10, xp: 60 },
    { day: 6, coins: 175, gems: 0, xp: 70 },
    { day: 7, coins: 200, gems: 25, xp: 100 }, // Weekly bonus
];

// Quest definitions
const QUEST_DEFINITIONS = {
    win_matches: {
        id: "win_matches",
        name: "Victory Hunter",
        description: "Win 5 matches",
        objective: "matchesWon",
        target: 5,
        reward: { coins: 200, gems: 10, xp: 100 }
    },
    reach_wave_10: {
        id: "reach_wave_10",
        name: "Wave Survivor",
        description: "Reach wave 10 in any match",
        objective: "wavesReached",
        target: 10,
        reward: { coins: 150, gems: 5, xp: 75 }
    },
    defeat_enemies: {
        id: "defeat_enemies",
        name: "Enemy Slayer",
        description: "Defeat 100 enemies",
        objective: "enemiesDefeated",
        target: 100,
        reward: { coins: 100, gems: 0, xp: 50 }
    },
    defeat_bosses: {
        id: "defeat_bosses",
        name: "Boss Hunter",
        description: "Defeat 5 bosses",
        objective: "bossesDefeated",
        target: 5,
        reward: { coins: 300, gems: 20, xp: 150 }
    },
    place_towers: {
        id: "place_towers",
        name: "Tower Builder",
        description: "Place 25 towers",
        objective: "towersPlaced",
        target: 25,
        reward: { coins: 120, gems: 5, xp: 60 }
    },
    upgrade_towers: {
        id: "upgrade_towers",
        name: "Upgrade Master",
        description: "Upgrade 15 towers",
        objective: "towersUpgraded",
        target: 15,
        reward: { coins: 180, gems: 8, xp: 90 }
    },
    reach_wave_20: {
        id: "reach_wave_20",
        name: "Endurance",
        description: "Reach wave 20 in any match",
        objective: "wavesReached",
        target: 20,
        reward: { coins: 400, gems: 30, xp: 200 }
    },
    win_hardcore: {
        id: "win_hardcore",
        name: "Hardcore Champion",
        description: "Win a Hardcore match",
        objective: "hardcoreWins",
        target: 1,
        reward: { coins: 500, gems: 50, xp: 300 }
    }
};

async function saveProgress() {
    if (authToken) {
        await saveGameData();
    } else {
        localStorage.setItem("tds_data", JSON.stringify(playerData));
    }
}

async function loadProgress() {
    if (authToken) {
        await loadUserData();
    } else {
        const data = localStorage.getItem("tds_data");
        if (data) playerData = { ...playerData, ...JSON.parse(data) };
    }
    
    // Check daily rewards reset
    const today = new Date().toDateString();
    if (playerData.dailyRewards.lastClaimDate !== today) {
        playerData.dailyRewards.claimedToday = false;
        // Reset streak if missed a day (more than 1 day gap)
        if (playerData.dailyRewards.lastClaimDate) {
            const lastDate = new Date(playerData.dailyRewards.lastClaimDate);
            const currentDate = new Date();
            const diffTime = Math.abs(currentDate - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 1) {
                playerData.dailyRewards.streak = 0;
            }
        }
    }
    
    updateMenuStats();
}

function updateMenuStats() {
    document.getElementById("stat-username").innerText = currentUsername || "Player";
    document.getElementById("stat-level").innerText = playerData.level;
    document.getElementById("stat-xp").innerText = playerData.xp;
    document.getElementById("stat-coins").innerText = playerData.coins;
    document.getElementById("stat-gems").innerText = playerData.gems;
    document.getElementById("shop-coins").innerText = playerData.coins;
}

function addXP(amount) {
    playerData.xp += amount;
    const required = playerData.level * 100;
    if (playerData.xp >= required) {
        playerData.xp -= required;
        playerData.level++;
    }
    saveProgress();
}

// --- 3. UI MANAGEMENT (Menus, Shop, Loadout) ---
function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

// --- FRIENDS & REAL-TIME MATCHES ---
const SOCKET_BASE = API_BASE.replace(/\/api$/, "");
let socket = null;
let currentMatch = null; // { matchId, opponent, isHost } when in a live shared-board co-op match
let remoteState = null; // guest-only: latest authoritative board snapshot from the host
let guestSelectedTowerToPlace = null; // guest-only: tower the guest wants to place next
let guestSelectedUid = null; // guest-only: uid of the tower currently selected in the upgrade panel
let nextTowerUid = 1; // host/solo: unique id assigned to each placed tower (used for co-op sync)

function connectSocket() {
    if (socket || !authToken || typeof io === "undefined") return;
    socket = io(SOCKET_BASE, { auth: { token: authToken } });

    socket.on("connect_error", (err) => console.warn("Socket connect error:", err.message));

    socket.on("friend:request", ({ from }) => {
        showToast(`${from} sent you a friend request!`);
        if (document.getElementById("friends-screen").classList.contains("active")) loadFriendsScreen();
    });

    socket.on("friend:accepted", ({ from }) => {
        showToast(`${from} accepted your friend request!`);
        if (document.getElementById("friends-screen").classList.contains("active")) loadFriendsScreen();
    });

    socket.on("friend:removed", ({ from }) => {
        if (document.getElementById("friends-screen").classList.contains("active")) loadFriendsScreen();
    });

    socket.on("match:invite", ({ fromUsername }) => {
        const accept = confirm(`${fromUsername} challenged you to a real-time match! Accept?`);
        socket.emit("match:respond", { toUsername: fromUsername, accept });
    });

    socket.on("match:response", ({ fromUsername, accept }) => {
        if (!accept) showToast(`${fromUsername} declined your challenge.`);
    });

    socket.on("match:start", ({ matchId, opponent, isHost }) => {
        currentMatch = { matchId, opponent, isHost };
        remoteState = null;
        document.getElementById("match-feed-panel").classList.remove("hidden");
        document.getElementById("match-feed").innerHTML = "";
        showToast(isHost ? `Match with ${opponent} starting - you host the shared board!` : `Match with ${opponent} starting - joining their board...`);
        if (isHost) {
            buildMapSelection();
            showScreen("map-screen");
        } else {
            buildMapSelection(); // shows a "waiting for host" message for guests
            showScreen("map-screen");
        }
    });

    socket.on("match:event", ({ fromUsername, data }) => {
        if (!currentMatch) return;
        if (data.type === "init" && !currentMatch.isHost) {
            currentMap = MAPS[data.mapId] || MAPS.grasslands;
            path = currentMap.path;
            gameState.gameMode = data.modeId;
            showScreen("game-screen");
            startGuestMatch();
        } else if (data.type === "defeat") {
            addMatchFeed(`${fromUsername} defeated an enemy (+${data.reward})`);
        } else if (data.type === "gameover") {
            addMatchFeed(`Match ended - ${data.wave} waves cleared.`);
            currentMatch = null;
            document.getElementById("match-feed-panel").classList.add("hidden");
        }
    });

    // Guest receives authoritative board snapshots from the host
    socket.on("match:state", ({ state }) => {
        if (currentMatch && !currentMatch.isHost) remoteState = state;
    });

    // Host receives action requests from the guest and applies them to the real, shared gameState
    socket.on("match:action", ({ action }) => {
        if (currentMatch && currentMatch.isHost) applyRemoteAction(action);
    });
}

function disconnectSocket() {
    if (socket) { socket.disconnect(); socket = null; }
    currentMatch = null;
}

function sendMatchEvent(data) {
    if (socket && currentMatch) {
        socket.emit("match:event", { toUsername: currentMatch.opponent, data });
    }
}

function addMatchFeed(text) {
    const feed = document.getElementById("match-feed");
    if (!feed) return;
    const line = document.createElement("div");
    line.innerText = text;
    feed.prepend(line);
}

function showToast(message) {
    let toast = document.getElementById("toast-notice");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast-notice";
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 3500);
}

async function loadFriendsScreen() {
    const listEl = document.getElementById("friends-list");
    const incomingEl = document.getElementById("friend-requests-list");
    const outgoingEl = document.getElementById("friend-outgoing-list");
    listEl.innerHTML = "<p>Loading...</p>";
    try {
        const data = await apiRequest("/friends");

        listEl.innerHTML = "";
        if (data.friends.length === 0) listEl.innerHTML = "<p>No friends yet. Add someone above!</p>";
        data.friends.forEach(f => {
            const div = document.createElement("div");
            div.className = "friend-row";
            div.innerHTML = `
                <span class="friend-status ${f.online ? "online" : "offline"}"></span>
                <span class="friend-name">${f.username}</span>
                <button class="challenge-btn" ${f.online ? "" : "disabled"}>${f.online ? "Challenge" : "Offline"}</button>
                <button class="remove-friend-btn">Remove</button>
            `;
            div.querySelector(".challenge-btn").addEventListener("click", () => {
                if (!socket) connectSocket();
                socket.emit("match:invite", { toUsername: f.username });
                showToast(`Challenge sent to ${f.username}`);
            });
            div.querySelector(".remove-friend-btn").addEventListener("click", async () => {
                await apiRequest("/friends/remove", "POST", { username: f.username });
                loadFriendsScreen();
            });
            listEl.appendChild(div);
        });

        incomingEl.innerHTML = "";
        if (data.incoming.length === 0) incomingEl.innerHTML = "<p>No pending requests.</p>";
        data.incoming.forEach(username => {
            const div = document.createElement("div");
            div.className = "friend-row";
            div.innerHTML = `
                <span class="friend-name">${username}</span>
                <button class="accept-btn">Accept</button>
                <button class="decline-btn">Decline</button>
            `;
            div.querySelector(".accept-btn").addEventListener("click", async () => {
                await apiRequest("/friends/accept", "POST", { username });
                loadFriendsScreen();
            });
            div.querySelector(".decline-btn").addEventListener("click", async () => {
                await apiRequest("/friends/decline", "POST", { username });
                loadFriendsScreen();
            });
            incomingEl.appendChild(div);
        });

        outgoingEl.innerHTML = "";
        if (data.outgoing.length === 0) outgoingEl.innerHTML = "<p>No sent requests.</p>";
        data.outgoing.forEach(username => {
            const div = document.createElement("div");
            div.className = "friend-row";
            div.innerHTML = `<span class="friend-name">${username}</span><span class="pending-text">Pending...</span>`;
            outgoingEl.appendChild(div);
        });
    } catch (error) {
        listEl.innerHTML = `<p class="error-text">${error.message}</p>`;
    }
}

document.getElementById("btn-add-friend").addEventListener("click", async () => {
    const input = document.getElementById("add-friend-input");
    const username = input.value.trim();
    const errorEl = document.getElementById("friend-error");
    errorEl.innerText = "";
    if (!username) return;
    try {
        await apiRequest("/friends/request", "POST", { username });
        input.value = "";
        loadFriendsScreen();
    } catch (error) {
        errorEl.innerText = error.message;
    }
});

// Authentication UI Handlers
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    
    const result = await login(username, password);
    if (result.success) {
        showScreen("main-menu");
        updateMenuStats();
        connectSocket();
    } else {
        document.getElementById("login-error").innerText = result.error;
    }
});

document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    
    const result = await register(username, email, password);
    if (result.success) {
        showScreen("main-menu");
        updateMenuStats();
        connectSocket();
    } else {
        document.getElementById("register-error").innerText = result.error;
    }
});

document.getElementById("btn-show-register").addEventListener("click", () => {
    showScreen("register-screen");
});

document.getElementById("btn-show-login").addEventListener("click", () => {
    showScreen("login-screen");
});

document.getElementById("btn-logout").addEventListener("click", async () => {
    const result = await logout();
    if (result.success) {
        disconnectSocket();
        showScreen("login-screen");
    }
});

document.getElementById("btn-play").addEventListener("click", () => {
    buildMapSelection();
    showScreen("map-screen");
});
document.getElementById("btn-shop").addEventListener("click", () => {
    buildShop(); showScreen("shop-screen");
});
document.getElementById("btn-loadout").addEventListener("click", () => {
    buildLoadout(); showScreen("loadout-screen");
});
document.getElementById("btn-daily").addEventListener("click", () => {
    buildDailyRewards(); showScreen("daily-screen");
});
document.getElementById("btn-quests").addEventListener("click", () => {
    buildQuests(); showScreen("quests-screen");
});
document.getElementById("btn-friends").addEventListener("click", () => {
    if (!socket) connectSocket();
    loadFriendsScreen(); showScreen("friends-screen");
});
document.querySelectorAll(".back-btn").forEach(btn => btn.addEventListener("click", () => showScreen("main-menu")));

function buildMapSelection() {
    const container = document.getElementById("map-container");
    const modeContainer = document.getElementById("mode-container");
    container.innerHTML = "";
    modeContainer.innerHTML = "";

    // Guests don't pick a map - they join whatever the host chooses on the shared board
    if (currentMatch && !currentMatch.isHost) {
        container.innerHTML = `<p>Waiting for <strong>${currentMatch.opponent}</strong> to choose a map and start the match...</p>`;
        return;
    }
    
    let selectedMap = currentMap;
    let selectedMode = GAME_MODES.normal;
    
    Object.values(MAPS).forEach(map => {
        const div = document.createElement("div");
        div.className = "tower-card";
        div.style.borderColor = map.difficulty === "Easy" ? "#2ecc71" : 
                               map.difficulty === "Medium" ? "#f39c12" : "#e74c3c";
        
        div.innerHTML = `
            <h3>${map.name}</h3>
            <p>${map.description}</p>
            <p>Difficulty: <span style="color: ${map.difficulty === "Easy" ? "#2ecc71" : map.difficulty === "Medium" ? "#f39c12" : "#e74c3c"}">${map.difficulty}</span></p>
            <button id="select-${map.id}">Select</button>
        `;
        container.appendChild(div);
        
        document.getElementById(`select-${map.id}`).addEventListener("click", () => {
            selectedMap = map;
            // Update selection visual
            document.querySelectorAll("#map-container .tower-card").forEach(c => c.style.background = "");
            div.style.background = "#34495e";
        });
    });
    
    Object.values(GAME_MODES).forEach(mode => {
        const div = document.createElement("div");
        div.className = "tower-card";
        div.style.borderColor = mode.id === "normal" ? "#2ecc71" : 
                               mode.id === "hardcore" ? "#e74c3c" : "#f39c12";
        
        div.innerHTML = `
            <h3>${mode.name}</h3>
            <p>${mode.description}</p>
            <p>Rewards: x${mode.xpMult} XP</p>
            <button id="mode-${mode.id}">Select</button>
        `;
        modeContainer.appendChild(div);
        
        document.getElementById(`mode-${mode.id}`).addEventListener("click", () => {
            selectedMode = mode;
            // Update selection visual
            document.querySelectorAll("#mode-container .tower-card").forEach(c => c.style.background = "");
            div.style.background = "#34495e";
        });
    });
    
    // Start button
    const startBtn = document.createElement("button");
    startBtn.className = "primary-btn";
    startBtn.innerText = "START GAME";
    startBtn.style.marginTop = "20px";
    startBtn.onclick = () => {
        currentMap = selectedMap;
        path = selectedMap.path;
        gameState.gameMode = selectedMode.id;
        if (currentMatch && currentMatch.isHost) {
            sendMatchEvent({ type: "init", mapId: selectedMap.id, modeId: selectedMode.id });
        }
        showScreen("game-screen");
        startGame();
    };
    modeContainer.appendChild(startBtn);
}

function buildDailyRewards() {
    const container = document.getElementById("daily-rewards-container");
    container.innerHTML = "";
    
    // Check if can claim today
    const today = new Date().toDateString();
    const canClaim = !playerData.dailyRewards.claimedToday;
    
    document.getElementById("daily-streak").innerText = playerData.dailyRewards.streak;
    
    DAILY_REWARDS.forEach((reward, index) => {
        const dayNum = (playerData.dailyRewards.streak % 7) + 1;
        const isCurrentDay = index + 1 === dayNum;
        const isPastDay = index + 1 < dayNum;
        
        const div = document.createElement("div");
        div.className = "tower-card";
        div.style.borderColor = isCurrentDay ? "#f39c12" : isPastDay ? "#2ecc71" : "#555";
        div.style.opacity = isPastDay ? "0.5" : "1";
        
        div.innerHTML = `
            <h3>Day ${reward.day}</h3>
            <p><span class="coin-text">+${reward.coins} Coins</span></p>
            ${reward.gems > 0 ? `<p><span class="gem-text">+${reward.gems} Gems</span></p>` : ""}
            <p>+${reward.xp} XP</p>
            ${isPastDay ? "<p>Claimed</p>" : isCurrentDay && !canClaim ? "<p>Wait until tomorrow</p>" : ""}
        `;
        container.appendChild(div);
    });
    
    const claimBtn = document.getElementById("btn-claim-daily");
    claimBtn.disabled = !canClaim;
    claimBtn.onclick = () => {
        if (canClaim) {
            const dayNum = (playerData.dailyRewards.streak % 7);
            const reward = DAILY_REWARDS[dayNum];
            
            playerData.coins += reward.coins;
            playerData.gems += reward.gems;
            addXP(reward.xp);
            
            playerData.dailyRewards.streak++;
            playerData.dailyRewards.lastClaimDate = today;
            playerData.dailyRewards.claimedToday = true;
            
            saveProgress();
            updateMenuStats();
            buildDailyRewards();
        }
    };
}

function buildQuests() {
    const activeContainer = document.getElementById("active-quests-container");
    const availableContainer = document.getElementById("available-quests-container");
    activeContainer.innerHTML = "";
    availableContainer.innerHTML = "";
    
    // Display active quests
    playerData.quests.active.forEach(questId => {
        const quest = QUEST_DEFINITIONS[questId];
        if (!quest) return;
        
        const progress = playerData.questProgress[quest.objective] || 0;
        const isComplete = progress >= quest.target;
        
        const div = document.createElement("div");
        div.className = "tower-card";
        div.style.borderColor = isComplete ? "#2ecc71" : "#f39c12";
        
        div.innerHTML = `
            <h3>${quest.name}</h3>
            <p>${quest.description}</p>
            <p>Progress: ${progress}/${quest.target}</p>
            <p>Rewards: <span class="coin-text">+${quest.reward.coins}</span>, <span class="gem-text">+${quest.reward.gems}</span>, +${quest.reward.xp} XP</p>
            ${isComplete ? `<button id="claim-quest-${questId}" class="primary-btn">Claim Reward</button>` : "<p>In Progress</p>"}
        `;
        activeContainer.appendChild(div);
        
        if (isComplete) {
            document.getElementById(`claim-quest-${questId}`).onclick = () => {
                playerData.coins += quest.reward.coins;
                playerData.gems += quest.reward.gems;
                addXP(quest.reward.xp);
                
                playerData.quests.active = playerData.quests.active.filter(id => id !== questId);
                playerData.quests.completed.push(questId);
                
                saveProgress();
                updateMenuStats();
                buildQuests();
            };
        }
    });
    
    // Display available quests
    Object.values(QUEST_DEFINITIONS).forEach(quest => {
        if (playerData.quests.active.includes(quest.id) || playerData.quests.completed.includes(quest.id)) return;
        
        const div = document.createElement("div");
        div.className = "tower-card";
        
        div.innerHTML = `
            <h3>${quest.name}</h3>
            <p>${quest.description}</p>
            <p>Target: ${quest.target}</p>
            <p>Rewards: <span class="coin-text">+${quest.reward.coins}</span>, <span class="gem-text">+${quest.reward.gems}</span>, +${quest.reward.xp} XP</p>
            <button id="start-quest-${quest.id}">Start Quest</button>
        `;
        availableContainer.appendChild(div);
        
        document.getElementById(`start-quest-${quest.id}`).onclick = () => {
            playerData.quests.active.push(quest.id);
            saveProgress();
            buildQuests();
        };
    });
}

function buildShop() {
    const container = document.getElementById("shop-container");
    container.innerHTML = "";
    
    // Regular towers section
    const regularHeader = document.createElement("h3");
    regularHeader.innerText = "Regular Towers";
    regularHeader.style.width = "100%";
    regularHeader.style.textAlign = "center";
    container.appendChild(regularHeader);
    
    Object.values(TOWER_DB).forEach(tower => {
        const div = document.createElement("div");
        div.className = "tower-card";
        const isOwned = playerData.ownedTowers.includes(tower.id);
        div.innerHTML = `
            <h3>${tower.name}</h3>
            <p>${tower.role}</p>
            <p>Cost: <span class="coin-text">${tower.priceCoins} Coins</span></p>
            <button ${isOwned ? "disabled" : ""} id="buy-${tower.id}">
                ${isOwned ? "Owned" : "Purchase"}
            </button>
        `;
        container.appendChild(div);
        
        if (!isOwned) {
            document.getElementById(`buy-${tower.id}`).addEventListener("click", () => {
                if (playerData.coins >= tower.priceCoins) {
                    playerData.coins -= tower.priceCoins;
                    playerData.ownedTowers.push(tower.id);
                    saveProgress();
                    buildShop();
                    updateMenuStats();
                } else alert("Not enough coins!");
            });
        }
    });
    
    // Golden towers section
    const goldenHeader = document.createElement("h3");
    goldenHeader.innerText = "Golden Towers";
    goldenHeader.style.width = "100%";
    goldenHeader.style.textAlign = "center";
    goldenHeader.style.marginTop = "20px";
    container.appendChild(goldenHeader);
    
    Object.values(GOLDEN_TOWERS).forEach(tower => {
        const div = document.createElement("div");
        div.className = "tower-card";
        div.style.borderColor = "#ffd700";
        const isOwned = playerData.goldenTowers.includes(tower.id);
        const canUnlock = playerData.level >= tower.requiredLevel;
        
        div.innerHTML = `
            <h3 style="color: #ffd700;">${tower.name}</h3>
            <p>${tower.baseId.charAt(0).toUpperCase() + tower.baseId.slice(1)} Variant</p>
            <p>Requires Level: ${tower.requiredLevel}</p>
            <p>Cost: <span class="gem-text">${tower.priceGems} Gems</span></p>
            <button ${isOwned ? "disabled" : !canUnlock ? "disabled" : ""} id="buy-${tower.id}">
                ${isOwned ? "Owned" : !canUnlock ? `Lvl ${tower.requiredLevel} Required` : "Purchase"}
            </button>
        `;
        container.appendChild(div);
        
        if (!isOwned && canUnlock) {
            document.getElementById(`buy-${tower.id}`).addEventListener("click", () => {
                if (playerData.gems >= tower.priceGems) {
                    playerData.gems -= tower.priceGems;
                    playerData.goldenTowers.push(tower.id);
                    saveProgress();
                    buildShop();
                    updateMenuStats();
                } else alert("Not enough gems!");
            });
        }
    });
}

function buildLoadout() {
    const active = document.getElementById("active-loadout");
    const owned = document.getElementById("owned-towers");
    active.innerHTML = ""; owned.innerHTML = "";

    playerData.loadout.forEach(id => {
        const t = TOWER_DB[id] || GOLDEN_TOWERS[id];
        const div = document.createElement("div");
        div.className = "tower-card equipped";
        if (GOLDEN_TOWERS[id]) {
            div.style.borderColor = "#ffd700";
        }
        div.innerHTML = `<h3>${t.name}</h3><button onclick="unequip('${id}')">Remove</button>`;
        active.appendChild(div);
    });

    // Regular towers
    playerData.ownedTowers.forEach(id => {
        const t = TOWER_DB[id];
        const isEquipped = playerData.loadout.includes(id);
        const div = document.createElement("div");
        div.className = `tower-card ${isEquipped ? "equipped" : ""}`;
        div.innerHTML = `<h3>${t.name}</h3><button onclick="${isEquipped ? '' : `equip('${id}')`}" ${isEquipped ? "disabled" : ""}>Equip</button>`;
        owned.appendChild(div);
    });
    
    // Golden towers
    playerData.goldenTowers.forEach(id => {
        const t = GOLDEN_TOWERS[id];
        const isEquipped = playerData.loadout.includes(id);
        const div = document.createElement("div");
        div.className = `tower-card ${isEquipped ? "equipped" : ""}`;
        div.style.borderColor = "#ffd700";
        div.innerHTML = `<h3 style="color: #ffd700;">${t.name}</h3><button onclick="${isEquipped ? '' : `equip('${id}')`}" ${isEquipped ? "disabled" : ""}>Equip</button>`;
        owned.appendChild(div);
    });
}
window.equip = function(id) {
    if (playerData.loadout.length < 5 && !playerData.loadout.includes(id)) {
        playerData.loadout.push(id);
        saveProgress(); buildLoadout();
    } else if (playerData.loadout.length >= 5) alert("Loadout full (Max 5).");
};
window.unequip = function(id) {
    playerData.loadout = playerData.loadout.filter(t => t !== id);
    saveProgress(); buildLoadout();
};

// --- 4. GAME ENGINE (Canvas, Objects, Logic) ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameState = {
    running: false, cash: 500, hp: 100, wave: 1,
    towers: [], enemies: [], projectiles: [],
    selectedTowerToPlace: null,
    selectedPlacedTower: null,
    waveActive: false,
    waveTimer: 0,
    frames: 0,
    gameMode: "normal" // normal, molten, fallen, hardcore, challenge
};

// Map definitions with different paths and terrain
const MAPS = {
    grasslands: {
        id: "grasslands",
        name: "Grasslands",
        description: "Simple curved path for beginners",
        difficulty: "Easy",
        bgColor: "#27ae60",
        pathColor: "#e67e22",
        path: [
            {x: -20, y: 150}, {x: 200, y: 150}, {x: 200, y: 400}, 
            {x: 600, y: 400}, {x: 600, y: 100}, {x: 820, y: 100}
        ]
    },
    desert: {
        id: "desert",
        name: "Desert",
        description: "Winding path with multiple turns",
        difficulty: "Medium",
        bgColor: "#f4a460",
        pathColor: "#8b4513",
        path: [
            {x: -20, y: 300}, {x: 150, y: 300}, {x: 150, y: 100},
            {x: 400, y: 100}, {x: 400, y: 500}, {x: 650, y: 500},
            {x: 650, y: 200}, {x: 820, y: 200}
        ]
    },
    tundra: {
        id: "tundra",
        name: "Tundra",
        description: "Long straight path with strategic corners",
        difficulty: "Medium",
        bgColor: "#87ceeb",
        pathColor: "#4682b4",
        path: [
            {x: -20, y: 50}, {x: 400, y: 50}, {x: 400, y: 300},
            {x: 200, y: 300}, {x: 200, y: 550}, {x: 600, y: 550},
            {x: 600, y: 300}, {x: 820, y: 300}
        ]
    },
    volcanic: {
        id: "volcanic",
        name: "Volcanic",
        description: "Complex path with tight corners",
        difficulty: "Hard",
        bgColor: "#2c1810",
        pathColor: "#ff4500",
        path: [
            {x: -20, y: 200}, {x: 100, y: 200}, {x: 100, y: 100},
            {x: 300, y: 100}, {x: 300, y: 400}, {x: 150, y: 400},
            {x: 150, y: 500}, {x: 500, y: 500}, {x: 500, y: 200},
            {x: 700, y: 200}, {x: 700, y: 450}, {x: 820, y: 450}
        ]
    },
    forest: {
        id: "forest",
        name: "Forest",
        description: "Zigzag path through dense terrain",
        difficulty: "Hard",
        bgColor: "#228b22",
        pathColor: "#006400",
        path: [
            {x: -20, y: 300}, {x: 200, y: 300}, {x: 200, y: 150},
            {x: 350, y: 150}, {x: 350, y: 450}, {x: 500, y: 450},
            {x: 500, y: 100}, {x: 650, y: 100}, {x: 650, y: 350},
            {x: 820, y: 350}
        ]
    }
};

let currentMap = MAPS.grasslands;
let path = currentMap.path;

// Game mode definitions with modifiers
const GAME_MODES = {
    normal: {
        id: "normal",
        name: "Normal",
        description: "Standard gameplay",
        enemyHpMult: 1.0,
        enemySpeedMult: 1.0,
        cashMult: 1.0,
        xpMult: 1.0,
        coinMult: 1.0,
        startingCash: 500,
        startingHp: 100
    },
    molten: {
        id: "molten",
        name: "Molten",
        description: "Enemies have increased speed and HP",
        enemyHpMult: 1.5,
        enemySpeedMult: 1.3,
        cashMult: 1.5,
        xpMult: 1.5,
        coinMult: 1.5,
        startingCash: 600,
        startingHp: 80
    },
    fallen: {
        id: "fallen",
        name: "Fallen",
        description: "More enemies, stronger bosses",
        enemyHpMult: 1.2,
        enemySpeedMult: 1.1,
        cashMult: 1.3,
        xpMult: 1.3,
        coinMult: 1.3,
        startingCash: 550,
        startingHp: 90
    },
    hardcore: {
        id: "hardcore",
        name: "Hardcore",
        description: "One life, no second chances",
        enemyHpMult: 2.0,
        enemySpeedMult: 1.5,
        cashMult: 2.0,
        xpMult: 2.0,
        coinMult: 2.0,
        startingCash: 700,
        startingHp: 1
    },
    challenge: {
        id: "challenge",
        name: "Challenge",
        description: "Special enemy compositions",
        enemyHpMult: 1.8,
        enemySpeedMult: 1.2,
        cashMult: 1.8,
        xpMult: 1.8,
        coinMult: 1.8,
        startingCash: 650,
        startingHp: 75
    }
};

class Enemy {
    constructor(type, waveMult) {
        this.x = path[0].x; this.y = path[0].y;
        this.pathIndex = 0;
        this.type = type;
        
        const mode = GAME_MODES[gameState.gameMode];
        
        // Enemy balancing with special abilities
        if(type === "normal") { 
            this.hp = 10 * waveMult; this.speed = 1.2 * mode.enemySpeedMult; this.reward = 5 * mode.cashMult; 
            this.color = "#e74c3c"; this.radius = 10; 
        }
        else if(type === "fast") { 
            this.hp = 6 * waveMult; this.speed = 2.0 * mode.enemySpeedMult; this.reward = 5 * mode.cashMult; 
            this.color = "#f39c12"; this.radius = 8; 
        }
        else if(type === "boss") { 
            this.hp = 150 * waveMult; this.speed = 0.7 * mode.enemySpeedMult; this.reward = 100 * mode.cashMult; 
            this.color = "#8e44ad"; this.radius = 18; 
            this.isBoss = true;
            this.phase = 1;
            this.maxPhases = 2;
            this.abilities = ["rage"];
            this.rageThreshold = 0.5;
            this.raged = false;
        }
        else if(type === "tank") { 
            this.hp = 30 * waveMult; this.speed = 0.8 * mode.enemySpeedMult; this.reward = 15 * mode.cashMult; 
            this.color = "#2c3e50"; this.radius = 14; 
        }
        else if(type === "swarm") { 
            this.hp = 3 * waveMult; this.speed = 2.5 * mode.enemySpeedMult; this.reward = 3 * mode.cashMult; 
            this.color = "#1abc9c"; this.radius = 6; 
        }
        else if(type === "shielded") { 
            this.hp = 15 * waveMult; this.speed = 1.0 * mode.enemySpeedMult; this.reward = 12 * mode.cashMult; 
            this.color = "#95a5a6"; this.radius = 11; this.shield = 10 * waveMult; this.maxShield = this.shield; 
        }
        else if(type === "regen") { 
            this.hp = 12 * waveMult; this.speed = 1.1 * mode.enemySpeedMult; this.reward = 10 * mode.cashMult; 
            this.color = "#27ae60"; this.radius = 10; this.regenRate = 0.05; 
        }
        else if(type === "immune") { 
            this.hp = 20 * waveMult; this.speed = 1.0 * mode.enemySpeedMult; this.reward = 18 * mode.cashMult; 
            this.color = "#c0392b"; this.radius = 12; this.immuneTo = ["splash"]; 
        }
        else if(type === "boss2") { 
            this.hp = 300 * waveMult; this.speed = 0.5 * mode.enemySpeedMult; this.reward = 200 * mode.cashMult; 
            this.color = "#9b59b6"; this.radius = 22; 
            this.isBoss = true;
            this.phase = 1;
            this.maxPhases = 3;
            this.abilities = ["rage", "summon", "shield"];
            this.rageThreshold = 0.6;
            this.shieldThreshold = 0.3;
            this.raged = false;
            this.shielded = false;
            this.shieldAmount = 50 * waveMult;
        }
        
        this.maxHp = this.hp;
        this.currentSpeed = this.speed;
        this.slowTimer = 0;
        this.burnTimer = 0;
        this.burnDamage = 0;
    }
    
    update() {
        // Boss phase and ability logic
        if (this.isBoss) {
            const hpPercent = this.hp / this.maxHp;
            
            // Rage ability
            if (this.abilities.includes("rage") && !this.raged && hpPercent < this.rageThreshold) {
                this.raged = true;
                this.speed *= 1.5;
                this.color = "#e74c3c"; // Visual indicator
                this.phase++;
            }
            
            // Shield ability
            if (this.abilities.includes("shield") && !this.shielded && hpPercent < this.shieldThreshold) {
                this.shielded = true;
                this.shield = this.shieldAmount;
                this.phase++;
                this.color = "#3498db"; // Visual indicator
            }
            
            // Summon ability (spawn minions)
            if (this.abilities.includes("summon") && this.phase === 2 && !this.summoned) {
                this.summoned = true;
                // Spawn 3 swarm enemies near the boss
                for (let i = 0; i < 3; i++) {
                    const minion = new Enemy("swarm", 1);
                    minion.x = this.x + (Math.random() - 0.5) * 30;
                    minion.y = this.y + (Math.random() - 0.5) * 30;
                    minion.pathIndex = this.pathIndex;
                    gameState.enemies.push(minion);
                }
            }
        }
        
        // Regeneration
        if (this.regenRate && this.hp < this.maxHp) {
            this.hp = Math.min(this.maxHp, this.hp + this.regenRate);
        }
        
        // Burn damage
        if (this.burnTimer > 0) {
            this.hp -= this.burnDamage;
            this.burnTimer--;
        }
        
        // Slow effect
        if (this.slowTimer > 0) {
            this.currentSpeed = this.speed * 0.5;
            this.slowTimer--;
        } else {
            this.currentSpeed = this.speed;
        }
        
        const target = path[this.pathIndex + 1];
        if (!target) return true; // Reached end

        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < this.currentSpeed) {
            this.x = target.x; this.y = target.y;
            this.pathIndex++;
            if (this.pathIndex >= path.length - 1) {
                gameState.hp -= 10; // Base takes damage
                return true; 
            }
        } else {
            this.x += (dx / dist) * this.currentSpeed;
            this.y += (dy / dist) * this.currentSpeed;
        }
        return false;
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
        
        // Shield indicator
        if (this.shield > 0) {
            ctx.strokeStyle = "#3498db";
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2); ctx.stroke();
        }
        
        // Boss health bar (larger and more detailed)
        if (this.isBoss) {
            const barWidth = 40;
            const barHeight = 6;
            const barY = this.y - this.radius - 15;
            
            // Background
            ctx.fillStyle = "#333";
            ctx.fillRect(this.x - barWidth/2, barY, barWidth, barHeight);
            
            // HP bar
            ctx.fillStyle = "#e74c3c";
            ctx.fillRect(this.x - barWidth/2, barY, barWidth * (this.hp / this.maxHp), barHeight);
            
            // Phase indicator
            ctx.fillStyle = "#fff";
            ctx.font = "10px Arial";
            ctx.fillText(`P${this.phase}`, this.x - 5, barY - 3);
            
            // Shield bar for boss
            if (this.shield > 0) {
                ctx.fillStyle = "#3498db";
                ctx.fillRect(this.x - barWidth/2, barY - 4, barWidth * (this.shield / this.shieldAmount), 3);
            }
        } else {
            // Regular enemy HP bar
            ctx.fillStyle = "red"; ctx.fillRect(this.x - 10, this.y - 15, 20, 4);
            ctx.fillStyle = "green"; ctx.fillRect(this.x - 10, this.y - 15, 20 * (this.hp / this.maxHp), 4);
            
            // Shield Bar
            if (this.shield > 0) {
                ctx.fillStyle = "#3498db"; ctx.fillRect(this.x - 10, this.y - 20, 20 * (this.shield / this.maxShield), 3);
            }
        }
        
        // Status effect indicators
        if (this.slowTimer > 0) {
            ctx.fillStyle = "#3498db";
            ctx.beginPath(); ctx.arc(this.x + 8, this.y - 8, 3, 0, Math.PI * 2); ctx.fill();
        }
        if (this.burnTimer > 0) {
            ctx.fillStyle = "#e74c3c";
            ctx.beginPath(); ctx.arc(this.x - 8, this.y - 8, 3, 0, Math.PI * 2); ctx.fill();
        }
    }
    
    takeDamage(damage, type) {
        // Check immunity
        if (this.immuneTo && this.immuneTo.includes(type)) {
            return; // Immune to this damage type
        }
        
        // Shield absorbs damage first
        if (this.shield > 0) {
            if (this.shield >= damage) {
                this.shield -= damage;
                return;
            } else {
                damage -= this.shield;
                this.shield = 0;
            }
        }
        
        this.hp -= damage;
    }
    
    applySlow(amount, duration) {
        this.slowTimer = duration;
    }
    
    applyBurn(damage, duration) {
        this.burnDamage = damage;
        this.burnTimer = duration;
    }
}

class Tower {
    constructor(typeId, x, y, owner) {
        this.typeId = typeId;
        this.uid = nextTowerUid++;
        this.owner = owner || currentUsername;
        this.isGolden = GOLDEN_TOWERS[typeId] !== undefined;
        
        if (this.isGolden) {
            this.goldenData = GOLDEN_TOWERS[typeId];
            this.baseData = TOWER_DB[this.goldenData.baseId];
        } else {
            this.baseData = TOWER_DB[typeId];
        }
        
        this.x = x; this.y = y;
        this.level = 0;
        this.lastAttack = 0;
        this.targetingMode = "first"; // first, last, strongest, weakest
        this.charge = 0; // For accelerator
        
        // Apply golden multipliers if applicable
        this.stats = this.applyGoldenMultipliers(this.baseData.levels[0]);
    }
    
    applyGoldenMultipliers(stats) {
        if (!this.isGolden || !this.goldenData.statMultipliers) return stats;
        
        const multipliers = this.goldenData.statMultipliers;
        const modifiedStats = { ...stats };
        
        for (let key in multipliers) {
            if (modifiedStats[key] !== undefined) {
                if (key === "cooldown") {
                    modifiedStats[key] = modifiedStats[key] * multipliers[key];
                } else {
                    modifiedStats[key] = modifiedStats[key] * multipliers[key];
                }
            }
        }
        
        return modifiedStats;
    }
    
    update() {
        // Farm logic
        if (this.baseData.type === "economy") {
            if (gameState.frames - this.lastAttack > (this.stats.cooldown / 16.66)) {
                gameState.cash += this.stats.income;
                updateGameUI();
                this.lastAttack = gameState.frames;
                
                // Float text effect
                gameState.projectiles.push(new FloatText("+$" + this.stats.income, this.x, this.y - 20));
            }
            return;
        }

        // Accelerator charge logic
        if (this.baseData.type === "damage" && this.stats.chargeRate) {
            this.charge = Math.min(1, this.charge + this.stats.chargeRate);
        }

        // Combat logic
        const effectiveCooldown = this.stats.cooldown / (1 + (this.charge * 0.5));
        if (gameState.frames - this.lastAttack > (effectiveCooldown / 16.66)) {
            let target = this.findTarget();
            
            if (target) {
                gameState.projectiles.push(new Projectile(this.x, this.y, target, this.stats, this.baseData.type, this));
                this.lastAttack = gameState.frames;
                this.charge = 0; // Reset charge after firing
            }
        }
    }
    
    findTarget() {
        let target = null;
        let bestValue = -1;
        
        for (let enemy of gameState.enemies) {
            const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (dist <= this.stats.range) {
                let currentValue = 0;
                
                switch(this.targetingMode) {
                    case "first":
                        currentValue = enemy.pathIndex * 1000 + dist;
                        break;
                    case "last":
                        currentValue = -(enemy.pathIndex * 1000 + dist);
                        break;
                    case "strongest":
                        currentValue = enemy.hp;
                        break;
                    case "weakest":
                        currentValue = -enemy.hp;
                        break;
                }
                
                if (currentValue > bestValue) {
                    bestValue = currentValue;
                    target = enemy;
                }
            }
        }
        
        return target;
    }
    
    draw() {
        ctx.fillStyle = this.baseData.color;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.baseData.radius, 0, Math.PI * 2); ctx.fill();
        
        // Level indicator
        ctx.fillStyle = "#fff";
        ctx.font = "10px Arial";
        ctx.fillText(this.level + 1, this.x - 3, this.y + 4);
        
        // Render gun barrel
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(this.x + 10, this.y - 10); ctx.stroke();
        
        // Targeting mode indicator
        ctx.fillStyle = "#fff";
        ctx.font = "8px Arial";
        ctx.fillText(this.targetingMode[0].toUpperCase(), this.x - 3, this.y - this.baseData.radius - 5);
    }
    
    upgrade() {
        if (this.level < this.baseData.levels.length - 1) {
            const nextLevel = this.baseData.levels[this.level + 1];
            if (gameState.cash >= nextLevel.costCash) {
                gameState.cash -= nextLevel.costCash;
                this.level++;
                this.stats = this.applyGoldenMultipliers(nextLevel);
                // Quest progress tracking
                playerData.questProgress.towersUpgraded = (playerData.questProgress.towersUpgraded || 0) + 1;
                updateGameUI();
                return true;
            }
        }
        return false;
    }
    
    cycleTargeting() {
        const modes = ["first", "last", "strongest", "weakest"];
        const currentIndex = modes.indexOf(this.targetingMode);
        this.targetingMode = modes[(currentIndex + 1) % modes.length];
    }
}

class Projectile {
    constructor(x, y, target, stats, type, tower) {
        this.x = x; this.y = y; this.target = target;
        this.stats = stats; this.type = type;
        this.tower = tower;
        this.speed = 8; this.active = true;
        this.chainedEnemies = []; // For chain lightning
    }
    update() {
        if (!this.target || this.target.hp <= 0) { this.active = false; return; }
        
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < this.speed) {
            // Apply damage based on type
            if (this.type === "splash") {
                // Splash damage
                gameState.enemies.forEach(e => {
                    if (Math.hypot(e.x - this.target.x, e.y - this.target.y) <= this.stats.splash) {
                        e.takeDamage(this.stats.damage, "splash");
                    }
                });
            } else if (this.type === "chain") {
                // Chain lightning
                this.target.takeDamage(this.stats.damage, "chain");
                this.chainedEnemies.push(this.target);
                
                // Chain to additional enemies
                let remainingChains = (this.stats.chainCount || 0) - this.chainedEnemies.length;
                if (remainingChains > 0) {
                    let nextTarget = null;
                    let minDist = 100;
                    
                    for (let e of gameState.enemies) {
                        if (!this.chainedEnemies.includes(e) && e.hp > 0) {
                            const d = Math.hypot(e.x - this.target.x, e.y - this.target.y);
                            if (d < minDist) {
                                minDist = d;
                                nextTarget = e;
                            }
                        }
                    }
                    
                    if (nextTarget) {
                        this.target = nextTarget;
                        this.x = this.target.x;
                        this.y = this.target.y;
                        return; // Continue chaining
                    }
                }
            } else if (this.type === "slow") {
                this.target.takeDamage(this.stats.damage || 0, "slow");
                if (this.stats.slowAmount && this.stats.slowDuration) {
                    this.target.applySlow(this.stats.slowAmount, this.stats.slowDuration);
                }
            } else if (this.type === "dot") {
                this.target.takeDamage(this.stats.damage || 0, "dot");
                if (this.stats.burnDamage && this.stats.burnDuration) {
                    this.target.applyBurn(this.stats.burnDamage, this.stats.burnDuration);
                }
            } else {
                this.target.takeDamage(this.stats.damage, "damage");
            }
            
            this.active = false;
        } else {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
    }
    draw() {
        ctx.fillStyle = this.type === "chain" ? "#9b59b6" : 
                       this.type === "slow" ? "#3498db" : 
                       this.type === "dot" ? "#e74c3c" : "#fff";
        ctx.beginPath(); ctx.arc(this.x, this.y, 3, 0, Math.PI * 2); ctx.fill();
    }
}

class FloatText {
    constructor(text, x, y) { this.text = text; this.x = x; this.y = y; this.life = 60; this.active = true;}
    update() { this.y -= 0.5; this.life--; if(this.life <= 0) this.active = false; }
    draw() { ctx.fillStyle = "#2ecc71"; ctx.font="14px Arial"; ctx.fillText(this.text, this.x, this.y); }
}

// --- 5. GAME LOOP & WAVE MANAGEMENT ---
let spawnQueue = [];
let spawnTimer = 0;

function generateWave() {
    const mode = GAME_MODES[gameState.gameMode];
    const waveMult = 1 + (gameState.wave * 0.2) * mode.enemyHpMult;
    let count = 5 + gameState.wave * 2;
    
    // Challenge mode has more enemies
    if (gameState.gameMode === "challenge") {
        count = Math.floor(count * 1.5);
    }
    
    spawnQueue = [];
    
    for (let i = 0; i < count; i++) {
        let type = "normal";
        
        // Progressive enemy introduction
        if (gameState.wave > 2 && i % 3 === 0) type = "fast";
        if (gameState.wave > 6 && i % 5 === 0) type = "tank";
        if (gameState.wave > 8 && i % 6 === 0) type = "swarm";
        if (gameState.wave > 10 && i % 7 === 0) type = "shielded";
        if (gameState.wave > 12 && i % 8 === 0) type = "regen";
        if (gameState.wave > 15 && i % 9 === 0) type = "immune";
        
        // Boss waves
        if (gameState.wave % 5 === 0 && i === count - 1) type = "boss";
        if (gameState.wave % 10 === 0 && i === count - 1) type = "boss2";
        
        // Challenge mode special compositions
        if (gameState.gameMode === "challenge" && gameState.wave % 3 === 0 && i % 2 === 0) {
            type = "immune";
        }
        
        spawnQueue.push({ type, waveMult });
    }
    gameState.waveActive = true;
    gameState.waveTimer = 180; // 3 seconds at 60fps
}

function gameLoop() {
    if (!gameState.running) return;
    gameState.frames++;

    // Clear Canvas with map background
    ctx.fillStyle = currentMap.bgColor; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Path with map colors
    ctx.strokeStyle = currentMap.pathColor; ctx.lineWidth = 40; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for(let i=1; i<path.length; i++) ctx.lineTo(path[i].x, path[i].y);
    ctx.stroke();

    // Spawning
    if (gameState.waveActive && spawnQueue.length > 0) {
        if (gameState.frames - spawnTimer > 60) {
            const next = spawnQueue.shift();
            gameState.enemies.push(new Enemy(next.type, next.waveMult));
            spawnTimer = gameState.frames;
        }
    } else if (gameState.waveActive && gameState.enemies.length === 0) {
        // Wave complete - wait for the player to click "START WAVE" for the next one
        gameState.waveActive = false;
        gameState.wave++;
        gameState.cash += 100 + (gameState.wave * 20); // Wave completion bonus
        updateGameUI();
    }

    // Entities Update & Draw
    gameState.towers.forEach(t => { t.update(); t.draw(); });
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const e = gameState.enemies[i];
        if (e.hp <= 0) {
            gameState.cash += e.reward;
            // Quest progress tracking
            playerData.questProgress.enemiesDefeated = (playerData.questProgress.enemiesDefeated || 0) + 1;
            if (e.type === "boss" || e.type === "boss2") {
                playerData.questProgress.bossesDefeated = (playerData.questProgress.bossesDefeated || 0) + 1;
            }
            gameState.enemies.splice(i, 1);
            updateGameUI();
        } else {
            if (e.update()) gameState.enemies.splice(i, 1); // Reached base
            else e.draw();
        }
    }

    for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
        const p = gameState.projectiles[i];
        p.update();
        if (!p.active) gameState.projectiles.splice(i, 1);
        else p.draw();
    }

    // Draw Placement Preview
    if (gameState.selectedTowerToPlace) {
        const rect = canvas.getBoundingClientRect();
        const tData = TOWER_DB[gameState.selectedTowerToPlace];
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.beginPath(); ctx.arc(mouseX, mouseY, tData.levels[0].range || 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = tData.color;
        ctx.globalAlpha = 0.5;
        ctx.beginPath(); ctx.arc(mouseX, mouseY, tData.radius, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    // Draw selection ring
    if (gameState.selectedPlacedTower) {
        ctx.strokeStyle = "white"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(gameState.selectedPlacedTower.x, gameState.selectedPlacedTower.y, gameState.selectedPlacedTower.stats.range || 0, 0, Math.PI*2); ctx.stroke();
    }

    // Game Over check
    if (gameState.hp <= 0) {
        endGame(false);
        return;
    }

    // Shared-board co-op: push an authoritative snapshot to the guest a few times a second
    if (currentMatch && currentMatch.isHost && gameState.frames % 3 === 0) {
        broadcastCoopState();
    }

    requestAnimationFrame(gameLoop);
}

// --- 6. IN-GAME INPUTS & UI ---
let mouseX = 0, mouseY = 0;
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener("click", (e) => {
    if (currentMatch && !currentMatch.isHost) {
        handleGuestCanvasClick();
        return;
    }

    // Attempt place tower
    if (gameState.selectedTowerToPlace) {
        const base = TOWER_DB[gameState.selectedTowerToPlace];
        const cost = base.levels[0].costCash;
        if (gameState.cash >= cost) {
            // Simplified placement (no collision check for MVP)
            gameState.cash -= cost;
            gameState.towers.push(new Tower(gameState.selectedTowerToPlace, mouseX, mouseY, currentUsername));
            // Quest progress tracking
            playerData.questProgress.towersPlaced = (playerData.questProgress.towersPlaced || 0) + 1;
            gameState.selectedTowerToPlace = null;
            buildMatchLoadout();
            updateGameUI();
        }
        return;
    }

    // Attempt select placed tower for upgrade
    gameState.selectedPlacedTower = null;
    for (let t of gameState.towers) {
        if (Math.hypot(t.x - mouseX, t.y - mouseY) < t.baseData.radius * 2) {
            gameState.selectedPlacedTower = t;
            showUpgradePanel(t);
            break;
        }
    }
    if (!gameState.selectedPlacedTower) document.getElementById("upgrade-panel").classList.add("hidden");
});

function buildMatchLoadout() {
    const bar = document.getElementById("match-loadout");
    bar.innerHTML = "";
    playerData.loadout.forEach(id => {
        const t = TOWER_DB[id] || GOLDEN_TOWERS[id];
        let cost, towerData;
        
        if (GOLDEN_TOWERS[id]) {
            // Golden tower - use base tower's cost but with golden stats
            const baseTower = TOWER_DB[t.baseId];
            cost = baseTower.levels[0].costCash;
            towerData = { ...baseTower, ...t, isGolden: true };
        } else {
            cost = t.levels[0].costCash;
            towerData = t;
        }
        
        const btn = document.createElement("div");
        btn.className = `match-tower-btn ${gameState.cash < cost ? "disabled" : ""}`;
        if (gameState.selectedTowerToPlace === id) btn.classList.add("selected");
        if (GOLDEN_TOWERS[id]) btn.style.borderColor = "#ffd700";
        
        btn.innerHTML = `<strong>${t.name}</strong><span>$${cost}</span>`;
        btn.onclick = () => {
            if (gameState.cash >= cost) {
                gameState.selectedTowerToPlace = gameState.selectedTowerToPlace === id ? null : id;
                buildMatchLoadout();
            }
        };
        bar.appendChild(btn);
    });
}

function updateGameUI() {
    document.getElementById("game-hp").innerText = gameState.hp;
    document.getElementById("game-wave").innerText = gameState.wave;
    document.getElementById("game-cash").innerText = gameState.cash;
    
    // Wave status display + START WAVE button state
    const timerEl = document.getElementById("wave-timer-ui");
    const startBtn = document.getElementById("btn-start-wave");
    if (gameState.waveActive) {
        timerEl.innerText = "Wave in progress";
        startBtn.disabled = true;
    } else {
        timerEl.innerText = "Ready for next wave";
        startBtn.disabled = false;
    }
    
    buildMatchLoadout(); // Update availability colors
}

function showUpgradePanel(tower) {
    const p = document.getElementById("upgrade-panel");
    p.classList.remove("hidden");
    document.getElementById("upg-title").innerText = tower.baseData.name;
    document.getElementById("upg-level").innerText = tower.level + 1;
    document.getElementById("upg-dmg").innerText = tower.stats.damage || tower.stats.income;
    document.getElementById("upg-range").innerText = tower.stats.range || 0;
    document.getElementById("upg-targeting").innerText = tower.targetingMode.charAt(0).toUpperCase() + tower.targetingMode.slice(1);
    
    // Targeting mode button
    document.getElementById("btn-targeting").onclick = () => {
        tower.cycleTargeting();
        showUpgradePanel(tower);
    };
    
    const upgBtn = document.getElementById("btn-upgrade");
    if (tower.level < tower.baseData.levels.length - 1) {
        const next = tower.baseData.levels[tower.level + 1];
        document.getElementById("upg-cost").innerText = next.costCash;
        upgBtn.disabled = gameState.cash < next.costCash;
        upgBtn.onclick = () => {
            if(tower.upgrade()) showUpgradePanel(tower);
        };
    } else {
        document.getElementById("upg-cost").innerText = "MAX";
        upgBtn.disabled = true;
    }

    document.getElementById("upg-sell").innerText = Math.floor(tower.stats.costCash * 0.5);
    document.getElementById("btn-sell").onclick = () => {
        gameState.cash += Math.floor(tower.stats.costCash * 0.5);
        gameState.towers = gameState.towers.filter(t => t !== tower);
        gameState.selectedPlacedTower = null;
        p.classList.add("hidden");
        updateGameUI();
    };
}
document.getElementById("btn-close-panel").onclick = () => {
    gameState.selectedPlacedTower = null;
    guestSelectedUid = null;
    document.getElementById("upgrade-panel").classList.add("hidden");
};

function startGame() {
    const mode = GAME_MODES[gameState.gameMode];
    nextTowerUid = 1;
    gameState = {
        running: true, 
        cash: mode.startingCash, 
        hp: mode.startingHp, 
        wave: 1,
        towers: [], enemies: [], projectiles: [],
        selectedTowerToPlace: null, selectedPlacedTower: null,
        waveActive: false, 
        waveTimer: 0,
        frames: 0,
        gameMode: gameState.gameMode
    };
    document.getElementById("game-over-overlay").classList.add("hidden");
    document.getElementById("upgrade-panel").classList.add("hidden");
    updateGameUI();
    // Wave 1 no longer starts automatically - the player clicks "START WAVE" when ready.
    requestAnimationFrame(gameLoop);
}

// Called when the local player clicks "START WAVE" (host in co-op, or solo play).
function startNextWave() {
    if (!gameState.running || gameState.waveActive) return;
    generateWave();
    updateGameUI();
    if (currentMatch) sendMatchEvent({ type: "wave", wave: gameState.wave });
}

// --- SHARED-BOARD CO-OP: HOST SIDE ---
// The host runs the real simulation (gameState) as normal. These two functions are its
// only extra responsibilities: tell the guest what the board looks like, and accept the
// guest's requested actions (place/upgrade/sell/re-target) against that same real board.

function broadcastCoopState() {
    if (!socket || !currentMatch || !currentMatch.isHost) return;
    const state = {
        cash: gameState.cash, hp: gameState.hp, wave: gameState.wave,
        waveActive: gameState.waveActive, waveTimer: gameState.waveTimer,
        gameMode: gameState.gameMode, mapId: currentMap.id,
        towers: gameState.towers.map(t => ({
            uid: t.uid, typeId: t.typeId, isGolden: t.isGolden, owner: t.owner,
            x: t.x, y: t.y, level: t.level, targetingMode: t.targetingMode,
            color: t.baseData.color, radius: t.baseData.radius
        })),
        enemies: gameState.enemies.map(e => ({
            x: e.x, y: e.y, hp: e.hp, maxHp: e.maxHp, color: e.color, radius: e.radius,
            isBoss: e.isBoss, phase: e.phase,
            shield: e.shield || 0, maxShield: e.maxShield || e.shieldAmount || 0,
            slowTimer: e.slowTimer, burnTimer: e.burnTimer
        })),
        projectiles: gameState.projectiles.map(p => ({ x: p.x, y: p.y, type: p.type }))
    };
    socket.emit("match:state", { toUsername: currentMatch.opponent, state });
}

function applyRemoteAction(action) {
    if (!action) return;
    if (action.type === "placeTower") {
        const base = TOWER_DB[action.towerId];
        if (!base) return;
        const cost = base.levels[0].costCash;
        if (gameState.cash >= cost) {
            gameState.cash -= cost;
            gameState.towers.push(new Tower(action.towerId, action.x, action.y, currentMatch.opponent));
            updateGameUI();
        }
    } else if (action.type === "upgradeTower") {
        const t = gameState.towers.find(tw => tw.uid === action.uid);
        if (t) t.upgrade();
    } else if (action.type === "sellTower") {
        const t = gameState.towers.find(tw => tw.uid === action.uid);
        if (t) {
            gameState.cash += Math.floor(t.stats.costCash * 0.5);
            gameState.towers = gameState.towers.filter(tw => tw !== t);
            if (gameState.selectedPlacedTower === t) gameState.selectedPlacedTower = null;
            document.getElementById("upgrade-panel").classList.add("hidden");
            updateGameUI();
        }
    } else if (action.type === "cycleTargeting") {
        const t = gameState.towers.find(tw => tw.uid === action.uid);
        if (t) t.cycleTargeting();
    } else if (action.type === "startWave") {
        startNextWave();
    }
}

// --- SHARED-BOARD CO-OP: GUEST SIDE ---
// The guest never simulates the board itself - it just renders whatever snapshot the
// host last sent, and turns clicks into action requests sent back to the host.

function startGuestMatch() {
    document.getElementById("game-over-overlay").classList.add("hidden");
    document.getElementById("upgrade-panel").classList.add("hidden");
    remoteState = null;
    guestSelectedTowerToPlace = null;
    guestSelectedUid = null;
    buildGuestMatchLoadout();
    requestAnimationFrame(guestRenderLoop);
}

function guestRenderLoop() {
    if (!currentMatch || currentMatch.isHost) return; // match ended, or role changed
    guestRenderLoop._frame = (guestRenderLoop._frame || 0) + 1;
    if (guestRenderLoop._frame % 30 === 0) buildGuestMatchLoadout();

    ctx.fillStyle = currentMap.bgColor; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = currentMap.pathColor; ctx.lineWidth = 40; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
    ctx.stroke();

    if (remoteState) {
        document.getElementById("game-hp").innerText = remoteState.hp;
        document.getElementById("game-wave").innerText = remoteState.wave;
        document.getElementById("game-cash").innerText = remoteState.cash;
        const timerEl = document.getElementById("wave-timer-ui");
        timerEl.innerText = remoteState.waveActive ? "Wave in progress" : "Ready for next wave";
        document.getElementById("btn-start-wave").disabled = remoteState.waveActive;

        remoteState.towers.forEach(t => {
            ctx.fillStyle = t.color;
            ctx.beginPath(); ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#fff"; ctx.font = "10px Arial";
            ctx.fillText(t.level + 1, t.x - 3, t.y + 4);
            // Ring the teammate's towers so it's clear this is a shared board
            if (t.owner && t.owner !== currentUsername) {
                ctx.strokeStyle = "#f39c12"; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(t.x, t.y, t.radius + 3, 0, Math.PI * 2); ctx.stroke();
            }
            if (t.uid === guestSelectedUid) {
                ctx.strokeStyle = "white"; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.arc(t.x, t.y, 80, 0, Math.PI * 2); ctx.stroke();
            }
        });

        remoteState.enemies.forEach(e => {
            ctx.fillStyle = e.color;
            ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "red"; ctx.fillRect(e.x - 10, e.y - 15, 20, 4);
            ctx.fillStyle = "green"; ctx.fillRect(e.x - 10, e.y - 15, 20 * (e.hp / e.maxHp), 4);
            if (e.shield > 0) {
                ctx.fillStyle = "#3498db"; ctx.fillRect(e.x - 10, e.y - 20, 20 * (e.shield / (e.maxShield || 1)), 3);
            }
        });

        remoteState.projectiles.forEach(p => {
            ctx.fillStyle = p.type === "chain" ? "#9b59b6" : p.type === "slow" ? "#3498db" : p.type === "dot" ? "#e74c3c" : "#fff";
            ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
        });

        if (guestSelectedTowerToPlace) {
            const tData = TOWER_DB[guestSelectedTowerToPlace];
            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            ctx.beginPath(); ctx.arc(mouseX, mouseY, tData.levels[0].range || 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = tData.color; ctx.globalAlpha = 0.5;
            ctx.beginPath(); ctx.arc(mouseX, mouseY, tData.radius, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1.0;
        }

        if (remoteState.hp <= 0) {
            document.getElementById("game-over-overlay").classList.remove("hidden");
            document.getElementById("end-title").innerText = "MATCH OVER";
            document.getElementById("end-stats").innerHTML = `Waves Cleared: ${Math.max(0, remoteState.wave - 1)}`;
            return; // stop the render loop, match is over
        }
    }

    requestAnimationFrame(guestRenderLoop);
}

function buildGuestMatchLoadout() {
    const bar = document.getElementById("match-loadout");
    bar.innerHTML = "";
    const cash = remoteState ? remoteState.cash : 0;
    playerData.loadout.forEach(id => {
        const t = TOWER_DB[id] || GOLDEN_TOWERS[id];
        const cost = GOLDEN_TOWERS[id] ? TOWER_DB[GOLDEN_TOWERS[id].baseId].levels[0].costCash : t.levels[0].costCash;

        const btn = document.createElement("div");
        btn.className = `match-tower-btn ${cash < cost ? "disabled" : ""}`;
        if (guestSelectedTowerToPlace === id) btn.classList.add("selected");
        if (GOLDEN_TOWERS[id]) btn.style.borderColor = "#ffd700";

        btn.innerHTML = `<strong>${t.name}</strong><span>$${cost}</span>`;
        btn.onclick = () => {
            if (cash >= cost) {
                guestSelectedTowerToPlace = guestSelectedTowerToPlace === id ? null : id;
                buildGuestMatchLoadout();
            }
        };
        bar.appendChild(btn);
    });
}

function handleGuestCanvasClick() {
    if (!socket || !currentMatch) return;

    if (guestSelectedTowerToPlace) {
        socket.emit("match:action", {
            toUsername: currentMatch.opponent,
            action: { type: "placeTower", towerId: guestSelectedTowerToPlace, x: mouseX, y: mouseY }
        });
        guestSelectedTowerToPlace = null;
        buildGuestMatchLoadout();
        return;
    }

    guestSelectedUid = null;
    if (remoteState) {
        for (const t of remoteState.towers) {
            if (Math.hypot(t.x - mouseX, t.y - mouseY) < t.radius * 2) {
                guestSelectedUid = t.uid;
                showGuestUpgradePanel(t);
                break;
            }
        }
    }
    if (guestSelectedUid === null) document.getElementById("upgrade-panel").classList.add("hidden");
}

function showGuestUpgradePanel(t) {
    const base = TOWER_DB[t.typeId];
    const p = document.getElementById("upgrade-panel");
    p.classList.remove("hidden");
    document.getElementById("upg-title").innerText = base.name + (t.owner !== currentUsername ? ` (${t.owner})` : "");
    document.getElementById("upg-level").innerText = t.level + 1;
    document.getElementById("upg-dmg").innerText = base.levels[t.level].damage ?? base.levels[t.level].income ?? "-";
    document.getElementById("upg-range").innerText = base.levels[t.level].range || 0;
    document.getElementById("upg-targeting").innerText = (t.targetingMode || "first").charAt(0).toUpperCase() + (t.targetingMode || "first").slice(1);

    document.getElementById("btn-targeting").onclick = () => {
        socket.emit("match:action", { toUsername: currentMatch.opponent, action: { type: "cycleTargeting", uid: t.uid } });
    };

    const upgBtn = document.getElementById("btn-upgrade");
    if (t.level < base.levels.length - 1) {
        const next = base.levels[t.level + 1];
        document.getElementById("upg-cost").innerText = next.costCash;
        upgBtn.disabled = !remoteState || remoteState.cash < next.costCash;
        upgBtn.onclick = () => {
            socket.emit("match:action", { toUsername: currentMatch.opponent, action: { type: "upgradeTower", uid: t.uid } });
        };
    } else {
        document.getElementById("upg-cost").innerText = "MAX";
        upgBtn.disabled = true;
    }

    document.getElementById("upg-sell").innerText = Math.floor(base.levels[t.level].costCash * 0.5);
    document.getElementById("btn-sell").onclick = () => {
        socket.emit("match:action", { toUsername: currentMatch.opponent, action: { type: "sellTower", uid: t.uid } });
        p.classList.add("hidden");
        guestSelectedUid = null;
    };
}

function endGame(victory) {
    gameState.running = false;
    const mode = GAME_MODES[gameState.gameMode];
    const coinsEarned = Math.floor(gameState.wave * 15 * mode.coinMult);
    const xpEarned = Math.floor(gameState.wave * 25 * mode.xpMult);
    
    // Quest progress tracking
    if (victory) {
        playerData.questProgress.matchesWon = (playerData.questProgress.matchesWon || 0) + 1;
        if (gameState.gameMode === "hardcore") {
            playerData.questProgress.hardcoreWins = (playerData.questProgress.hardcoreWins || 0) + 1;
        }
    }
    playerData.questProgress.wavesReached = Math.max(playerData.questProgress.wavesReached || 0, gameState.wave - 1);
    
    document.getElementById("game-over-overlay").classList.remove("hidden");
    document.getElementById("end-title").innerText = victory ? "VICTORY!" : "GAME OVER";
    document.getElementById("end-stats").innerHTML = `Waves Cleared: ${gameState.wave - 1}<br>Coins Earned: <span class="coin-text">+${coinsEarned}</span><br>XP Earned: +${xpEarned}`;
    
    playerData.coins += coinsEarned;
    addXP(xpEarned);
    saveProgress();
    updateMenuStats();

    if (currentMatch) {
        sendMatchEvent({ type: "gameover", wave: gameState.wave - 1, victory });
        currentMatch = null;
        document.getElementById("match-feed-panel").classList.add("hidden");
    }
}

document.getElementById("btn-return-menu").addEventListener("click", () => showScreen("main-menu"));

document.getElementById("btn-start-wave").addEventListener("click", () => {
    if (currentMatch && !currentMatch.isHost) {
        // Guest: ask the host (who runs the real simulation) to start the wave
        if (!socket || !currentMatch) return;
        socket.emit("match:action", { toUsername: currentMatch.opponent, action: { type: "startWave" } });
    } else {
        // Host or solo play: start it directly
        startNextWave();
    }
});

// --- Initialize ---
async function initializeApp() {
    // Check if user has a valid session
    const isValidSession = await verifySession();
    
    if (isValidSession) {
        showScreen("main-menu");
        updateMenuStats();
        connectSocket();
    } else {
        showScreen("login-screen");
    }
}

initializeApp();