import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, User, Mail, Phone, AlertCircle, CheckCircle } from 'lucide-react';

const ResumeInterview = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    skills: ''
  });
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF, DOC, or DOCX file');
        return;
      }

      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      setError('');
    }
  };

  const handleUploadAndExtract = async () => {
    if (!file) return;

    setUploading(true);
    setExtracting(true);
    setError('');

    try {
      // Upload and extract in one step
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch(`http://localhost:5000/extract-resume`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process resume');
      }

      const result = await response.json();
      console.log('Resume processing result:', result);

      if (result.success && result.data) {
        setExtractedData({
          ...result.data,
          resumeFile: result.file
        });
      } else {
        throw new Error('Failed to extract data from resume');
      }

    } catch (error) {
      console.error('Resume processing error:', error);
      setError(error.message || 'Failed to process resume');
    } finally {
      setUploading(false);
      setExtracting(false);
    }
  };

  const handleRegisterForInterview = async () => {
    setRegistering(true);
    setError('');

    try {
      // Register candidate with extracted data
      const candidateData = {
        name: extractedData.name,
        email: extractedData.email,
        phone: extractedData.phone,
        experience: extractedData.experience,
        skills: extractedData.skills,
        status: 'scheduled',
        resume: extractedData.resumeFile
      };

      const response = await fetch(`http://localhost:5000/api/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register for interview');
      }

      const result = await response.json();
      
      // Navigate to interview page
      navigate(`/interview/${result._id}`);
      
    } catch (error) {
      setError(error.message || 'Failed to register for interview');
    } finally {
      setRegistering(false);
    }
  };

  const handleEdit = (field, value) => {
    setExtractedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Start Your Interview</h1>
            <p className="text-gray-600">Upload your resume and we'll extract your details automatically</p>
          </div>

          {!extractedData.name ? (
            <div className="space-y-6">
              {/* File Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Your Resume</h3>
                <p className="text-gray-600 mb-4">Supported formats: PDF, DOC, DOCX (max 10MB)</p>
                
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Choose File
                </label>
              </div>

              {file && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-900">{file.name}</span>
                      <span className="text-sm text-blue-600 ml-2">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-sm text-red-800">{error}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleUploadAndExtract}
                disabled={!file || uploading || extracting}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                {extracting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                {uploading ? 'Uploading...' : extracting ? 'Extracting Details...' : 'Process Resume'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">Resume processed successfully!</span>
                </div>
              </div>

              {/* Extracted Data */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Extracted Information</h3>
                <p className="text-sm text-gray-600">Please review and edit if needed:</p>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="h-4 w-4 inline mr-1" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={extractedData.name}
                      onChange={(e) => handleEdit('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={extractedData.email}
                      onChange={(e) => handleEdit('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={extractedData.phone}
                      onChange={(e) => handleEdit('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                    <input
                      type="text"
                      value={extractedData.skills || ''}
                      onChange={(e) => handleEdit('skills', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="JavaScript, React, Node.js"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-sm text-red-800">{error}</span>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setExtractedData({
                      name: '',
                      email: '',
                      phone: '',
                      experience: '',
                      skills: ''
                    });
                    setFile(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Upload Different Resume
                </button>
                <button
                  onClick={handleRegisterForInterview}
                  disabled={registering}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {registering && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                  {registering ? 'Starting Interview...' : 'Start Interview'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeInterview;