import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const loginHandler = async () => {
  let options = {
    url: "http://173.249.49.52:18080/login",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "bearer abcd",
    },
    data: {
      login: 353942,
      password: "Pass@1234",
    },
  };

  try {
    let response = await axios(options);
    if (response.status === 200) {
      return getOpenPositions(response.data.token);
    }
  } catch (error) {
    console.log("login error--", error);
    return { error: "login error" };
  }
};

const getOpenPositions = async (token: String) => {
  let options = {
    url: "http://173.249.49.52:18080/positionget",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "bearer abcd",
    },
    data: {
      token,
    },
  };
  try {
    let positionResponse = await axios(options);
    if (positionResponse.status === 200) {
      return positionResponse.data;
    }
  } catch (error) {
    console.log("positions error", error);
    return { error: "position api error" };
  }
};

export const GET = async (request: NextRequest) => {
  try {
    let loginResponse = await loginHandler();
    if (loginResponse?.error === "login error") {
      return NextResponse.json("login error");
    }

    if (loginResponse?.error === "position api error") {
      return NextResponse.json("position api error");
    }

    return NextResponse.json(loginResponse);
  } catch (err) {
    console.log("error", err);
    return NextResponse.json("error");
  }
};
