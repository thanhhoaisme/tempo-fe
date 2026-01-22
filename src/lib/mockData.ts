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

// Mock content for collaborative editor testing
export const MOCK_EDITOR_CONTENT = `<h1>Project Implementation Plan</h1>

<p>This document outlines the comprehensive plan for implementing our new project management system.</p>

<h2>Project Timeline</h2>

<p>The implementation will follow a phased approach over the next six months. Each phase has specific deliverables and milestones that need to be achieved.</p>

<p><strong>Q1 2026 (January - March):</strong></p>
<ul>
  <li>Requirements gathering and analysis</li>
  <li>System architecture design</li>
  <li>Database schema planning</li>
</ul>

<p><strong>Q2 2026 (April - June):</strong></p>
<ul>
  <li>Core feature development</li>
  <li>API implementation</li>
  <li>Frontend UI/UX design</li>
</ul>

<h2>Technical Dependencies</h2>

<p>The project relies on several key technologies and third-party libraries. We need to ensure all dependencies are properly documented and version-locked.</p>

<p><strong>Backend Stack:</strong></p>
<ul>
  <li>Spring Boot 3.2</li>
  <li>PostgreSQL 15</li>
  <li>Redis for caching</li>
</ul>

<p><strong>Frontend Stack:</strong></p>
<ul>
  <li>Next.js 14</li>
  <li>React 18</li>
  <li>TailwindCSS</li>
</ul>

<h2>Security Considerations</h2>

<p>Security is a top priority for this project. All sensitive data must be encrypted, and we need to implement proper authentication and authorization mechanisms.</p>

<p>Key security measures include:</p>
<ul>
  <li>JWT-based authentication</li>
  <li>Role-based access control (RBAC)</li>
  <li>Input validation and sanitization</li>
  <li>Rate limiting for API endpoints</li>
</ul>

<h2>Testing Strategy</h2>

<p>We will implement comprehensive testing at all levels to ensure code quality and reliability.</p>

<p><strong>Testing Types:</strong></p>
<ul>
  <li>Unit tests (80% coverage target)</li>
  <li>Integration tests</li>
  <li>End-to-end tests</li>
  <li>Performance testing</li>
</ul>

<h2>Deployment Plan</h2>

<p>The application will be deployed on AWS infrastructure with automatic scaling and monitoring capabilities.</p>

<p>Deployment stages:</p>
<ol>
  <li>Development environment</li>
  <li>Staging environment</li>
  <li>Production environment</li>
</ol>

<p>Each deployment must pass all automated tests before proceeding to the next stage.</p>`;

