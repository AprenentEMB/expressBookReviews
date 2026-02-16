const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require("axios");
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  /*
  Hint: The code should take the 'username' and 'password' provided in the body of the request for registration. If the username already exists, it must mention the same & must also show other errors like eg. when username & password are not provided.
  */
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get("/", async (req, res) => {
  try {
    const booksData = await Promise.resolve(books);
    res.status(200).json(booksData);
  } catch (err) {
    res.status(500).json({ message: "Error fetching books" });
  }
});


// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  //getting the isbn from the request parameters
  try {
    const isbn = req.params.isbn;
    const book = await Promise.resolve(books[isbn]);

    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Error fetching book details" });
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  /*Hints:
1. Obtain all the keys for the 'books' object.
2. Iterate through the 'books' array & check the author matches the one provided in the request parameters.
*/
  const author = req.params.author;
  const matchingBooks = [];

  for (const isbn in books) {
    if (books[isbn].author === author) {
      matchingBooks.push(books[isbn]);
    }
  }

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res
      .status(404)
      .json({ message: "No books found for the given author" });
  }
});

// Get all books based on title
public_users.get("/title/:title", (req, res) => {
  const title = req.params.title.toLowerCase().trim();

  // Simulem una crida asincrona amb Promise
  Promise.resolve(books)
    .then(allBooks => {
      const matchingBooks = [];

      for (const isbn in allBooks) {
        const bookTitle = allBooks[isbn].title.toLowerCase().trim();
        if (bookTitle === title) {
          matchingBooks.push(allBooks[isbn]);
        }
      }

      if (matchingBooks.length > 0) {
        res.status(200).json(matchingBooks);
      } else {
        res.status(404).json({ message: "No books found for the given title" });
      }
    })
    .catch(err => {
      res.status(500).json({ message: "Error fetching book details", error: err.message });
    });
});


//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res
      .status(404)
      .json({ message: "No reviews found for the given ISBN" });
  }
});

module.exports.general = public_users;
