import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface Message {
  id: string;
  content: string;
  timestamp: any;
  responseTime?: number;
  isUser: boolean;
}

interface MessagesProps {
  userId: string;
}

export default function Messages({ userId }: MessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messagesRef = collection(db, 'messages');
        const q = query(
          messagesRef,
          where('userId', '==', userId),
          orderBy('timestamp', 'desc'),
          limit(50)
        );
        
        const querySnapshot = await getDocs(q);
        const messageList: Message[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          messageList.push({
            id: doc.id,
            content: data.content,
            timestamp: data.timestamp,
            responseTime: data.responseTime,
            isUser: data.isUser || false
          });
        });

        setMessages(messageList);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Messages</h2>
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No messages yet. Start chatting with SwanAI to see your conversation history.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg ${
                  message.isUser
                    ? 'bg-indigo-50 ml-12'
                    : 'bg-gray-50 mr-12'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {message.isUser ? 'You' : 'SwanAI'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toDate().toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
                {message.responseTime && !message.isUser && (
                  <div className="mt-2 text-xs text-gray-500">
                    Response time: {message.responseTime.toFixed(2)}s
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 