export type City = {
  name: string
  country: string
  lat: number
  lng: number
  tz: string
}

export const CITIES: City[] = [
  { name: 'Tashkent', country: 'Uzbekistan', lat: 41.31, lng: 69.28, tz: 'Asia/Tashkent' },
  { name: 'Samarkand', country: 'Uzbekistan', lat: 39.65, lng: 66.96, tz: 'Asia/Samarkand' },
  { name: 'Edmonton', country: 'Canada', lat: 53.55, lng: -113.49, tz: 'America/Edmonton' },
  { name: 'Calgary', country: 'Canada', lat: 51.05, lng: -114.07, tz: 'America/Edmonton' },
  { name: 'Toronto', country: 'Canada', lat: 43.65, lng: -79.38, tz: 'America/Toronto' },
  { name: 'Vancouver', country: 'Canada', lat: 49.28, lng: -123.12, tz: 'America/Vancouver' },
  { name: 'Makkah', country: 'Saudi Arabia', lat: 21.42, lng: 39.83, tz: 'Asia/Riyadh' },
  { name: 'Madinah', country: 'Saudi Arabia', lat: 24.47, lng: 39.61, tz: 'Asia/Riyadh' },
  { name: 'Riyadh', country: 'Saudi Arabia', lat: 24.71, lng: 46.68, tz: 'Asia/Riyadh' },
  { name: 'Istanbul', country: 'Türkiye', lat: 41.01, lng: 28.98, tz: 'Europe/Istanbul' },
  { name: 'Dubai', country: 'UAE', lat: 25.2, lng: 55.27, tz: 'Asia/Dubai' },
  { name: 'Doha', country: 'Qatar', lat: 25.29, lng: 51.53, tz: 'Asia/Qatar' },
  { name: 'Cairo', country: 'Egypt', lat: 30.04, lng: 31.24, tz: 'Africa/Cairo' },
  { name: 'London', country: 'UK', lat: 51.51, lng: -0.13, tz: 'Europe/London' },
  { name: 'New York', country: 'USA', lat: 40.71, lng: -74.01, tz: 'America/New_York' },
  { name: 'Los Angeles', country: 'USA', lat: 34.05, lng: -118.24, tz: 'America/Los_Angeles' },
  { name: 'Chicago', country: 'USA', lat: 41.88, lng: -87.63, tz: 'America/Chicago' },
  { name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.14, lng: 101.69, tz: 'Asia/Kuala_Lumpur' },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.21, lng: 106.85, tz: 'Asia/Jakarta' },
  { name: 'Karachi', country: 'Pakistan', lat: 24.86, lng: 67.01, tz: 'Asia/Karachi' },
  { name: 'Lahore', country: 'Pakistan', lat: 31.55, lng: 74.34, tz: 'Asia/Karachi' },
  { name: 'Delhi', country: 'India', lat: 28.61, lng: 77.21, tz: 'Asia/Kolkata' },
  { name: 'Dhaka', country: 'Bangladesh', lat: 23.81, lng: 90.41, tz: 'Asia/Dhaka' },
  { name: 'Almaty', country: 'Kazakhstan', lat: 43.24, lng: 76.89, tz: 'Asia/Almaty' },
  { name: 'Bishkek', country: 'Kyrgyzstan', lat: 42.87, lng: 74.59, tz: 'Asia/Bishkek' },
  { name: 'Baku', country: 'Azerbaijan', lat: 40.41, lng: 49.87, tz: 'Asia/Baku' },
]

export const findCity = (name: string) =>
  CITIES.find((c) => c.name === name) || CITIES[0]
