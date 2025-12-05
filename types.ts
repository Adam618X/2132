export interface Dish {
  name: string;
  cuisine: string;
  flavor: string;
  ingredient: string;
  technique: string;
  price: number;
  score: string;
  pinyin: string;
  tag: string;
  img: string;
  time: string;
  desc: string;
  sortScore?: number;
  isRandom?: boolean;
}

export interface UserMetrics {
  l1: number; // Physiological
  l2: number; // Capital
  l3: number; // Cultural
}

export interface UserProfile {
  username: string;
  phone: string;
  location: string;
  origin: string;
  job: string;
  ageGroup: string;
  gender: string;
  age_approx: number;
  job_meta: { sedentary: boolean; stress: number };
  device: string;
  is_migrant: boolean;
  timestamp: number;
  tags: string[];
  metrics: UserMetrics;
  explicit_cards?: any[];
}

export interface LogEntry {
  type: string;
  payload: any;
  timestamp: string;
  id: string;
}

export const REGION_STATS: Record<string, { baseHeight: number; bmiOffset: number }> = {
    "Hunan": { baseHeight: 168, bmiOffset: -1 },
    "Sichuan": { baseHeight: 167, bmiOffset: -1 },
    "Chongqing": { baseHeight: 168, bmiOffset: -1 },
    "Guangdong": { baseHeight: 165, bmiOffset: -2 },
    "Beijing": { baseHeight: 175, bmiOffset: 1 },
    "Shanghai": { baseHeight: 172, bmiOffset: 0 },
    // Simplified map for demo
};

export const FLAVOR_MAP: Record<string, string> = {
    "Hunan": "Spicy", "Sichuan": "Spicy", "Chongqing": "Spicy",
    "Guangdong": "Mild", "Zhejiang": "Mild", "Jiangsu": "Sweet",
    "Shanghai": "Sweet", "Beijing": "Salty", "Shanxi": "Sour"
};