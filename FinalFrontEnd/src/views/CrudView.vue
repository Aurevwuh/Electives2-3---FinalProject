<template>
  <div class="crud">
    <h2>Manage Posts</h2>

    <div class="form-section">
      <input v-model="newPost.title" placeholder="Post Title" />
      <input v-model="newPost.description" placeholder="Description" />
      <button @click="addPost">Add Post</button>
    </div>

    <table class="post-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(post, index) in posts" :key="post.id">
          <td>{{ post.id }}</td>
          <td v-if="editIndex !== index">{{ post.title }}</td>
          <td v-else><input v-model="editPost.title" /></td>

          <td v-if="editIndex !== index">{{ post.description }}</td>
          <td v-else><input v-model="editPost.description" /></td>

          <td>
            <button v-if="editIndex !== index" @click="startEdit(index)">Edit</button>
            <button v-else @click="saveEdit(index)">Save</button>
            <button @click="deletePost(index)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "CrudView",
  data() {
    return {
      posts: [],
      newPost: { title: "", description: "" },
      editIndex: null,
      editPost: { title: "", description: "" },
      nextId: 1,
      currentUser: null
    };
  },
  mounted() {
    const currentEmail = localStorage.getItem("currentUser");
    if (!currentEmail) {
      this.$router.push('/login');
      return;
    }
    this.currentUser = currentEmail;

    const allPosts = JSON.parse(localStorage.getItem("userPosts") || "{}");
    this.posts = allPosts[currentEmail] || [];
    this.nextId = this.posts.length > 0 
      ? Math.max(...this.posts.map(p => p.id)) + 1 
      : 1;
  },
  methods: {
    savePosts() {
      const allPosts = JSON.parse(localStorage.getItem("userPosts") || "{}");
      allPosts[this.currentUser] = this.posts;
      localStorage.setItem("userPosts", JSON.stringify(allPosts));
    },
    addPost() {
      if (!this.newPost.title || !this.newPost.description) {
        return alert("Fill in all fields!");
      }
      this.posts.push({
        id: this.nextId++,
        title: this.newPost.title,
        description: this.newPost.description,
        createdAt: new Date().toISOString()
      });
      this.newPost = { title: "", description: "" };
      this.savePosts();
    },
    deletePost(index) {
      this.posts.splice(index, 1);
      this.savePosts();
    },
    startEdit(index) {
      this.editIndex = index;
      this.editPost = { ...this.posts[index] };
    },
    saveEdit(index) {
      this.posts[index] = { 
        ...this.editPost,
        updatedAt: new Date().toISOString()
      };
      this.editIndex = null;
      this.savePosts();
    },
  },
};
</script>

<style scoped>
.crud {
  padding: 20px;
}

.form-section {
  margin-bottom: 20px;
}

.form-section input {
  margin-right: 5px;
  padding: 5px;
}

button {
  margin-right: 5px;
  padding: 5px 10px;
}

.post-table {
  width: 100%;
  border-collapse: collapse;
}

.post-table th,
.post-table td {
  border: 1px solid #ddd;
  padding: 8px;
}

.post-table th {
  background-color: #333;
  color: white;
}
</style>
