import { Form, Button, Card, ListGroup, Table, Modal, Row, Col } from "react-bootstrap";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import TimePicker from "react-time-picker";
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";
import "./Chart.scss";

function Chart(props) {
  let history = useHistory();

  const managerList = props.managerList;
  const [stuDB, setstuDB] = useState(props.stuDB);
  const [data, setdata] = useState(props.trList);

  const [startday, setstartday] = useState(props.trList[props.trList.length - 1].날짜);
  const [lastday, setlastday] = useState(props.trList[0].날짜);

  useEffect(() => {
    var newdata = [...props.trList];

    newdata = newdata.filter((data) => {
      return new Date(data.날짜) >= new Date(startday) && new Date(data.날짜) <= new Date(lastday);
    });

    newdata.sort(function (a, b) {
      return +(new Date(a.날짜) > new Date(b.날짜)) - 0.5;
    });

    setdata(newdata);
  }, [startday, lastday]);
  return (
    <div>
      <Card className="dateselctbox">
        <Form.Control
          type="date"
          value={startday}
          onChange={(e) => {
            setstartday(e.target.value);
          }}
        />
        <Form.Control
          type="date"
          value={lastday}
          onChange={(e) => {
            setlastday(e.target.value);
          }}
        />
      </Card>
      <div>
        <LineChart className="graph" width={1000} height={500} data={data}>
          <Line type="monotone" dataKey="실제학습" stroke="#8884d8" />
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="날짜" />
          <YAxis />
        </LineChart>
      </div>
    </div>
  );
}

export default Chart;
