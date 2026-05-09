const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());


// ================= DATABASE =================
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "musamvu_db",
});

// ================= TEST CONNECTION =================
db.getConnection((err, conn) => {
  if (err) {
    console.log("❌ DB CONNECTION ERROR:", err);
  } else {
    console.log("✅ DATABASE CONNECTED");
    conn.release();
  }
});

// ================= HELPER =================
const safe = (v) => (v === undefined || v === null ? "" : v);

const handleError = (err, res, label) => {
  console.log(`❌ ${label}`, err);

  return res.status(500).json({
    success: false,
    error: err.message,
  });
};

// ================= SMTP EMAIL =================
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

const sendAdminEmail = async (subject, text) => {
  if (!ADMIN_EMAIL || !SMTP_HOST) return;

  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER || ADMIN_EMAIL,
    to: ADMIN_EMAIL,
    subject,
    text,
  });
};


// ================= ADMIN LOGIN =================
app.post("/admin-login", (req, res) => {

  const { username, password } = req.body;

  if (username === "musamvu" && password === "ngoma") {

    return res.json({
      success: true,
      message: "Login success",
    });
  }

  res.json({
    success: false, 
    message: "Invalid usernaname and password",
  });
});

// ================= TEACHER ATTENDANCE TABLE =================
const teacherAttendanceTable = "teacher_attendance";

const ensureTeacherAttendanceTable = () => {
  db.query(
    `CREATE TABLE IF NOT EXISTS ${teacherAttendanceTable} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date DATE NOT NULL,
      teacher_name VARCHAR(255) NOT NULL,
      teacher_trade VARCHAR(255) NOT NULL,
      start_job DATETIME NULL,
      end_job DATETIME NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
  );
};

ensureTeacherAttendanceTable();

// ================= ADMIN DASHBOARD =================
app.get("/admin-dashboard", (req, res) => {

  const result = {};


  db.query("SELECT * FROM register", (err, register) => {

    if (err) return handleError(err, res, "REGISTER FETCH");

    result.register = register;

    db.query("SELECT * FROM parents", (err, parents) => {

      if (err) return handleError(err, res, "PARENTS FETCH");

      result.parents = parents;

      db.query("SELECT * FROM students", (err, students) => {

        if (err) return handleError(err, res, "STUDENTS FETCH");

        result.students = students;

        db.query("SELECT * FROM teachers", (err, teachers) => {

          if (err) return handleError(err, res, "TEACHERS FETCH");

          result.teachers = teachers;

          db.query("SELECT * FROM workers", (err, workers) => {

            if (err) return handleError(err, res, "WORKERS FETCH");

            result.workers = workers;

            db.query(
              `SELECT * FROM ${teacherAttendanceTable} ORDER BY id DESC`,
              (err, teacher_attendance) => {
                if (err) return handleError(err, res, "TEACHER ATTENDANCE FETCH");

                result.teacher_attendance = teacher_attendance;

                res.json({
                  success: true,
                  data: result,
                });
              }
            );
          });

        });
      });
    });
  });
});

// ================= REGISTER STUDENT =================
app.post("/register", (req, res) => {

  console.log("REGISTER DATA:", req.body);

  const {
    firstname,
    lastname,
    gender,
    fathername,
    mothername,
    telephone,
    district,
    province,
    country,
    email,
  } = req.body;

  db.query(
    `
    INSERT INTO register
    (
      firstname,
      lastname,
      gender,
      fathername,
      mothername,
      telephone,
      district,
      province,
      country,
      email
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      safe(firstname),
      safe(lastname),
      safe(gender),
      safe(fathername),
      safe(mothername),
      safe(telephone),
      safe(district),
      safe(province),
      safe(country),
      safe(email),
    ],
    (err) => {

      if (err) return handleError(err, res, "REGISTER INSERT");

      res.json({
        success: true,
        message: "Student registered successfully",
      });
    }
  );
});

// ======================================================
// ================= REGISTER CRUD ======================
// ======================================================

// GET REGISTER
app.get("/register", (req, res) => {

  db.query("SELECT * FROM register", (err, result) => {

    if (err) return handleError(err, res, "REGISTER GET");

    res.json({
      success: true,
      data: result,
    });
  });
});

