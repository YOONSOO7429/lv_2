const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = 3000;

const postsRouter = require("./routes/posts");
const commentsRouter = require("./routes/comments");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");

const connect = require("./schemas");
connect();

// 미들웨어 express 설정
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use("/api",[postsRouter, commentsRouter, usersRouter, authRouter]);



app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(port, "포트로 서버가 열렸습니다!")
})