import { apiClient } from './client';

export interface CountryOption {
  name: string;
  code: string;
}

export interface CountryWithCities extends CountryOption {
  cities: string[];
}

export interface CountriesAndCitiesResponse {
  countries: CountryOption[];
  countries_with_cities: CountryWithCities[];
}

export const locationsApi = {
  /**
   * Fetch the full countries/cities dataset once — small and static,
   * so the frontend caches it and filters/searches client-side rather
   * than querying per keystroke.
   */
  async getCountriesAndCities(): Promise<CountriesAndCitiesResponse> {
    return apiClient.get<CountriesAndCitiesResponse>(
      '/api/v1/trips/locations/countries-cities/'
    );
  },
};
