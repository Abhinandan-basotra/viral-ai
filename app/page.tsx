"use client";
import Image from "next/image";

export default async function Home() {
  const handle = async () => {
    try {
      const res =  await fetch('/api/v1/video/generateScript', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          idea: "The Future of AI",
          generateScript: true,
          script: ""
        })
      })
      const data = await res.json();
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <>
    <button onClick={handle}>
      CLick Me
    </button>
    </>
  );
}
