/**
 * Constants for EnhancedCountySelector
 */

// Popular counties by state (major metropolitan areas)
export const POPULAR_COUNTIES: Record<string, string[]> = {
  'CA': ['Los Angeles', 'San Diego', 'Orange', 'Riverside', 'San Bernardino', 'Santa Clara', 'Alameda', 'Sacramento', 'Contra Costa', 'Fresno'],
  'TX': ['Harris', 'Dallas', 'Tarrant', 'Bexar', 'Travis', 'Collin', 'Fort Bend', 'Hidalgo', 'El Paso', 'Denton'],
  'FL': ['Miami-Dade', 'Broward', 'Palm Beach', 'Hillsborough', 'Orange', 'Pinellas', 'Duval', 'Lee', 'Polk', 'Volusia'],
  'NY': ['Kings', 'Queens', 'New York', 'Suffolk', 'Bronx', 'Nassau', 'Westchester', 'Erie', 'Monroe', 'Onondaga'],
  'PA': ['Philadelphia', 'Allegheny', 'Montgomery', 'Bucks', 'Delaware', 'Lancaster', 'Chester', 'York', 'Dauphin', 'Lehigh'],
  'IL': ['Cook', 'DuPage', 'Lake', 'Will', 'Kane', 'McHenry', 'Winnebago', 'St. Clair', 'Sangamon', 'Peoria'],
  'OH': ['Franklin', 'Cuyahoga', 'Hamilton', 'Summit', 'Montgomery', 'Lucas', 'Stark', 'Butler', 'Lorain', 'Mahoning'],
  'GA': ['Fulton', 'Gwinnett', 'DeKalb', 'Cobb', 'Clayton', 'Cherokee', 'Forsyth', 'Henry', 'Paulding', 'Douglas'],
  'NC': ['Mecklenburg', 'Wake', 'Guilford', 'Forsyth', 'Durham', 'Buncombe', 'Cumberland', 'Union', 'Gaston', 'Cabarrus'],
  'MI': ['Wayne', 'Oakland', 'Macomb', 'Kent', 'Genesee', 'Washtenaw', 'Ingham', 'Kalamazoo', 'Saginaw', 'Ottawa']
};
