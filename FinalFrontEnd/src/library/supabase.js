import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
   "https://junorlahdvolliticgjt.supabase.co",
   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1bm9ybGFoZHZvbGxpdGljZ2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NzIzNzIsImV4cCI6MjA3OTM0ODM3Mn0.sd-4R_-Si-lDcTBZjnyAudzQVZfQpv6XgGlxhIJotMA"
)

// Authentication functions
const authenticateUser = async (email, password) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, username, password')
      .eq('email', email)
      .single()

    if (error || !data) {
      return { success: false, message: 'User not found' }
    }

    // Compare password (in production, should use bcrypt on backend)
    if (data.password !== password) {
      return { success: false, message: 'Invalid password' }
    }

    // Store user session
    localStorage.setItem('currentUser', data.email)
    localStorage.setItem('currentUserId', data.id)
    localStorage.setItem('currentUsername', data.username)
    localStorage.setItem('loggedIn', 'true')

    // Initialize player progress if doesn't exist
    await initializePlayerProgress(data.id)

    return { success: true, user: data }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

const registerUser = async (email, password, username) => {
  try {
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return { success: false, message: 'Email already registered' }
    }

    // Insert new user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email: email,
          password: password,
          username: username
        }
      ])
      .select()
      .single()

    if (error) {
      return { success: false, message: error.message }
    }

    // Create player progress record
    await initializePlayerProgress(data.id)

    return { success: true, user: data }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

const logoutUser = () => {
  localStorage.removeItem('currentUser')
  localStorage.removeItem('currentUserId')
  localStorage.removeItem('currentUsername')
  localStorage.removeItem('loggedIn')
}

const getCurrentUser = () => {
  return localStorage.getItem('currentUser')
}

const getCurrentUserId = () => {
  return localStorage.getItem('currentUserId')
}

// Player Progress functions
const initializePlayerProgress = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('player_progress')
      .select('id')
      .eq('user_id', userId)
      .single()

    // Only create if doesn't exist
    if (error && error.code === 'PGRST116') {
      await supabase
        .from('player_progress')
        .insert([
          {
            user_id: userId,
            total_intel_points: 0,
            missions_completed: 0,
            missions_failed: 0,
            ciphers_correct: 0,
            ciphers_passed: 0,
            countries_cleared: [],
            achievements: []
          }
        ])
    }
  } catch (error) {
    console.error('Error initializing player progress:', error)
  }
}

const getPlayerProgress = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('player_progress')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching player progress:', error)
    return null
  }
}

const updateIntelPoints = async (userId, pointsToAdd) => {
  try {
    const progress = await getPlayerProgress(userId)
    if (!progress) return false

    const { error } = await supabase
      .from('player_progress')
      .update({
        total_intel_points: progress.total_intel_points + pointsToAdd,
        updated_at: new Date()
      })
      .eq('user_id', userId)

    return !error
  } catch (error) {
    console.error('Error updating intel points:', error)
    return false
  }
}

const updateMissionCompleted = async (userId, countryId) => {
  try {
    const progress = await getPlayerProgress(userId)
    if (!progress) return false

    // Only add country if it's not already in the list
    const updatedCountries = [...(progress.countries_cleared || [])]
    if (!updatedCountries.includes(countryId)) {
      updatedCountries.push(countryId)
    }
    
    const { error } = await supabase
      .from('player_progress')
      .update({
        missions_completed: progress.missions_completed + 1,
        countries_cleared: updatedCountries,
        updated_at: new Date()
      })
      .eq('user_id', userId)

    return !error
  } catch (error) {
    console.error('Error updating mission completed:', error)
    return false
  }
}

const updateMissionFailed = async (userId) => {
  try {
    const progress = await getPlayerProgress(userId)
    if (!progress) return false

    const { error } = await supabase
      .from('player_progress')
      .update({
        missions_failed: progress.missions_failed + 1,
        updated_at: new Date()
      })
      .eq('user_id', userId)

    return !error
  } catch (error) {
    console.error('Error updating mission failed:', error)
    return false
  }
}

