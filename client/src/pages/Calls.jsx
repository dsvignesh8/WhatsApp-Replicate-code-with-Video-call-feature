import { useSelector, useDispatch } from 'react-redux';
import { setActiveCall } from '../store/slices/callSlice';

const Calls = () => {
  const dispatch = useDispatch();
  const callHistory = useSelector((state) => state.call.callHistory);

  const initiateCall = (contact, isVideo = false) => {
    dispatch(setActiveCall({
      id: Date.now().toString(),
      userId: contact.id,
      userName: contact.name,
      isVideo,
      isMuted: false,
      isVideoEnabled: isVideo,
      startTime: new Date().toISOString(),
    }));
  };

  const formatCallDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Calls Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h2 className="text-xl font-semibold text-gray-800">Calls</h2>
      </div>

      {/* Call History */}
      <div className="flex-1 overflow-y-auto">
        {callHistory.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-phone-slash text-4xl text-gray-400 mb-2"></i>
              <p className="text-gray-500">No recent calls</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {callHistory.map((call) => (
              <div
                key={call.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                    {call.contact.avatar ? (
                      <img
                        src={call.contact.avatar}
                        alt={call.contact.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <i className="fas fa-user text-gray-400 text-xl"></i>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {call.contact.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <i className={`fas fa-${call.missed ? 'arrow-down text-red-500' : 'arrow-up text-green-500'} mr-1`}></i>
                      <i className={`fas fa-${call.isVideo ? 'video' : 'phone'} mr-1`}></i>
                      <span>
                        {new Date(call.timestamp).toLocaleDateString()} •{' '}
                        {formatCallDuration(call.duration)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => initiateCall(call.contact, false)}
                    className="w-10 h-10 rounded-full bg-whatsapp-light text-white flex items-center justify-center hover:bg-whatsapp-dark transition-colors"
                  >
                    <i className="fas fa-phone"></i>
                  </button>
                  <button
                    onClick={() => initiateCall(call.contact, true)}
                    className="w-10 h-10 rounded-full bg-whatsapp-light text-white flex items-center justify-center hover:bg-whatsapp-dark transition-colors"
                  >
                    <i className="fas fa-video"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Call Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-whatsapp-light hover:bg-whatsapp-dark text-white rounded-full shadow-lg flex items-center justify-center transition-colors">
        <i className="fas fa-phone-plus text-xl"></i>
      </button>
    </div>
  );
};

export default Calls;
