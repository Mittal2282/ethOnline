import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion'; // eslint-disable-line no-unused-vars

const ConnectionPopup = ({ isOpen, onClose, nodeData }) => {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [isAccountConnected, setIsAccountConnected] = useState(false);

  if (!isOpen || !nodeData) return null;

  const events = [
    { value: 'file_created', label: 'File Created' },
    { value: 'file_updated', label: 'File Updated' },
    { value: 'file_deleted', label: 'File Deleted' },
    { value: 'folder_created', label: 'Folder Created' },
    { value: 'file_shared', label: 'File Shared' }
  ];

  const handleContinue = () => {
    if (selectedEvent && isAccountConnected) {
      // Handle connection logic here
      console.log('Connection created:', { nodeData, selectedEvent });
      onClose();
    }
  };

  const canContinue = selectedEvent && isAccountConnected;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div 
              className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Connect {nodeData?.entity?.name}
                    </h2>
                    <p className="text-sm text-gray-500">Configure the connection</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Steps */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-medium">
                      !
                    </div>
                    <span className="text-sm font-medium text-gray-900">Setup</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-400">Test</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[50vh]">
                {/* App Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    App <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {nodeData?.entity?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{nodeData?.entity?.name || 'Unknown'}</span>
                      </div>
                      <button className="text-gray-900 hover:text-gray-700 text-sm font-medium transition-colors duration-200">
                        Change
                      </button>
                    </div>
                  </div>
                </div>

                {/* Event Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Action event <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 appearance-none bg-white transition-colors duration-200"
                    >
                      <option value="">Choose an event</option>
                      {events.map((event) => (
                        <option key={event.value} value={event.value}>
                          {event.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Account Connection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Account <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <span className="text-sm text-gray-600">
                      {isAccountConnected ? 'Connected' : 'Connect ' + (nodeData?.entity?.name || 'Unknown')}
                    </span>
                    <button
                      onClick={() => setIsAccountConnected(!isAccountConnected)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        isAccountConnected
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      {isAccountConnected ? 'Disconnect' : 'Sign in'}
                    </button>
                  </div>
                </div>

                {/* Security Info */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {nodeData?.entity?.name || 'This service'} is a secure partner. Your credentials are encrypted and can be removed at any time. You can manage all of your connected accounts{' '}
                    <button className="text-gray-900 hover:text-gray-700 underline transition-colors duration-200">here</button>.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <button
                  onClick={handleContinue}
                  disabled={!canContinue}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-colors duration-200 ${
                    canContinue
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {canContinue ? 'Continue' : 'To continue, choose an event'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConnectionPopup;
