import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useSelector } from 'react-redux';

const Layout = () => {
  const activeCall = useSelector((state) => state.call.activeCall);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-[400px] bg-white border-r border-gray-200">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>

      {/* Active Call Overlay */}
      {activeCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl">
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4">
                {activeCall.isVideo ? 'Video Call' : 'Voice Call'} with {activeCall.userName}
              </h3>
              {activeCall.isVideo && (
                <div className="relative w-full aspect-video bg-gray-900 rounded-lg mb-4">
                  {/* Remote Video */}
                  <video
                    id="remoteVideo"
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                    autoPlay
                    playsInline
                  />
                  {/* Local Video (Picture-in-Picture) */}
                  <video
                    id="localVideo"
                    className="absolute bottom-4 right-4 w-48 aspect-video object-cover rounded-lg border-2 border-white"
                    autoPlay
                    playsInline
                    muted
                  />
                </div>
              )}
              <div className="flex space-x-4">
                <button
                  className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full"
                  onClick={() => {/* Handle end call */}}
                >
                  <i className="fas fa-phone-slash"></i>
                </button>
                <button
                  className="p-4 bg-gray-500 hover:bg-gray-600 text-white rounded-full"
                  onClick={() => {/* Handle toggle mute */}}
                >
                  <i className={`fas fa-${activeCall.isMuted ? 'microphone-slash' : 'microphone'}`}></i>
                </button>
                {activeCall.isVideo && (
                  <button
                    className="p-4 bg-gray-500 hover:bg-gray-600 text-white rounded-full"
                    onClick={() => {/* Handle toggle video */}}
                  >
                    <i className={`fas fa-${activeCall.isVideoEnabled ? 'video' : 'video-slash'}`}></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
