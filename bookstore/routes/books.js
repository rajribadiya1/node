const express = require('express');
const router = express.Router();
const {
    getBooks,
    getBook,
    createBook,
    updateBook,
    deleteBook
} = require('../controllers/bookController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
    .get(getBooks)
    .post(protect, admin, createBook);

router.route('/:id')
    .get(getBook)
    .put(protect, admin, updateBook)
    .delete(protect, admin, deleteBook);

module.exports = router;