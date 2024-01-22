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
  const socket = io("wss://quotes.equidity.io:3000");

  const [positionsDetails, setPositionDetails] =
    useState<postionDetailsInterface>({
      header: [],
      body: [],
    });

  const [channelSubscribed, setChannelSubscribed] = useState<boolean>(false);

  const [positionsIndex, setPositionsIndex] = useState(null);

  const updatePositionDetailsToSTate = (data: any): void => {
    let posHeaders = [];
    for (let keyName in data[0]) {
      posHeaders.push({
        title: keyName[0].toUpperCase() + keyName.slice(1),
        dataIndex: keyName,
        key: keyName,
      });
    }

    let symbolObj: any = {};

    let posBody = data.map((item: any, index: number) => {
      if (symbolObj[item.symbol]) {
        symbolObj[item.symbol].push(index);
      } else {
        symbolObj[item.symbol] = [index];
      }
      return { ...item, key: (index + 1).toString() };
    });

    setPositionsIndex({ ...symbolObj });

    setPositionDetails({
      header: [...posHeaders],
      body: [...posBody],
    });
  };

  const feedScubscribeHandler = (): void => {
    socket.emit("subscribe", "feeds");
    setChannelSubscribed(true);
  };

  let getDataFromRoute = async () => {
    let options = {
      url: "https://trading-app-task.vercel.app/api/user",
      method: "GET",
    };
    try {
      let response = await axios(options);
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
        updatePositionDetailsToSTate(response.data);
      }
    } catch (err) {
      console.log("useffect error ", err);
    }
  };

  useEffect(() => {
    getDataFromRoute();
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected");
    });

    socket.on("message", (data: any) => {
      if (positionsIndex != null) {
        let arr: any = positionsIndex[data.symbol];
        if (arr != undefined) {
          let newPositionsArr = [...positionsDetails.body];
          if (arr.length == 1) {
            newPositionsArr[arr[0]] = {
              ...newPositionsArr[arr[0]],
              open_price: data.bid,
              close_price: data.ask,
            };
          } else if (arr.length > 1) {
            newPositionsArr = newPositionsArr.map((item) => {
              if (item.symbol == data.symbol) {
                return { ...item, open_price: data.bid, close_price: data.ask };
              }
              return item;
            });
          }
          setPositionDetails({
            ...positionsDetails,
            body: [...newPositionsArr],
          });
        }
      }
    });
  }, [socket]);

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
                onClick={() => feedScubscribeHandler()}
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
