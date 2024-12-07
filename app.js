import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs,query,where,Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAXgpkJdQf-RhbVgNULDVH7fzgavdwUTu4",
    authDomain: "hackathon-b3d5f.firebaseapp.com",
    projectId: "hackathon-b3d5f",
    storageBucket: "hackathon-b3d5f.firebasestorage.app",
    messagingSenderId: "889877704999",
    appId: "1:889877704999:web:a6c76d1ace48596c04f902",
    measurementId: "G-D98KFY63DH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

function signup(event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    if (!email || !password) return alert("Please fill out all fields.");
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert("Sign up successful!");
            window.location.href = "./index.html";
        })
        .catch((error) => alert("Error: " + error.message));
}

document.getElementById("signupButton")?.addEventListener("click", signup);

function signin() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please fill out both email and password fields.");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Signed in successfully: ", user);
            alert("Logged in...");
            sessionStorage.setItem("user", user.accessToken);
            window.location.href = "./welcome.html";
        })
        .catch((error) => {
            console.error("Error signing in:", error.code, error.message);
            alert("Error: " + error.message);
        });
}

document.getElementById("loginButton")?.addEventListener("click", signin);

function signinWithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            sessionStorage.setItem("user", result.user.uid);
            alert("Signed in successfully!");
            window.location.href = "./welcome.html";
        })
        .catch((error) => alert("Error: " + error.message));
}

document.getElementById("googleButton")?.addEventListener("click", signinWithGoogle);

function submitFormToDb() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    addDoc(collection(db, "user info"), {
        name: name,
        email: email,
        date: Timestamp.now(),
    })
        .then((docRef) => {
            console.log("Form Submitted: ", docRef.id);
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        });
}

const submitForm = document.getElementById("signupButton");
submitForm?.addEventListener("click", submitFormToDb);

// Fetch Form Data from Firestore
async function getFormData() {
    const dataElement = document.getElementById("data");
    try {
        const querySnapshot = await getDocs(collection(db, "user info"));
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push(doc.data());
        });
        dataElement.innerText = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

getFormData();

document.getElementById("postForm")?.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get the values from the form
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;
    const username =  document.getElementById("username").value; // This could come from a login system or user input

    // Validate form fields
    if (!title || !description || !category) {
        alert("All fields are required!");
        return;
    }

    // Add the post to Firestore
    addDoc(collection(db, "posts"), {
        title: title,
        description: description,
        category: category,
        username: username,
        timestamp: serverTimestamp()
    })
        .then(() => {
            alert("Post submitted successfully!");
            document.getElementById("title").value = "";
            document.getElementById("description").value = "";
            document.getElementById("category").value = "";
            document.getElementById("username").value = "";
            loadPosts(); // Reload the posts after submission
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
            alert("Error submitting the post");
        });
});

function loadPosts() {
    const postsContainer = document.getElementById("blogPosts");
    postsContainer.innerHTML = "";  // Clear previous posts

    // Get all posts from Firestore collection
    getDocs(collection(db, "posts"))
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const postData = doc.data();
                const postDiv = document.createElement("div");
                postDiv.classList.add("post", "mb-4", "border", "p-3");
                postDiv.innerHTML = `
                    <h3>${postData.title}</h3>
                    <p><strong>Category:</strong> ${postData.category}</p>
                    <p><strong>By:</strong> ${postData.username}</p>
                    <p>${postData.description}</p>
                    <hr>
                `;
                postsContainer.appendChild(postDiv);
            });
        })
        .catch((error) => {
            console.error("Error getting documents: ", error);
        });
}

// Function to filter posts based on the selected category
function filterPosts(category) {
    const postsContainer = document.getElementById("blogPosts");
    postsContainer.innerHTML = "";  // Clear previous posts

    // Query posts from Firestore where category matches the selected one
    const q = query(collection(db, "posts"), where("category", "==", category));

    getDocs(q)
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                postsContainer.innerHTML = `<p>No posts available for the ${category} category.</p>`;
            } else {
                querySnapshot.forEach((doc) => {
                    const postData = doc.data();
                    const postDiv = document.createElement("div");
                    postDiv.classList.add("post", "mb-4", "border", "p-3");
                    postDiv.innerHTML = `
                        <h3>${postData.title}</h3>
                        <p><strong>Category:</strong> ${postData.category}</p>
                        <p><strong>By:</strong> ${postData.username}</p>
                        <p>${postData.description}</p>
                        <hr>
                    `;
                    postsContainer.appendChild(postDiv);
                });
            }
        })
        .catch((error) => {
            console.error("Error getting documents: ", error);
        });
}

// Event listeners for the category buttons to filter posts
document.getElementById("travelBtn")?.addEventListener("click", () => filterPosts("Travel"));
document.getElementById("lifestyleBtn")?.addEventListener("click", () => filterPosts("Lifestyle"));
document.getElementById("healthBtn")?.addEventListener("click", () => filterPosts("Health"));
document.getElementById("techBtn")?.addEventListener("click", () => filterPosts("Tech"));

// Event listener for post submission form
document.getElementById("postForm")?.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get the values from the form
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;
    const username = document.getElementById("username").value; // This could come from a login system or user input

    // Validate form fields
    if (!title || !description || !category) {
        alert("All fields are required!");
        return;
    }

    // Add the post to Firestore
    addDoc(collection(db, "posts"), {
        title: title,
        description: description,
        category: category,
        username: username,
        timestamp: serverTimestamp()
    })
        .then(() => {
            alert("Post submitted successfully!");
            document.getElementById("title").value = "";
            document.getElementById("description").value = "";
            document.getElementById("category").value = "";
            document.getElementById("username").value = "";
            loadPosts(); // Reload the posts after submission
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
            alert("Error submitting the post");
        });
});

// Load posts when the page loads
window.onload = loadPosts;
