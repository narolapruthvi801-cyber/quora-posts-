const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const methodOverride = require("method-override");
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Middleware Setup
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Initial Posts Array
let posts = [
    {
        id: uuidv4(),
        username: "Pruthviraj",
        content: "i love coding!",
        image: "https://images.unsplash.com/photo-1615109398623-88346a601842?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFufGVufDB8fDB8fHww"
    },
    {
        id: uuidv4(),
        username: "Rishi",
        content: "nahi ho rahi padhai",
        image: "https://static.vecteezy.com/system/resources/thumbnails/017/186/225/small/luxury-swimming-pool-on-the-beach-tranquil-scene-of-exotic-tropical-landscape-with-copy-space-summer-background-for-vacation-holidays-beautiful-poolside-and-sunset-sky-luxurious-tropical-beach-photo.jpg"
    },
    {
        id: uuidv4(),
        username: "alex",
        content: "Ganju Tal kare dhamal",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRR6HGgcV7S4T9MYWnNdPSaVl-uDcqvciKB63SvIzNWfDkxqJ32U6tjV3U&s=10"
    }
];

// Routes
app.get("/", (req, res) => {
    res.redirect("/posts");
});

app.get("/posts", (req, res) => {
    res.render("index.ejs", { posts });
});

app.get("/posts/new", (req, res) => {
    res.render("new.ejs");
});

// Create Post Route with Multer Middleware
app.post("/posts", upload.single("image"), (req, res) => {
    let { username, content } = req.body;
    let id = uuidv4();
    
    // Use uploaded file path if available, otherwise default placeholder
    let image = req.file 
        ? `/uploads/${req.file.filename}` 
        : "https://via.placeholder.com/300";

    posts.push({ id, username, content, image });
    res.redirect("/posts");
});

app.get("/posts/:id", (req, res) => {
    let { id } = req.params;
    let post = posts.find((p) => id === p.id);
    res.render("show.ejs", { post });
});

app.patch("/posts/:id", (req, res) => {
    let { id } = req.params;
    let newContent = req.body.content;
    let post = posts.find((p) => id === p.id);
    if (post) post.content = newContent;
    res.redirect("/posts");
});

app.get("/posts/:id/edit", (req, res) => {
    let { id } = req.params;
    let post = posts.find((p) => id === p.id);
    res.render("edit.ejs", { post });
});

app.delete("/posts/:id", (req, res) => {
    let { id } = req.params;
    posts = posts.filter((p) => id !== p.id);
    res.redirect("/posts");
});
app.delete('/posts/:id/image', (req, res) => {
    const { id } = req.params;
    const post = posts.find(p => p.id === id);
    
    if (post) {
        post.image = null; // Clear the image property
    }
    
    res.redirect(`/posts/${id}/edit`);
});

app.listen(port, () => {
    console.log("Listening on port: 8080");
});