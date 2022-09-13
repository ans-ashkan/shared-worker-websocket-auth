const express = require("express");
var cookieParser = require("cookie-parser");
const path = require("path");
const WebSocket = require("ws");
const exp = require("constants");
const app = express();
app.use(cookieParser());

// Use the public directory for static file requests
app.use(express.static("public"));

app.get("/get", function(req, res) {
  console.log("Request Cookies: ", req.cookies);
  res.send(req.cookies);
});

app.get("/set", function(req, res) {
  res.cookie("token", "abc", {
    httpOnly: true,
    maxAge: 1000 * 60 * 15,
  });
  res.sendStatus(200);
});

app.get("/clear", function(req, res) {
  res.clearCookie("token");
  res.sendStatus(200);
});

// Start our WS server at 3001
const wss = new WebSocket.Server({ port: 3001 });

wss.on("connection", (ws) => {
  console.log("A new client connected!");
  ws.on("message", (data) => {
    console.log(`Message from client: ${data}`);
    const parsed = JSON.parse(data);
    ws.send(
      JSON.stringify({
        ...parsed.data,
        messageFromServer: `Hello tab id: ${parsed.data.from}`,
      })
    );
  });
  ws.on("close", () => {
    console.log("Sad to see you go :(");
  });

  setTimeout(
    () =>
      ws.send(JSON.stringify({ broadcast: "A broadcast for all clients!" })),
    15000
  );
});

// Listen for requests for static pages at 3000
const server = app.listen(3000, function() {
  console.log("The server is running on http://localhost:" + 3000);
});
