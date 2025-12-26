// Map 2-letter country codes to full country names
export const countryCodeToName = {
  // North America
  'US': 'USA',
  'CA': 'Canada',
  'MX': 'Mexico',
  
  // Caribbean
  'CU': 'Cuba',
  
  // South America
  'BR': 'Brazil',
  'AR': 'Argentina',
  'CL': 'Chile',
  'CO': 'Colombia',
  'PE': 'Peru',
  'VE': 'Venezuela',
  
  // Europe
  'RU': 'Russia',
  'FR': 'France',
  'GB': 'United Kingdom',
  'DE': 'Germany',
  'IT': 'Italy',
  'ES': 'Spain',
  'PL': 'Poland',
  'UA': 'Ukraine',
  'RO': 'Romania',
  'GR': 'Greece',
  'PT': 'Portugal',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'CH': 'Switzerland',
  'AT': 'Austria',
  'CZ': 'Czechia',
  'HU': 'Hungary',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'IE': 'Ireland',
  
  // Africa
  'ZA': 'South Africa',
  'EG': 'Egypt',
  'NG': 'Nigeria',
  'KE': 'Kenya',
  'ET': 'Ethiopia',
  'GH': 'Ghana',
  'MZ': 'Mozambique',
  'TZ': 'Tanzania',
  'UG': 'Uganda',
  'AO': 'Angola',
  
  // Asia
  'CN': 'China',
  'IN': 'India',
  'JP': 'Japan',
  'KR': 'South Korea',
  'TH': 'Thailand',
  'VN': 'Vietnam',
  'PH': 'Philippines',
  'ID': 'Indonesia',
  'MY': 'Malaysia',
  'SG': 'Singapore',
  'PK': 'Pakistan',
  'BD': 'Bangladesh',
  'LK': 'Sri Lanka',
  'MM': 'Myanmar',
  'KH': 'Cambodia',
  'LA': 'Laos',
  'IR': 'Iran',
  'IQ': 'Iraq',
  'SA': 'Saudi Arabia',
  'AE': 'United Arab Emirates',
  'IL': 'Israel',
  'TR': 'Turkey',
  'KZ': 'Kazakhstan',
  'UZ': 'Uzbekistan',
  'TM': 'Turkmenistan',
  'KG': 'Kyrgyzstan',
  'TJ': 'Tajikistan',
  
  // Oceania
  'AU': 'Australia',
  'NZ': 'New Zealand',
  'FJ': 'Fiji',
  'PG': 'Papua New Guinea',
  
  // Middle East
  'AE': 'United Arab Emirates',
  'QA': 'Qatar',
  'KW': 'Kuwait',
  'BH': 'Bahrain',
  'OM': 'Oman',
  'YE': 'Yemen',
  'JO': 'Jordan',
  'LB': 'Lebanon',
  'PS': 'Palestine',
  'SY': 'Syria'
};

