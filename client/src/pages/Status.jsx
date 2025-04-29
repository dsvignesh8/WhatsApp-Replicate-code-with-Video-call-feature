import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMyStatus, deleteMyStatus, markStatusAsViewed } from '../store/slices/statusSlice';

const Status = () => {
  const dispatch = useDispatch();
  const [isUploading, setIsUploading] = useState(false);
  const { statuses, myStatuses, viewedStatuses } = useSelector((state) => state.status);
  const user = useSelector((state) => state.auth.user);

  const handleStatusUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      // TODO: Implement actual file upload
      // Simulated upload
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newStatus = {
        id: Date.now().toString(),
        type: file.type.startsWith('image/') ? 'image' : 'video',
        url: URL.createObjectURL(file),
        caption: '',
        timestamp: new Date().toISOString(),
        duration: 24 * 60 * 60, // 24 hours in seconds
      };

      dispatch(addMyStatus(newStatus));
    } catch (error) {
      console.error('Failed to upload status:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return 'Yesterday';
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Status Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h2 className="text-xl font-semibold text-gray-800">Status</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* My Status */}
        <div className="p-4 bg-white">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <i className="fas fa-user text-gray-400 text-xl"></i>
                )}
              </div>
              <label
                htmlFor="status-upload"
                className="absolute bottom-0 right-0 w-6 h-6 bg-whatsapp-light text-white rounded-full flex items-center justify-center cursor-pointer"
              >
                <i className="fas fa-plus text-sm"></i>
              </label>
              <input
                type="file"
                id="status-upload"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleStatusUpload}
                disabled={isUploading}
              />
            </div>
            <div>
              <h3 className="font-medium">My Status</h3>
              <p className="text-sm text-gray-500">
                {myStatuses.length > 0
                  ? 'Tap to add status update'
                  : 'No updates'}
              </p>
            </div>
          </div>

          {/* My Status Preview */}
          {myStatuses.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {myStatuses.map((status) => (
                <div
                  key={status.id}
                  className="relative aspect-square rounded-lg overflow-hidden group"
                >
                  {status.type === 'image' ? (
                    <img
                      src={status.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={status.url}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => dispatch(deleteMyStatus(status.id))}
                      className="text-white hover:text-red-500"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  <span className="absolute bottom-2 right-2 text-xs text-white">
                    {formatTimeAgo(status.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Updates */}
        {statuses.length > 0 && (
          <div className="mt-4">
            <h4 className="px-4 py-2 text-sm font-medium text-gray-500">
              RECENT UPDATES
            </h4>
            <div className="bg-white divide-y divide-gray-200">
              {statuses.map((userStatus) => (
                <div
                  key={userStatus.userId}
                  className="p-4 flex items-center space-x-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    userStatus.items.forEach(status => 
                      dispatch(markStatusAsViewed({ statusId: status.id }))
                    );
                    // TODO: Open status viewer
                  }}
                >
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-full border-2 ${
                      viewedStatuses.has(userStatus.items[0].id)
                        ? 'border-gray-300'
                        : 'border-whatsapp-light'
                    }`}>
                      {userStatus.avatar ? (
                        <img
                          src={userStatus.avatar}
                          alt={userStatus.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center">
                          <i className="fas fa-user text-gray-400 text-xl"></i>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">{userStatus.name}</h3>
                    <p className="text-sm text-gray-500">
                      {formatTimeAgo(userStatus.items[0].timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Status Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-whatsapp-light hover:bg-whatsapp-dark text-white rounded-full shadow-lg flex items-center justify-center transition-colors">
        <i className="fas fa-camera text-xl"></i>
      </button>
    </div>
  );
};

export default Status;
