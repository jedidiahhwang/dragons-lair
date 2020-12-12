const bcrypt = require("bcryptjs");

module.exports = {
    register: async (req, res) => {
        const db = req.app.get("db");
        const {username, password, isAdmin} = req.body;
        const result = await db.get_user([username]);
        const existingUser = result[0];

        // Instead of typing existingUser === true, just use the intrinsic truthy value.
        if (existingUser) {
            return res.status(409).send("Username taken");
        };

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const registeredUser = await db.register_user([isAdmin, username, hash]);
        const user = registeredUser[0];
        req.session.user = {
            isAdmin: user.is_admin,
            id: user.id,
            username: user.username
        };
        return res.status(201).send(req.session.user);
    },
    login: async (req, res) => {
        const db = req.app.get("db");
        const {username, password} = req.body;
        const foundUser = await db.get_user([username]);
        const user = foundUser[0];

        // !user is the opposite of register, meaning if user is falsy, execute the following code.
        if (!user) {
            return res.status(401).send("User not found. Please register as a new user before logging in.");
        };

        // This method will compoare the password entered at login with the hashed and salted version in the database.
        const isAutheticated = bcrypt.compareSync(password, user.hash);
        if (!isAutheticated) {
            return res.status(403).send("Incorrect password");
        };
        req.session.user = {
            isAdmin: user.is_admin,
            id: user.id,
            username: user.username
        };
        return res.send(req.session.user);
    },
    // Review the lecture video on why we don't need to access the database to "logout".
    logout: (req, res) => {
        req.session.destroy();
        return res.sendStatus(200);
    }
}