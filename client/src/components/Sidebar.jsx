import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('chats');
  const user = useSelector((state) => state.auth.user);
  const conversations = useSelector((state) => state.chat.conversations);
  const unreadCount = useSelector((state) => state.chat.unreadCount);

  const tabs = [
    { id: 'chats', icon: 'comments', label: 'Chats', path: '/' },
    { id: 'calls', icon: 'phone', label: 'Calls', path: '/calls' },
    { id: 'status', icon: 'circle', label: 'Status', path: '/status' },
    { id: 'settings', icon: 'cog', label: 'Settings', path: '/settings' },
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    navigate(tab.path);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-whatsapp-teal text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">WhatsApp</h1>
          <div className="flex space-x-4">
            <button className="hover:text-gray-200">
              <i className="fas fa-search"></i>
            </button>
            <button className="hover:text-gray-200">
              <i className="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`flex-1 py-4 text-center relative ${
              location.pathname === tab.path
                ? 'text-whatsapp-teal border-b-2 border-whatsapp-teal'
                : 'text-gray-500 hover:text-whatsapp-teal'
            }`}
          >
            <i className={`fas fa-${tab.icon} text-lg`}></i>
            {tab.id === 'chats' && unreadCount > 0 && (
              <span className="absolute top-2 right-4 bg-whatsapp-light text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chats' && (
          <div className="divide-y divide-gray-200">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => {/* Handle conversation click */}}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0">
                    {conversation.avatar && (
                      <img
                        src={conversation.avatar}
                        alt={conversation.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-semibold truncate">
                        {conversation.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(conversation.updatedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage?.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Chat/Call/Status Button */}
      <div className="p-4">
        <button className="w-14 h-14 bg-whatsapp-light hover:bg-whatsapp-dark text-white rounded-full shadow-lg fixed bottom-6 right-6 flex items-center justify-center transition-colors duration-200">
          <i className={`fas fa-${activeTab === 'chats' ? 'plus' : activeTab === 'calls' ? 'phone-plus' : 'camera'} text-xl`}></i>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
