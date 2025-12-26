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

// ADMIN CRUD FUNCTIONS FOR COUNTRIES AND MISSIONS
const addCountry = async (countryData) => {
  try {
    const { data, error } = await supabase
      .from('countries')
      .insert([countryData])
      .select()
    
    if (error) {
      console.error('Error adding country:', error)
      return { success: false, error }
    }
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error adding country:', error)
    return { success: false, error }
  }
}

const updateCountry = async (countryId, countryData) => {
  try {
    const { data, error } = await supabase
      .from('countries')
      .update(countryData)
      .eq('id', countryId)
      .select()
    
    if (error) {
      console.error('Error updating country:', error)
      return { success: false, error }
    }
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error updating country:', error)
    return { success: false, error }
  }
}

const deleteCountry = async (countryId) => {
  try {
    const { error } = await supabase
      .from('countries')
      .delete()
      .eq('id', countryId)
    
    if (error) {
      console.error('Error deleting country:', error)
      return { success: false, error }
    }
    return { success: true }
  } catch (error) {
    console.error('Error deleting country:', error)
    return { success: false, error }
  }
}

const addQuestion = async (questionData) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .insert([questionData])
      .select()
    
    if (error) {
      console.error('Error adding question:', error)
      return { success: false, error }
    }
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error adding question:', error)
    return { success: false, error }
  }
}

const updateQuestion = async (questionId, questionData) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .update(questionData)
      .eq('id', questionId)
      .select()
    
    if (error) {
      console.error('Error updating question:', error)
      return { success: false, error }
    }
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error updating question:', error)
    return { success: false, error }
  }
}

const deleteQuestion = async (questionId) => {
  try {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId)
    
    if (error) {
      console.error('Error deleting question:', error)
      return { success: false, error }
    }
    return { success: true }
  } catch (error) {
    console.error('Error deleting question:', error)
    return { success: false, error }
  }
}

const getCountriesByIds = async (countryIds = null) => {
  try {
    let query = supabase.from('countries').select('*').order('name', { ascending: true })
    
    if (countryIds && countryIds.length > 0) {
      query = query.in('id', countryIds)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching countries:', error)
      return { success: false, error }
    }
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching countries:', error)
    return { success: false, error }
  }
}

const getQuestionsByCountry = async (countryId) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('country_id', countryId)
    
    if (error) {
      // Silently return empty array for table/permission errors
      if (error.code === 'PGRST116' || error.status === 400) {
        return { success: true, data: [] }
      }
      console.error('Error fetching questions:', error)
      return { success: false, error }
    }
    return { success: true, data }
  } catch (error) {
    // Silently return empty array on catch
    return { success: true, data: [] }
  }
}

// Get completed countries for a user
const getCompletedCountries = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('completed_countries')
      .eq('user_id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching completed countries:', error)
      return { success: false, data: [] }
    }
    
    return { success: true, data: data?.completed_countries || [] }
  } catch (error) {
    console.error('Error fetching completed countries:', error)
    return { success: false, data: [] }
  }
}

// Mark a country as completed for a user
const markCountryCompleted = async (userId, countryName) => {
  try {
    // First get the current completed countries
    const current = await getCompletedCountries(userId)
    const completedCountries = current.data || []
    
    if (!completedCountries.includes(countryName)) {
      completedCountries.push(countryName)
    }
    
    // Update the user_progress table
    const { data, error } = await supabase
      .from('user_progress')
      .update({ completed_countries: completedCountries })
      .eq('user_id', userId)
      .select()
    
    if (error) {
      console.error('Error marking country completed:', error)
      return { success: false, error }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Error marking country completed:', error)
    return { success: false, error }
  }
}

const addPuzzle = async (puzzleData) => {
  try {
    const { data, error } = await supabase
      .from('puzzles')
      .insert([puzzleData])
      .select()
    
    if (error) {
      console.error('Error adding puzzle:', error)
      return { success: false, error }
    }
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error adding puzzle:', error)
    return { success: false, error }
  }
}

const updatePuzzle = async (puzzleId, puzzleData) => {
  try {
    const { data, error } = await supabase
      .from('puzzles')
      .update(puzzleData)
      .eq('id', puzzleId)
      .select()
    
    if (error) {
      console.error('Error updating puzzle:', error)
      return { success: false, error }
    }
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error updating puzzle:', error)
    return { success: false, error }
  }
}

const deletePuzzle = async (puzzleId) => {
  try {
    const { error } = await supabase
      .from('puzzles')
      .delete()
      .eq('id', puzzleId)
    
    if (error) {
      console.error('Error deleting puzzle:', error)
      return { success: false, error }
    }
    return { success: true }
  } catch (error) {
    console.error('Error deleting puzzle:', error)
    return { success: false, error }
  }
}

const getPuzzlesByCountry = async (countryId) => {
  try {
    const { data, error } = await supabase
      .from('puzzles')
      .select('*')
      .eq('country_id', countryId)
    
    if (error) {
      // Silently return empty array for table/permission errors
      if (error.code === 'PGRST116' || error.status === 400) {
        return { success: true, data: [] }
      }
      console.error('Error fetching puzzles:', error)
      return { success: false, error }
    }
    return { success: true, data }
  } catch (error) {
    // Silently return empty array on catch
    return { success: true, data: [] }
  }
}

// Get all questions (for highlighting)
const getAllQuestions = async () => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
    
    if (error) {
      console.error('Error fetching all questions:', error)
      return { success: false, error }
    }
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching all questions:', error)
    return { success: false, error }
  }
}

// Get all puzzles (for highlighting)
const getAllPuzzles = async () => {
  try {
    const { data, error } = await supabase
      .from('puzzles')
      .select('*')
    
    if (error) {
      console.error('Error fetching all puzzles:', error)
      return { success: false, error }
    }
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching all puzzles:', error)
    return { success: false, error }
  }
}

// CIPHER PUZZLE FUNCTIONS
const addCipherPuzzle = async (puzzleData) => {
  try {
    const { data, error } = await supabase
      .from('cipher_puzzles')
      .insert([puzzleData])
      .select()
    
    if (error) {
      console.error('Error adding cipher puzzle:', error)
      return { success: false, error }
    }
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error adding cipher puzzle:', error)
    return { success: false, error }
  }
}

const updateCipherPuzzle = async (puzzleId, puzzleData) => {
  try {
    const { data, error } = await supabase
      .from('cipher_puzzles')
      .update(puzzleData)
      .eq('id', puzzleId)
      .select()
    
    if (error) {
      console.error('Error updating cipher puzzle:', error)
      return { success: false, error }
    }
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error updating cipher puzzle:', error)
    return { success: false, error }
  }
}

const deleteCipherPuzzle = async (puzzleId) => {
  try {
    const { error } = await supabase
      .from('cipher_puzzles')
      .delete()
      .eq('id', puzzleId)
    
    if (error) {
      console.error('Error deleting cipher puzzle:', error)
      return { success: false, error }
    }
    return { success: true }
  } catch (error) {
    console.error('Error deleting cipher puzzle:', error)
    return { success: false, error }
  }
}

const getCipherPuzzlesByCountry = async (countryId) => {
  try {
    const { data, error } = await supabase
      .from('cipher_puzzles')
      .select('*')
      .eq('country_id', countryId)
    
    if (error) {
      console.error('Error fetching cipher puzzles:', error)
      return { success: false, error }
    }
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching cipher puzzles:', error)
    return { success: false, error }
  }
}

const getAllCipherPuzzles = async () => {
  try {
    const { data, error } = await supabase
      .from('puzzles')
      .select('*')
      .eq('puzzle_type', 'caesar_cipher')
      .order('puzzle_data->shift', { ascending: true })
    
    if (error) {
      console.error('Error fetching all cipher puzzles:', error)
      return { success: false, error }
    }
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching all cipher puzzles:', error)
    return { success: false, error }
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
  addCountry,
  updateCountry,
  deleteCountry,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  addPuzzle,
  updatePuzzle,
  deletePuzzle,
  addCipherPuzzle,
  updateCipherPuzzle,
  deleteCipherPuzzle,
  getCountriesByIds,
  getQuestionsByCountry,
  getAllQuestions,
  getPuzzlesByCountry,
  getAllPuzzles,
  getCipherPuzzlesByCountry,
  getAllCipherPuzzles,
  getCompletedCountries,
  markCountryCompleted
}

