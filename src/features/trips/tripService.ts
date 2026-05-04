import type { TripCreate, TripUpdate, TripResponse } from '../../types/trip';

const API_BASE_URL = 'https://philanthropically-farsighted-malik.ngrok-free.dev';

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

export const tripService = {
  async createTrip(data: TripCreate, token: string): Promise<TripResponse> {
    const response = await fetch(`${API_BASE_URL}/trips/create_trip`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getAllTrips(token: string): Promise<TripResponse> {
    const response = await fetch(`${API_BASE_URL}/trips/get_all_trips`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async getTrip(tripId: string, token: string): Promise<TripResponse> {
    const response = await fetch(`${API_BASE_URL}/trips/get_trip/${tripId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  },

  async updateTrip(tripId: string, data: TripUpdate, token: string): Promise<TripResponse> {
    const response = await fetch(`${API_BASE_URL}/trips/update_trip/${tripId}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteTrip(tripId: string, token: string): Promise<TripResponse> {
    const response = await fetch(`${API_BASE_URL}/trips/delete_trip/${tripId}`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return response.json();
  }
};