const updateCipherProgress = async (userId, correctCount = 0, passedCount = 0) => {
  try {
    const progress = await getPlayerProgress(userId)
    if (!progress) return false

    const { error } = await supabase
      .from('player_progress')
      .update({
        ciphers_correct: progress.ciphers_correct + correctCount,
        ciphers_passed: progress.ciphers_passed + passedCount,
        updated_at: new Date()
      })
      .eq('user_id', userId)

    return !error
  } catch (error) {
    console.error('Error updating cipher progress:', error)
    return false
  }
}

const unlockAchievement = async (userId, achievementName) => {
  try {
    const progress = await getPlayerProgress(userId)
    if (!progress) return false

    const updatedAchievements = [...(progress.achievements || [])]
    if (!updatedAchievements.includes(achievementName)) {
      updatedAchievements.push(achievementName)
    }

    const { error } = await supabase
      .from('player_progress')
      .update({
        achievements: updatedAchievements,
        updated_at: new Date()
      })
      .eq('user_id', userId)

    return !error
  } catch (error) {
    console.error('Error unlocking achievement:', error)
    return false
  }
}

// Official SVG mapping from simplemaps.com - SVG ID to Country Name
const SVG_COUNTRY_MAPPING = {
  "AF": "Afghanistan", "AL": "Albania", "DZ": "Algeria", "AI": "Anguilla", "AM": "Armenia", "AW": "Aruba", "AT": "Austria", "BH": "Bahrain", "BD": "Bangladesh", "BB": "Barbados", "BY": "Belarus", "BE": "Belgium", "BZ": "Belize", "BJ": "Benin", "BM": "Bermuda", "BT": "Bhutan", "BO": "Bolivia", "BA": "Bosnia and Herzegovina", "BW": "Botswana", "BR": "Brazil", "VG": "British Virgin Islands", "BN": "Brunei Darussalam", "BG": "Bulgaria", "BF": "Burkina Faso", "BI": "Burundi", "KH": "Cambodia", "CM": "Cameroon", "CF": "Central African Republic", "TD": "Chad", "CO": "Colombia", "CR": "Costa Rica", "HR": "Croatia", "CU": "Cuba", "CW": "Curaçao", "CZ": "Czech Republic", "CI": "Côte d'Ivoire", "KP": "Dem. Rep. Korea", "CD": "Democratic Republic of the Congo", "DJ": "Djibouti", "DM": "Dominica", "DO": "Dominican Republic", "EC": "Ecuador", "EG": "Egypt", "SV": "El Salvador", "GQ": "Equatorial Guinea", "ER": "Eritrea", "EE": "Estonia", "ET": "Ethiopia", "FI": "Finland", "GF": "French Guiana", "GA": "Gabon", "GE": "Georgia", "DE": "Germany", "GH": "Ghana", "GL": "Greenland", "GD": "Grenada", "GU": "Guam", "GT": "Guatemala", "GN": "Guinea", "GW": "Guinea-Bissau", "GY": "Guyana", "HT": "Haiti", "HN": "Honduras", "HU": "Hungary", "IS": "Iceland", "IN": "India", "IR": "Iran", "IQ": "Iraq", "IE": "Ireland", "IL": "Israel", "JM": "Jamaica", "JO": "Jordan", "KZ": "Kazakhstan", "KE": "Kenya", "XK": "Kosovo", "KW": "Kuwait", "KG": "Kyrgyzstan", "LA": "Lao PDR", "LV": "Latvia", "LB": "Lebanon", "LS": "Lesotho", "LR": "Liberia", "LY": "Libya", "LT": "Lithuania", "LU": "Luxembourg", "MK": "Macedonia", "MG": "Madagascar", "MW": "Malawi", "MV": "Maldives", "ML": "Mali", "MH": "Marshall Islands", "MQ": "Martinique", "MR": "Mauritania", "YT": "Mayotte", "MX": "Mexico", "MD": "Moldova", "MN": "Mongolia", "ME": "Montenegro", "MS": "Montserrat", "MA": "Morocco", "MZ": "Mozambique", "MM": "Myanmar", "NA": "Namibia", "NR": "Nauru", "NP": "Nepal", "NL": "Netherlands", "BQBO": "Netherlands", "NI": "Nicaragua", "NE": "Niger", "NG": "Nigeria", "PK": "Pakistan", "PW": "Palau", "PS": "Palestine", "PA": "Panama", "PY": "Paraguay", "PE": "Peru", "PL": "Poland", "PT": "Portugal", "QA": "Qatar", "CG": "Republic of Congo", "KR": "Republic of Korea", "RE": "Reunion", "RO": "Romania", "RW": "Rwanda", "BQSA": "Saba (Netherlands)", "LC": "Saint Lucia", "VC": "Saint Vincent and the Grenadines", "BL": "Saint-Barthélemy", "MF": "Saint-Martin", "SA": "Saudi Arabia", "SN": "Senegal", "RS": "Serbia", "SL": "Sierra Leone", "SX": "Sint Maarten", "SK": "Slovakia", "SI": "Slovenia", "SO": "Somalia", "ZA": "South Africa", "SS": "South Sudan", "ES": "Spain", "LK": "Sri Lanka", "BQSE": "St. Eustatius (Netherlands)", "SD": "Sudan", "SR": "Suriname", "SZ": "Swaziland", "SE": "Sweden", "CH": "Switzerland", "SY": "Syria", "TW": "Taiwan", "TJ": "Tajikistan", "TZ": "Tanzania", "TH": "Thailand", "GM": "The Gambia", "TL": "Timor-Leste", "TG": "Togo", "TN": "Tunisia", "TM": "Turkmenistan", "TV": "Tuvalu", "UG": "Uganda", "UA": "Ukraine", "AE": "United Arab Emirates", "UY": "Uruguay", "UZ": "Uzbekistan", "VE": "Venezuela", "VN": "Vietnam", "EH": "Western Sahara", "YE": "Yemen", "ZM": "Zambia", "ZW": "Zimbabwe", "JP": "Japan", "US": "United States", "RU": "Russian Federation", "CN": "China", "AU": "Australia", "FR": "France", "GB": "United Kingdom", "PH": "Philippines",
  // Class-based countries (using full names as both key and value for easy lookup)
  "American Samoa": "American Samoa",
  "Angola": "Angola",
  "Antigua and Barbuda": "Antigua and Barbuda",
  "Argentina": "Argentina",
  "Australia": "Australia",
  "Azerbaijan": "Azerbaijan",
  "Bahamas": "Bahamas",
  "Canada": "Canada",
  "Canary Islands (Spain)": "Canary Islands (Spain)",
  "Cape Verde": "Cape Verde",
  "Cayman Islands": "Cayman Islands",
  "Chile": "Chile",
  "China": "China",
  "Comoros": "Comoros",
  "Cyprus": "Cyprus",
  "Denmark": "Denmark",
  "Faeroe Islands": "Faeroe Islands",
  "Falkland Islands": "Falkland Islands",
  "Federated States of Micronesia": "Federated States of Micronesia",
  "Fiji": "Fiji",
  "France": "France",
  "French Polynesia": "French Polynesia",
  "Greece": "Greece",
  "Guadeloupe": "Guadeloupe",
  "Indonesia": "Indonesia",
  "Italy": "Italy",
  "Japan": "Japan",
  "Malaysia": "Malaysia",
  "Malta": "Malta",
  "Mauritius": "Mauritius",
  "New Caledonia": "New Caledonia",
  "New Zealand": "New Zealand",
  "Northern Mariana Islands": "Northern Mariana Islands",
  "Norway": "Norway",
  "Oman": "Oman",
  "Papua New Guinea": "Papua New Guinea",
  "Philippines": "Philippines",
  "Puerto Rico": "Puerto Rico",
  "Russian Federation": "Russian Federation",
  "Saint Kitts and Nevis": "Saint Kitts and Nevis",
  "Samoa": "Samoa",
  "São Tomé and Principe": "São Tomé and Principe",
  "Seychelles": "Seychelles",
  "Solomon Islands": "Solomon Islands",
  "Tonga": "Tonga",
  "Trinidad and Tobago": "Trinidad and Tobago",
  "Turkey": "Turkey",
  "Turks and Caicos Islands": "Turks and Caicos Islands",
  "United Kingdom": "United Kingdom",
  "United States": "United States",
  "United States Virgin Islands": "United States Virgin Islands",
  "Vanuatu": "Vanuatu"
}