// UPDATE REGISTER
app.put("/register/:id", (req, res) => {

  const { id } = req.params;

  const {
    firstname,
    lastname,
    gender,
    fathername,
    mothername,
    telephone,
    district,
    province,
    country,
    email,
  } = req.body;

  db.query(
    `
    UPDATE register SET
    firstname=?,
    lastname=?,
    gender=?,
    fathername=?,
    mothername=?,
    telephone=?,
    district=?,
    province=?,
    country=?,
    email=?
    WHERE id=?
    `,
    [
      safe(firstname),
      safe(lastname),
      safe(gender),
      safe(fathername),
      safe(mothername),
      safe(telephone),
      safe(district),
      safe(province),
      safe(country),
      safe(email),
      id,
    ],
    (err) => {

      if (err) return handleError(err, res, "REGISTER UPDATE");

      res.json({
        success: true,
        message: "Register updated",
      });
    }
  );
});

// DELETE REGISTER
app.delete("/register/:id", (req, res) => {

  const { id } = req.params;

  db.query(
    "DELETE FROM register WHERE id=?",
    [id],
    (err) => {

      if (err) return handleError(err, res, "REGISTER DELETE");

      res.json({
        success: true,
        message: "Register deleted",
      });
    }
  );
});

// ======================================================
// ================= PARENTS CRUD =======================
// ======================================================

// CREATE
app.post("/parents", (req, res) => {

  const {
    fullnames,
    email,
    telephone,
    location,
    childname,
  } = req.body;

  db.query(
    `
    INSERT INTO parents
    (fullnames, email, telephone, location, childname)
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      safe(fullnames),
      safe(email),
      safe(telephone),
      safe(location),
      safe(childname),
    ],
    (err) => {

      if (err) return handleError(err, res, "PARENTS INSERT");

      res.json({
        success: true,
        message: "Parent saved",
      });
    }
  );
});

// GET
app.get("/parents", (req, res) => {

  db.query("SELECT * FROM parents", (err, result) => {

    if (err) return handleError(err, res, "PARENTS GET");

    res.json({
      success: true,
      data: result,
    });
  });
});

// UPDATE
app.put("/parents/:id", (req, res) => {

  const { id } = req.params;

  const {
    fullnames,
    email,
    telephone,
    location,
    childname,
  } = req.body;

  db.query(
    `
    UPDATE parents SET
    fullnames=?,
    email=?,
    telephone=?,
    location=?,
    childname=?
    WHERE id=?
    `,
    [
      safe(fullnames),
      safe(email),
      safe(telephone),
      safe(location),
      safe(childname),
      id,
    ],
    (err) => {

      if (err) return handleError(err, res, "PARENTS UPDATE");

      res.json({
        success: true,
        message: "Parent updated",
      });
    }
  );
});

// DELETE
app.delete("/parents/:id", (req, res) => {

  const { id } = req.params;

  db.query(
    "DELETE FROM parents WHERE id=?",
    [id],
    (err) => {

      if (err) return handleError(err, res, "PARENTS DELETE");

      res.json({
        success: true,
        message: "Parent deleted",
      });
    }
  );
});

// ======================================================
// ================= STUDENTS CRUD ======================
// ======================================================

// CREATE
app.post("/students", (req, res) => {

  const {
    fullnames,
    mothername,
    fathername,
    gender,
    dob,
    telephone,
  } = req.body;

  db.query(
    `
    INSERT INTO students
    (fullnames, mothername, fathername, gender, dob, telephone)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      safe(fullnames),
      safe(mothername),
      safe(fathername),
      safe(gender),
      safe(dob),
      safe(telephone),
    ],
    (err) => {

      if (err) return handleError(err, res, "STUDENTS INSERT");

      res.json({
        success: true,
        message: "Student saved",
      });
    }
  );
});

// GET
app.get("/students", (req, res) => {

  db.query("SELECT * FROM students", (err, result) => {

    if (err) return handleError(err, res, "STUDENTS GET");

    res.json({
      success: true,
      data: result,
    });
  });
});

