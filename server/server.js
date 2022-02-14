const express = require("express");
const path = require("path");
const app = express();

const ObjectId = require("mongodb").ObjectId;
//MongoDB 연결, 설치필요 (npm install mongodb)
const MongoClient = require("mongodb").MongoClient;

// .env
require("dotenv").config();

// express에 내장된 body-parser 사용
app.use(express.urlencoded({ extended: true }));

// react와 nodejs 서버간 ajax 요청 잘 되게
app.use(express.json());
var cors = require("cors");
app.use(cors());

//db라는 변수에 Zwon 데이터베이스 연결
var db;
MongoClient.connect(process.env.DB_URL, function (err, client) {
  if (err) {
    return console.log(err);
  }

  // db라는 변수에 Zwon 데이터베이스를 연결.
  db = client.db("Zwon");

  app.listen(process.env.PORT, function () {
    console.log(`listening on ${process.env.PORT}`);
  });
});

// 특정폴더 안의 파일들을 static파일로 고객들에게 보내줄 수 있음
app.use(express.static(path.join(__dirname, "../zwontr/build")));

// 홈페이지(/) 접속시, build된 react의 html 전송
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "../zwontr/build/index.html"));
});

// collection 중 StudentDB의 모든 Document find 및 전송
// res.json과 res.send의 차이점 :
// 1. send가 상위호환이나 전송파일이 json일 경우 불필요한 호출이 한번 더 일어남
// 2. 개발자가 소스코드를 읽을 때도 res.json이 더 명확한 의도가 드러남.

app.get("/api/studentList", function (req, res) {
  db.collection("StudentDB")
    .find()
    .toArray(function (err, result) {
      if (err) {
        return console.log("api/studentList - find Error : ", err);
      }
      console.log("api/studentList - find result length   :", result.length);
      res.json(result);
    });
});

// collection 중 StudentDB에 새로운 stuDB 추가
app.post("/api/studentAdd", function (req, res) {
  const newDB = req.body;
  db.collection("StudentDB").findOne({ 이름: newDB }, function (err, result) {
    if (err) {
      return console.log("/api/studentAdd findOne Error : ", err);
    } else if (result === null) {
      db.collection("StudentDB").insertOne(newDB, (err2, result2) => {
        console.log("신규 DB 저장 완료");
        return res.send(true);
      });
    }
  });
});

// collection 중 StudentDB의 이름이 param 중 name인 Document 요청
app.get("/api/stuDB/:name", function (req, res) {
  const paramName = decodeURIComponent(req.params.name);
  console.log("요청된 이름 : ", paramName);
  db.collection("StudentDB").findOne({ 이름: paramName }, function (err, result) {
    if (err) {
      return console.log("/api - findOne Error : ", err);
    }
    console.log("/api findOne 요청 결과 : ", result);
    res.redirect("/");
  });
});

app.get("/api/TR/:name", function (req, res) {
  const paramName = decodeURIComponent(req.params.name);
  console.log(`${paramName}의 TR 리스트 조회 시도`);
  db.collection("TR")
    .find({ 이름: paramName })
    .toArray(function (err, result) {
      if (err) {
        return console.log("/api/TR/:name - find Error : ", err);
      }
      console.log(`${paramName}의 TR 리스트 조회 결과수 : `, result.length);
      res.json(result);
    });
});

app.post("/api/TR/write", function (req, res) {
  const newTR = req.body;
  console.log("일간하루 저장 시도 : ", newTR.이름, newTR.날짜);
  db.collection(`TR`).findOne({ 이름: newTR.이름, 날짜: newTR.날짜 }, function (err, result) {
    if (err) {
      return console.log(`/api/TR/write - findOne Error : `, err);
    } else if (result === null) {
      db.collection("TR").insertOne(newTR, function (err2, result2) {
        if (err2) {
          return console.log("/api/TR/write - insertOne Error : ", err2);
        }
        console.log("터미널에 표시 : 일간하루 저장 완료");
        return res.send(true);
      });
    } else {
      return res.send(false);
    }
  });
});

app.put("/api/TR/edit", function (req, res) {
  const newTR = req.body;
  console.log("일간하루 수정 시도 : ", newTR.이름, newTR.날짜);
  db.collection(`TR`).findOne({ 이름: newTR.이름, 날짜: newTR.날짜 }, function (err, result) {
    if (err) {
      return console.log(`/api/TR/edit - findOne Error : `, err);
    } else if (result !== null) {
      db.collection("TR").updateOne({ 이름: newTR.이름, 날짜: newTR.날짜 }, { $set: newTR }, function (err2, result2) {
        if (err2) {
          return console.log("/api/TR/write - updateOne Error : ", err2);
        }
        console.log("터미널에 표시 : 일간하루 수정 완료");
        return res.send(true);
      });
    } else {
      return res.send(false);
    }
  });
});

app.put("/api/StudentEdit", function (req, res) {
  const newstuDB = req.body;
  console.log("stuDB 수정 시도 : ", newstuDB);
  db.collection(`StudentDB`).findOne({ _id: ObjectId(newstuDB._id) }, function (err, result) {
    if (err) {
      return console.log(`/api/StudentEdit - findOne Error : `, err);
    } else if (result !== null) {
      const findID = ObjectId(newstuDB._id);
      delete newstuDB._id;
      db.collection("StudentDB").updateOne({ _id: findID }, { $set: newstuDB }, function (err2, result2) {
        if (err2) {
          return console.log("/api/StudentEdit - updateOne Error : ", err2);
        }
        console.log("터미널에 표시 : 학생DB 수정 완료");
        return res.send(true);
      });
    } else {
      return res.send(false);
    }
  });
});

// app.get("*", function (req, res) {
//   res.sendFile(path.join(__dirname, "../zwontr/build/index.html"));
// });
