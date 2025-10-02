import React, { useState, useRef, useEffect } from 'react';

const Interview = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState([]);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  
  // Video/Audio states
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [devices, setDevices] = useState({ cameras: [], microphones: [] });
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedMicrophone, setSelectedMicrophone] = useState('');
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const questions = [
    "Tell me about yourself and your background.",
    "What interests you most about this position?",
    "Describe a challenging project you've worked on recently.",
    "How do you handle working under pressure or tight deadlines?",
    "What are your greatest strengths and how do they apply to this role?",
    "Where do you see yourself professionally in the next 5 years?",
    "Do you have any questions about our company or this position?"
  ];

  // Initialize camera and microphone
  useEffect(() => {
    getDevices();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const getDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      const microphones = devices.filter(device => device.kind === 'audioinput');
      
      setDevices({ cameras, microphones });
      
      if (cameras.length > 0) setSelectedCamera(cameras[0].deviceId);
      if (microphones.length > 0) setSelectedMicrophone(microphones[0].deviceId);
    } catch (error) {
      console.error('Error getting devices:', error);
    }
  };

  const requestPermissions = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: {
          deviceId: selectedMicrophone ? { exact: selectedMicrophone } : undefined,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      setStream(mediaStream);
      setIsPermissionGranted(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Initialize MediaRecorder
      const recorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      setMediaRecorder(recorder);

    } catch (error) {
      console.error('Error accessing camera/microphone:', error);
      alert('Please allow camera and microphone access to continue with the interview.');
    }
  };

  const startRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'inactive') {
      setRecordedChunks([]);
      mediaRecorder.start(1000); // Record in 1-second chunks
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const captureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      // Convert to blob and save
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interview-snapshot-q${currentQuestion + 1}.png`;
        a.click();
      }, 'image/png');
    }
  };

  const startInterview = async () => {
    if (!isPermissionGranted) {
      await requestPermissions();
    }
    setIsInterviewStarted(true);
    setCurrentQuestion(0);
    setResponses([]);
    startRecording();
  };

  const submitResponse = () => {
    if (currentResponse.trim()) {
      stopRecording();
      
      setResponses([...responses, {
        question: questions[currentQuestion],
        answer: currentResponse,
        timestamp: new Date().toISOString(),
        recordingData: recordedChunks
      }]);
      setCurrentResponse('');
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        // Start recording for next question
        setTimeout(() => startRecording(), 1000);
      } else {
        // Interview complete
        setIsInterviewStarted(false);
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        alert('Interview completed! Thank you for your responses.');
      }
    }
  };

  const skipQuestion = () => {
    stopRecording();
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeout(() => startRecording(), 1000);
    } else {
      setIsInterviewStarted(false);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      alert('Interview completed!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">AI-Powered Video Interview</h1>

        {!isInterviewStarted ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Video Preview */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Camera Preview</h2>
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover"
                  />
                  {!isPermissionGranted && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                      <div className="text-center text-white">
                        <div className="mb-4 text-4xl">📷</div>
                        <p>Camera access required</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Device Selection */}
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Camera
                    </label>
                    <select
                      value={selectedCamera}
                      onChange={(e) => setSelectedCamera(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      disabled={isPermissionGranted}
                    >
                      {devices.cameras.map((camera) => (
                        <option key={camera.deviceId} value={camera.deviceId}>
                          {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Microphone
                    </label>
                    <select
                      value={selectedMicrophone}
                      onChange={(e) => setSelectedMicrophone(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      disabled={isPermissionGranted}
                    >
                      {devices.microphones.map((mic) => (
                        <option key={mic.deviceId} value={mic.deviceId}>
                          {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {!isPermissionGranted && (
                  <button
                    onClick={requestPermissions}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                  >
                    📷 Enable Camera & Microphone
                  </button>
                )}
              </div>

              {/* Interview Info */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Interview Details</h2>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium text-blue-800 mb-2">What to expect:</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• {questions.length} interview questions</li>
                    <li>• Video and audio recording for each response</li>
                    <li>• Take your time to think before answering</li>
                    <li>• You can skip questions if needed</li>
                    <li>• Speak clearly and maintain eye contact</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-yellow-800 mb-2">Technical Requirements:</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Working camera and microphone</li>
                    <li>• Good lighting and quiet environment</li>
                    <li>• Stable internet connection</li>
                    <li>• Updated browser (Chrome, Firefox, Safari)</li>
                  </ul>
                </div>

                <button
                  onClick={startInterview}
                  disabled={!isPermissionGranted}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg text-lg"
                >
                  {isPermissionGranted ? '🎥 Start Video Interview' : 'Enable Camera First'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Video Recording Panel */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Video Recording</h3>
                  <div className="flex items-center space-x-2">
                    {isRecording && (
                      <div className="flex items-center text-red-600">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse mr-2"></div>
                        <span className="text-sm font-medium">Recording</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover"
                  />
                </div>

                <div className="flex justify-center space-x-3">
                  <button
                    onClick={captureSnapshot}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded"
                  >
                    📸 Snapshot
                  </button>
                  
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`font-medium py-2 px-4 rounded ${
                      isRecording 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isRecording ? '⏹️ Stop Recording' : '🎥 Start Recording'}
                  </button>
                </div>
              </div>

              {/* Question and Response Panel */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Question {currentQuestion + 1}:</h3>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-lg text-gray-800">{questions[currentQuestion]}</p>
                </div>
                
                <textarea
                  value={currentResponse}
                  onChange={(e) => setCurrentResponse(e.target.value)}
                  placeholder="Type your response here (optional - you can also just record video)..."
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <div className="flex justify-between mt-4">
                  <button
                    onClick={skipQuestion}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded"
                  >
                    Skip Question
                  </button>
                  <button
                    onClick={submitResponse}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
                  >
                    {currentQuestion === questions.length - 1 ? 'Finish Interview' : 'Next Question'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hidden canvas for snapshots */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Previous Responses */}
        {responses.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Your Responses ({responses.length}/{questions.length})</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {responses.map((response, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <p className="font-medium text-gray-800">Q{index + 1}: {response.question}</p>
                  <p className="text-gray-600 mt-1">{response.answer}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Recorded: {new Date(response.timestamp).toLocaleString()}
                    {response.recordingData && ` • Video: ${response.recordingData.length} chunks`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Interview;