// Reverse mapping: Country Name to SVG ID
const COUNTRY_TO_SVG_ID = {}
Object.entries(SVG_COUNTRY_MAPPING).forEach(([svgId, countryName]) => {
  COUNTRY_TO_SVG_ID[countryName] = svgId
})

// Normalize country names to match SVG mapping
// Handles common variations in database vs SVG naming
const normalizeCountryName = (countryName) => {
  if (!countryName) return null
  
  const nameMap = {
    'USA': 'United States',
    'U.S.A.': 'United States',
    'United States of America': 'United States',
    'US': 'United States',
    'America': 'United States',
    'Russia': 'Russian Federation',
    'USSR': 'Russian Federation',
    'Soviet Union': 'Russian Federation',
    'China': 'China',
    'P.R. China': 'China',
    'People\'s Republic of China': 'China',
    'PRC': 'China',
    'Australia': 'Australia',
    'France': 'France',
    'UK': 'United Kingdom',
    'England': 'United Kingdom',
    'Great Britain': 'United Kingdom',
    'Britain': 'United Kingdom',
    'Germany': 'Germany',
    'India': 'India',
    'Iran': 'Iran',
    'Persia': 'Iran',
    'North Korea': 'Dem. Rep. Korea',
    'DPRK': 'Dem. Rep. Korea',
    'South Korea': 'Republic of Korea',
    'Korea': 'Republic of Korea',
    'ROK': 'Republic of Korea',
    'Japan': 'Japan',
    'Brazil': 'Brazil',
    'Cuba': 'Cuba',
    'Philippines': 'Philippines',
    'Egypt': 'Egypt',
    'Mexico': 'Mexico',
    'Canada': 'Canada',
    'Ivory Coast': 'Côte d\'Ivoire',
    'Côte d\'Ivoire': 'Côte d\'Ivoire',
    'Congo': 'Republic of Congo',
    'Republic of Congo': 'Republic of Congo',
    'Democratic Republic of Congo': 'Democratic Republic of the Congo',
    'DR Congo': 'Democratic Republic of the Congo',
    'DRC': 'Democratic Republic of the Congo',
    'Timor Leste': 'Timor-Leste',
    'Timor-Leste': 'Timor-Leste',
    'East Timor': 'Timor-Leste',
    'Gambia': 'The Gambia',
    'The Gambia': 'The Gambia',
    'Myanmar': 'Myanmar',
    'Burma': 'Myanmar',
    'Thailand': 'Thailand',
    'Siam': 'Thailand',
    'Vietnam': 'Vietnam',
    'Viet Nam': 'Vietnam',
    'Cambodia': 'Cambodia',
    'Kampuchea': 'Cambodia',
    'Lao': 'Lao PDR',
    'Laos': 'Lao PDR',
    'Lao PDR': 'Lao PDR',
    'South Sudan': 'South Sudan',
    'Maldives': 'Maldives',
    'Turkey': 'Turkey',
    'Türkiye': 'Turkey',
    'Greece': 'Greece',
    'Italy': 'Italy',
    'Indonesia': 'Indonesia',
    'Malaysia': 'Malaysia',
    'New Zealand': 'New Zealand',
    'Aotearoa': 'New Zealand',
    'Argentina': 'Argentina',
    'Chile': 'Chile',
    'Norway': 'Norway',
    'Denmark': 'Denmark',
    'Sweden': 'Sweden',
    'Poland': 'Poland',
    'Czech Republic': 'Czech Republic',
    'Czechia': 'Czech Republic',
    'Slovakia': 'Slovakia',
    'Austria': 'Austria',
    'Hungary': 'Hungary',
    'Romania': 'Romania',
    'Bulgaria': 'Bulgaria',
    'Serbia': 'Serbia',
    'Croatia': 'Croatia',
    'Slovenia': 'Slovenia',
    'Bosnia and Herzegovina': 'Bosnia and Herzegovina',
    'Bosnia': 'Bosnia and Herzegovina',
    'Ukraine': 'Ukraine',
    'Moldova': 'Moldova',
    'Belarus': 'Belarus',
    'Lithuania': 'Lithuania',
    'Latvia': 'Latvia',
    'Estonia': 'Estonia',
    'Finland': 'Finland',
    'Iceland': 'Iceland',
    'Ireland': 'Ireland',
    'Belgium': 'Belgium',
    'Netherlands': 'Netherlands',
    'Holland': 'Netherlands',
    'Spain': 'Spain',
    'Portugal': 'Portugal',
    'Switzerland': 'Switzerland',
    'Helvetia': 'Switzerland',
    'Luxembourg': 'Luxembourg',
    'Saudi Arabia': 'Saudi Arabia',
    'Israel': 'Israel',
    'Palestine': 'Palestine',
    'Jordan': 'Jordan',
    'Lebanon': 'Lebanon',
    'Syria': 'Syria',
    'Iraq': 'Iraq',
    'Iran': 'Iran',
    'Afghanistan': 'Afghanistan',
    'Pakistan': 'Pakistan',
    'Bangladesh': 'Bangladesh',
    'Nepal': 'Nepal',
    'Sri Lanka': 'Sri Lanka',
    'Ceylon': 'Sri Lanka',
    'Thailand': 'Thailand',
    'Kenya': 'Kenya',
    'Uganda': 'Uganda',
    'Tanzania': 'Tanzania',
    'Ethiopia': 'Ethiopia',
    'South Africa': 'South Africa',
    'Nigeria': 'Nigeria',
    'Egypt': 'Egypt',
    'Morocco': 'Morocco',
    'Algeria': 'Algeria',
    'Tunisia': 'Tunisia',
    'Libya': 'Libya',
    'Sudan': 'Sudan',
    'Angola': 'Angola',
    'Mozambique': 'Mozambique',
    'Zimbabwe': 'Zimbabwe',
    'Botswana': 'Botswana',
    'Namibia': 'Namibia',
    'Zambia': 'Zambia',
    'Malawi': 'Malawi',
    'Colombia': 'Colombia',
    'Venezuela': 'Venezuela',
    'Guyana': 'Guyana',
    'Suriname': 'Suriname',
    'Ecuador': 'Ecuador',
    'Peru': 'Peru',
    'Bolivia': 'Bolivia',
    'Paraguay': 'Paraguay',
    'Uruguay': 'Uruguay',
    'Costa Rica': 'Costa Rica',
    'Panama': 'Panama',
    'Nicaragua': 'Nicaragua',
    'Honduras': 'Honduras',
    'El Salvador': 'El Salvador',
    'Guatemala': 'Guatemala',
    'Belize': 'Belize',
    'Jamaica': 'Jamaica',
    'Haiti': 'Haiti',
    'Dominican Republic': 'Dominican Republic',
    'Trinidad and Tobago': 'Trinidad and Tobago',
    'Singapore': 'Singapore',
    'Hong Kong': 'Hong Kong',
    'Taiwan': 'Taiwan',
    'Mongolia': 'Mongolia',
    'Kazakhstan': 'Kazakhstan',
    'Uzbekistan': 'Uzbekistan',
    'Turkmenistan': 'Turkmenistan',
    'Azerbaijan': 'Azerbaijan',
    'Georgia': 'Georgia',
    'Armenia': 'Armenia',
  }
  
  // Direct lookup
  if (nameMap[countryName]) {
    return nameMap[countryName]
  }
  
  // Try to find in SVG mapping values
  const found = Object.values(SVG_COUNTRY_MAPPING).find(
    name => name.toLowerCase() === countryName.toLowerCase()
  )
  
  return found || countryName
}

