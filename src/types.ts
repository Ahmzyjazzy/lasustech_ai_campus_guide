/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ActiveScreen = 'home' | 'map' | 'chat' | 'directions';

export type LocationCategory = 'all' | 'academic' | 'food' | 'sports' | 'services' | 'admin';

export interface CampusLocation {
  id: string;
  name: string;
  subtitle: string;
  category: LocationCategory;
  image: string;
  distance: string;
  walkTime: string;
  icon: string;
  description: string;
  coordinates: {
    x: number; // percentage from left
    y: number; // percentage from top
  };
  steps: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  hasDirectionsLink?: boolean;
  directionsTargetId?: string;
}

export interface RecentSearch {
  id: string;
  name: string;
  distance: string;
  status: string;
}

export interface CampusCategory {
  id: LocationCategory;
  label: string;
  icon: string;
}
