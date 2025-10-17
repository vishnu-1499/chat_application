import React, { useEffect, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useSocket } from '../context/SocketProvider';
import { Api } from '../config/Api';
import moment from 'moment';
import { MdDelete } from "react-icons/md";
import { GrEmoji } from "react-icons/gr";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface Message {
    _id: string;
    senderMessage?: string;
    recieverMessage?: string;
    createdAt: string;
}

interface User {
    _id: string;
    name: string
}

interface ResponseData {
    status: boolean;
    message: string;
    data: User[];
}

function UserList() {
    const { socket } = useSocket();
    const [messages, setMessages] = useState<Message[]>([]);
    const [userData, setUserData] = useState<User[]>([]);
    const [userId, setUserId] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    const [sendMessage, setSendMessage] = useState<string>("");
    const [deleteAllMsg, setDeleteAllMsg] = useState<string>("");
    const [showModel, setShowModel] = useState<boolean>(false);
    const [confirmDelete, setConfirmDelete] = useState<any>({ id: "", type: "" });
    const [showEmoji, setshowEmoji] = useState<boolean>(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    const handleModelOpen = (id: string, type: string) => {
        setShowModel(true)
        setConfirmDelete((prev: any) => ({ ...prev, id, type }))
    }

    const getUserData = async () => {
        try {
            const axiosResponse = await Api({
                method: 'GET',
                url: '/get-Data',
            });

            const response: ResponseData = axiosResponse.data;
            if (response.status) {
                setUserData(response.data);
            } else {
                setUserData([]);
                toast.error(response.message || 'No data found');
            }
        } catch (error) {
            toast.error('Internal error..');
        }
    };

    useEffect(() => {
        getUserData();
    }, []);

    useEffect(() => {
        if (!socket || !userId) return;

        console.log('userId---', userId)
        socket.emit('getMessageData', { id: userId });

        socket.on('getMessageResponse', (response) => {
            if (response.status) {
                setMessages(response.data || []);
                setDeleteAllMsg(response.recieverId)
            } else {
                setMessages([]);
                setDeleteAllMsg("")
            }
        });

        return () => {
            socket.off('getMessageResponse');
        };
    }, [socket, userId]);

    const handleSubmit = async () => {
        try {
            if (!socket || !sendMessage) return;

            socket.emit('sendMessage', { id: userId, message: sendMessage });

            socket.on('sendResponse', (response) => {
                if (response.status) {
                    setSendMessage("")
                    setshowEmoji(false)
                    socket.emit('getMessageData', { id: userId });
                } else {
                    console.log("cant send the message");
                    setSendMessage("")
                    setshowEmoji(false)
                }
            });

            return () => {
                socket.off('sendResponse');
            }
        } catch (error) {
            toast.error('Internal error..');
        };
    }

    const handleDelete = (id: string, type: string) => {
        try {
            if (!socket || !id || !type) return

            socket.emit("deleteMessage", { id, type });

            socket.on("deleteMessageResponse", (response) => {
                if (response.status) {
                    setShowModel(false)
                    socket.emit('getMessageData', { id: userId });
                } else {
                    console.log("Cant delete a message");
                }
            })

            return (() => {
                socket.off("deleteMessageResponse");
            })
        } catch (error) {
            toast.error('Internal error..');
        }
    }

    const handleClose = () => {
        setShowModel(false)
        setConfirmDelete((prev: any) => ({ ...prev, id: "", type: "" }))
    }

    const handleEmoji = (emojiData: EmojiClickData) => {
        setSendMessage(prev => prev + emojiData.emoji);
    };

    const handleToggleEmoji = () => {
        setshowEmoji(true);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
            setshowEmoji(false);
        }
    };

    useEffect(() => {
        if (showEmoji) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmoji]);

    return (
        <div className="container-fluid vh-100 bg-light p-0">
            <ToastContainer />

            <div className="row h-100 m-0">
                <div className="col-12 col-md-4 col-lg-3 border-end bg-white p-0">
                    <div className="d-flex justify-content-between align-items-center p-3 bg-success text-white">
                        <h5 className="mb-0">Chats</h5>
                        <i className="bi bi-three-dots-vertical"></i>
                    </div>

                    <div className="overflow-auto" style={{ height: 'calc(100vh - 60px)' }}>
                        {userData.length > 0 ? (
                            userData.map((user) => (
                                <div
                                    key={user._id}
                                    className="chat-item d-flex align-items-center px-3 py-2 border-bottom"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => { setUserId(user._id); setUserName(user.name) }}
                                >
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between">
                                            <h6 className="mb-0 text-capitalize">{user.name}</h6>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-3 text-center text-muted">No users found.</div>
                        )}
                    </div>
                </div>

                <div className="col d-flex flex-column p-0">
                    <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
                        <h6 className="mb-0 text-capitalize">{userName || "Select Chat"}</h6>
                        <i className="bi bi-info-circle"></i>
                        {userName ?
                            messages.length > 0 ?
                                <MdDelete size={20} style={{ cursor: "pointer" }} onClick={() => handleModelOpen(deleteAllMsg, "deleteAll")} />
                                : "" : ""}

                    </div>

                    <div className="flex-grow-1 overflow-auto px-3 py-2 bg-light">
                        {messages.length === 0 ? (
                            <div className="text-center text-muted mt-5">
                                <h4>{userId ? 'No messages yet.' : 'Select a chat to start messaging'}</h4>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <>
                                    <div
                                        key={index}
                                        className={`d-flex mb-2 ${msg.senderMessage ? 'justify-content-end' : 'justify-content-start'}`}
                                    >
                                        <div
                                            className={`p-2 rounded shadow-sm ${msg.senderMessage ? 'bg-success text-white' : 'bg-white text-dark'}`}
                                            style={{ maxWidth: '75%' }}
                                        >
                                            <p className="mb-0">{msg.senderMessage || msg.recieverMessage}</p>
                                            <small
                                                className={`d-block text-end text-muted `}
                                                style={{ fontSize: '0.7rem' }}
                                            >
                                                {moment(msg.createdAt).format('LT')}
                                            </small>
                                        </div>
                                    </div>
                                    <div className={`d-flex mb-2 staticBackdrop ${msg.senderMessage ? 'justify-content-end' : 'justify-content-start'}`}>
                                        <MdDelete size={14} style={{ cursor: "pointer" }} onClick={() => handleModelOpen(msg._id, "deleteId")} />
                                    </div>
                                </>
                            ))
                        )}
                    </div>

                    <div className="position-relative">
                        {showEmoji && (
                            <div style={{ position: 'absolute', bottom: '60px', zIndex: 1000 }}>
                                <EmojiPicker onEmojiClick={handleEmoji} />
                            </div>
                        )}

                        <div className="d-flex align-items-center p-3 border-top bg-white">
                            <GrEmoji
                                size={20}
                                style={{ cursor: "pointer", marginRight: "10px" }}
                                onClick={handleToggleEmoji}
                            />

                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Type a message..."
                                    value={sendMessage}
                                    onChange={(e) => setSendMessage(e.target.value)}
                                />
                                <button
                                    className="btn btn-success"
                                    type="submit"
                                    onClick={handleSubmit}
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>


                    {/* Modal  */}
                    {showModel == true && (
                        <div
                            className="modal fade show d-block"
                            //   tabIndex="-1"
                            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                        >
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content border-0 shadow">
                                    <div
                                        className="modal-header"
                                        style={{ backgroundColor: "#e8f5e9" }}
                                    >
                                        <h5 className="modal-title"> Delete Message </h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={handleClose}
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        <p>
                                            {confirmDelete.id == deleteAllMsg ? `Do you want to Delete a All Message` : "Do you want to Delete a Message"} </p>

                                        <div className="modal-footer">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={handleClose}
                                            >
                                                Cancel
                                            </button>
                                            <button type="submit" className="btn btn-success" onClick={() => handleDelete(confirmDelete.id, confirmDelete.type)}>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserList;
