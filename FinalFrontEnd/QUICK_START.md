# Quick Start Guide - Supabase Images & Country Filtering

## Problem Solved ✅
The Philippines (and other countries without questions) were showing as highlighted and clickable on the world map even though they had no missions. This has been fixed.

## What Changed

### 1. Only Playable Countries Load
```javascript
// OLD - Loaded all countries:
const { data, error } = await supabase
  .from("countries")
  .select("*")

// NEW - Loads only countries with questions:
const countries = await getCountriesWithQuestions()
```

### 2. Image Storage is Ready
You can now store and retrieve images from Supabase:
```javascript
// Upload
const filePath = await uploadImage(file, 'game-images', 'country-images')

// Get URL
const url = getImageUrl(filePath)

// Delete
await deleteImage(filePath)
```

## Files You Need to Know About

### Core Functions
- **`src/library/supabase.js`** - Contains:
  - `getCountriesWithQuestions()` - Get only playable countries
  - `uploadImage()` - Upload images to Supabase
  - `getImageUrl()` - Get image URLs
  - `deleteImage()` - Delete images

### Vue Composable
- **`src/composables/useSupabaseImages.js`** - Use in components:
  - `getCountryImageUrl()` - Smart URL handling
  - `uploadGameImage()` - Upload with loading state
  - `getCountryImage()` - Fetch country image from database

### Updated Views
- **`src/views/Supabase.vue`** - Now uses `getCountriesWithQuestions()`
- **`src/views/AboutView.vue`** - Now displays only playable countries

## Examples

### Example 1: Show All Playable Countries
```vue
<script setup>
import { getCountriesWithQuestions } from '@/library/supabase.js'

const countries = await getCountriesWithQuestions()
// Only countries with missions are loaded!
</script>

<template>
  <div v-for="country in countries" :key="country.id">
    {{ country.name }}
  </div>
</template>
```

### Example 2: Display Country Image
```vue
<script setup>
import { useSupabaseImages } from '@/composables/useSupabaseImages.js'

const { getCountryImageUrl } = useSupabaseImages()

const imageUrl = getCountryImageUrl('country-images/1734012345-china.jpg')
</script>

<template>
  <img :src="imageUrl" alt="Country" />
</template>
```

### Example 3: Upload Image with Feedback
```vue
<script setup>
import { useSupabaseImages } from '@/composables/useSupabaseImages.js'

const { uploadGameImage, isLoading, error } = useSupabaseImages()

const handleUpload = async (file) => {
  const filePath = await uploadGameImage(file, 'country-images')
  if (filePath) {
    console.log('Uploaded successfully:', filePath)
    // Save filePath to database
  }
}
</script>

<template>
  <div>
    <input type="file" @change="e => handleUpload(e.target.files[0])" />
    <div v-if="isLoading">Uploading...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>
```

## Database Setup (Optional but Recommended)

Add image storage to your countries table:

```sql
-- Add image_path column to store Supabase image paths
ALTER TABLE countries ADD COLUMN image_path TEXT;

-- Example data:
UPDATE countries SET image_path = 'country-images/1734012345-usa.jpg' WHERE name = 'United States';
UPDATE countries SET image_path = 'country-images/1734012346-china.jpg' WHERE name = 'China';
```

Then fetch with:
```javascript
const country = await supabase
  .from('countries')
  .select('id, name, image_path')
  .eq('id', countryId)
  .single()

const imageUrl = getImageUrl(country.image_path)
```

## Supabase Storage Setup

1. Go to your Supabase dashboard
2. Click **Storage** in the sidebar
3. Create a new bucket named `game-images`
4. Set it to **Public** (important!)
5. Done! You're ready to use the image functions

## What's Fixed

| Issue | Solution |
|-------|----------|
| Philippines showing as playable | Now filtered - only countries with questions appear |
| All countries loading unnecessarily | Using efficient filtered query |
| No image storage system | Implemented with Supabase Storage |
| Hard to manage images in components | Created `useSupabaseImages` composable |

## Testing the Fix

1. **Before**: Philippines would be highlighted and clickable even with no questions
2. **After**: Philippines won't appear on the map at all (unless it has questions)

To test:
- Open the world map in the game
- Philippines should NOT be highlighted
- Only countries with questions should be highlighted

## Need Help?

See:
- **Full Documentation**: `SUPABASE_STORAGE_GUIDE.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Code Examples**: This file
