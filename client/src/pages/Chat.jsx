import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage, updateMessageStatus } from '../store/slices/chatSlice';

const Chat = () => {
  const dispatch = useDispatch();
  const messageInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const activeConversation = useSelector((state) => state.chat.activeConversation);
  const messages = useSelector((state) => state.chat.messages);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() && !isRecording) return;

    const newMessage = {
      id: Date.now().toString(),
      content: message,
      type: 'text',
      sender: user.id,
      conversationId: activeConversation.id,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    dispatch(addMessage(newMessage));
    setMessage('');
    messageInputRef.current?.focus();

    // Simulate message being delivered
    setTimeout(() => {
      dispatch(updateMessageStatus({ messageId: newMessage.id, status: 'delivered' }));
    }, 1000);

    // Simulate message being read
    setTimeout(() => {
      dispatch(updateMessageStatus({ messageId: newMessage.id, status: 'read' }));
    }, 2000);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // TODO: Implement actual voice recording
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
    // TODO: Implement sending voice message
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!activeConversation) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-comments text-4xl text-gray-400 mb-2"></i>
          <p className="text-gray-500">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-whatsapp-teal text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-300">
            {activeConversation.avatar && (
              <img
                src={activeConversation.avatar}
                alt={activeConversation.name}
                className="w-full h-full rounded-full object-cover"
              />
            )}
          </div>
          <div>
            <h3 className="font-semibold">{activeConversation.name}</h3>
            <p className="text-sm opacity-80">
              {activeConversation.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="hover:text-gray-200">
            <i className="fas fa-video"></i>
          </button>
          <button className="hover:text-gray-200">
            <i className="fas fa-phone"></i>
          </button>
          <button className="hover:text-gray-200">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === user.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`chat-bubble ${
                msg.sender === user.id ? 'chat-bubble-sent' : 'chat-bubble-received'
              }`}
            >
              {msg.type === 'text' ? (
                <p>{msg.content}</p>
              ) : msg.type === 'voice' ? (
                <div className="flex items-center space-x-2">
                  <button className="text-current">
                    <i className="fas fa-play"></i>
                  </button>
                  <div className="w-32 h-1 bg-current rounded-full"></div>
                  <span className="text-sm">{msg.duration}s</span>
                </div>
              ) : null}
              <div className="flex items-center justify-end space-x-1 mt-1">
                <span className="text-xs opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {msg.sender === user.id && (
                  <i
                    className={`fas fa-${
                      msg.status === 'sent'
                        ? 'check'
                        : msg.status === 'delivered'
                        ? 'check-double'
                        : 'check-double text-blue-500'
                    } text-xs`}
                  ></i>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="bg-white p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="fas fa-smile text-xl"></i>
          </button>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="fas fa-paperclip text-xl"></i>
          </button>
          
          <div className="flex-1 relative">
            {isRecording ? (
              <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg">
                <i className="fas fa-microphone text-red-500 animate-pulse"></i>
                <span className="text-red-500">{formatTime(recordingTime)}</span>
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="ml-auto text-red-500"
                >
                  <i className="fas fa-stop"></i>
                </button>
              </div>
            ) : (
              <input
                type="text"
                ref={messageInputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
                className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-whatsapp-light"
              />
            )}
          </div>

          {message.trim() ? (
            <button
              type="submit"
              className="text-whatsapp-teal hover:text-whatsapp-dark"
            >
              <i className="fas fa-paper-plane text-xl"></i>
            </button>
          ) : (
            <button
              type="button"
              onMouseDown={handleStartRecording}
              onMouseUp={handleStopRecording}
              className="text-whatsapp-teal hover:text-whatsapp-dark"
            >
              <i className="fas fa-microphone text-xl"></i>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Chat;
