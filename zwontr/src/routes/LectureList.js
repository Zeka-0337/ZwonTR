import { Button, Card, ListGroup, Modal, Table, InputGroup, Form } from "react-bootstrap";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useState, useEffect } from "react";
import axios from "axios";
import "./Lecture.css";
import { FaPencilAlt, FaTimes } from "react-icons/fa";

function LectureList() {
  let history = useHistory();

  // 날짜 관련 코드
  const now = new Date(); // 현재 시간
  const utcNow = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const koreaTimeDiff = 9 * 60 * 60 * 1000;
  const koreaNow = new Date(utcNow + koreaTimeDiff);
  const today = koreaNow.toISOString().split("T")[0];

  // 강의 정렬 관련 코드

  const [managerOn, setmanagerOn] = useState(false);
  const [startdayOn, setstartdayOn] = useState(false);

  // 강의 추가 관련 코드
  const [modal, setmodal] = useState(false);
  const modalOpen = () => setmodal(true);
  const modalClose = () => setmodal(false);
  const createNewLecture = () => {
    if (lecture["lectureName"] === "") {
      window.alert("강의명이 입력되지 않았습니다.");
      return;
    }

    if (lecture["subject"] === "") {
      window.alert("과목이 선택되지 않았습니다.");
      return;
    }

    if (lecture["manager"] === "") {
      window.alert("담당 매니저가 선택되지 않았습니다.");
      return;
    }
    if (lecture["startday"] === "") {
      window.alert("강의시작일이 입력되지 않았습니다.");
      return;
    }

    axios
      .post(`/api/Lecture`, lecture)
      .then((result) => {
        if (result.data === true) {
          window.location.replace("/Lecture");
        } else if (result.data === "로그인필요") {
          window.alert("로그인이 필요합니다.");
          return history.push("/");
        } else {
          window.alert(result.data);
        }
      })
      .catch((err) => {
        window.alert(err);
      });
  };

  const [lecture, setlecture] = useState({
    lectureID: "",
    lectureName: "",
    subject: "",
    manager: "",
    startday: today,
    lastrevise: today,
    students: {},
    studentList: [],
    assignments: {},
    assignKey: 0,
  });

  // 강의 수정 관련 코드
  const [reviseModal, setreviseModal] = useState(false);
  const [existlecture, setexistlecture] = useState({});

  const reviseModalOpen = (lecture) => {
    setexistlecture(lecture);
    setreviseModal(true);
  };

  const reviseModalClose = () => {
    setexistlecture({});
    setreviseModal(false);
  };

  const reviseLecture = async () => {
    if (!window.confirm("강의를 수정하시겠습니까?")) return;

    axios
      .put("/api/Lecture", existlecture)
      .then((result) => {
        if (result.data === true) {
          window.alert("수정되었습니다");
          return window.location.replace("/Lecture");
        } else if (result.data === "로그인필요") {
          window.alert("로그인이 필요합니다.");
          return history.push("/");
        } else {
          console.log(result.data);
          window.alert(result.data);
        }
      })
      .catch((err) => {
        return window.alert("수정에 실패했습니다", err);
      });
  };

  // 강의 삭제 관련 코드
  const deleteLecture = async (studentList, lecture) => {
    if (!window.confirm(`${lecture["lectureName"]} 강의를 삭제하시겠습니까?`)) return;
    for (let student of studentList) {
      const stuDB = await axios
        .get(`/api/StudentDB/${student}`)
        .then((result) => {
          if (result.data === "로그인필요") {
            window.alert("로그인이 필요합니다.");
            return history.push("/");
          }
          return result["data"];
        })
        .catch((err) => {
          return err;
        });
      // 학생DB에 수강중강의가 있는지, 수강중강의에 해당 lectureID가 존재하는지부터 확인해야하긴 함.

      await stuDB["수강중강의"].splice(stuDB["수강중강의"].indexOf(lecture["lectureID"]), 1);
      console.log(stuDB["수강중강의"]);
      axios
        .put("/api/StudentDB", stuDB)
        .then(function (result) {
          if (result.data === "로그인필요") {
            window.alert("로그인이 필요합니다.");
            return history.push("/");
          }
          if (result.data !== true) {
            window.alert(result.data);
          }
        })
        .catch(function (err) {
          window.alert("저장에 실패했습니다 개발/데이터 팀에게 문의해주세요");
        });
    }
    axios
      .delete(`/api/Lecture/${lecture["lectureID"]}`)
      .then((result) => {
        if (result.data === true) {
          window.alert("삭제되었습니다");
          return window.location.replace("/Lecture");
        } else {
          window.alert(result.data);
        }
      })
      .catch((err) => {
        window.alert(`삭제에 실패했습니다. ${err}`);
      });
  };

  // 매니저리스트 관련 코드
  const [managerList, setmanagerList] = useState([]);

  // 강의리스트 관련 코드
  const [lectureList, setlectureList] = useState([]);

  useEffect(async () => {
    const newmanagerList = await axios
      .get("/api/managerList")
      .then((result) => {
        return result["data"];
      })
      .catch((err) => {
        return err;
      });
    setmanagerList(newmanagerList);

    const newlectureList = await axios
      .get("/api/Lecture")
      .then((result) => {
        return result["data"];
      })
      .catch((err) => {
        return window.alert(err);
      });
    setlectureList(newlectureList);
  }, []);

  return (
    <div className="background text-center">
      <h1 className="mt-3 fw-bold">강의 관리</h1>
      
      <Button
        variant="success"
        className="color-purple"
        onClick={() => {
          modalOpen();
        }}
      >
        강의 추가
      </Button>

      
      

      {/* 강의 생성 Modal */}
      <Modal show={modal} onHide={modalClose}>
        <Modal.Header closeButton>
          <Modal.Title>강의 추가</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <InputGroup className="mb-3">
            <InputGroup.Text> 강의명</InputGroup.Text>
            <Form.Control
              placeholder="강의명을 입력해주세요"
              onChange={(e) => {
                const regExp = /[#?\/\\%]/gi;
                if (regExp.test(e.target.value)) {
                  alert("#,?,\\ /는 입력하실수 없습니다.");
                  e.target.value = e.target.value.substring(0, e.target.value.length - 1);
                  return;
                }
                const newlecture = JSON.parse(JSON.stringify(lecture));
                newlecture["lectureName"] = e.target.value;
                if (newlecture["lectureName"] !== "" && newlecture["manager"] !== "" && newlecture["startday"] !== "") {
                  newlecture["lectureID"] =
                    newlecture["lectureName"] +
                    "_" +
                    newlecture["manager"] +
                    "_" +
                    newlecture["startday"].slice(2, 4) +
                    newlecture["startday"].slice(5, 7) +
                    newlecture["startday"].slice(8, 10);
                }
                setlecture(newlecture);
              }}
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text>과목</InputGroup.Text>
            <Form.Select
              onChange={(e) => {
                const newlecture = JSON.parse(JSON.stringify(lecture));
                newlecture["subject"] = e.target.value;
                setlecture(newlecture);
              }}
            >
              <option value="">선택</option>
              {["국어", "수학", "영어", "탐구", "기타"].map((subject, idx) => {
                return (
                  <option value={subject} key={idx}>
                    {subject}
                  </option>
                );
              })}
            </Form.Select>
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text>매니저(강사)</InputGroup.Text>
            <Form.Select
              onChange={(e) => {
                const newlecture = JSON.parse(JSON.stringify(lecture));
                newlecture["manager"] = e.target.value;
                if (newlecture["lectureName"] !== "" && newlecture["manager"] !== "" && newlecture["startday"] !== "") {
                  newlecture["lectureID"] =
                    newlecture["lectureName"] +
                    "_" +
                    newlecture["manager"] +
                    "_" +
                    newlecture["startday"].slice(2, 4) +
                    newlecture["startday"].slice(5, 7) +
                    newlecture["startday"].slice(8, 10);
                }
                setlecture(newlecture);
              }}
            >
              <option value="">선택</option>
              {managerList.map((manager, idx) => {
                return (
                  <option value={manager} key={idx}>
                    {manager}
                  </option>
                );
              })}
            </Form.Select>
          </InputGroup>

          <InputGroup className="mb-3">
            <InputGroup.Text>강의시작일</InputGroup.Text>
            <Form.Control
              type="date"
              value={lecture["startday"]}
              onChange={(e) => {
                const newlecture = JSON.parse(JSON.stringify(lecture));
                newlecture["startday"] = e.target.value;
                if (newlecture["lectureName"] !== "" && newlecture["manager"] !== "" && newlecture["startday"] !== "") {
                  newlecture["lectureID"] =
                    newlecture["lectureName"] +
                    "_" +
                    newlecture["manager"] +
                    "_" +
                    newlecture["startday"].slice(2, 4) +
                    newlecture["startday"].slice(5, 7) +
                    newlecture["startday"].slice(8, 10);
                }
                setlecture(newlecture);
              }}
            />
          </InputGroup>

          <Button
            variant="success"
            onClick={() => {
              createNewLecture();
            }}
          >
            강의 생성
          </Button>
        </Modal.Body>
      </Modal>

      {/* 강의 수정 Modal */}
      <Modal show={reviseModal} onHide={reviseModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>강의 수정</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <InputGroup className="mb-3">
            <InputGroup.Text>강의명</InputGroup.Text>
            <Form.Control
              value={existlecture["lectureName"]}
              onChange={(e) => {
                const regExp = /[#?\/\\%]/gi;
                if (regExp.test(e.target.value)) {
                  alert("#,?,\\ /는 입력하실수 없습니다.");
                  e.target.value = e.target.value.substring(0, e.target.value.length - 1);
                  return;
                }
                const newlecture = JSON.parse(JSON.stringify(existlecture));
                newlecture["lectureName"] = e.target.value;
                setexistlecture(newlecture);
              }}
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text>과목</InputGroup.Text>
            <Form.Select
              value={existlecture["subject"]}
              onChange={(e) => {
                const newlecture = JSON.parse(JSON.stringify(existlecture));
                newlecture["subject"] = e.target.value;
                setexistlecture(newlecture);
              }}
            >
              <option value="">선택</option>
              {["국어", "수학", "영어", "탐구", "기타"].map((subject, idx) => {
                return (
                  <option value={subject} key={idx}>
                    {subject}
                  </option>
                );
              })}
            </Form.Select>
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text>매니저(강사)</InputGroup.Text>
            <Form.Select
              value={existlecture["manager"]}
              onChange={(e) => {
                const newlecture = JSON.parse(JSON.stringify(existlecture));
                newlecture["manager"] = e.target.value;
                setexistlecture(newlecture);
              }}
            >
              <option value="">선택</option>
              {managerList.map((manager, idx) => {
                return (
                  <option value={manager} key={idx}>
                    {manager}
                  </option>
                );
              })}
            </Form.Select>
          </InputGroup>

          <InputGroup className="mb-3">
            <InputGroup.Text>강의시작일</InputGroup.Text>
            <Form.Control
              type="date"
              value={existlecture["startday"]}
              onChange={(e) => {
                const newlecture = JSON.parse(JSON.stringify(existlecture));
                newlecture["startday"] = e.target.value;
                setexistlecture(newlecture);
              }}
            />
          </InputGroup>

          <Button
            variant="success"
            onClick={() => {
              reviseLecture();
            }}
          >
            강의 수정
          </Button>
        </Modal.Body>
      </Modal>

      <div className="row m-auto lectureListBox">
      <div className="d-flex flex-row-reverse">
      <Button
        className="me-2 color-gray-purple"
        variant="secondary"
        onClick={() => {
          const newlectureList = [...lectureList];
          newlectureList.sort(function (a, b) {
            return (+(a.manager > b.manager) - 0.5) * (+!managerOn - 0.5);
          });
          setlectureList(newlectureList);
          setmanagerOn(!managerOn);
          setstartdayOn(false);
        }}
      >
        매니저순 정렬
      </Button>
      <Button
        className="me-2 color-gray-purple"
        variant="secondary"
        onClick={() => {
          const newlectureList = [...lectureList];
          newlectureList.sort(function (a, b) {
            return (+(a.startday > b.startday) - 0.5) * (+!startdayOn - 0.5);
          });
          setlectureList(newlectureList);
          setmanagerOn(false);
          setstartdayOn(!startdayOn);
        }}
      >
        강의시작일순 정렬
      </Button>
      </div>
        {lectureList.map((element, idx) => {
          return (
            <div className="col-sm-6 col-md-4 col-lg-3">
              <Card
                className="mt-2 lecture-card"
                key={idx}
                onClick={() => {
                  history.push(`/Lecture/${element["lectureID"]}`);
                }}
              >
                <Card.Header as="h5">{element["lectureName"]}</Card.Header>
                <Card.Body>
                  <div className="text-start">
                    {/* <Card.Text>강의명 : {element["lectureName"]}</Card.Text> */}
                    <Card.Text>과목 : {element["subject"]}</Card.Text>
                    <Card.Text>매니저 : {element["manager"]}</Card.Text>
                    <Card.Text>수강생 : {element["studentList"].length}명</Card.Text>
                  </div>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      reviseModalOpen(element);
                    }}
                    variant="secondary"
                    className="btn-sm me-2 color-purple"
                  >
                    <FaPencilAlt></FaPencilAlt>
                  </Button>

                  <Button
                    className="btn-sm m-auto"
                    variant="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLecture(element["studentList"], element);
                    }}
                  >
                    <FaTimes></FaTimes>
                  </Button>
                </Card.Body>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LectureList;
