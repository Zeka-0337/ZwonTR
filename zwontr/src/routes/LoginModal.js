import "./FirstPage.scss";
import { Form, Button } from "react-bootstrap";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useState, useEffect } from "react";
import axios from "axios";

function Loginpage() {
  let history = useHistory();
  let [loginModal, loginModalChange] = useState(false);
  useEffect(() => {
    let timer = setTimeout(() => {
      loginModalChange(true);
    }, 250);
  }, []);

  const [inputID, setinputID] = useState("");
  const [inputPW, setinputPW] = useState("");

  async function loginRequest() {
    const request = await axios
      .post("/api/login", { id: inputID, pw: inputPW })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        return console.log(err);
      });
    return request;
  }

  async function loginClick() {
    const result = await loginRequest();
    if (result === false) {
      return window.alert("로그인에 실패했습니다. 데이터 / 개발 팀에 문의해주세요");
    }
    if (result.user === true) {
      return history.push("/studentList");
    } else {
      window.alert(result.message);
    }
  }

  return (
    <div className={loginModal === true ? "loginModal loginModal-active" : "loginModal"}>
      <Form>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>ID</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter ID"
            onChange={(e) => {
              setinputID(e.target.value);
            }}
            onKeyPress={(e) => {
              if (e.key == "Enter") {
                loginClick();
              }
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter Password"
            onChange={(e) => {
              setinputPW(e.target.value);
            }}
            onKeyPress={(e) => {
              if (e.key == "Enter") {
                loginClick();
              }
            }}
          />
        </Form.Group>
        <Button
          variant="dark"
          type="button"
          className="stuButton"
          onClick={() => {
            loginClick();
          }}
        >
          로그인
        </Button>
      </Form>
    </div>
  );
}

export default Loginpage;
