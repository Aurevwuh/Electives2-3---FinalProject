# Supabase Image Storage Implementation Guide

This document outlines how to use Supabase Storage for managing images in the Spy Espionage application.

## Overview

The project now includes functions to:
- Upload images to Supabase Storage
- Retrieve public URLs for stored images
- Delete images from storage
- Fetch country images directly from the database

## Available Functions

### In `src/library/supabase.js`

#### `uploadImage(file, bucket, path)`
Uploads an image file to Supabase Storage.

**Parameters:**
- `file` (File): The image file to upload
- `bucket` (string): Storage bucket name (default: 'game-images')
- `path` (string): Path within the bucket (e.g., 'country-images', 'avatars')

**Returns:** File path or null on error

**Example:**
```javascript
import { uploadImage } from '@/library/supabase.js'

const handleImageUpload = async (file) => {
  const filePath = await uploadImage(file, 'game-images', 'country-images')
  if (filePath) {
    console.log('Uploaded to:', filePath)
  }
}
```

#### `getImageUrl(filePath, bucket)`
Gets the public URL for an image stored in Supabase.

**Parameters:**
- `filePath` (string): The file path in storage
- `bucket` (string): Storage bucket name (default: 'game-images')

**Returns:** Public URL string

**Example:**
```javascript
import { getImageUrl } from '@/library/supabase.js'

const imageUrl = getImageUrl('country-images/china.jpg')
// Returns: https://junorlahdvolliticgjt.supabase.co/storage/v1/object/public/game-images/country-images/china.jpg
```

#### `deleteImage(filePath, bucket)`
Deletes an image from Supabase Storage.

**Parameters:**
- `filePath` (string): The file path to delete
- `bucket` (string): Storage bucket name (default: 'game-images')

**Returns:** Boolean indicating success

**Example:**
```javascript
import { deleteImage } from '@/library/supabase.js'

const success = await deleteImage('country-images/old-image.jpg')
```

#### `getCountriesWithQuestions()`
Fetches only countries that have missions (questions), filtering out countries without content.

**Returns:** Array of country objects

**Example:**
```javascript
import { getCountriesWithQuestions } from '@/library/supabase.js'

const playableCountries = await getCountriesWithQuestions()
// Returns only countries that have questions and can be played
```

### In `src/composables/useSupabaseImages.js`

This composable provides a convenient Vue interface for image handling.

#### `getImagePublicUrl(filePath, bucket)`
Gets the public URL for an image.

#### `getCountryImageUrl(imagePath)`
Gets the image URL, handling both local paths and Supabase storage paths intelligently.

#### `uploadGameImage(file, path, bucket)`
Uploads a game image with loading and error states.

#### `getCountryImage(countryId)`
Fetches the image URL for a specific country from the database.

## Using in Vue Components

### Example 1: Display Country Image
```vue
<script setup>
import { useSupabaseImages } from '@/composables/useSupabaseImages.js'

const { getCountryImageUrl } = useSupabaseImages()

const country = {
  id: 1,
  name: 'China',
  image_path: 'country-images/1734012345-china.jpg'
}

const imageUrl = getCountryImageUrl(country.image_path)
</script>

<template>
  <img :src="imageUrl" :alt="country.name" />
</template>
```

### Example 2: Upload and Display Image
```vue
<script setup>
import { ref } from 'vue'
import { useSupabaseImages } from '@/composables/useSupabaseImages.js'

const { uploadGameImage, getCountryImageUrl, isLoading, error } = useSupabaseImages()

const selectedFile = ref(null)
const uploadedImagePath = ref(null)

const handleFileSelect = (event) => {
  selectedFile.value = event.target.files[0]
}

const handleUpload = async () => {
  if (!selectedFile.value) return
  
  const filePath = await uploadGameImage(selectedFile.value, 'country-images')
  if (filePath) {
    uploadedImagePath.value = filePath
  }
}

const imageUrl = () => {
  return uploadedImagePath.value ? getCountryImageUrl(uploadedImagePath.value) : null
}
</script>

<template>
  <div>
    <input type="file" @change="handleFileSelect" accept="image/*" />
    <button @click="handleUpload" :disabled="isLoading">
      {{ isLoading ? 'Uploading...' : 'Upload' }}
    </button>
    <div v-if="error" class="error">{{ error }}</div>
    <img v-if="imageUrl()" :src="imageUrl()" alt="Uploaded" />
  </div>
</template>
```

## Setting Up Supabase Storage

### Prerequisites
1. Supabase project must have Storage enabled
2. Create a bucket named `game-images` (or configure a different bucket name in functions)

### Create Bucket in Supabase Dashboard
1. Go to Storage in your Supabase dashboard
2. Click "Create a new bucket"
3. Name it `game-images`
4. Set it to Public (to allow direct URL access)

### Bucket Structure
Suggested folder structure in the bucket:
```
game-images/
├── country-images/          # Country mission images
├── avatars/                 # User profile avatars
├── general/                 # General game assets
└── ui/                      # UI elements
```

## Database Changes

To store image paths in the database:

### Countries Table
Add an `image_path` column to store the path to country images:
```sql
ALTER TABLE countries ADD COLUMN image_path TEXT;
```

### Users Table (Optional)
Add for user profile pictures:
```sql
ALTER TABLE users ADD COLUMN avatar_path TEXT;
```

## Important Notes

1. **Public Bucket**: The `game-images` bucket should be public to allow direct URL access
2. **File Path**: Always store the relative path (e.g., 'country-images/1734012345-china.jpg'), not the full URL
3. **Backward Compatibility**: The `getCountryImageUrl()` function handles both local paths (/images/...) and Supabase paths automatically
4. **Filtering**: The `getCountriesWithQuestions()` function ensures only playable countries are displayed, fixing the Philippines issue

## Fixed Issues

### Philippines Issue
Previously, the Philippines was highlighted and playable on the world map even though it had no questions. This has been fixed by:
1. Creating `getCountriesWithQuestions()` function that only returns countries with questions
2. Updating Supabase.vue to use this function instead of loading all countries
3. Updating AboutView.vue to display only playable countries

### Current Implementation
- Supabase.vue now loads only countries with questions
- WorldMap receives only playable countries and won't highlight non-playable ones
- AboutView displays only countries available in missions

## Future Enhancements

1. Implement image optimization/resizing on upload
2. Add image caching strategies
3. Support for different image sizes (thumbnail, full-size)
4. Batch upload functionality
5. Image gallery component for managing game assets
