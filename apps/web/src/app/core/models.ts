// Types and Interfaces for Hermes Team Wiki

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatarUrl?: string;
  status: string;
  organizationId: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  logoUrl?: string;
  status: string;
  createdAt: string;
}

export interface Space {
  id: string;
  name: string;
  description?: string;
  icon: string;
  sortOrder: number;
  organizationId: string;
  homePageId?: string;
  pageCount?: number;
  createdAt: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  versionNumber: number;
  isHomePage: boolean;
  sortOrder: number;
  organizationId: string;
  spaceId: string;
  spaceName?: string;
  authorId?: string;
  authorName?: string;
  parentId?: string;
  children: Page[];
  createdAt: string;
  updatedAt: string;
}

export interface PageVersion {
  id: string;
  versionNumber: number;
  title: string;
  content: string;
  summary?: string;
  changeStats: string;
  pageId: string;
  authorId?: string;
  authorName?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  isEdited: boolean;
  pageId: string;
  authorId?: string;
  authorName?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalPages: number;
  totalSpaces: number;
  totalComments: number;
  totalMembers: number;
}

export interface Activity {
  type: 'edit' | 'comment' | 'create';
  title: string;
  userName: string;
  date: string;
}

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  snippet: string;
  spaceId: string;
  spaceName: string;
  updatedAt: string;
}
