const { encPassword, decPassword } = require("../config/hash");
const chatSchema = require("../model/chat");
const userSchema = require("../model/user");

class chatController {
    chatMessage = async (socket, data) => {
        const id = socket.userId;
        const { id: recieverID, message } = data;

        try {
            const [sendUser, recieveUser] = await Promise.all([
                userSchema.findById(id),
                userSchema.findById(recieverID),
            ]);

            const encMessage = await encPassword(message, process.env.CHAT_KEY);

            let chatSender = await chatSchema.findOne({ senderID: id });
            if (!chatSender) {
                chatSender = new chatSchema({
                    senderID: id,
                    senderEmail: sendUser.email,
                    senderRole: sendUser.role,
                    totalMessage: [],
                });
            }

            let chatReceiver = await chatSchema.findOne({ senderID: recieverID });
            if (!chatReceiver) {
                chatReceiver = new chatSchema({
                    senderID: recieverID,
                    senderEmail: recieveUser.email,
                    senderRole: recieveUser.role,
                    totalMessage: [],
                });
            }

            const updateChat = (chatDoc, matchID, messageKey, messageValue) => {
                let matchData = chatDoc.totalMessage.find((item) =>
                    item.recieverData.some((data) => data.recieverID.toString() === matchID.toString())
                );

                if (matchData) {
                    matchData.recieverData.push({
                        recieverID: matchID,
                        [messageKey]: messageValue
                    });
                } else {
                    chatDoc.totalMessage.push({
                        recieverData: [
                            {
                                recieverID: matchID,
                                [messageKey]: messageValue
                            }
                        ]
                    });
                }
            };

            updateChat(chatSender, recieverID, "senderMessage", encMessage);
            updateChat(chatReceiver, id, "recieverMessage", encMessage);

            await Promise.all([chatSender.save(), chatReceiver.save()]);

            socket.emit("sendResponse", { status: true, message: "Message Saved" });
        } catch (error) {
            console.error("Chat message error:", error);
            socket.emit("sendResponse", { status: false, message: "Internal Error in Message" });
        }
    };

    showChatData = async (socket, data) => {
        const id = socket.userId;
        const { id: recieverID } = data;

        try {
            const chatData = await chatSchema.findOne({ senderID: id });

            if (!chatData) {
                return socket.emit("getMessageResponse", { status: false, message: "No messages found", data: [] });
            }

            const message = chatData.totalMessage.find((data) =>
                data.recieverData.some(rd => rd.recieverID.toString() === recieverID.toString())
            );

            if (!message) {
                return socket.emit("getMessageResponse", { status: false, message: "No messages found for this user", data: [] });
            }

            const filterMessage = message.recieverData.filter(
                item => item.recieverID.toString() === recieverID.toString()
            );

            const decrypt = await Promise.all(
                filterMessage.map(async item => {
                    let decrypted = {
                        _id: item._id,
                        recieverID: item.recieverID,
                        createdAt: item.createdAt
                    };

                    if (item.senderMessage) {
                        decrypted.senderMessage = await decPassword(item.senderMessage, process.env.CHAT_KEY);
                    }

                    if (item.recieverMessage) {
                        decrypted.recieverMessage = await decPassword(item.recieverMessage, process.env.CHAT_KEY);
                    }

                    return decrypted;
                })
            );
            // decrypt.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            socket.emit("getMessageResponse", { status: true, message: "Message data", data: decrypt, recieverId: message._id });

        } catch (error) {
            console.error('error----', error);
            socket.emit("getMessageResponse", { status: false, message: "Internal Error in get Message" });
        }
    };


    deleteChatId = async (socket, data) => {
        const id = socket.userId;
        const { id: chatId, type } = data;

        try {
            let chatData = await chatSchema.findOne({ senderID: id });
            if (!chatData) {
                return socket.emit("deleteMessageResponse", { status: false, message: "No messages to delete" });
            }

            if (type === "deleteId") {
                await Promise.all(
                    chatData.totalMessage.map((data) => {
                        data.recieverData.forEach(async (deleteData) => {
                            if (deleteData._id.toString() === chatId) {
                                await chatSchema.updateOne(
                                    { "totalMessage.recieverData._id": chatId },
                                    { $pull: { "totalMessage.$[].recieverData": { _id: chatId } } }
                                );
                            }
                        });
                    })
                );
            } else if (type === "deleteAll") {
                await Promise.all(
                    chatData.totalMessage.map(async (data) => {
                        if (data._id.toString() === chatId) {
                            await chatSchema.updateOne(
                                { "totalMessage._id": chatId },
                                { $pull: { totalMessage: { _id: chatId } } }
                            );
                        }
                    })
                );
            } else if (type === "deleteIdPermanent") {
                let recieverData = await chatSchema.findOne({ senderID: chatId });
                
                    console.log('chatData---', chatData)
                    console.log('recieverData---', recieverData)

                const deletePermanent = async (messageData, parentId) => {
                    const updateData = [];
                    console.log('messageData---', messageData)
                    console.log('parentId---', parentId)

                    messageData.totalMessage.forEach((data) => {
                        data.recieverData.forEach((deleteID) => {
                            if (deleteID._id.toString() === parentId.toString()) {
                                updateData.push(
                                    chatSchema.updateOne(
                                        { "totalMessage.recieverData._id": parentId },
                                        { $pull: { "totalMessage.$[].recieverData": { _id: parentId } } }
                                    )
                                );
                            }
                        });
                    });
                    await Promise.all(updateData);
                };

                await Promise.all([
                    deletePermanent(chatData, id),
                    deletePermanent(recieverData, chatId)
                ]);
            }

            socket.emit("deleteMessageResponse", { status: true, message: "Message Deleted" });
        } catch (error) {
            console.log('error---', error);
            socket.emit("deleteMessageResponse", { status: false, message: "Internal Error in Delete Message" });
        }
    };
}

module.exports = new chatController;