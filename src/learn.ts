import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { v4 as uuidv4 } from "uuid";
import { streamText } from "hono/streaming";

const app = new Hono();

interface videoInterface {
  _id: string;
  title: string;
  description: string;
}

let videos: videoInterface[] = [];

// Create a new video
app.post("/videos", async (c) => {
  const body: { title: string; description: string } = await c.req.json();
  console.log("Request body = ", body);

  const newVideo: videoInterface = {
    _id: uuidv4(),
    title: body.title,
    description: body.description,
  };

  videos.push(newVideo);

  return c.json({ success: true, newVideo });
});

// GET all videos
app.get("/videos", (c) => {
  return c.json({ success: true, videoCount: videos.length, videos });
});

// app.get("/test", (c) => {
//   return c.text("Test");
// });

// GET all videos (by STREAMING)
app.get("/streamVideos", (c) => {
  return streamText(c, async (stream) => {
    for (let video of videos) {
      await stream.writeln(JSON.stringify(video));
      await stream.sleep(1000);
    }
  });
});

// GET a single video
app.get("/videos/:videoID", async (c) => {
  const videoID = c.req.param("videoID");
  const video = videos.find((video) => video._id === videoID);

  if (!video) return c.json({ success: false, message: "Video Not Found" });

  return c.json({ success: true, video });
});

// Delete a video
app.delete("/videos/:videoID", async (c) => {
  // get video id
  const videoID = c.req.param("videoID");

  videos = videos.filter((video) => video._id !== videoID);

  return c.json({ success: true, count: videos.length, videos });
});

// Update a video
app.put("/videos/:videoID", async (c) => {
  const videoID = c.req.param("videoID");
  const { title, description } = await c.req.json();

  const index = videos.findIndex((video) => video._id === videoID);
  if (index === -1) {
    return c.json({ success: false, message: "Video Not Found" });
  }

  videos[index] = { ...videos[index], title, description };
  return c.json({ success: true });
});

// firing up our server
serve(
  {
    fetch: app.fetch,
    port: 5001,
  },
  (info) => {
    console.log(`Server running on Port ${info.port}`);
  }
);
