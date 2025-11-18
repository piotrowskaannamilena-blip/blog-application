// error I had, what I was talking about, so it was stored as global :( hence why something didn't work
// let token = localStorage.getItem("authToken"); at the top, 
// but inside functions like createPost, logout, etc., you re-read the token from localStorage


// API BASE URL
// If running on localhost, use local API, otherwise, assume deployed backend on render
const API_URL = (() => {
    const hostname = window.location.hostname;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
        // Local backend running on port 3001
        console.log("Server running at http://localhost:3001");
        return "http://localhost:3001/api";
    } else {
        // Deployed Render URL
        console.log("Running on production, using Render backend.");
        return "https://blog-application-9q6n.onrender.com/api";
    }
})();


// Functions accessible from HTML
window.register = register;
window.login = login;
window.logout = logout;
window.createPost = createPost;
window.fetchPosts = fetchPosts;
window.filterPosts = filterPosts;
window.searchPosts = searchPosts;


// DOM content loading
document.addEventListener("DOMContentLoaded", () => {
    // Initial UI setup pn page loading
    updateUI();           // Update UI based on login state
    loadCategoriesSidebar(); // Populate sidebar categories
    loadCategories();        // Populate dropdown for post creation
    setupFormToggles();
    fetchPosts();
});

// Fixing hidden and not hidden as I got it mixed up everywhere, so adding as a function to use on DOM load 
// clean version
function setupFormToggles() {
  // Show login form 
    document.getElementById("show-login-btn")?.addEventListener("click", () => {
        document.getElementById("login-form").classList.remove("hidden");
        document.getElementById("register-form").classList.add("hidden");
    });
  // Show register form
    document.getElementById("show-register-btn")?.addEventListener("click", () => {
        document.getElementById("register-form").classList.remove("hidden");
        document.getElementById("login-form").classList.add("hidden");
    });
}

    // Updates front end
function updateUI() {
    const token = localStorage.getItem("authToken");
    const isLoggedIn = !!token;

    // Auth container hidden when logged in
    document.getElementById("auth-container")?.classList.toggle("hidden", isLoggedIn);
    if (!isLoggedIn) {
        document.getElementById("register-form").classList.remove("hidden");
        document.getElementById("login-form").classList.add("hidden");
    }
     
    // Create post visible only when logged in
    document.getElementById("create-post-container").classList.toggle("hidden", !isLoggedIn);
    // Logout button visible only when logged in
    document.getElementById("user-actions").classList.toggle("hidden", !isLoggedIn);

}

// Function format date 
function dateFormat(dateString) {
    if (!dateString) return "Unknown date";
    const d = new Date(dateString);
    return isNaN(d) ? "Unknown date" : d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

// Register function
function register() {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !email || !password) {
        return alert("Please fill in all fields");
    }

    fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.errors) return alert(data.errors.map(e => e.message).join("\n"));
        if (data.error) return alert(data.error);

        if (data.token) {
            localStorage.setItem("authToken", data.token);
            alert("Registration successful!");
            updateUI();
        }

        // Hide forms once logged in
        document.getElementById("register-form").classList.add("hidden");
        document.getElementById("login-form").classList.add("hidden");
    })
    .catch(err => console.error("Registration error:", err));
}


// USER LOGIN

function login() {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!email || !password) return alert("Please enter email and password");

    fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    })
    .then(res => res.json())
    .then(data => {
        if (!data.token) return alert(data.message || "Login failed");

        localStorage.setItem("authToken", data.token);
        alert("Logged in successfully!");
        updateUI();

        // Hide forms
        document.getElementById("register-form").classList.add("hidden");
        document.getElementById("login-form").classList.add("hidden");
    })
    .catch(err => console.error("Login error:", err));
}


// Logout
function logout() {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    fetch(`${API_URL}/users/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    }).finally(() => {
        // Remove token locally
        localStorage.removeItem("authToken");
        alert("Logged out successfully");
        updateUI();
    });
}

// // Function for date format
// function dateFormat(dateString) {
//     if (!dateString) return "Unknown date";

//     const date = new Date(dateString);
//     if (isNaN(date)) return "Unknown date";

//     const options = { year: 'numeric', month: 'long', day: 'numeric' };
//     return date.toLocaleDateString(undefined, options); // e.g., "1 February 2024"
// }

// Load Fetch posts 
function fetchPosts() {
    fetch(`${API_URL}/posts`)
        .then(res => res.json())
        .then(posts => renderPosts(posts))
        .catch(err => console.error("Error fetching posts:", err));
}

// Filter posts by category name (for sidebar)
function filterPosts(categoryName) {
    fetch(`${API_URL}/posts`)
        .then(res => res.json())
        .then(posts => {
            if (categoryName && categoryName !== "All") {
                posts = posts.filter(post =>
                    post.category?.category_name === categoryName
                );
            }
            renderPosts(posts);
        })
        .catch(err => console.error("Error fetching posts:", err));
}


// Create post only for logged in users
function createPost() {
    const token = localStorage.getItem("authToken");
    if (!token) return alert("You must be logged in to create a post");
    
    const title = document.getElementById("post-title").value.trim();
    const content = document.getElementById("post-content").value.trim();
    const categoryId = parseInt(document.getElementById("category-dropdown").value);

  if (!title || !content || !categoryId) {
    return alert("Please fill in all fields");
  }
  // user login details
  const decodedToken = jwt_decode(token);
  const userId = decodedToken?.data?.id; // Ensure .data.id exists

  fetch(`${API_URL}/posts`, {
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
  fetch(`${API_URL}/categories`)
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
  fetch(`${API_URL}/categories`)
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
  fetch(`${API_URL}/posts?category_id=${categoryId}`)
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
  fetch(`${API_URL}/posts`)
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
            on  ${dateFormat(post.createdAt)}
          </small>
        `;
        container.appendChild(div);
      });
    })
    .catch(err => console.error("Error fetching posts:", err));
}

// Search post - searchbar
function searchPosts() {
    const query = document.getElementById("search-input").value.toLowerCase();

    fetch(`${API_URL}/posts`)
        .then(res => res.json())
        .then(posts => {
            const filtered = posts.filter(post => {
                const title = post.title?.toLowerCase() || "";
                const content = post.content?.toLowerCase() || "";
                return title.includes(query) || content.includes(query);
            });
            renderPosts(filtered);
        })
        .catch(err => console.error("Error fetching posts:", err));
}

function renderPosts(posts) {
    const container = document.getElementById("posts");
    container.innerHTML = "";

    if (!Array.isArray(posts) || posts.length === 0) {
        container.innerHTML = "<p>No posts found.</p>";
        return;
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
                on ${dateFormat(post.createdAt)}
            </small>
        `;
        container.appendChild(div);
    });
}

updateUI();
fetchPosts();