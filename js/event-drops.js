// Mapping event name -> array of drop items {name, img}
// Image files should exist under /images/ (relative to site root)
// Use lowercase file names for consistency.
export const eventDrops = {
    'Boss Vàng': [
        { name: 'Chaos', img: 'chaos.jpg' },
        { name: 'Bless', img: 'bless.jpg' },
        { name: 'Soul', img: 'soul.jpg' },
        { name: 'Life', img: 'life.jpg' }
    ],
    'Devil Square': [
        { name: 'Chaos', img: 'chaos.jpg' },
        { name: 'Creation', img: 'creation.jpg' },
        { name: 'Gemstone', img: 'Gemstone.jpg' }
    ],
    'Blood Castle': [
        { name: 'Chaos', img: 'chaos.jpg' },
        { name: 'Bless', img: 'bless.jpg' },
        { name: 'Soul', img: 'soul.jpg' },
        { name: 'Life', img: 'life.jpg' },
        { name: 'Creation', img: 'creation.jpg' }
    ],
    'Chaos Castle': [
        { name: 'Chaos', img: 'chaos.jpg' },
        { name: 'Bless', img: 'bless.jpg' },
        { name: 'Soul', img: 'soul.jpg' },
        { name: 'Guardian', img: 'Guardian.jpg' }
    ],
    'Rồng Đỏ': [
        { name: 'Bless', img: 'bless.jpg' },
        { name: 'Soul', img: 'soul.jpg' },
        { name: 'Life', img: 'life.jpg' }
    ],
    'Vua Quỷ Xương': [
        { name: 'Bless', img: 'bless.jpg' },
        { name: 'Soul', img: 'soul.jpg' },
        { name: 'Harmony', img: 'Harmony.jpg' }
    ],
    'Thổ Ngọc': [
        { name: 'Gemstone', img: 'Gemstone.jpg' },
        { name: 'Creation', img: 'creation.jpg' }
    ],
    'Ngưu Ma Vương': [
        { name: 'Life', img: 'life.jpg' },
        { name: 'Guardian', img: 'Guardian.jpg' }
    ],
    'Loạn Chiến': [
        { name: 'Bless', img: 'bless.jpg' },
        { name: 'Soul', img: 'soul.jpg' }
    ],
    'Nhện': [
        { name: 'Chaos', img: 'chaos.jpg' },
        { name: 'Creation', img: 'creation.jpg' }
    ],
    'Siêu Boss': [
        { name: 'Refining Stone', img: 'RefiningStone.jpg' },
        { name: 'High Refining', img: 'highRefiningSton.jpg' }
    ],
    'Wukong': [
        { name: 'Bless', img: 'bless.jpg' },
        { name: 'Soul', img: 'soul.jpg' },
        { name: 'Life', img: 'life.jpg' }
    ],
    'Medusa': [
        { name: 'Bless', img: 'bless.jpg' },
        { name: 'Harmony', img: 'Harmony.jpg' },
        { name: 'Guardian', img: 'Guardian.jpg' }
    ],
    'Kundun': [
        { name: 'Bless', img: 'bless.jpg' },
        { name: 'Soul', img: 'soul.jpg' },
        { name: 'Life', img: 'life.jpg' },
        { name: 'Creation', img: 'creation.jpg' }
    ]
};

// Optional Wcoin rewards per event (amount player can earn)
export const eventWcoinReward = {
    'Boss Vàng': 30000,
    'Blood Castle': 1500,
    'Devil Square': 1200,
    'Chaos Castle': 1400,
    'Rồng Đỏ': 2500,
    'Vua Quỷ Xương': 2000,
    'Thỏ Ngọc': 1000,
    'Ngưu Ma Vương': 4000,
    'Loạn Chiến': 1800,
    'Nhện': 1600,
    'Siêu Boss': 6000,
    'Wukong': 2200,
    'Medusa': 3500,
    'Kundun': 3000
};

// Format number with dot thousands (e.g., 30000 -> 30.000)
export function formatWcoin(value) {
    if (value == null) return '';
    const num = Number(value);
    if (isNaN(num)) return String(value);
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
