require("dotenv").config();
const express = require("express");
const session = require("express-session");
const massive = require("massive");

const authCtrl = require("./controllers/authController.js");
const treasureCtrl = require("./controllers/treasureController.js");
const auth = require("./middleware/authMiddleware.js");

const app = express();

const SERVER_PORT = 4000;

const {CONNECTION_STRING, SESSION_SECRET} = process.env;

// This is an example of middleware (top level)
app.use(express.json());

// Another use of middleware, in this case using secret
app.use(
    session ({
        resave: false,
        saveUninitialized: true,
        secret: SESSION_SECRET
    })
)

app.post("/auth/register", authCtrl.register);
app.post("/auth/login", authCtrl.login);
app.get("/auth/logout", authCtrl.logout);

app.get("/api/treasure/dragon", treasureCtrl.dragonTreasure);
app.get("/api/treasure/user", auth.usersOnly, treasureCtrl.getUserTreasure);
app.post("/api/treasure/user", auth.usersOnly, treasureCtrl.addUserTreasure);
app.get("/api/treasure/all", auth.usersOnly, auth.adminsOnly, treasureCtrl.getAllTreasure);

massive ({
    connectionString: CONNECTION_STRING,
    ssl: {
        rejectUnauthorized: false
    }
}).then(dbInstance => {
    app.set("db", dbInstance);
    console.log("DB is good to go");
    secret: SESSION_SECRET
    app.listen(SERVER_PORT, () => 
        console.log(`Server ready on port ${SERVER_PORT}`)
    )
})
