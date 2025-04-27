import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { stream, streamText } from "hono/streaming";
import connectDb from "./utils/connectDB.js";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import Video, { type VideosSchema } from "./models/video-model.js";

const app = new Hono();

// middlewares
app.use(secureHeaders());
app.use(logger());

const initializeApp = async () => {
  try {
    // connect to DB
    await connectDb();
  } catch (error) {
    process.exit(1);
  }
};

initializeApp();

// GETTING ALL VIDEOS
app.get("/videos", async (c) => {
  try {
    const videos = await Video.find();
    return c.json({ success: true, count: videos.length, videos });
  } catch (error) {
    console.log("Error while fetching videos. ", error);
    return c.json({
      success: false,
      message: "An Error occured while fetching videos.",
    });
  }
});

// CREATING A VIDEO
app.post("/videos", async (c) => {
  try {
    const { title, description, channelName } =
      await c.req.json<VideosSchema>();

    await Video.create({
      title,
      description,
      channelName,
    });

    return c.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return c.json({ success: false, message });
  }
});

// GET A PARTICULAR VIDEO DETAILS
app.get("/videos/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const video = await Video.findById(id);

    console.log(typeof video);

    if (!video) {
      return c.json({ success: false, msg: "Video Not Found" }, 404);
    }

    return c.json({ success: true, video });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Something went wrong";
    return c.json({ success: false, msg }, 500);
  }
});

// GET A PARTICULAR VIDEO DETAILS BY STREAMING
app.get("/stream/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const video = await Video.findById(id);

    if (!video) {
      return c.json({ success: false, message: "No such video Not Found!" });
    }

    return streamText(c, async (stream) => {
      stream.onAbort(() => {
        console.log("aborted!");
      });

      for (let ch of video.description) {
        await stream.write(ch);
        await stream.sleep(50);
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return c.json({ success: false, message });
  }
});

// GET ALL VIDEOS BY STREAMING
app.get("/stream-videos", (c) => {
  return stream(c, async (stream) => {
    const videos = await Video.find();

    for (let video of videos) {
      await stream.writeln(JSON.stringify(video));
      await stream.sleep(1500);
    }
  });
});

// UPDATE A VIDEO
app.put("/videos/:id", async (c) => {
  try {
    const { title, description, channelName }: VideosSchema =
      await c.req.json();
    const id = c.req.param("id");

    const video = await Video.findById(id);

    if (!video)
      return c.json({ success: false, msg: "No such video found!" }, 404);

    const updatedVideo = await Video.findByIdAndUpdate(
      id,
      {
        title,
        description,
        channelName,
      },
      { new: true }
    );

    return c.json({ success: true, updatedVideo });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return c.json({ success: false, message });
  }
});

// DELETING A VIDEO
app.delete("/videos/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const deletedDoc = await Video.findByIdAndDelete(id);

    if (!deletedDoc) {
      throw new Error("Video not found!");
    }

    return c.json({ success: true, deletedDoc });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return c.json({ success: false, message });
  }
});

// handling errors
app.onError((err, c) => {
  console.error(`${err}`);
  return c.text("App initialization error", 500);
});

serve(
  {
    fetch: app.fetch,
    port: 5001,
  },
  (info) => {
    console.log(`Server is running on Port ${info.port}`);
  }
);
