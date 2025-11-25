/**
 * State Data for EnhancedStateSelector
 *
 * US states with population, region, and priority information
 */

export interface StateData {
  value: string;
  label: string;
  priority: 'high' | 'normal';
  region: 'West' | 'South' | 'Northeast' | 'Midwest';
  population: number;
}

export const US_STATES_ENHANCED: StateData[] = [
  // Most populous states (high priority)
  { value: 'CA', label: 'California', priority: 'high', region: 'West', population: 39538223 },
  { value: 'TX', label: 'Texas', priority: 'high', region: 'South', population: 29145505 },
  { value: 'FL', label: 'Florida', priority: 'high', region: 'South', population: 21538187 },
  { value: 'NY', label: 'New York', priority: 'high', region: 'Northeast', population: 20201249 },
  { value: 'PA', label: 'Pennsylvania', priority: 'high', region: 'Northeast', population: 13002700 },
  { value: 'IL', label: 'Illinois', priority: 'high', region: 'Midwest', population: 12812508 },
  { value: 'OH', label: 'Ohio', priority: 'high', region: 'Midwest', population: 11799448 },
  { value: 'GA', label: 'Georgia', priority: 'high', region: 'South', population: 10711908 },
  { value: 'NC', label: 'North Carolina', priority: 'high', region: 'South', population: 10439388 },
  { value: 'MI', label: 'Michigan', priority: 'high', region: 'Midwest', population: 10037261 },

  // All other states
  { value: 'AL', label: 'Alabama', priority: 'normal', region: 'South', population: 5024279 },
  { value: 'AK', label: 'Alaska', priority: 'normal', region: 'West', population: 733391 },
  { value: 'AZ', label: 'Arizona', priority: 'normal', region: 'West', population: 7151502 },
  { value: 'AR', label: 'Arkansas', priority: 'normal', region: 'South', population: 3011524 },
  { value: 'CO', label: 'Colorado', priority: 'normal', region: 'West', population: 5773714 },
  { value: 'CT', label: 'Connecticut', priority: 'normal', region: 'Northeast', population: 3605944 },
  { value: 'DE', label: 'Delaware', priority: 'normal', region: 'South', population: 989948 },
  { value: 'HI', label: 'Hawaii', priority: 'normal', region: 'West', population: 1455271 },
  { value: 'ID', label: 'Idaho', priority: 'normal', region: 'West', population: 1839106 },
  { value: 'IN', label: 'Indiana', priority: 'normal', region: 'Midwest', population: 6785528 },
  { value: 'IA', label: 'Iowa', priority: 'normal', region: 'Midwest', population: 3190369 },
  { value: 'KS', label: 'Kansas', priority: 'normal', region: 'Midwest', population: 2937880 },
  { value: 'KY', label: 'Kentucky', priority: 'normal', region: 'South', population: 4505836 },
  { value: 'LA', label: 'Louisiana', priority: 'normal', region: 'South', population: 4657757 },
  { value: 'ME', label: 'Maine', priority: 'normal', region: 'Northeast', population: 1344212 },
  { value: 'MD', label: 'Maryland', priority: 'normal', region: 'South', population: 6177224 },
  { value: 'MA', label: 'Massachusetts', priority: 'normal', region: 'Northeast', population: 6892503 },
  { value: 'MN', label: 'Minnesota', priority: 'normal', region: 'Midwest', population: 5737193 },
  { value: 'MS', label: 'Mississippi', priority: 'normal', region: 'South', population: 2961279 },
  { value: 'MO', label: 'Missouri', priority: 'normal', region: 'Midwest', population: 6154913 },
  { value: 'MT', label: 'Montana', priority: 'normal', region: 'West', population: 1084225 },
  { value: 'NE', label: 'Nebraska', priority: 'normal', region: 'Midwest', population: 1961504 },
  { value: 'NV', label: 'Nevada', priority: 'normal', region: 'West', population: 3104614 },
  { value: 'NH', label: 'New Hampshire', priority: 'normal', region: 'Northeast', population: 1377529 },
  { value: 'NJ', label: 'New Jersey', priority: 'normal', region: 'Northeast', population: 9288994 },
  { value: 'NM', label: 'New Mexico', priority: 'normal', region: 'West', population: 2117522 },
  { value: 'ND', label: 'North Dakota', priority: 'normal', region: 'Midwest', population: 779094 },
  { value: 'OK', label: 'Oklahoma', priority: 'normal', region: 'South', population: 3959353 },
  { value: 'OR', label: 'Oregon', priority: 'normal', region: 'West', population: 4237256 },
  { value: 'RI', label: 'Rhode Island', priority: 'normal', region: 'Northeast', population: 1097379 },
  { value: 'SC', label: 'South Carolina', priority: 'normal', region: 'South', population: 5118425 },
  { value: 'SD', label: 'South Dakota', priority: 'normal', region: 'Midwest', population: 886667 },
  { value: 'TN', label: 'Tennessee', priority: 'normal', region: 'South', population: 6910840 },
  { value: 'UT', label: 'Utah', priority: 'normal', region: 'West', population: 3271616 },
  { value: 'VT', label: 'Vermont', priority: 'normal', region: 'Northeast', population: 643077 },
  { value: 'VA', label: 'Virginia', priority: 'normal', region: 'South', population: 8631393 },
  { value: 'WA', label: 'Washington', priority: 'normal', region: 'West', population: 7705281 },
  { value: 'WV', label: 'West Virginia', priority: 'normal', region: 'South', population: 1793716 },
  { value: 'WI', label: 'Wisconsin', priority: 'normal', region: 'Midwest', population: 5893718 },
  { value: 'WY', label: 'Wyoming', priority: 'normal', region: 'West', population: 576851 },
  { value: 'DC', label: 'District of Columbia', priority: 'normal', region: 'South', population: 689545 }
];