// Mock page comments with nested replies linked to MOCK_EDITOR_CONTENT
// Character positions calculated from MOCK_EDITOR_CONTENT above
export const MOCK_PAGE_COMMENTS = [
  {
    id: 'comment-1',
    pageId: 'page-1',
    userId: 'user-2',
    user: { name: 'John Doe', avatarUrl: undefined },
    content: 'Can we break this down into more specific milestones? What are the exact deliverables for each month?',
    selectionStart: 182,  // "The implementation will follow a phased approach"
    selectionEnd: 283,
    parentId: undefined,
    resolved: false,
    createdAt: Date.now() - 7200000, // 2 hours ago
    updatedAt: Date.now() - 7200000,
    replies: [
      {
        id: 'comment-2',
        pageId: 'page-1',
        userId: 'user-3',
        user: { name: 'Jane Smith', avatarUrl: undefined },
        content: 'I agree! We should add weekly checkpoints and specific KPIs for each phase.',
        selectionStart: undefined,
        selectionEnd: undefined,
        parentId: 'comment-1',
        resolved: false,
        createdAt: Date.now() - 5400000, // 1.5 hours ago
        updatedAt: Date.now() - 5400000,
        replies: [],
      },
      {
        id: 'comment-3',
        pageId: 'page-1',
        userId: 'user-1',
        user: { name: 'You', avatarUrl: undefined },
        content: 'Good point. I\'ll create a detailed Gantt chart with monthly deliverables. Will have it ready by EOD.',
        selectionStart: undefined,
        selectionEnd: undefined,
        parentId: 'comment-1',
        resolved: false,
        createdAt: Date.now() - 3600000, // 1 hour ago
        updatedAt: Date.now() - 3600000,
        replies: [],
      },
    ],
  },
  {
    id: 'comment-4',
    pageId: 'page-1',
    userId: 'user-3',
    user: { name: 'Jane Smith', avatarUrl: undefined },
    content: 'We need to specify exact versions and check for known vulnerabilities. Also, what about licensing?',
    selectionStart: 667,  // "The project relies on several key technologies"
    selectionEnd: 779,
    parentId: undefined,
    resolved: false,
    createdAt: Date.now() - 5400000, // 1.5 hours ago
    updatedAt: Date.now() - 5400000,
    replies: [
      {
        id: 'comment-5',
        pageId: 'page-1',
        userId: 'user-2',
        user: { name: 'John Doe', avatarUrl: undefined },
        content: 'Yes! Let\'s run a dependency audit with Snyk or Dependabot. We should also create a Software Bill of Materials (SBOM).',
        selectionStart: undefined,
        selectionEnd: undefined,
        parentId: 'comment-4',
        resolved: false,
        createdAt: Date.now() - 3600000, // 1 hour ago
        updatedAt: Date.now() - 3600000,
        replies: [],
      },
      {
        id: 'comment-10',
        pageId: 'page-1',
        userId: 'user-1',
        user: { name: 'You', avatarUrl: undefined },
        content: 'I\'ll add a dependencies section with license info and security scan results.',
        selectionStart: undefined,
        selectionEnd: undefined,
        parentId: 'comment-4',
        resolved: false,
        createdAt: Date.now() - 1800000, // 30 minutes ago
        updatedAt: Date.now() - 1800000,
        replies: [],
      },
    ],
  },
  {
    id: 'comment-6',
    pageId: 'page-1',
    userId: 'user-4',
    user: { name: 'Alex Johnson', avatarUrl: undefined },
    content: 'Overall structure looks solid! I like the phased approach. Maybe add a risk assessment section?',
    selectionStart: undefined,  // General comment - no selection
    selectionEnd: undefined,
    parentId: undefined,
    resolved: false,
    createdAt: Date.now() - 2700000, // 45 minutes ago
    updatedAt: Date.now() - 2700000,
    replies: [],
  },
  {
    id: 'comment-7',
    pageId: 'page-1',
    userId: 'user-2',
    user: { name: 'John Doe', avatarUrl: undefined },
    content: 'This section is too vague. What specific encryption algorithms? What about key management?',
    selectionStart: 1067,  // "Security is a top priority"
    selectionEnd: 1209,
    parentId: undefined,
    resolved: true,  // RESOLVED - Testing resolve functionality
    createdAt: Date.now() - 10800000, // 3 hours ago
    updatedAt: Date.now() - 600000, // Resolved 10 min ago
    replies: [
      {
        id: 'comment-8',
        pageId: 'page-1',
        userId: 'user-1',
        user: { name: 'You', avatarUrl: undefined },
        content: 'I\'ve updated it with: AES-256 for data at rest, TLS 1.3 for transit, and AWS KMS for key management. Check it out!',
        selectionStart: undefined,
        selectionEnd: undefined,
        parentId: 'comment-7',
        resolved: false,
        createdAt: Date.now() - 1200000, // 20 minutes ago
        updatedAt: Date.now() - 1200000,
        replies: [],
      },
      {
        id: 'comment-9',
        pageId: 'page-1',
        userId: 'user-2',
        user: { name: 'John Doe', avatarUrl: undefined },
        content: 'Perfect! That\'s exactly what I was looking for. Resolving this thread.',
        selectionStart: undefined,
        selectionEnd: undefined,
        parentId: 'comment-7',
        resolved: false,
        createdAt: Date.now() - 600000, // 10 minutes ago
        updatedAt: Date.now() - 600000,
        replies: [],
      },
    ],
  },
  {
    id: 'comment-11',
    pageId: 'page-1',
    userId: 'user-3',
    user: { name: 'Jane Smith', avatarUrl: undefined },
    content: 'What about load testing? We should define performance benchmarks before deployment.',
    selectionStart: 1462,  // "We will implement comprehensive testing"
    selectionEnd: 1535,
    parentId: undefined,
    resolved: false,
    createdAt: Date.now() - 1800000, // 30 minutes ago
    updatedAt: Date.now() - 1800000,
    replies: [
      {
        id: 'comment-12',
        pageId: 'page-1',
        userId: 'user-4',
        user: { name: 'Alex Johnson', avatarUrl: undefined },
        content: 'Good catch! We should use JMeter or k6 for load testing. Target: 1000 concurrent users.',
        selectionStart: undefined,
        selectionEnd: undefined,
        parentId: 'comment-11',
        resolved: false,
        createdAt: Date.now() - 900000, // 15 minutes ago
        updatedAt: Date.now() - 900000,
        replies: [],
      },
    ],
  },
];

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
