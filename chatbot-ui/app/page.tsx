"use client";

import { useState } from "react";
import ChatBox from "@/components/ChatBox";

export default function Home() {
  return (
    <div className="h-screen flex justify-center items-center w-full bg-[#1c1c1c] relative">
      <h1 className="text-3xl text-[#c15f3c] fixed left-0 top-0 w-full p-5 ">FlowGPT</h1>
      <ChatBox />
    </div>
  );
}