const { response } = require("express");
const port = 8080;
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const users = [];

const logger = function (request, response, next) {
  if(request.method === 'GET'){
    response.end("You are using wrong method!");
  }
  console.log("<<<",request.body);
  next();
};
const readHeader = function (request, response, next) {
  if (request.headers.iknowyoursecret == "TheOwlsAreNotWhatTheySeem") {
    const { username } = request.headers;
    const { remoteAddress } = request.connection;
    console.log(
      `Hey ${username} 
      your ip:  ${remoteAddress}.`
    );
    next();
  } else {
    response.end("Where is right header? Goodbye");
  }
};

mongoose.connect("mongodb://localhost:27017");
const UserSchema = mongoose.Schema({ name: String, ip: String });
const User = mongoose.model("Users", UserSchema);

const writeDb = function (req, res, next) {
  const { username } = req.headers;
  const { remoteAddress } = req.connection;
  const user = new User({ name: username, ip: remoteAddress });
  user.save((error, savedUser) => {
    if (error) {
      throw error;
    }
    console.log(
      `I know you ${savedUser.name} , your ip adress  ${savedUser.ip} `
    );
    next();
  });
};

app.use(logger, readHeader, writeDb);

app.get("/", function (request,response) {
  response.send("Assertion to db");
});
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
  User.find({}, (err, users) => {
    console.log("Users at moment: ", users.map((u) => u.name).join(" "));
    if (err) {
      return console.log('Something bad happened', err)
  }
  });
});