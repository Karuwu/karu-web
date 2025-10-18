// File: app/actions.ts
'use server'; // This is the magic directive that makes this a Server Action file

import { db } from '../lib/firebase'; // Your admin SDK
import { revalidatePath } from 'next/cache'; // A new, important import

// Define the shape of our form data
interface PostFormData {
  title: string;
  content: string;
}

export async function createPost(formData: PostFormData) {
  const { title, content } = formData;

  if (!title || !content) {
    throw new Error('Title and content are required.');
  }

  try {
    // Add a new document to the 'posts' collection
    await db.collection('posts').add({
      title: title,
      content: content,
      createdAt: new Date(), // Add a timestamp
    });

    console.log('New post created successfully!');

    // THIS IS KEY: After creating a post, we must tell Next.js
    // to "revalidate" (refresh) the data on the homepage.
    revalidatePath('/');

  } catch (error) {
    console.error('Error creating post:', error);
    throw new Error('Failed to create post.');
  }
}
