"use client";

import React, { useEffect, useState } from "react";
import { Button, Table } from "antd";
import { io } from "socket.io-client";
import axios from "axios";

interface tableBody {
  action: number;
  close_price: number;
  comment: String;
  key: any;
  open_price: number;
  open_time: number;
  position_id: number;
  profit: number;
  sl: number;
  swap: number;
  symbol: String;
  tp: number;
  volume: number;
}

interface postionDetailsInterface {
  header: { dataIndex: String; key: String; title: String }[] | any;
  body: tableBody[];
}

const Home = () => {
  const socket = io("wss://quotes.equidity.io:443", {
    transports: ["websocket"],
    autoConnect: false,
  });

  const [positionsDetails, setPositionDetails] =
    useState<postionDetailsInterface>({
      header: [],
      body: [],
    });

  const [channelSubscribed, setChannelSubscribed] = useState<boolean>(false);

  const updatePositionDetailsToSTate = (data: any): void => {
    let posHeaders = [];
    for (let keyName in data[0]) {
      posHeaders.push({
        title: keyName[0].toUpperCase() + keyName.slice(1),
        dataIndex: keyName,
        key: keyName,
      });
    }

    let posBody = data.map((item: any, index: number) => {
      return { ...item, key: (index + 1).toString() };
    });

    setPositionDetails({
      header: [...posHeaders],
      body: [...posBody],
    });
  };

  const feedScubscribeHandler = (): void => {
    // socket.emit("subscribe", "feeds");
    let obj: tableBody = {
      key: (positionsDetails.body.length + 1).toString(),
      action: 0,
      close_price: 1.07859,
      comment: "",
      open_price: 1.07346,
      open_time: 1705440482,
      position_id: 95715668,
      profit: 3.14,
      sl: 0,
      swap: -0.21,
      symbol: "AUDNZD",
      tp: 0,
      volume: 0.01,
    };
    setPositionDetails({
      ...positionsDetails,
      body: [...positionsDetails.body, { ...obj }],
    });
  };

  let getDataFromRoute = async () => {
    let options = {
      url: "https://trading-app-task.vercel.app/api/user",
      method: "GET",
    };
    try {
      let response = await axios(options);
      console.log("re", response);
      if (response.data === "login error") {
        alert("login error");
        return;
      }

      if (response.data === "position api error") {
        alert("position api error");
        return;
      }

      if (
        response.status == 200 &&
        response.data !== "login error" &&
        response.data !== "position api error"
      ) {
        localStorage.setItem(
          "postionsArrDetails",
          JSON.stringify(response.data)
        );
        updatePositionDetailsToSTate(response.data);
      }
    } catch (err) {
      console.log("useffect error ", err);
    }
  };

  useEffect(() => {
    let postionsArrDetails = localStorage.getItem("postionsArrDetails");
    if (postionsArrDetails == null) {
      getDataFromRoute();
    } else {
      updatePositionDetailsToSTate(JSON.parse(postionsArrDetails));
    }
  }, []);


  useEffect(() => {
    // socket.connect()
    // socket.on("connect_error", (err) => {
    //   console.log("error socket", err)
    // })
    // console.log("socket --", socket)
  }, [])

  return (
    <div className="App">
      {positionsDetails.body.length == 0 ? (
        <div>Loading...</div>
      ) : (
        <div>
          <Table
            dataSource={positionsDetails.body}
            columns={positionsDetails.header}
          />
          <div>
            {channelSubscribed === false ? (
              <Button
                type="primary"
                size="large"
                onClick={feedScubscribeHandler}
              >
                Subscribe to feed
              </Button>
            ) : (
              <Button type="primary" size="large">
                Feed channel Subscribed
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
