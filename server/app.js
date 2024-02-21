const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const PORT = 5005;
const cors = require("cors");
const Student = require("./models/Student.model");
const Cohort = require("./models/Cohort.model");
const ObjectId = mongoose.Types.ObjectId;

const app = express();


app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5005"] }));
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


mongoose
  .connect("mongodb://127.0.0.1:27017/mongoose-cohort-tools-api-dev")
  .then(x => console.log(`Connected to Database: "${x.connections[0].name}"`))
  .catch(err => console.error("Error connecting to MongoDB", err));
 


app.get("/", (req, res) => {
  res.json({ message: "Hello from the route /" });
});

app.get("/docs", (req, res) => {
  res.sendFile(__dirname + "/views/docs.html");
});

app.get("/api/cohorts", cors(), (req, res) => {
  Cohort.find({})
  .then((cohorts)=> {
    console.log("Retrieved cohorts ->", cohorts);
    res.json(cohorts);
  })
  .catch((error) => {
    console.error("Error while retrieving cohorts ->", error);
    res.status(500).send({ error: "Failed to retrieve cohorts" });
  });
});

app.get("/api/cohorts/:cohortId", cors(), (req, res) => {
  const cohortId = req.params.cohortId;

  if (!ObjectId.isValid(cohortId)) {
    return res.status(400).json({ error: "Invalid cohort ID format" });
  }

  Cohort.findById(cohortId)
  .then((cohort) => {
    if (!cohort) {
      return res.status(404).json({ error: "Cohort not found" });
    }

    console.log("Retrieved cohort by ID ->", cohort);
    res.json(cohort);
  })
  .catch((error) => {
    console.error("Error while retrieving cohort by ID ->", error);
    res.status(500).send({ error: "Failed to retrieve cohort by ID" });
  });
});

app.get("/api/students", cors(), (req, res) => {
  Student.find({})
  .then((students)=> {
    console.log("Retrieved students ->", students);
    console.log("Number of students ->", students.length);
    res.json(students);
  })
  .catch((error) => {
    console.error("Error while retrieving students ->", error);
    res.status(500).send({ error: "Failed to retrieve students" });
  });
});

app.get("/api/students/cohort/:cohortId", cors(), (req, res) => {
  const cohortId = req.params.cohortId;
  if (!ObjectId.isValid(cohortId)) {
    return res.status(400).json({ error: "Invalid cohort ID format" });
  }
  Student.find({cohort: cohortId})
  .then((students)=> {
    console.log("Retrieved students for cohort ->", students);
    console.log("Number of students ->", students.length);
    res.json(students);
  })
  .catch((error) => {
    console.error("Error while retrieving students ->", error);
    res.status(500).send({ error: "Failed to retrieve students" });
  });
});

app.get("/api/students/:studentId", cors(), (req, res) => {
  const studentId = req.params.studentId;

  if (!ObjectId.isValid(studentId)) {
    return res.status(400).json({ error: "Invalid student ID format" });
  }

  Student.findById(studentId)
  .then((student) => {
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    console.log("Retrieved student by ID ->", student);
    res.json(student);
  })
  .catch((error) => {
    console.error("Error while retrieving student by ID ->", error);
    res.status(500).send({ error: "Failed to retrieve student by ID" });
  });
});



app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
