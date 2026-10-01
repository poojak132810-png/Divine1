export type TabType = 'home' | 'shlokas' | 'bookings' | 'donations' | 'ai'| 'admin';

export type LanguageCode = 'en' | 'kn' | 'sa';

export interface ShlokaItem {
  id: string;
  title: string;
  deity: string;
  category: 'daily' | 'shiva' | 'vishnu' | 'devi' | 'ganesha' | 'hanuman' | 'shanti';
  sanskrit: string;
  kannada: string;
  transliteration: string;
  meaning: string;
  significance: string;
  idealTime: string;
}

export interface AartiScheduleItem {
  id: string;
  title: string;
  hindiTitle?: string;
  kannadaTitle?: string;
  time: string;
  status: 'completed' | 'up-next' | 'upcoming';
  description: string;
  deityFocus: string;
  mantra?: string;
}

export interface FestivalItem {
  id: string;
  month: string;
  day: string;
  title: string;
  tag: string;
  description: string;
  detailedInfo: string;
  significance: string;
}

export interface SevaItem {
  id: string;
  name: string;
  sanskritName: string;
  category: 'daily' | 'special' | 'homam' | 'darshan';
  price: number;
  duration: string;
  description: string;
  benefits: string;
  timings: string[];
}

export interface SevaBooking {
  id: string;
  sevaId: string;
  sevaName: string;
  devoteeName: string;
  gotra: string;
  nakshatra: string;
  rashi: string;
  date: string;
  slot: string;
  sankalpa: string;
  amount: number;
  prasadamDelivery: boolean;
  address?: string;
  bookingTime: string;
  status: 'Confirmed' | 'Completed';
  tokenNumber: string;
}

export interface DonationRecord {
  id: string;
  cause: string;
  amount: number;
  devoteeName: string;
  phoneNumber?: string;
  sankalpaOccasion?: string;
  date: string;
  receiptNumber: string;
}

export interface PanchangData {
  tithi: string;
  tithiEnd: string;
  paksha: string;
  nakshatra: string;
  nakshatraEnd: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  abhijitMuhurta: string;
  rahuKalam: string;
  gulikaKalam: string;
  yamaganda: string;
  samvat: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
export interface TempleMember {
  id: string;
  memberNumber: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  validTill: string;
  status: 'active' | 'inactive';
  createdAt: string;
  scanCount: number; // Number of times the member has scanned in
}