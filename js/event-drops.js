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
    'Rương Báu': [
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
    'Boss Vàng': 5000,
    'Rồng Đỏ': 300,
    'Vua Quỷ Xương': 300,
    'Thỏ Ngọc': 0,
    'Ngưu Ma Vương': 5000,
    'Siêu Boss': 5000,
    'Wukong': 5000,
    'Medusa': 5000,
    'Kundun': 5000,
    'Rương Báu': 5000
};

// Format number with dot thousands (e.g., 30000 -> 30.000)
export function formatWcoin(value) {
    if (value == null) return '';
    const num = Number(value);
    if (isNaN(num)) return String(value);
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
