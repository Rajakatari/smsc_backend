const express = require("express");
const bodyParser = require("body-parser");
// const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// Assuming db.js is in the same directory
const app = express();

app.use(express.json());
const sql = require("mysql2");

const connection = sql.createConnection({
  host: "localhost",
  user: "root",
  password: "Katari123@",
  database: "cdr",
});

// app.use(bodyParser.urlencoded({ extended: true }));

// Allow requests from http://localhost:3004 (your frontend application)

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3004");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

const port = 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Registration endpoint
// app.post('/register', async (req, res) => {
//   try {
//     const { username, email, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
//     connection.query(sql, [username, email, hashedPassword], (err, result) => {
//       if (err) {
//         console.error(err);
//         res.status(500).json({ error: 'An error occurred while registering the user' });
//       } else {
//         res.status(200).json({ message: 'User registered successfully' });
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while registering the user' });
//   }
// });

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ?";
    connection.query(sql, [username], async (err, result) => {
      if (err || result.length === 0) {
        console.error(err);
        res.status(401).json({ error: "Invalid username or password" });
      } else {
        const user = result[0];
        const isPasswordValid = password === "raja";
        //await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
          const token = jwt.sign(
            { id: user.id, username: user.username },
            "your_secret_key",
            {
              expiresIn: "1h",
            }
          );
          res.status(200).json({ token });
        } else {
          res.status(401).json({ error: "Invalid username or password" });
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while logging in" });
  }
});

//Submit API

app.get("/submits", async (req, res) => {
  try {
    const sql = `select count(*) as submits from dlr;`;
    connection.query(sql, async (error, result) => {
      if (error || result.length === 0) {
        res.send("db error");
      } else {
        res.status(200).json(result[0]);
      }
    });
  } catch (e) {
    res.send(e);
  }
});

//Success API

app.get("/success", async (req, res) => {
  try {
    const sql = `select count(*) as success from dlr where iFail_Reason in (0);`;
    connection.query(sql, async (error, result) => {
      if (error || result.length === 0) {
        res.send("db error");
      } else {
        res.status(200).json(result[0]);
      }
    });
  } catch (e) {
    res.send(e);
  }
});

//faillure api

app.get("/failure", async (req, res) => {
  try {
    const sql = `select count(*) as failure from dlr where iFail_Reason not in (0);`;
    connection.query(sql, async (error, result) => {
      if (error || result.length === 0) {
        res.send("db error");
      } else {
        res.status(200).json(result[0]);
      }
    });
  } catch (e) {
    res.send(e);
  }
});

app.get("/allclientreports", async (request, response) => {
  try {
    const sql = ` select vcDltEsmeId as Client, count(*) as submited, sum(case when iFail_Reason in (0) then 1 else 0 end) as delivered, 
  (sum(case when iFail_Reason in (0) then 1 else 0 end)/count(*) *100) as deliveredPer , 
  sum(case when iFail_Reason not in (0) then 1 else 0  end) as undelivered ,
  ( sum(case when iFail_Reason not in (0) then 1 else 0  end)/count(*) *100) as undeliveredPer,
   sum(case when iFail_Reason in (1) then 1 else 0 end) as error1,  
   sum(case when iFail_Reason in (6) then 1 else 0 end) as error6, 
   sum(case when iFail_Reason in (13) then 1 else 0 end) as error13,  
   sum(case when iFail_Reason in (21) then 1 else 0 end) as error21, 
   sum(case when iFail_Reason in (32) then 1 else 0 end) as error32, 
   sum(case when iFail_Reason in (34) then 1 else 0 end) as error34,  
   sum(case when iFail_Reason in (51) then 1 else 0 end) as error51,  
   sum(case when iFail_Reason in (69) then 1 else 0 end) as error69 , 
    sum(case when iFail_Reason in (253) then 1 else 0 end) as error253,
      sum(case when iFail_Reason in (254) then 1 else 0 end) as error254 from dlr group by vcDltEsmeId;`;
    connection.query(sql, async (error, rows) => {
      if (error || rows.length === 0) {
        response.send("db Error");
      } else {
        response.status(200).json(rows);
      }
    });
  } catch (e) {
    response.send(e);
  }
});

module.exports = app;
