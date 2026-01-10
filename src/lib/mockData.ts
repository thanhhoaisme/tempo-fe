import { ShopItem } from '@/types';

export const MOCK_HOBBIES = [
  { name: 'Gym', emoji: '💪' },
  { name: 'Reading', emoji: '📚' },
  { name: 'Gaming', emoji: '🎮' },
  { name: 'Walking', emoji: '🚶' },
  { name: 'Coding', emoji: '💻' },
  { name: 'Drawing', emoji: '🎨' },
  { name: 'Music', emoji: '🎵' },
  { name: 'Cooking', emoji: '👨‍🍳' },
  { name: 'Meditation', emoji: '🧘' },
  { name: 'Sports', emoji: '⚽' },
  { name: 'Yoga', emoji: '🧘‍♀️' },
  { name: 'Running', emoji: '🏃' },
  { name: 'Cycling', emoji: '🚴' },
  { name: 'Swimming', emoji: '🏊' },
  { name: 'Photography', emoji: '📷' },
  { name: 'Writing', emoji: '✍️' },
  { name: 'Dancing', emoji: '💃' },
  { name: 'Singing', emoji: '🎤' },
  { name: 'Gardening', emoji: '🌱' },
  { name: 'Shopping', emoji: '🛍️' },
  { name: 'Movies', emoji: '🎬' },
  { name: 'Travel', emoji: '✈️' },
  { name: 'Pets', emoji: '🐕' },
  { name: 'Coffee', emoji: '☕' },
];

export const MOOD_EMOJIS = {
  terrible: '😢',
  bad: '😟',
  neutral: '😐',
  good: '🙂',
  excellent: '😄',
};

export const FOCUS_DURATIONS = [
  { label: '25 min', value: 25 * 60 },
  { label: '50 min', value: 50 * 60 },
  { label: '90 min', value: 90 * 60 },
];

export const DEFAULT_CUSTOM_DURATION = 25 * 60;

export const DISTRACTION_TYPES = [
  'Social Media',
  'YouTube',
  'Notifications',
  'Calls',
  'Email',
  'News',
  'Other',
];

export const INSIGHTS = [
  'Your most productive time is between 9 AM - 12 PM',
  'You focus best with 25-minute sessions followed by 5-minute breaks',
  'Reading is your most consistent hobby this month',
  'Your mood improves after exercise sessions',
  'You have a 7-day focus streak - keep it up!',
  'Meditation before work increases your focus time by 15%',
  'Your longest focus session was 90 minutes',
  'You\'ve logged 120+ hours of focus time this month',
];
