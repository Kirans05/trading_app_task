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
  const socket = io("wss://quotes.equidity.io:3000", {
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
    socket.emit("subscribe", "feeds", (data:any) => {
      console.log("any data", data)
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
        // localStorage.setItem(
        //   "postionsArrDetails",
        //   JSON.stringify(response.data)
        // );
        updatePositionDetailsToSTate(response.data);
      }
    } catch (err) {
      console.log("useffect error ", err);
    }
  };

  useEffect(() => {
    // let postionsArrDetails = localStorage.getItem("postionsArrDetails");
    // if (postionsArrDetails == null) {
      getDataFromRoute();
    // } else {
    //   updatePositionDetailsToSTate(JSON.parse(postionsArrDetails));
    // }
  }, []);

  useEffect(() => {
    socket.connect();
  }, []);


  useEffect(() => {
    socket.onAny((eventName, ...args) => {
      console.log(`Received event: ${eventName}`, args);
    });
  },[socket])

  return (
    <div className="App">
      {positionsDetails.body.length == 0 ? (
        <div>Open Positions Loading...</div>
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
