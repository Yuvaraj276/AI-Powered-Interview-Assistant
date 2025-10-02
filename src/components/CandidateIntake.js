import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Upload,
  FileText,
  Check,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

const CandidateIntake = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [candidateData, setCandidateData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    skills: '',
    notes: ''
  });
  
  const [resumeFile, setResumeFile] = useState(null);
  const [resumePreview, setResumePreview] = useState(null);

  const positions = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Data Scientist',
    'Product Manager',
    'UI/UX Designer',
    'QA Engineer',
    'Mobile Developer',
    'Software Architect'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCandidateData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF, DOC, or DOCX file');
        return;
      }

      if (file.size > maxSize) {
        setError('File size must be less than 5MB');
        return;
      }

      setResumeFile(file);
      setResumePreview({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.type
      });
      setError('');
    }
  };

  const validateStep1 = () => {
    const { name, email, phone, position } = candidateData;
    if (!name.trim() || !email.trim() || !phone.trim() || !position.trim()) {
      setError('Please fill in all required fields');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-()]/g, ''))) {
      setError('Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!resumeFile) {
      setError('Please upload your resume');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    setError('');
    
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setError('');
  };

  const submitCandidate = async () => {
    setLoading(true);
    setError('');

    try {
      // First upload the resume
      let resumeData = null;
      if (resumeFile) {
        const formData = new FormData();
        formData.append('resume', resumeFile);

        const uploadResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/upload/resume`, {
          method: 'POST',
          body: formData
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload resume');
        }

        const uploadResult = await uploadResponse.json();
        resumeData = uploadResult.file;
      }

      // Create candidate with resume data
      const candidatePayload = {
        ...candidateData,
        skills: candidateData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        resume: resumeData ? {
          filename: resumeData.filename,
          originalName: resumeData.originalName,
          mimeType: resumeData.mimetype,
          size: resumeData.size,
          url: `/api/upload/file/${resumeData.filename}?type=resumes`
        } : undefined
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(candidatePayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register candidate');
      }

      const result = await response.json();
      console.log('Candidate registered:', result);
      
      setSuccess(true);
      
      // Redirect to interview page after a short delay
      setTimeout(() => {
        navigate(`/interview/${result._id}`);
      }, 2000);

    } catch (error) {
      console.error('Error submitting candidate:', error);
      setError(error.message || 'Failed to register candidate');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-4">
            Welcome {candidateData.name}! Your profile has been created successfully.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to interview page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidate Registration</h1>
          <p className="text-gray-600">Please complete your profile to begin the interview process</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 space-x-8">
            <span className="text-sm text-gray-600">Personal Info</span>
            <span className="text-sm text-gray-600">Resume Upload</span>
            <span className="text-sm text-gray-600">Review</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={candidateData.name}
                      onChange={handleInputChange}
                      className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={candidateData.email}
                      onChange={handleInputChange}
                      className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={candidateData.phone}
                      onChange={handleInputChange}
                      className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position Applying For *
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <select
                      name="position"
                      value={candidateData.position}
                      onChange={handleInputChange}
                      className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a position</option>
                      {positions.map(position => (
                        <option key={position} value={position}>{position}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="text"
                  name="experience"
                  value={candidateData.experience}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 3-5 years"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  name="skills"
                  value={candidateData.skills}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., JavaScript, React, Node.js"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={candidateData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any additional information..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Resume Upload */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Resume</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="flex flex-col items-center">
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  <div className="mb-4">
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      <span className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        Choose Resume File
                      </span>
                      <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Upload PDF, DOC, or DOCX file (max 5MB)
                  </p>
                </div>
              </div>

              {resumePreview && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{resumePreview.name}</p>
                      <p className="text-sm text-gray-600">{resumePreview.size}</p>
                    </div>
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Your Information</h2>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <p className="text-gray-900">{candidateData.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <p className="text-gray-900">{candidateData.email}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <p className="text-gray-900">{candidateData.phone}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Position:</span>
                    <p className="text-gray-900">{candidateData.position}</p>
                  </div>
                  {candidateData.experience && (
                    <div>
                      <span className="font-medium text-gray-700">Experience:</span>
                      <p className="text-gray-900">{candidateData.experience}</p>
                    </div>
                  )}
                  {candidateData.skills && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Skills:</span>
                      <p className="text-gray-900">{candidateData.skills}</p>
                    </div>
                  )}
                </div>
                
                {resumePreview && (
                  <div>
                    <span className="font-medium text-gray-700">Resume:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-gray-900">{resumePreview.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={step === 1 ? () => navigate('/') : prevStep}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {step === 1 ? 'Back to Home' : 'Previous'}
            </button>

            {step < 3 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                onClick={submitCandidate}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Complete Registration'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateIntake;