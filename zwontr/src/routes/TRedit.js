import "./TRWriteEdit.scss";
import { Form, Button, Card, ListGroup, Table, Modal, Row, Col } from "react-bootstrap";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import TimePicker from "react-time-picker";

function TRedit(props) {
  let history = useHistory();
  var managerList = props.managerList;
  const [stuDB, setstuDB] = useState(props.stuDB);
  const [TR, TR변경] = useState(props.existTR);
  const [cuberaito, setCuberatio] = useState(0);
  const [failCnt, setFailCnt] = useState(0);

  function 입력확인() {
    if (!TR.날짜) {
      window.alert("일간하루 날짜가 입력되지 않았습니다.");
      return false;
    }
    if (!TR.작성매니저) {
      window.alert("일간하루 작성매니저가 선택되지 않았습니다.");
      return false;
    }
    if (TR.결석여부) {
      if (!TR.결석사유) {
        window.alert("미등원 사유가 선택되지 않았습니다.");
        return false;
      }
      return true;
    }
    if (!TR.신체컨디션) {
      window.alert("신체컨디션이 선택되지 않았습니다.");
      return false;
    }

    if (!TR.정서컨디션) {
      window.alert("정서컨디션이 선택되지 않았습니다.");
      return false;
    }
    if (TR.학습) {
      for (let i = 0; i < TR.학습.length; i++) {
        if (TR.학습[i].과목 == "선택") {
          window.alert(`${i + 1}번째 학습의 과목이 선택되지 않았습니다.`);
          return false;
        }
        if (TR.학습[i].교재 == "선택") {
          window.alert(`${i + 1}번째 학습의 교재가 선택되지 않았습니다.`);
          return false;
        }
        if (!TR.학습[i].학습시간 || TR.학습[i].학습시간 === "00:00") {
          window.alert(`${i + 1}번째 학습의 학습시간이 입력되지 않았습니다. 학습이 진행되지 않은 경우, 해당 항목을 삭제해주세요.`);
          return false;
        }
      }
    }
    if (isNaN(TR.실제학습)) {
      window.alert("학습 시간의 값이 NaN입니다. 수정 후 다시시도해 주세요.");
      return false;
    }

    if (isNaN(TR.프로그램시간)) {
      window.alert("프로그램 시간의 값이 NaN입니다. 수정 후 다시시도해 주세요.");
      return false;
    }
    return true;
  }

  function 차이계산(목표, 실제) {
    if (!목표 || !실제) {
      return NaN;
    }
    let [목표시간, 목표분] = 목표.split(":");
    let [실제시간, 실제분] = 실제.split(":");
    let diff = parseInt(목표시간) - parseInt(실제시간) + (parseInt(목표분) - parseInt(실제분)) / 60;
    if (diff < -12) {
      diff += 24;
    } else if (diff > 12) {
      diff -= 24;
    }

    return Math.round(diff * 10) / 10;
  }

  function 차이출력(stayup, diff, 종류) {
    if (stayup == true && (종류 == '취침'|| 종류 == '기상')) {
      return "밤샘";
    } else{
      if (diff < 0) {
        diff = -diff;
        return Math.round(diff * 10) / 10 + "시간 늦게 " + 종류;
    } else if (diff > 0) {
        return Math.round(diff * 10) / 10 + "시간 일찍 " + 종류;
    } else {
        return "정시 " + 종류;
      }
    }
  }

  function change_depth_one(category, data) {
    const newTR = JSON.parse(JSON.stringify(TR));
    newTR[category] = data;
    TR변경(newTR);
  }

  function change_depth_two(category1, category2, data) {
    const newTR = JSON.parse(JSON.stringify(TR));
    newTR[category1][category2] = data;
    TR변경(newTR);
  }

  function change_depth_three(category1, category2, category3, data) {
    const newTR = JSON.parse(JSON.stringify(TR));
    newTR[category1][category2][category3] = data;
    TR변경(newTR);
  }

  function delete_depth_one(category, index) {
    const newTR = JSON.parse(JSON.stringify(TR));
    newTR[category].splice(index, 1);
    TR변경(newTR);
  }

  function push_depth_one(category, content) {
    const newTR = JSON.parse(JSON.stringify(TR));
    newTR[category].push(content);
    TR변경(newTR);
  }

  function 컨디션변환(num) {
    if (num == 5) {
      return "매우 좋음";
    }
    if (num == 4) {
      return "좋음";
    }
    if (num == 3) {
      return "보통";
    }
    if (num == 2) {
      return "안좋음";
    }
    if (num == 1) {
      return "매우 안좋음";
    }
    if (num === "-") {
      return "-";
    }
  }

  const isInitialMount = useRef(true);

  useEffect(async () => {
    const newTR = JSON.parse(JSON.stringify(TR));
    newTR.작성매니저 = "";
    if (newTR["큐브책"].length !== 0 && !("구분" in newTR["큐브책"][0])) {
      for (let i = 0; i < newTR["큐브책"].length; i++) {
        const tmp = newTR["큐브책"][i];
        newTR["큐브책"][i] = {
          구분: "구분",
          할일: tmp["할일"],
          완료여부: tmp["완료여부"],
        };
      }
    }
    if (!("센터내시간" in newTR)) {
      newTR["센터내시간"] = 0;
      newTR["센터활용률"] = 0;
      newTR["센터학습활용률"] = 0;
    }
    await TR변경(newTR);

    isInitialMount.current = false;
  }, []);

  useEffect(() => {
    if (!isInitialMount.current) {
      const newTR = JSON.parse(JSON.stringify(TR));
      const tmp = new Date(TR.날짜);
      const ls = ["일", "월", "화", "수", "목", "금", "토"];
      newTR["요일"] = ls[tmp.getDay()] + "요일";
      TR변경(newTR);
    }
  }, [TR.날짜]);

  useEffect(() => {
    if (!isInitialMount.current) {
      const newTR = JSON.parse(JSON.stringify(TR));
      ["취침", "기상", "등원", "귀가"].forEach((a) => {
        newTR[`${a}차이`] = 차이계산(newTR[`목표${a}`], newTR[`실제${a}`]);
      });
      newTR.센터내시간 = 차이계산(newTR.실제귀가, newTR.실제등원);
      newTR.센터활용률 = Math.round(((newTR.프로그램시간 + newTR.실제학습) / TR.센터내시간) * 1000) / 10;
      newTR.센터학습활용률 = Math.round((newTR.실제학습 / newTR.센터내시간) * 1000) / 10;
      TR변경(newTR);
    }
  }, [
    TR.목표취침,
    TR.실제취침,
    TR.목표기상,
    TR.실제기상,
    TR.목표등원,
    TR.실제등원,
    TR.목표귀가,
    TR.실제귀가,
    TR.목표학습,
    TR.실제학습,
    TR.프로그램시간,
    TR.센터내시간,
  ]);

  useEffect(() => {
    if (!isInitialMount.current) {
      let cnt = 0;
      let fail = 0;
      for (const cube of TR["큐브책"]) {
        if (cube["완료여부"] === true) {
          cnt += 1;
        } else {
          fail += 1;
        }
      }
      setFailCnt(fail);
      setCuberatio(Math.round((cnt / TR["큐브책"].length) * 1000) / 10);
    }
  }, [TR.큐브책]);

  useEffect(() => {
    if (!isInitialMount.current) {
      const newTR = JSON.parse(JSON.stringify(TR));
      newTR.센터내시간 = 차이계산(newTR.실제귀가, newTR.실제등원);
      newTR.센터활용률 = Math.round(((newTR.프로그램시간 + newTR.실제학습) / TR.센터내시간) * 1000) / 10;
      newTR.센터학습활용률 = Math.round((newTR.실제학습 / newTR.센터내시간) * 1000) / 10;
      TR변경(newTR);
    }
  }, [TR.실제학습, TR.프로그램시간, TR.센터내시간, TR.실제등원, TR.실제귀가]);

  return (
    <div className="trEdit-background">
      <div className="row">
        <div className="col-xl-6 trCol">
          <div>
            <div className="row m-0 trCard">
              <div className="col-2">
                <p className="fw-bold">[ 이름 ]</p>
                <p>{TR.이름}</p>
              </div>
              <div className="col-3">
                <p className="fw-bold">[ 날짜 ]</p>
                <input
                  type="date"
                  value={TR.날짜}
                  className="w-100"
                  onChange={(e) => {
                    change_depth_one("날짜", e.target.value);
                  }}
                />
              </div>

              <div className="col-3">
                <p className="fw-bold">[ 작성매니저 ]</p>
                <Form.Select
                  size="sm"
                  value={TR.작성매니저}
                  onChange={(e) => {
                    change_depth_one("작성매니저", e.target.value);
                  }}
                >
                  <option value="기존">{"기존 : " + props.existTR.작성매니저}</option>
                  {managerList
                    ? managerList.map((manager, index) => {
                        return (
                          <option value={manager} key={index}>
                            {manager}
                          </option>
                        );
                      })
                    : null}
                </Form.Select>
              </div>

              <div className="col-2 pe-0">
                <button
                  className="btn btn-TRcommit btn-attend"
                  onClick={() => {
                    console.log(TR);
                    change_depth_one("결석여부", false);
                  }}
                >
                  <strong>등원</strong>
                </button>
              </div>
              <div className="col-2 ps-0">
                <button
                  className="btn btn-TRcommit btn-absent"
                  onClick={() => {
                    if (window.confirm("미등원으로 전환하시겠습니까?")) {
                      console.log(TR);
                      change_depth_one("결석여부", true);
                    }
                  }}
                >
                  <strong>미등원</strong>
                </button>
              </div>
            </div>
            {TR.결석여부 === false ? (
              <div className="mt-3">
                <div className="trCard">
                  <Form.Group as={Row}>
                    <Form.Label column sm="2">
                      <strong>[ 신체 컨디션 ]</strong>
                    </Form.Label>
                    <Col sm="10">
                      <Form.Select
                        size="sm"
                        value={TR.신체컨디션}
                        onChange={(e) => {
                          change_depth_one("신체컨디션", parseInt(e.target.value));
                        }}
                      >
                        <option value={props.existTR.신체컨디션}>{컨디션변환(props.existTR.신체컨디션)}</option>
                        <option value={5}>매우 좋음</option>
                        <option value={4}> 좋음</option>
                        <option value={3}>보통</option>
                        <option value={2}> 안좋음</option>
                        <option value={1}>매우 안좋음</option>
                      </Form.Select>
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">
                      <strong>[ 정서 컨디션 ]</strong>
                    </Form.Label>
                    <Col sm="10">
                      <Form.Select
                        size="sm"
                        value={TR.정서컨디션}
                        onChange={(e) => {
                          change_depth_one("정서컨디션", parseInt(e.target.value));
                        }}
                      >
                        <option value={props.existTR.정서컨디션}>{컨디션변환(props.existTR.정서컨디션)}</option>
                        <option value={5}>매우 좋음</option>
                        <option value={4}> 좋음</option>
                        <option value={3}>보통</option>
                        <option value={2}> 안좋음</option>
                        <option value={1}>매우 안좋음</option>
                      </Form.Select>
                    </Col>
                  </Form.Group>
                  <Table striped hover size="sm" className="mt-3">
                    <thead>
                      <tr>
                        <th width="15%">생활</th>
                        <th width="25%">목표</th>
                        <th width="25%">실제</th>
                        <th>차이</th>
                      </tr>
                    </thead>
                    <tbody>
                      {["취침", "기상", "등원", "귀가"].map(function (a, i) {
                        return (
                          <tr key={i}>
                            <td>{a}</td>
                            <td>
                              <TimePicker
                                locale="sv-sv"
                                value={TR[`목표${a}`]}
                                openClockOnFocus={false}
                                clearIcon={null}
                                clockIcon={null}
                                onChange={(value) => {
                                  const newTR = JSON.parse(JSON.stringify(TR));
                                  newTR[`목표${a}`] = value;
                                  TR변경(newTR);
                                }}
                              ></TimePicker>
                            </td>

                            <td>
                              <TimePicker
                                className="timepicker"
                                locale="sv-sv"
                                value={TR[`실제${a}`]}
                                openClockOnFocus={false}
                                clearIcon={null}
                                clockIcon={null}
                                onChange={(value) => {
                                  const newTR = JSON.parse(JSON.stringify(TR));
                                  newTR[`실제${a}`] = value;
                                  TR변경(newTR);
                                }}
                              ></TimePicker>
                            </td>
                            <td>{차이출력(TR['밤샘여부'], TR[`${a}차이`], a)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                  <Form.Check
                  className="stayUpCheck"
                  type = "checkbox"
                  label = "* 학생 밤샘 시 체크해주세요."
                  checked = {TR['밤샘여부']}
                  onChange={(e)=>{
                    var newTR = JSON.parse(JSON.stringify(TR));
                    newTR['밤샘여부'] = e.target.checked;
                    if (e.target.checked == true){
                      let 목표기상시간 = newTR["목표기상"];
                      newTR["실제취침"] = 목표기상시간;
                      newTR["실제기상"] = 목표기상시간;
                      }
                    TR변경(newTR);
                    }
                  }
                  />
                  <p style={{ fontSize: "17px" }} className="mt-2 btn-add program-add">
                    센터내시간 : {TR.센터내시간}시간 / 센터활용률 : {TR.센터활용률}% / 센터학습활용률: {TR.센터학습활용률}%
                  </p>
                </div>

                <div className="trCard">
                  <Table striped hover size="sm" className="mt-3">
                    <thead>
                      <tr>
                        <th width="15%">학습</th>
                        <th>교재</th>
                        <th width="15%">총교재량</th>
                        <th width="15%">최근진도</th>
                        <th width="15%">학습시간</th>
                        <th width="12%"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {TR.학습.map(function (a, i) {
                        return (
                          <tr key={i}>
                            <td>
                              <Form.Select
                                size="sm"
                                value={a.과목}
                                onChange={(e) => {
                                  change_depth_three("학습", i, "과목", e.target.value);
                                }}
                              >
                                <option value="선택">선택</option>
                                <option value="국어">국어</option>
                                <option value="수학">수학</option>
                                <option value="영어">영어</option>
                                <option value="탐구">탐구</option>
                                <option value="기타">기타</option>
                              </Form.Select>
                            </td>
                            <td>
                              <Form.Select
                                size="sm"
                                value={a.교재}
                                onChange={(e) => {
                                  change_depth_three("학습", i, "교재", e.target.value);
                                }}
                              >
                                <option value="선택">선택</option>
                                {stuDB.진행중교재.map(function (book, index) {
                                  return (
                                    <option value={book.교재} key={index}>
                                      {book.교재}
                                    </option>
                                  );
                                })}
                                <option value="모의고사">모의고사</option>
                                <option value="테스트">테스트</option>
                                <option value="기타">기타</option>
                              </Form.Select>
                            </td>
                            <td>
                              <p className="fs-13px">{a.총교재량}</p>
                            </td>
                            <td>
                              <input
                                type="number"
                                placeholder="-1"
                                value={a.최근진도}
                                className="inputText"
                                onChange={(e) => {
                                  change_depth_three("학습", i, "최근진도", parseInt(e.target.value));
                                }}
                              />
                            </td>
                            <td>
                              <TimePicker
                                className="timepicker"
                                locale="sv-sv"
                                value={a.학습시간}
                                openClockOnFocus={false}
                                clearIcon={null}
                                clockIcon={null}
                                onChange={(value) => {
                                  var newTR = JSON.parse(JSON.stringify(TR));
                                  newTR.학습[i].학습시간 = value;
                                  let 실제학습시간 = 0;
                                  let 실제학습분 = 0;
                                  newTR.학습.map(function (b, j) {
                                    if (b.학습시간) {
                                      실제학습시간 += parseInt(b.학습시간.split(":")[0]);
                                      실제학습분 += parseInt(b.학습시간.split(":")[1]);
                                    }
                                  });
                                  newTR.실제학습 = Math.round((실제학습시간 + 실제학습분 / 60) * 10) / 10;
                                  TR변경(newTR);
                                }}
                              ></TimePicker>
                            </td>
                            <td>
                              <button
                                className="btn btn-delete"
                                onClick={() => {
                                  if (i > -1) {
                                    if (window.confirm("삭제하시겠습니까?")) {
                                      var newTR = JSON.parse(JSON.stringify(TR));
                                      newTR.학습.splice(i, 1);
                                      let 실제학습시간 = 0;
                                      let 실제학습분 = 0;
                                      newTR.학습.map(function (b, j) {
                                        if (b.학습시간) {
                                          실제학습시간 += parseInt(b.학습시간.split(":")[0]);
                                          실제학습분 += parseInt(b.학습시간.split(":")[1]);
                                        }
                                      });
                                      newTR.실제학습 = Math.round((실제학습시간 + 실제학습분 / 60) * 10) / 10;
                                      TR변경(newTR);
                                    }
                                  }
                                }}
                              >
                                <strong>x</strong>
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      <tr>
                        <td colSpan={4}>목표 학습 - {TR.목표학습} 시간</td>
                        <td> {TR.실제학습} 시간</td>
                        <td>{Math.round((TR.실제학습 - TR.목표학습) * 10) / 10}시간</td>
                      </tr>
                      <tr>
                        <td colSpan={6}>
                          {" "}
                          <button
                            className="btn btn-add program-add"
                            onClick={() => {
                              push_depth_one("학습", {
                                과목: "선택",
                                교재: "선택",
                                총교재량: "---",
                                최근진도: 0,
                                학습시간: "00:00",
                              });
                            }}
                          >
                            <strong>+</strong>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>

                <div className="trCard">
                  <Table striped hover size="sm" className="mt-3">
                    <thead>
                      <tr>
                        <th width="20%">프로그램</th>
                        <th width="20%">매니저</th>
                        <th width="15%">소요시간</th>
                        <th width="35%">상세내용</th>
                        <th width="10%"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {TR.프로그램.map(function (a, i) {
                        return (
                          <tr key={i}>
                            <td>
                              <Form.Select
                                size="sm"
                                value={a.프로그램분류}
                                onChange={(e) => {
                                  change_depth_three("프로그램", i, "프로그램분류", e.target.value);
                                }}
                              >
                                <option value="선택">선택</option>
                                {stuDB.프로그램분류.map(function (p, j) {
                                  return (
                                    <option value={p} key={j}>
                                      {p}
                                    </option>
                                  );
                                })}
                              </Form.Select>
                            </td>
                            <td>
                              <Form.Select
                                size="sm"
                                value={a.매니저}
                                onChange={(e) => {
                                  change_depth_three("프로그램", i, "매니저", e.target.value);
                                }}
                              >
                                <option value="선택">선택</option>
                                {managerList.map(function (b, j) {
                                  return (
                                    <option value={b} key={j}>
                                      {b}
                                    </option>
                                  );
                                })}
                              </Form.Select>
                            </td>
                            <td>
                              <TimePicker
                                className="timepicker"
                                locale="sv-sv"
                                value={a.소요시간}
                                openClockOnFocus={false}
                                clearIcon={null}
                                clockIcon={null}
                                onChange={(value) => {
                                  var newTR = JSON.parse(JSON.stringify(TR));
                                  newTR.프로그램[i].소요시간 = value;
                                  let 실제시간 = 0;
                                  let 실제분 = 0;
                                  newTR.프로그램.map(function (c, k) {
                                    if (c.소요시간) {
                                      실제시간 += parseInt(c.소요시간.split(":")[0]);
                                      실제분 += parseInt(c.소요시간.split(":")[1]);
                                    }
                                  });
                                  newTR.프로그램시간 = Math.round((실제시간 + 실제분 / 60) * 10) / 10;
                                  TR변경(newTR);
                                }}
                              ></TimePicker>
                            </td>
                            <td>
                              <textarea
                                className="textArea"
                                name=""
                                id=""
                                rows="3"
                                placeholder="프로그램 진행 내용"
                                value={a.상세내용}
                                onChange={(e) => {
                                  change_depth_three("프로그램", i, "상세내용", e.target.value);
                                }}
                              ></textarea>
                            </td>
                            <td>
                              <button
                                className="btn btn-delete"
                                onClick={() => {
                                  if (i > -1) {
                                    if (window.confirm("삭제하시겠습니까?")) {
                                      var newTR = JSON.parse(JSON.stringify(TR));
                                      newTR.프로그램.splice(i, 1);
                                      let 실제시간 = 0;
                                      let 실제분 = 0;
                                      newTR.프로그램.map(function (c, k) {
                                        if (c.소요시간) {
                                          실제시간 += parseInt(c.소요시간.split(":")[0]);
                                          실제분 += parseInt(c.소요시간.split(":")[1]);
                                        }
                                      });
                                      newTR.프로그램시간 = Math.round((실제시간 + 실제분 / 60) * 10) / 10;
                                      TR변경(newTR);
                                    }
                                  }
                                }}
                              >
                                <strong>x</strong>
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      <tr>
                        <td colSpan={5}>프로그램 진행 시간 : {TR.프로그램시간}시간</td>
                      </tr>
                      <tr>
                        <td colSpan={5}>
                          {" "}
                          <button
                            className="btn btn-add program-add"
                            onClick={() => {
                              push_depth_one("프로그램", {
                                프로그램분류: "선택",
                                매니저: "선택",
                                소요시간: "00:00",
                                상세내용: "",
                              });
                            }}
                          >
                            <strong>+</strong>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="trCard mt-3">
                <Form.Select
                  size="sm"
                  value={TR.결석사유}
                  onChange={(e) => {
                    push_depth_one("결석사유", e.target.value);
                  }}
                >
                  <option value="">미등원사유 선택</option>
                  <option value="등원일 아님">등원일 아님</option>
                  <option value="병가">병가</option>
                  <option value="무단">무단</option>
                  <option value="휴가">휴가</option>
                  <option value="구조적용중">"구조적용중"</option>
                  <option value="기타">기타</option>
                </Form.Select>
                <textarea
                  className="textArea mt-3"
                  placeholder="미등원 사유를 입력"
                  value={TR.결석상세내용}
                  onChange={(e) => {
                    push_depth_one("결석상세내용", e.target.value);
                  }}
                ></textarea>
              </div>
            )}
          </div>
        </div>
        <div className="col-xl-2 trCol">
          {TR.결석여부 === false ? (
            // <div className="trCard">
            //   <>
            //     <p className="fw-bold mt-3 mb-3">
            //       <strong>[ 학습태도 ]</strong>
            //     </p>
            //     {TR.학습태도.map((prob, i) => (
            //       <div key={`study-${prob.분류}`} className="mb-1 mt-1 checkBox">
            //         <Form.Check
            //           checked={prob.문제여부}
            //           className="border-bottom"
            //           type="checkbox"
            //           id={`study-${prob.분류}`}
            //           label={`${prob.분류}`}
            //           onChange={(e) => {
            //             change_depth_three("학습태도", i, "문제여부", e.target.checked);
            //           }}
            //         />
            //       </div>
            //     ))}
            //   </>
            // </div>
            null
          ) : null}
          <div className="trCard">
            <p className="fw-bold mt-3 mb-3">
              <strong>[ 문제행동 ]</strong>
            </p>
            {TR.문제행동.map((prob, i) => (
              <div key={`study-${prob.분류}`} className="mb-1 mt-1 checkBox">
                <Form.Check
                  checked={prob.문제여부}
                  className="border-bottom"
                  type="checkbox"
                  id={`study-${prob.분류}`}
                  label={`${prob.분류}`}
                  onChange={(e) => {
                    change_depth_three("문제행동", i, "문제여부", e.target.checked);
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="col-xl-4 trCol">
          <div className="trCard">
            <h5 className="fw-bold mt-3 mb-3">
              <strong>[ 큐브책 체크리스트 ]</strong>
            </h5>
            {TR.큐브책.map((a, i) => (
              <div key={`cube-${i}`} className="mb-1 mt-1 checkBox">
                <Form.Check
                  className="border-bottom tmp2"
                  checked={a.완료여부}
                  type="checkbox"
                  id={`cube-${i}`}
                  label={`${a.구분} - ${a.할일}`}
                  onChange={(e) => {
                    change_depth_three("큐브책", i, "완료여부", e.target.checked);
                  }}
                />
              </div>
            ))}

            <p style={{ fontSize: "17px" }} className="mt-2 btn-add program-add">
              큐브책 달성률 : {cuberaito}% / 달성 실패 : {failCnt}개
            </p>

            <h5 className="fw-bold mt-5 mb-3">
              <strong>[ 매니저 피드백 ]</strong>
            </h5>
            <textarea
              rows="10"
              className="textArea"
              value={TR.매니저피드백}
              onChange={(e) => {
                change_depth_one("매니저피드백", e.target.value);
              }}
            ></textarea>
          </div>
          <Button
            variant="danger"
            className="btn-TRcommit btn-edit"
            onClick={() => {
              console.log(TR);
              if (입력확인()) {
                if (window.confirm(`수정된 ${TR.이름}학생의 ${TR.날짜} 일간하루를 저장하시겠습니까?`)) {
                  axios
                    .put("/api/TR/edit", TR)
                    .then(function (result) {
                      if (result.data === true) {
                        window.alert("저장되었습니다");
                        history.push("/studentList");
                      } else if (result.data === "로그인필요") {
                        window.alert("로그인이 필요합니다.");
                        return history.push("/");
                      } else {
                        console.log(result.data);
                        window.alert(result.data);
                      }
                    })
                    .catch(function (err) {
                      console.log("수정 실패 : ", err);
                      window.alert(err);
                    });
                }
              }
            }}
          >
            일간하루 수정
          </Button>

          <Button
            variant="danger"
            className="btn-TRcommit btn-cancel"
            onClick={() => {
              if (window.confirm(`현재 작성중인 일간하루를 정말 삭제하시겠습니까?`)) {
                axios
                  .delete(`/api/TR/delete/${TR._id}`)
                  .then(function (result) {
                    if (result.data === true) {
                      window.alert("삭제되었습니다");
                    } else {
                      window.alert(result.data);
                    }
                  })
                  .catch(function (err) {
                    window.alert(err, "삭제에 실패했습니다 개발/데이터 팀에게 문의해주세요");
                  })
                  .then(function () {
                    history.push("/studentList");
                  });
              }
            }}
          >
            <strong>일간하루 삭제</strong>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TRedit;