// Get SVG ID for a country from database
const getSvgIdForCountry = (countryName) => {
  const normalized = normalizeCountryName(countryName)
  return COUNTRY_TO_SVG_ID[normalized] || null
}

// Get country name from SVG ID
const getCountryNameFromSvgId = (svgId) => {
  return SVG_COUNTRY_MAPPING[svgId] || null
}

// Countries functions
const getTotalCountries = async () => {
  try {
    const { data, error, count } = await supabase
      .from('countries')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Error fetching total countries count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Error in getTotalCountries:', error)
    return 0
  }
}

const getAllCountries = async () => {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching countries:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllCountries:', error)
    return []
  }
}

const getAllPlayers = async (limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('player_progress')
      .select(`
        id,
        user_id,
        total_intel_points,
        missions_completed,
        missions_failed,
        countries_cleared
      `)
      .order('total_intel_points', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching players:', error)
      return []
    }

    // Fetch user data for each player
    const playersWithNames = await Promise.all(
      (data || []).map(async (player) => {
        const { data: userData } = await supabase
          .from('users')
          .select('username')
          .eq('id', player.user_id)
          .single()

        return {
          id: player.id,
          userId: player.user_id,
          username: userData?.username || 'UNKNOWN AGENT',
          score: player.total_intel_points || 0,
          missionsCompleted: player.missions_completed || 0,
          missionsFailed: player.missions_failed || 0,
          countriesCleared: (player.countries_cleared || []).length
        }
      })
    )

    return playersWithNames
  } catch (error) {
    console.error('Error in getAllPlayers:', error)
    return []
  }
}