// UPDATE
app.put("/students/:id", (req, res) => {

  const { id } = req.params;

  const {
    fullnames,
    mothername,
    fathername,
    gender,
    dob,
    telephone,
  } = req.body;

  db.query(
    `
    UPDATE students SET
    fullnames=?,
    mothername=?,
    fathername=?,
    gender=?,
    dob=?,
    telephone=?
    WHERE id=?
    `,
    [
      safe(fullnames),
      safe(mothername),
      safe(fathername),
      safe(gender),
      safe(dob),
      safe(telephone),
      id,
    ],
    (err) => {

      if (err) return handleError(err, res, "STUDENTS UPDATE");

      res.json({
        success: true,
        message: "Student updated",
      });
    }
  );
});

// DELETE
app.delete("/students/:id", (req, res) => {

  const { id } = req.params;

  db.query(
    "DELETE FROM students WHERE id=?",
    [id],
    (err) => {

      if (err) return handleError(err, res, "STUDENTS DELETE");

      res.json({
        success: true,
        message: "Student deleted",
      });
    }
  );
});

// ======================================================
// ================= TEACHERS CRUD ======================
// ======================================================

// CREATE
app.post("/teachers", (req, res) => {

  const {
    fullnames,
    email,
    telephone,
    location,
  } = req.body;

  db.query(
    `
    INSERT INTO teachers
    (fullnames, email, telephone, location)
    VALUES (?, ?, ?, ?)
    `,
    [
      safe(fullnames),
      safe(email),
      safe(telephone),
      safe(location),
    ],
    (err) => {

      if (err) return handleError(err, res, "TEACHERS INSERT");

      res.json({
        success: true,
        message: "Teacher saved",
      });
    }
  );
});

// GET
app.get("/teachers", (req, res) => {

  db.query("SELECT * FROM teachers", (err, result) => {

    if (err) return handleError(err, res, "TEACHERS GET");

    res.json({
      success: true,
      data: result,
    });
  });
});

// UPDATE
app.put("/teachers/:id", (req, res) => {

  const { id } = req.params;

  const {
    fullnames,
    email,
    telephone,
    location,
  } = req.body;

  db.query(
    `
    UPDATE teachers SET
    fullnames=?,
    email=?,
    telephone=?,
    location=?
    WHERE id=?
    `,
    [
      safe(fullnames),
      safe(email),
      safe(telephone),
      safe(location),
      id,
    ],
    (err) => {

      if (err) return handleError(err, res, "TEACHERS UPDATE");

      res.json({
        success: true,
        message: "Teacher updated",
      });
    }
  );
});

// DELETE
app.delete("/teachers/:id", (req, res) => {

  const { id } = req.params;

  db.query(
    "DELETE FROM teachers WHERE id=?",
    [id],
    (err) => {

      if (err) return handleError(err, res, "TEACHERS DELETE");

      res.json({
        success: true,
        message: "Teacher deleted",
      });
    }
  );
});

// ======================================================
// ================= TEACHER ATTENDANCE ===================
// ======================================================

app.post("/teacher-attendance/start", (req, res) => {
  const { teacher_name, teacher_trade } = req.body;
  if (!teacher_name || !teacher_trade) {
    return res.status(400).json({ success: false, error: "teacher_name and teacher_trade are required" });
  }

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;

  // If there is a row for today with start_job NULL -> set start_job
  db.query(
    `SELECT * FROM ${teacherAttendanceTable} WHERE date=? AND teacher_name=? AND teacher_trade=? AND start_job IS NULL ORDER BY id DESC LIMIT 1`,
    [dateStr, teacher_name, teacher_trade],
    (err, rows) => {
      if (err) return handleError(err, res, "TEACHER ATT START SELECT");

      if (rows && rows.length) {
        const row = rows[0];
        db.query(
          `UPDATE ${teacherAttendanceTable} SET start_job=NOW() WHERE id=?`,
          [row.id],
          async (err2) => {
            if (err2) return handleError(err2, res, "TEACHER ATT START UPDATE");

            await sendAdminEmail(
              "Teacher attendance started",
              `${teacher_name} (${teacher_trade}) started working on ${dateStr} at ${new Date().toLocaleString()}`
            );

            res.json({ success: true, message: "Attendance start updated" });
          }
        );
        return;
      }

      // Else insert new row with start_job=NOW()
      db.query(
        `INSERT INTO ${teacherAttendanceTable} (date, teacher_name, teacher_trade, start_job, end_job) VALUES (?, ?, ?, NOW(), NULL)`,
        [dateStr, teacher_name, teacher_trade],
        async (err3) => {
          if (err3) return handleError(err3, res, "TEACHER ATT START INSERT");

          await sendAdminEmail(
            "Teacher attendance started",
            `${teacher_name} (${teacher_trade}) started working on ${dateStr} at ${new Date().toLocaleString()}`
          );

          res.json({ success: true, message: "Attendance start saved" });
        }
      );
    }
  );
});

app.post("/teacher-attendance/end", (req, res) => {
  const { teacher_name, teacher_trade } = req.body;
  if (!teacher_name || !teacher_trade) {
    return res.status(400).json({ success: false, error: "teacher_name and teacher_trade are required" });
  }

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;

  // Find today's row where end_job IS NULL
  db.query(
    `SELECT * FROM ${teacherAttendanceTable} WHERE date=? AND teacher_name=? AND teacher_trade=? AND end_job IS NULL ORDER BY id DESC LIMIT 1`,
    [dateStr, teacher_name, teacher_trade],
    (err, rows) => {
      if (err) return handleError(err, res, "TEACHER ATT END SELECT");

      if (!rows || !rows.length) {
        return res.status(404).json({ success: false, error: "No open attendance found for today" });
      }

      const row = rows[0];
      db.query(
        `UPDATE ${teacherAttendanceTable} SET end_job=NOW() WHERE id=?`,
        [row.id],
        async (err2) => {
          if (err2) return handleError(err2, res, "TEACHER ATT END UPDATE");

          await sendAdminEmail(
            "Teacher attendance ended",
            `${teacher_name} (${teacher_trade}) ended working on ${dateStr} at ${new Date().toLocaleString()}`
          );

          res.json({ success: true, message: "Attendance ended" });
        }
      );
    }
  );
});

// ======================================================
// ================= WORKERS CRUD =======================
// ======================================================


// CREATE
app.post("/workers", (req, res) => {

  const {
    fullnames,
    email,
    telephone,
    province,
    district,
    sector,
    cell,
    village,
    country,
  } = req.body;

  db.query(
    `
    INSERT INTO workers
    (
      fullnames,
      email,
      telephone,
      province,
      district,
      sector,
      cell,
      village,
      country
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      safe(fullnames),
      safe(email),
      safe(telephone),
      safe(province),
      safe(district),
      safe(sector),
      safe(cell),
      safe(village),
      safe(country),
    ],
    (err) => {

      if (err) return handleError(err, res, "WORKERS INSERT");

      res.json({
        success: true,
        message: "Worker saved",
      });
    }
  );
});

// GET
app.get("/workers", (req, res) => {

  db.query("SELECT * FROM workers", (err, result) => {

    if (err) return handleError(err, res, "WORKERS GET");

    res.json({
      success: true,
      data: result,
    });
  });
});

// UPDATE
app.put("/workers/:id", (req, res) => {

  const { id } = req.params;

  const {
    fullnames,
    email,
    telephone,
    province,
    district,
    sector,
    cell,
    village,
    country,
  } = req.body;

  db.query(
    `
    UPDATE workers SET
    fullnames=?,
    email=?,
    telephone=?,
    province=?,
    district=?,
    sector=?,
    cell=?,
    village=?,
    country=?
    WHERE id=?
    `,
    [
      safe(fullnames),
      safe(email),
      safe(telephone),
      safe(province),
      safe(district),
      safe(sector),
      safe(cell),
      safe(village),
      safe(country),
      id,
    ],
    (err) => {

      if (err) return handleError(err, res, "WORKERS UPDATE");

      res.json({
        success: true,
        message: "Worker updated",
      });
    }
  );
});

// DELETE
app.delete("/workers/:id", (req, res) => {

  const { id } = req.params;

  db.query(
    "DELETE FROM workers WHERE id=?",
    [id],
    (err) => {

      if (err) return handleError(err, res, "WORKERS DELETE");

      res.json({
        success: true,
        message: "Worker deleted",
      });
    }
  );
});

// ================= SERVER =================
app.listen(3001, () => {

  console.log("🚀 SERVER RUNNING ON http://localhost:3001");
});