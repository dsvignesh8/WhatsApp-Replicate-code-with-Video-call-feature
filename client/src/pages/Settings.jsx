import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, logout } from '../store/slices/authSlice';

const Settings = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    about: user?.about || '',
    avatar: user?.avatar || null,
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(logout());
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // TODO: Implement actual file upload
      // Simulated upload
      const avatarUrl = URL.createObjectURL(file);
      setProfileData(prev => ({ ...prev, avatar: avatarUrl }));
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // TODO: Implement actual API call
      dispatch(updateProfile(profileData));
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: 'key', label: 'Privacy', onClick: () => {} },
        { icon: 'bell', label: 'Notifications', onClick: () => {} },
        { icon: 'database', label: 'Storage and Data', onClick: () => {} },
      ],
    },
    {
      title: 'App Settings',
      items: [
        { icon: 'palette', label: 'Theme', onClick: () => {} },
        { icon: 'language', label: 'Language', onClick: () => {} },
        { icon: 'desktop', label: 'WhatsApp Web/Desktop', onClick: () => {} },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'question-circle', label: 'Help', onClick: () => {} },
        { icon: 'info-circle', label: 'About', onClick: () => {} },
      ],
    },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Settings Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Profile Section */}
        <div className="bg-white p-4 mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                {profileData.avatar ? (
                  <img
                    src={profileData.avatar}
                    alt={profileData.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <i className="fas fa-user text-gray-400 text-3xl"></i>
                )}
              </div>
              {isEditing && (
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-whatsapp-light text-white rounded-full flex items-center justify-center cursor-pointer"
                >
                  <i className="fas fa-camera"></i>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              )}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="input-primary mb-2"
                  placeholder="Your name"
                />
              ) : (
                <h3 className="text-xl font-semibold">{profileData.name}</h3>
              )}
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.about}
                  onChange={(e) =>
                    setProfileData((prev) => ({ ...prev, about: e.target.value }))
                  }
                  className="input-primary"
                  placeholder="About"
                />
              ) : (
                <p className="text-gray-500">{profileData.about || 'Hey there! I am using WhatsApp.'}</p>
              )}
            </div>
            <button
              onClick={() => {
                if (isEditing) {
                  handleSaveProfile();
                } else {
                  setIsEditing(true);
                }
              }}
              className="text-whatsapp-teal hover:text-whatsapp-dark"
            >
              <i className={`fas fa-${isEditing ? 'check' : 'pen'} text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <div key={section.title} className="bg-white mb-4">
            <h3 className="px-4 py-2 text-sm font-medium text-gray-500">
              {section.title.toUpperCase()}
            </h3>
            <div className="divide-y divide-gray-200">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors"
                >
                  <i className={`fas fa-${item.icon} text-gray-500 w-6`}></i>
                  <span className="flex-1 text-left">{item.label}</span>
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full py-3 text-red-500 font-medium bg-white hover:bg-red-50 rounded-lg transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