const getPlayerRank = (score) => {
  if (score < 100) return 'RECRUIT'
  if (score < 250) return 'OPERATIVE'
  if (score < 500) return 'AGENT'
  return 'ELITE'
}

// Image Storage Functions
const uploadImage = async (file, bucket = 'game-images', path = '') => {
  try {
    if (!file) return null
    
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name}`
    const filePath = path ? `${path}/${fileName}` : fileName
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)
    
    if (error) {
      console.error('Error uploading image:', error)
      return null
    }
    
    return filePath
  } catch (error) {
    console.error('Error in uploadImage:', error)
    return null
  }
}

const getImageUrl = (filePath, bucket = 'game-images') => {
  try {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)
    
    return data?.publicUrl || null
  } catch (error) {
    console.error('Error getting image URL:', error)
    return null
  }
}

const deleteImage = async (filePath, bucket = 'game-images') => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])
    
    if (error) {
      console.error('Error deleting image:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error in deleteImage:', error)
    return false
  }
}

// Get only countries that have questions (playable countries)
const getCountriesWithQuestions = async () => {
  try {
    // Get all countries first
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('id, name, description, image_path')
      .order('name', { ascending: true })
    
    if (countriesError) {
      console.error('Error fetching countries:', countriesError)
      return []
    }
    
    if (!countries || countries.length === 0) {
      return []
    }
    
    // Get all questions to check which countries have them
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('country_id')
    
    if (questionsError) {
      console.error('Error fetching questions:', questionsError)
      return []
    }
    
    // Create a set of country IDs that have questions
    const countriesWithQuestionsSet = new Set()
    if (questions && questions.length > 0) {
      questions.forEach(q => {
        if (q.country_id) {
          countriesWithQuestionsSet.add(q.country_id)
        }
      })
    }
    
    // Filter countries to only those with questions
    const filteredCountries = countries.filter(country => 
      countriesWithQuestionsSet.has(country.id)
    )
    
    return filteredCountries
  } catch (error) {
    console.error('Error in getCountriesWithQuestions:', error)
    return []
  }
}

export { 
  supabase, 
  authenticateUser, 
  registerUser, 
  logoutUser, 
  getCurrentUser, 
  getCurrentUserId,
  getPlayerProgress,
  updateIntelPoints,
  updateMissionCompleted,
  updateMissionFailed,
  updateCipherProgress,
  unlockAchievement,
  getTotalCountries,
  getAllCountries,
  getAllPlayers,
  getPlayerRank,
  uploadImage,
  getImageUrl,
  deleteImage,
  getCountriesWithQuestions,
  SVG_COUNTRY_MAPPING,
  COUNTRY_TO_SVG_ID,
  normalizeCountryName,
  getSvgIdForCountry,
  getCountryNameFromSvgId
}

