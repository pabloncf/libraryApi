const express = require('express');
const exphbs = require('express-handlebars');
const pool = require('./db/conn')

const multer = require('multer');
const path = require('path');

const app = express();

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(express.json());

app.use(express.static('public'));

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '/public/uploads/'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.render('home');
});

app.post('/books/insertbook', upload.single('image'), (req, res) => {
    const title = req.body.title;
    const pageqty = req.body.pageqty;
    const imagePath = `/uploads/${req.file.filename}`;

    const query = `INSERT INTO books (title, pageqty, image_path) VALUES ('${title}', '${pageqty}', '${imagePath}')`

    pool.query(query, function (err) {
        if (err) {
            console.log(err);
        }

        res.redirect('/books');
    });
});

app.get('/books', (req, res) => {
    const query = "SELECT * FROM books";

    pool.query(query, function (err, data) {
        if (err) {
            console.log(err);
        }

        const books = data;

        res.render('books', { books });
    });
});

app.get('/books/:id', (req, res) => {
    const id = req.params.id;

    const query = `SELECT * FROM books WHERE id = ${id}`;

    pool.query(query, function (err, data) {
        if (err) {
            console.log(err);
            return;
        }

        const book = data[0];

        res.render('book', { book })
    });
})

app.get('/books/edit/:id', (req, res) => {
    const id = req.params.id;

    const sql = `SELECT * FROM books WHERE id = ${id}`;

    pool.query(sql, function (err, data) {
        if (err) {
            console.log(err);
            return;
        }

        const book = data[0];

        res.render('editbook', { book });
    });
});

app.post('/books/updatebook', upload.single('image'),(req, res) => {
    const id = req.body.id;
    const title = req.body.title;
    const pageqty = req.body.pageqty;
    const imagePath = `/uploads/${req.file.filename}`;


    const sql = `UPDATE books SET title = '${title}', pageqty = '${pageqty}', image_path = '${imagePath}' WHERE id = ${id}`;

    pool.query(sql, function (err) {
        if (err) {
            console.log(err);
            return;
        }

        res.redirect('/books')
    });
})

app.post('/books/remove/:id', (req, res) => {
    const id = req.params.id;

    const sql = `DELETE FROM books WHERE id = ${id}`;

    pool.query(sql, function (err) {
        if (err) {
            console.log(err);
            return;
        }

        res.redirect('/books')
    })
})

app.use(function(req, res, next){
    res.status(404).render('404');
});

app.listen(3000);