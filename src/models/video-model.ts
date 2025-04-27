import mongoose from "mongoose";

export interface VideosSchema {
  title: string;
  description: string;
  channelName: string;
}

const videoSchema = new mongoose.Schema<VideosSchema>({
  title: {
    type: String,
    required: true,
  },
  description: String,
  channelName: {
    type: String,
    required: true,
  },
});

const Video = mongoose.models.video || mongoose.model("video", videoSchema);

export default Video;
