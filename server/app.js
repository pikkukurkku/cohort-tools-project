const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const PORT = 5005;
const cors = require("cors");
const Student = require("./models/Student.model");
const Cohort = require("./models/Cohort.model");
const ObjectId = mongoose.Types.ObjectId;
require("dotenv").config();
const app = express();

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5005"] }));
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

mongoose
  .connect("mongodb://127.0.0.1:27017/mongoose-cohort-tools-api-dev")
  .then((x) => console.log(`Connected to Database: "${x.connections[0].name}"`))
  .catch((err) => console.error("Error connecting to MongoDB", err));

app.get("/", (req, res) => {
  res.json({ message: "Hello from the route /" });
});

app.get("/docs", (req, res) => {
  res.sendFile(__dirname + "/views/docs.html");
});

app.get("/api/cohorts", (req, res) => {
  Cohort.find({})
    .then((cohorts) => {
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

app.post("/api/cohorts", (req, res) => {
  Cohort.create({
    cohortSlug: req.body.cohortSlug,
    cohortName: req.body.cohortName,
    program: req.body.program,
    languages: req.body.languages,
    format: req.body.format,
    campus: req.body.campus,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    inProgress: req.body.inProgress,
    programManager: req.body.programManager,
    leadTeacher: req.body.leadTeacher,
    totalHours: req.body.totalHours,
  })
    .then((cohort) => {
      console.log("New cohort created ->", cohort);
      res.json(cohort);
    })
    .catch((error) => {
      console.error("Error while creating cohort ->", error);
      res.status(500).send({ error: "Failed to create cohort" });
    });
});

app.put("/api/cohorts/:cohortId", (req, res) => {
  const cohortId = req.params.cohortId;

  Cohort.findByIdAndUpdate(cohortId, req.body, { new: true })
    .then((updatedCohort) => {
      console.log("Updated cohort ->", updatedCohort);

      res.status(204).send(updatedCohort);
    })
    .catch((error) => {
      console.error("Error while updating the cohort ->", error);
      res.status(500).send({ error: "Failed to update the cohort" });
    });
});

app.delete("/api/cohorts/:cohortId", (req, res) => {
  const cohortId = req.params.cohortId;
  Cohort.findByIdAndDelete(cohortId)
    .then(() => {
      console.log("Cohort deleted!");
      res.status(204).send(); // Send back only status code 204 indicating that resource is deleted
    })
    .catch((error) => {
      console.error("Error while deleting the cohort ->", error);
      res.status(500).send({ error: "Deleting cohort failed" });
    });
});

app.get("/api/students", cors(), (req, res) => {
  Student.find({})
    .then((students) => {
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
  Student.find({ cohort: cohortId })
    .then((students) => {
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

app.post("/api/students", (req, res) => {
  Student.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    linkedinUrl: req.body.linkedinUrl,
    languages: req.body.languages,
    program: req.body.program,
    background: req.body.background,
    image: req.body.image,
    cohort: { type: mongoose.Schema.Types.ObjectId, ref: "Cohort" },
    projects: [{ type: Array }],
  })
    .then((student) => {
      console.log("New student created ->", student);
      res.json(student);
    })
    .catch((error) => {
      console.error("Error while creating student ->", error);
      res.status(500).send({ error: "Failed to create student" });
    });
});

app.put("/api/students/:studentId", (req, res) => {
  const studentId = req.params.studentId;

  Student.findByIdAndUpdate(studentId, req.body, { new: true })
    .then((updatedStudent) => {
      console.log("Updated student ->", updatedStudent);

      res.status(204).send(updatedStudent);
    })
    .catch((error) => {
      console.error("Error while updating the student ->", error);
      res.status(500).send({ error: "Failed to update the student" });
    });
});

app.delete("/api/students/:studentId", (req, res) => {
  const studentId = req.params.studentId;
  Student.findByIdAndDelete(studentId)
    .then(() => {
      console.log("Student deleted!");
      res.status(204).send(); // Send back only status code 204 indicating that resource is deleted
    })
    .catch((error) => {
      console.error("Error while deleting the student ->", error);
      res.status(500).send({ error: "Deleting student failed" });
    });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
