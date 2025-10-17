const chatController = require("../controller/chatController");

module.exports = (io, socket) => {
  socket.on("sendMessage", (data) => {
    chatController.chatMessage(socket, data);
  });

  socket.on("getMessageData", (data) => {
    chatController.showChatData(socket, data);
  });

  socket.on("deleteMessage", (data) => {
    chatController.deleteChatId(socket, data);
  });
};
