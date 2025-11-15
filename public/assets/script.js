let token = localStorage.getItem("authToken");

// Attach functions to window for HTML access when page loads
window.register = register;
window.login = login;
window.logout = logout;
window.createPost = createPost;
window.fetchPosts = fetchPosts;
window.filterPosts = filterPosts;
window.searchPosts = searchPosts;


document.addEventListener("DOMContentLoaded", () => {
  // Initial UI setup pn page loading
  updateUI();
  loadCategoriesSidebar();

  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");
  const showLoginBtn = document.getElementById("show-login-btn");
  const showRegisterBtn = document.getElementById("show-register-btn");

  // Show login form
  showLoginBtn?.addEventListener("click", () => {
      loginForm.classList.remove("hidden");
      registerForm.classList.add("hidden");
  });

  // Show register form
  showRegisterBtn?.addEventListener("click", () => {
      registerForm.classList.remove("hidden");
      loginForm.classList.add("hidden");
  });


});

    // Updates front end
function updateUI() {
    const token = localStorage.getItem("authToken");
    const authContainer = document.getElementById("auth-container");
    const createPostContainer = document.getElementById("create-post-container");
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");

    if (token) {
        // User is logged in
        authContainer.classList.add("hidden");
        createPostContainer.classList.remove("hidden");
        registerForm.classList.add("hidden");
        loginForm.classList.add("hidden");
    } else {
        // User is not logged in
        authContainer.classList.remove("hidden");
        createPostContainer.classList.add("hidden");

        // Show register form by default
        registerForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
    }
}

// Register function
function register() {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !email || !password) {
        return alert("Please fill in all fields");
    }

    fetch("http://localhost:3001/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.errors && Array.isArray(data.errors)) {
            alert(data.errors.map(e => e.message).join("\n"));
        } else if (data.error) {
            alert(data.error);
        } else if (data.token) {
            // Auto-login after registration
            localStorage.setItem("authToken", data.token);
            token = data.token;
            updateUI();
            alert("Registration successful! You are now logged in.");
        } else {
            alert(data.message || "Registration successful. Please log in.");
        }
    })
    .catch(err => {
        console.error("Registration error:", err);
        alert("Failed to register. Check console for details.");
    });
}

function login() {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!email || !password) return alert("Please enter email and password");

    fetch("http://localhost:3001/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem("authToken", data.token);
            token = data.token;
            updateUI();
            alert("Logged in successfully!");
        } else {
            alert(data.message || "Login failed");
        }
    })
    .catch(err => {
        console.error("Login error:", err);
        alert("Login failed. Check console for details.");
    });
}

// Logout
function logout() {
    if (!token) return;

    fetch("http://localhost:3001/api/users/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    })
    .finally(() => {
        // Remove token locally
        localStorage.removeItem("authToken");
        token = null;
        updateUI();
        alert("Logged out successfully");
    });
}

// Load posts 
function fetchPosts() {
  fetch("http://localhost:3001/api/posts")
    .then(res => res.json())
    .then(posts => {
      const container = document.getElementById("posts");
      container.innerHTML = "";

      if (!Array.isArray(posts)) {
        console.error("Posts data is not an array:", posts);
        return;
      }

      posts.forEach(post => {

        let dateText = "Unknown date";
        if (post.createdAt) {
          const date = new Date(post.createdAt);
          if (!isNaN(date)) {
            dateText = date.toLocaleString(); 
          }
        }

        const div = document.createElement("div");
        div.classList.add("post");

        div.innerHTML = `
          <h3>${post.title}</h3>
          <p>${post.content}</p>
          <small>
            By: ${post.user?.username || post.postedBy || "Unknown"} 
            in category: ${post.category?.category_name || post.category_name || "General"}
            on ${dateText}
          </small>
        `;
        container.appendChild(div);
      });
    })
    .catch(err => console.error("Error fetching posts:", err));
}
  
// Create post only for logged in users
function createPost() {
  if (!token) return alert("You must be logged in to create a post");

  const title = document.getElementById("post-title").value.trim();
  const content = document.getElementById("post-content").value.trim();
  const categoryId = parseInt(document.getElementById("category-dropdown").value);

  if (!title || !content || !categoryId) {
    return alert("Please fill in all fields");
  }
  // user login details
  const decodedToken = jwt_decode(token);
  const userId = decodedToken.data?.id; // Ensure .data.id exists

  if (!userId) return alert("Invalid user session. Please log in again.");

  fetch("http://localhost:3001/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title,
      content,
      category_id: categoryId,  
      user_id: userId           
    }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        console.error("Error creating post:", data.error);
        return alert("Failed to create post. Check console for details.");
      }
      alert("Post created successfully!");
      // Clear form
      document.getElementById("post-title").value = "";
      document.getElementById("post-content").value = "";
      document.getElementById("category-dropdown").value = "";
      fetchPosts();
    })
    .catch(err => {
      console.error("Network error creating post:", err);
      alert("Failed to create post. Network error.");
    });
}

// Function to load categories on frontend as dropdown
function loadCategories() {
  fetch("http://localhost:3001/api/categories")
    .then(res => res.json())
    .then(categories => {
      const dropdown = document.getElementById("category-dropdown");
      dropdown.innerHTML = '<option value="">Select a category</option>';

      if (!Array.isArray(categories)) {
        console.error("Categories data is not an array:", categories);
        return;
      }

      categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id; // must be numeric ID for backend
        option.textContent = cat.category_name;
        dropdown.appendChild(option);
      });
    })
    .catch(err => 
      console.error("Error loading categories:", err));
}

// Function for sidebar to load categories
function loadCategoriesSidebar() {
  fetch("http://localhost:3001/api/categories")
    .then(res => res.json())
    .then(categories => {
      const sidebar = document.getElementById("categories-list");
      sidebar.innerHTML = ""; 

      if (!Array.isArray(categories)) {
        console.error("Categories data is not an array:", categories);
        return;
      }

      // Add an "All" option to reset filter
      const allLi = document.createElement("li");
      allLi.textContent = "All";
      allLi.style.fontWeight = "bold";
      allLi.addEventListener("click", () => fetchPosts()); // show all posts
      sidebar.appendChild(allLi);

      // Add categories
      categories.forEach(cat => {
        const li = document.createElement("li");
        li.textContent = cat.category_name;
        li.addEventListener("click", () => filterPosts(cat.category_name));
        sidebar.appendChild(li);
      });
    })
    .catch(err => console.error("Error loading sidebar categories:", err));
}

// Function for sidebar to filter categories by name
function filterByCategory(categoryId) {
  fetch(`http://localhost:3001/api/posts?category_id=${categoryId}`)
    .then(res => res.json())
    .then(posts => {
      const container = document.getElementById("posts");
      container.innerHTML = "";

      if (!Array.isArray(posts)) {
        console.error("Posts data is not an array:", posts);
        return;
      }

      posts.forEach(post => {
        const div = document.createElement("div");
        div.classList.add("post");
        div.innerHTML = `
          <h3>${post.title}</h3>
          <p>${post.content}</p>
          <small>
            By: ${post.user?.username || "Unknown"} 
            in category: ${post.category?.category_name || "General"}
            on ${post.created_at ? new Date(post.created_at).toLocaleString() : "Unknown date"}
          </small>
        `;
        container.appendChild(div);
      });
    })
    .catch(err => console.error("Error fetching posts by category:", err));
}

// Filter Posts by category - for sidebar
function filterPosts(categoryName) {
  fetch("http://localhost:3001/api/posts")
    .then(res => res.json())
    .then(posts => {
      const container = document.getElementById("posts");
      container.innerHTML = "";

      // If categoryName is provided, filter posts
      if (categoryName) {
        posts = posts.filter(post =>
          post.category?.category_name === categoryName
        );
      }

      posts.forEach(post => {
        const div = document.createElement("div");
        div.classList.add("post");
        div.innerHTML = `
          <h3>${post.title}</h3>
          <p>${post.content}</p>
          <small>
            By: ${post.user?.username || post.postedBy || "Unknown"} 
            in category: ${post.category?.category_name || post.category_name || "General"}
            on ${post.created_at ? new Date(post.created_at).toLocaleString() : "Unknown date"}
          </small>
        `;
        container.appendChild(div);
      });
    })
    .catch(err => console.error("Error fetching posts:", err));
}

// Search post - searchbar
function searchPosts() {
  document.getElementById("search-input").addEventListener("input", searchPosts);

    const query = document.getElementById("search-input").value.toLowerCase();

    fetch("http://localhost:3001/api/posts")
        .then(res => res.json())
        .then(posts => {
            const container = document.getElementById("posts");
            container.innerHTML = "";

            if (!Array.isArray(posts)) {
                console.error("Posts data is not an array:", posts);
                return;
            }

            // Filter posts based on title or content
            const filteredPosts = posts.filter(post => {
                const title = post.title.toLowerCase();
                const content = post.content.toLowerCase();
                return title.includes(query) || content.includes(query);
            });

            if (filteredPosts.length === 0) {
                container.innerHTML = "<p>No posts found.</p>";
                return;
            }

            filteredPosts.forEach(post => {
                const div = document.createElement("div");
                div.classList.add("post");
                div.innerHTML = `
                    <h3>${post.title}</h3>
                    <p>${post.content}</p>
                    <small>
                        By: ${post.user?.username || post.postedBy || "Unknown"} 
                        in category: ${post.category?.category_name || post.category_name || "General"}
                        on ${post.created_at ? new Date(post.created_at).toLocaleString() : "Unknown date"}
                    </small>
                `;
                container.appendChild(div);
            });
        })
        .catch(err => console.error("Error fetching posts:", err));
}

updateUI();
fetchPosts();
