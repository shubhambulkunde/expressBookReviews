const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "username & password require !" });
    }

    const existingUser = users.some(user => user.username === username);
    if (existingUser)
        return res.status(409).json({ message: "user already exists !" });

    users.push({ username, password });
    return res.status(201).json({ message: "user registered successfully", array: users });
});

// Get the book list available in the shop using Promises
public_users.get('/books-promise', function (req, res) {
    axios.get('http://localhost:5000')
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch(error => {
            res.status(500).json({ message: "Error fetching the list of books", error: error.message });
        });
});

// Get book details based on ISBN using Promises
public_users.get('/isbn-promise/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    axios.get(`http://localhost:5000/isbn/${isbn}`)
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch(error => {
            res.status(404).json({ message: "Error fetching book details", error: error.message });
        });
});

// Get book details based on author using Promises
public_users.get('/author-promise/:author', function (req, res) {
    const author = req.params.author;
    axios.get(`http://localhost:5000/author/${author}`)
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch(error => {
            res.status(404).json({ message: "Error fetching book details by author", error: error.message });
        });
});

// Get book details based on title using Promises
public_users.get('/title-promise/:title', function (req, res) {
    const title = req.params.title;
    axios.get(`http://localhost:5000/title/${title}`)
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch(error => {
            res.status(404).json({ message: "Error fetching book details by title", error: error.message });
        });
});

// Existing code for retrieving books, author, title, and reviews
public_users.get('/', function (req, res) {
    res.send(JSON.stringify({ books }, null, 4))
});

public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book)
        return res.status(200).json(book);
    else
        return res.status(404).json({ message: "book not found" });
});

public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();
    const bookViaAuthor = Object.values(books).filter((book) => book.author.toLowerCase() === author);

    if (bookViaAuthor.length > 0)
        return res.status(200).json(bookViaAuthor);
    else
        return res.status(404).json({ message: "not found" })
});

public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();
    const bookViaTitle = Object.values(books).filter((book) => book.title.toLowerCase() === title);

    if (bookViaTitle.length > 0)
        return res.status(200).json(bookViaTitle);
    else
        return res.status(404).json({ message: "not found" })
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book && book.reviews)
        return res.status(200).json(book.reviews);
    else
        return res.status(404).json({ message: "no reviews found" });
});

module.exports.general = public_users;