// Map country names to regions
export const countryToRegion = {
  // North America
  'United States': 'North America',
  'Canada': 'North America',
  'Mexico': 'North America',
  
  // Central America & Caribbean
  'Guatemala': 'Central America',
  'Honduras': 'Central America',
  'El Salvador': 'Central America',
  'Nicaragua': 'Central America',
  'Costa Rica': 'Central America',
  'Panama': 'Central America',
  'Cuba': 'Caribbean',
  'Dominican Republic': 'Caribbean',
  'Haiti': 'Caribbean',
  'Jamaica': 'Caribbean',
  'Trinidad and Tobago': 'Caribbean',
  
  // South America
  'Brazil': 'South America',
  'Argentina': 'South America',
  'Chile': 'South America',
  'Colombia': 'South America',
  'Peru': 'South America',
  'Venezuela': 'South America',
  'Ecuador': 'South America',
  'Bolivia': 'South America',
  'Paraguay': 'South America',
  'Uruguay': 'South America',
  'Guyana': 'South America',
  'Suriname': 'South America',
  'French Guiana': 'South America',
  
  // Europe
  'Russia': 'Europe/Asia',
  'France': 'Europe',
  'United Kingdom': 'Europe',
  'Germany': 'Europe',
  'Italy': 'Europe',
  'Spain': 'Europe',
  'Poland': 'Europe',
  'Ukraine': 'Europe',
  'Romania': 'Europe',
  'Greece': 'Europe',
  'Portugal': 'Europe',
  'Netherlands': 'Europe',
  'Belgium': 'Europe',
  'Switzerland': 'Europe',
  'Austria': 'Europe',
  'Czechia': 'Europe',
  'Hungary': 'Europe',
  'Sweden': 'Europe',
  'Norway': 'Europe',
  'Denmark': 'Europe',
  'Finland': 'Europe',
  'Ireland': 'Europe',
  'Slovakia': 'Europe',
  'Slovenia': 'Europe',
  'Croatia': 'Europe',
  'Serbia': 'Europe',
  'Bulgaria': 'Europe',
  'Lithuania': 'Europe',
  'Latvia': 'Europe',
  'Estonia': 'Europe',
  'Iceland': 'Europe',
  'Luxembourg': 'Europe',
  'Malta': 'Europe',
  'Cyprus': 'Europe',
  
  // Africa
  'South Africa': 'Africa',
  'Egypt': 'Africa',
  'Nigeria': 'Africa',
  'Kenya': 'Africa',
  'Ethiopia': 'Africa',
  'Ghana': 'Africa',
  'Mozambique': 'Africa',
  'Tanzania': 'Africa',
  'Uganda': 'Africa',
  'Angola': 'Africa',
  'Morocco': 'Africa',
  'Algeria': 'Africa',
  'Tunisia': 'Africa',
  'Sudan': 'Africa',
  'Cameroon': 'Africa',
  'Côte d\'Ivoire': 'Africa',
  'Senegal': 'Africa',
  'Mali': 'Africa',
  'Burkina Faso': 'Africa',
  'Niger': 'Africa',
  'Chad': 'Africa',
  'Zambia': 'Africa',
  'Zimbabwe': 'Africa',
  'Botswana': 'Africa',
  'Namibia': 'Africa',
  'Lesotho': 'Africa',
  'Eswatini': 'Africa',
  'Madagascar': 'Africa',
  'Mauritius': 'Africa',
  'Seychelles': 'Africa',
  
  // Asia
  'China': 'Asia',
  'India': 'Asia',
  'Japan': 'Asia',
  'South Korea': 'Asia',
  'Thailand': 'Asia',
  'Vietnam': 'Asia',
  'Philippines': 'Asia',
  'Indonesia': 'Asia',
  'Malaysia': 'Asia',
  'Singapore': 'Asia',
  'Pakistan': 'Asia',
  'Bangladesh': 'Asia',
  'Sri Lanka': 'Asia',
  'Myanmar': 'Asia',
  'Cambodia': 'Asia',
  'Laos': 'Asia',
  'Nepal': 'Asia',
  'Bhutan': 'Asia',
  'Mongolia': 'Asia',
  'North Korea': 'Asia',
  'Taiwan': 'Asia',
  'Hong Kong': 'Asia',
  'Macau': 'Asia',
  'Maldives': 'Asia',
  
  // Middle East & West Asia
  'Iran': 'Middle East',
  'Iraq': 'Middle East',
  'Saudi Arabia': 'Middle East',
  'United Arab Emirates': 'Middle East',
  'Israel': 'Middle East',
  'Turkey': 'Middle East/Europe',
  'Kazakhstan': 'Asia',
  'Uzbekistan': 'Asia',
  'Turkmenistan': 'Asia',
  'Kyrgyzstan': 'Asia',
  'Tajikistan': 'Asia',
  'Afghanistan': 'Asia',
  'Lebanon': 'Middle East',
  'Jordan': 'Middle East',
  'Palestine': 'Middle East',
  'Syria': 'Middle East',
  'Yemen': 'Middle East',
  'Oman': 'Middle East',
  'Qatar': 'Middle East',
  'Kuwait': 'Middle East',
  'Bahrain': 'Middle East',
  
  // Oceania
  'Australia': 'Oceania',
  'New Zealand': 'Oceania',
  'Fiji': 'Oceania',
  'Papua New Guinea': 'Oceania',
  'Solomon Islands': 'Oceania',
  'Samoa': 'Oceania',
  'Vanuatu': 'Oceania',
  'Kiribati': 'Oceania',
  'Marshall Islands': 'Oceania',
  'Micronesia': 'Oceania',
  'Nauru': 'Oceania',
  'Palau': 'Oceania',
  'Tonga': 'Oceania',
  'Tuvalu': 'Oceania'
};

/**
 * Get full country name from 2-letter code
 * @param {string} code - 2-letter country code
 * @returns {string} Full country name
 */
export const getCountryNameFromCode = (code) => {
  return countryCodeToName[code] || code;
};

/**
 * Get region from country name
 * @param {string} countryName - Full country name
 * @returns {string} Region name
 */
export const getRegionFromCountry = (countryName) => {
  return countryToRegion[countryName] || 'Unknown';
};
