<template>
  <div class="profile-container">
    <div class="profile-card">
      <h2>My Profile</h2>

      <div class="avatar-section">
        <img
          src="/images/avatar_image.jpg"
          alt="Profile Avatar"
          class="avatar"
        />
        <button @click="changeAvatar">Change Avatar</button>
      </div>

      <form @submit.prevent="saveProfile">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input v-model="name" id="name" type="text" />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input v-model="email" id="email" type="email" readonly />
        </div>

        <button type="submit" class="save-btn">Save Changes</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProfileView",
  data() {
    return {
      name: "",
      email: ""
    };
  },
    mounted() {

    const currentEmail = localStorage.getItem("currentUser");
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const currentUser = users.find((u) => u.email === currentEmail);

    if (currentUser) {
      this.email = currentUser.email;
      this.name = currentUser.name || "Unnamed User";
    } else {

      this.$router.push("/login");
    }
  },
  methods: {
    changeAvatar() {
      alert("Wala char char rani hehe");
    },
    saveProfile() {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const currentEmail = localStorage.getItem("currentUser");
      const index = users.findIndex((u) => u.email === currentEmail);

      if (index !== -1) {
        users[index].name = this.name;
        localStorage.setItem("users", JSON.stringify(users));
        alert(`Profile updated!\nName: ${this.name}\nEmail: ${this.email}`);
      }
    },
  },
};
</script>


<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.profile-card {
  background: white;
  color: black;
  padding: 2rem;
  border-radius: 0;
  border: 2px solid black;
  width: 350px;
  text-align: center;
}

.avatar-section {
  margin-bottom: 1.5rem;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px solid black;
  object-fit: cover;
  margin-bottom: 0.5rem;
}

.avatar-section button {
  background: black;
  color: white;
  border: 1px solid black;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.avatar-section button:hover {
  background: white;
  color: black;
}

.form-group {
  margin-bottom: 1rem;
  text-align: left;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.4rem;
}

input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid black;
  border-radius: 0;
  background: white;
  color: black;
}

input:focus {
  outline: none;
  border: 2px solid black;
}

.save-btn {
  background: black;
  color: white;
  border: 1px solid black;
  padding: 0.7rem 1.2rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
}

.save-btn:hover {
  background: white;
  color: black;
}
</style>
