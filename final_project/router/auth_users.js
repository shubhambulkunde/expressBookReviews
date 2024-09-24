const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Function to check if a username is valid (i.e., not already taken)
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Function to check if a given username and password match our records
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Authenticate the user
    if (authenticatedUser(username, password)) {
        // Generate a JWT token
        const accessToken = jwt.sign({ username }, "secret_key", { expiresIn: '1h' });
        return res.status(200).json({ message: "Login successful", token: accessToken });
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;
    const token = req.headers['authorization'];

    // Check if the user is authenticated
    if (!token) {
        return res.status(403).json({ message: "Authorization token missing" });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, "secret_key");
        const username = decoded.username;

        // Check if the book exists
        if (books[isbn]) {
            // Add or update the review
            books[isbn].reviews[username] = review;
            return res.status(200).json({ message: "Review added/updated successfully", book: books[isbn] });
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const token = req.headers['authorization'];

    // Check if the authorization token is present
    if (!token) {
        return res.status(403).json({ message: "Authorization token missing" });
    }

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, "secret_key");
        const username = decoded.username;

        // Check if the book exists
        if (books[isbn]) {
            // Check if the user has a review for the book
            if (books[isbn].reviews[username]) {
                // Delete the user's review
                delete books[isbn].reviews[username];
                return res.status(200).json({ message: "Review deleted successfully" });
            } else {
                return res.status(404).json({ message: "No review found for this user" });
            }
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
y