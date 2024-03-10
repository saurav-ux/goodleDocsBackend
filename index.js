import express from "express";
import { Server } from "socket.io";
import "./Database/connection.js";
import { getDocument, updataDocument } from "./controller/docController.js";
import cors from 'cors'
const app = express();
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
app.use(cors());
app.use(
  cors({
    origin: ["https://deploy-mern-1whq.vercel.app"],
    methods: ["POST", "GET", "PATCH", "DELETE"],
    credentials: true,
  })
);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET", "PATCH", "DELETE"],
  },
});

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const document = await getDocument(documentId);
    socket.join(documentId);
    socket.emit("load-content", document.data);
    socket.on("save-document", async (data) => {
      await updataDocument(documentId, data);
    });
  });

  socket.on("save-change", (data, documentId) => {
    socket.broadcast.to(documentId).emit("receive-changes", data);
  });

  console.log("connected");
});
