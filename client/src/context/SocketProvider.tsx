import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import config from '../config/config';

interface SocketProps {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketProps | undefined>(undefined);

interface Props {
    children: React.ReactNode;
}

export const SocketProvider = ({ children }: Props) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const newSocket = io(config.Backend_Url, {
            auth: { token },
        });

        newSocket.on('connect', () => {
            console.log('Socket connected...', newSocket.id);
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected....');
            setIsConnected(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = (): SocketProps => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('used with a SocketProvider');
    }
    return context;
};
