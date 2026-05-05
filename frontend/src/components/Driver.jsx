import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Car,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  MapPin,
  UploadCloud,
  FileText,
  Camera,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ChevronDown,
  X,
  Moon,
  Sun,
  ClipboardList,
  Check
} from 'lucide-react';

// --- Reusable Helper Components ---


/**
 * Reusable Form Input Component
 */
const FormInput = ({ id, label, type = 'text', value, onChange, error, icon: Icon }) => (
  <motion.div variants={itemVariants} className="relative w-full">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">
      {label}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />}
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className={`
          w-full p-3 pl-10 rounded-lg border 
          bg-gray-50 dark:bg-gray-800
          text-gray-900 dark:text-white
          placeholder-gray-400 dark:placeholder-gray-500
          transition-all duration-200
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${Icon ? 'pl-10' : 'pl-4'}
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'}
        `}
      />
    </div>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </motion.div>
);

/**
 * Reusable Form Select Component
 */
const FormSelect = ({ id, label, value, onChange, error, children, icon: Icon }) => (
  <motion.div variants={itemVariants} className="relative w-full">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">
      {label}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />}
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className={`
          w-full p-3 pl-10 rounded-lg border appearance-none
          bg-gray-50 dark:bg-gray-800
          text-gray-900 dark:text-white
          transition-all duration-200
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${Icon ? 'pl-10' : 'pl-4'}
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'}
        `}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
    </div>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </motion.div>
);

/**
 * Reusable Document Uploader Component
 */
const DocumentUploader = ({ id, label, file, setFile, error, acceptedTypes = "image/*,.pdf" }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    if (file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      // Free memory when the component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      // For non-image files like PDF
      setPreview('text');
    }
  }, [file]);

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setFile(null);
  };

  return (
    <motion.div variants={itemVariants} className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">
        {label}
      </label>
      <label
        htmlFor={id}
        className={`
          w-full flex justify-center items-center p-4 rounded-lg border-2 border-dashed
          cursor-pointer transition-all duration-200
          hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800
          ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
          ${file ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : 'bg-gray-50 dark:bg-gray-800/50'}
        `}
      >
        <input id={id} type="file" className="hidden" onChange={handleChange} accept={acceptedTypes} />
        {preview ? (
          <div className="text-center relative">
            {preview === 'text' ? (
              <FileText className="h-12 w-12 text-gray-500 dark:text-gray-400 mx-auto" />
            ) : (
              <img src={preview} alt="Preview" className="h-20 w-auto max-w-xs object-contain rounded-md mx-auto" />
            )}
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 truncate max-w-xs">{file.name}</p>
            <button
              onClick={removeFile}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all"
              aria-label="Remove file"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <UploadCloud className="h-10 w-10 text-gray-400 dark:text-gray-500 mx-auto" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {acceptedTypes.replace('image/*,', 'Images or ').toUpperCase()}
            </p>
          </div>
        )}
      </label>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </motion.div>
  );
};

// --- Review/Success Page Helper Components ---

const renderFileData = (file) => {
  if (!file) return <span className="text-gray-500 italic">Not provided</span>;
  return (
    <div className="flex items-center space-x-2 text-green-700 dark:text-green-400">
      <FileText className="h-4 w-4" />
      <span className="text-sm font-medium truncate max-w-xs">{file.name}</span>
    </div>
  );
};

/**
 * Reusable component to safely preview an image from a File object,
 * handling object URL creation and revocation.
 */
const FileImagePreview = ({ file, altText, className }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    let objectUrl;
    try {
      // Check if it's an image file before creating URL
      if (file.type && file.type.startsWith('image/')) {
        objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
      } else {
        // Handle non-image files if needed, or just set to null
        setPreview(null);
      }
    } catch (e) {
      console.error("Failed to create object URL for file", file);
      setPreview(null);
    }

    // Cleanup: revoke the object URL when the component unmounts or file changes
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file]);

  if (!file) {
    return <span className="text-gray-500 italic">Not provided</span>;
  }

  if (!preview) {
    // File is present but not a previewable image
    return <span className="text-gray-500 italic">Invalid image</span>;
  }

  return (
    <img src={preview} alt={altText} className={className} />
  );
};


const DataRow = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
    <div className="text-base text-gray-900 dark:text-white">{value || <span className="text-gray-500 italic">Not provided</span>}</div>
  </div>
);


// --- Form Sections / Steps ---

/**
 * Step 1: Personal Information
 */
const PersonalInfoForm = ({ formData, setFormData, nextStep, validate }) => {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (name, file) => {
    setFormData(prev => ({ ...prev, [name]: file }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleNext = () => {
    const stepErrors = validate(formData);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      nextStep();
    }
  };

  return (
    <FormStepLayout title="Personal Information" subtitle="Tell us a bit about yourself.">
      <FormInput
        id="fullName"
        label="Full Name"
        value={formData.fullName}
        onChange={handleChange}
        error={errors.fullName}
        icon={User}
      />
      <FormInput
        id="email"
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        icon={Mail}
      />
      <FormInput
        id="phone"
        label="Phone Number"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
        icon={Phone}
      />
      <FormSelect
        id="gender"
        label="Gender"
        value={formData.gender}
        onChange={handleChange}
        error={errors.gender}
        icon={User}
      >
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
        <option value="prefer_not_to_say">Prefer not to say</option>
      </FormSelect>
      <FormInput
        id="dob"
        label="Date of Birth"
        type="date"
        value={formData.dob}
        onChange={handleChange}
        error={errors.dob}
        icon={Calendar}
      />
      <DocumentUploader
        id="profilePhoto"
        label="Profile Photo"
        file={formData.profilePhoto}
        setFile={(file) => handleFileChange('profilePhoto', file)}
        error={errors.profilePhoto}
        acceptedTypes="image/jpeg,image/png,image/webp"
      />
      <motion.div variants={itemVariants} className="md:col-span-2">
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">
          Address
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <textarea
            id="address"
            name="address"
            rows="3"
            value={formData.address}
            onChange={handleChange}
            className={`
              w-full p-3 pl-10 rounded-lg border 
              bg-gray-50 dark:bg-gray-800
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              transition-all duration-200
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'}
            `}
          ></textarea>
        </div>
        {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
      </motion.div>

      <div className="md:col-span-2 flex justify-end">
        <FormButton onClick={handleNext} text="Save & Continue" icon={ArrowRight} />
      </div>
    </FormStepLayout>
  );
};

/**
 * Step 2: Vehicle Information
 */
const VehicleInfoForm = ({ formData, setFormData, nextStep, prevStep, validate }) => {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (name, file) => {
    setFormData(prev => ({ ...prev, [name]: file }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleNext = () => {
    const stepErrors = validate(formData);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      nextStep();
    }
  };

  return (
    <FormStepLayout title="Vehicle Information" subtitle="Let's get your vehicle details.">
      <FormInput
        id="carModel"
        label="Car Model (e.g., Toyota)"
        value={formData.carModel}
        onChange={handleChange}
        error={errors.carModel}
        icon={Car}
      />
      <FormInput
        id="carName"
        label="Car Name (e.g., Camry)"
        value={formData.carName}
        onChange={handleChange}
        error={errors.carName}
        icon={Car}
      />
      <FormInput
        id="carNumber"
        label="Car Number (License Plate)"
        value={formData.carNumber}
        onChange={handleChange}
        error={errors.carNumber}
        icon={ClipboardList}
      />
      <FormInput
        id="carYear"
        label="Car Year (e.g., 2020)"
        type="number"
        value={formData.carYear}
        onChange={handleChange}
        error={errors.carYear}
        icon={Calendar}
      />
      <FormInput
        id="carColor"
        label="Car Color"
        value={formData.carColor}
        onChange={handleChange}
        error={errors.carColor}
        icon={Car} // A 'color palette' icon would be better
      />
      <FormSelect
        id="fuelType"
        label="Fuel Type"
        value={formData.fuelType}
        onChange={handleChange}
        error={errors.fuelType}
        icon={Car} // A 'gas pump' icon would be better
      >
        <option value="">Select Fuel Type</option>
        <option value="petrol">Petrol</option>
        <option value="diesel">Diesel</option>
        <option value="cng">CNG</option>
        <option value="electric">Electric</option>
      </FormSelect>
      <FormSelect
        id="numSeats"
        label="Number of Seats (excluding driver)"
        value={formData.numSeats}
        onChange={handleChange}
        error={errors.numSeats}
        icon={User}
      >
        <option value="">Select Seats</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="6">6</option>
      </FormSelect>
      <div className="md:col-span-2"></div> {/* Spacer */}
      <DocumentUploader
        id="rcDoc"
        label="Upload RC Document (PDF/Image)"
        file={formData.rcDoc}
        setFile={(file) => handleFileChange('rcDoc', file)}
        error={errors.rcDoc}
      />
      <DocumentUploader
        id="insuranceDoc"
        label="Upload Insurance Document (PDF/Image)"
        file={formData.insuranceDoc}
        setFile={(file) => handleFileChange('insuranceDoc', file)}
        error={errors.insuranceDoc}
      />
      <DocumentUploader
        id="carImage"
        label="Upload Car Image (Exterior)"
        file={formData.carImage}
        setFile={(file) => handleFileChange('carImage', file)}
        error={errors.carImage}
        acceptedTypes="image/jpeg,image/png,image/webp"
      />

      <div className="md:col-span-2 flex justify-between">
        <FormButton onClick={prevStep} text="Back" icon={ArrowLeft} variant="secondary" />
        <FormButton onClick={handleNext} text="Save & Continue" icon={ArrowRight} />
      </div>
    </FormStepLayout>
  );
};

/**
 * Step 3: Driver Verification
 */
const VerificationForm = ({ formData, setFormData, nextStep, prevStep, validate }) => {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handleFileChange = (name, file) => {
    setFormData(prev => ({ ...prev, [name]: file }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleNext = () => {
    const stepErrors = validate(formData);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      nextStep();
    }
  };

  return (
    <FormStepLayout title="Driver Verification" subtitle="Last step to ensure safety and trust.">
      <FormInput
        id="licenseNumber"
        label="Driving License Number"
        value={formData.licenseNumber}
        onChange={handleChange}
        error={errors.licenseNumber}
        icon={ClipboardList}
      />

      <div className="flex space-x-2">
        <ShieldCheck className="h-6 w-6 text-green-500 flex-shrink-0" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Your documents are safe with us. We use industry-standard encryption.
        </span>
      </div>

      <DocumentUploader
        id="licenseFront"
        label="Upload License (Front)"
        file={formData.licenseFront}
        setFile={(file) => handleFileChange('licenseFront', file)}
        error={errors.licenseFront}
      />
      <DocumentUploader
        id="licenseBack"
        label="Upload License (Back)"
        file={formData.licenseBack}
        setFile={(file) => handleFileChange('licenseBack', file)}
        error={errors.licenseBack}
      />
      <DocumentUploader
        id="idProof"
        label="Aadhar / ID Proof"
        file={formData.idProof}
        setFile={(file) => handleFileChange('idProof', file)}
        error={errors.idProof}
      />
      <DocumentUploader
        id="selfie"
        label="Selfie Verification"
        file={formData.selfie}
        setFile={(file) => handleFileChange('selfie', file)}
        error={errors.selfie}
        acceptedTypes="image/jpeg,image/png,image/webp"
      />

      <motion.div variants={itemVariants} className="md:col-span-2 flex items-start space-x-3">
        <input
          id="agreedToTerms"
          name="agreedToTerms"
          type="checkbox"
          checked={formData.agreedToTerms}
          onChange={handleChange}
          className={`
            h-5 w-5 mt-0.5 rounded
            text-blue-600 bg-gray-100 dark:bg-gray-700
            border-gray-300 dark:border-gray-600
            focus:ring-blue-500 dark:focus:ring-blue-600
            ${errors.agreedToTerms ? 'border-red-500' : ''}
          `}
        />
        <div className="flex-1">
          <label htmlFor="agreedToTerms" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            I agree to the <a href="#" className="text-blue-600 hover:underline">Safety Policy</a> and <a href="#" className="text-blue-600 hover:underline">Terms & Conditions</a>.
          </label>
          {errors.agreedToTerms && <p className="mt-1 text-xs text-red-600">{errors.agreedToTerms}</p>}
        </div>
      </motion.div>

      <div className="md:col-span-2 flex justify-between">
        <FormButton onClick={prevStep} text="Back" icon={ArrowLeft} variant="secondary" />
        <FormButton onClick={handleNext} text="Review Application" icon={Check} />
      </div>
    </FormStepLayout>
  );
};

/**
 * Step 4: Review Application
 */
const ReviewStep = ({ formData, setStep, handleSubmit, isLoading }) => {
  
  const ReviewSection = ({ title, children, stepIndex }) => (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
        <button
          onClick={() => setStep(stepIndex)}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          Edit
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {children}
      </div>
    </div>
  );
  
  return (
    <FormStepLayout title="Review Your Application" subtitle="Please double-check all details before submitting.">
      <div className="md:col-span-2 w-full">
        <ReviewSection title="Personal Information" stepIndex={1}>
          <DataRow label="Full Name" value={formData.fullName} />
          <DataRow label="Email" value={formData.email} />
          <DataRow label="Phone" value={formData.phone} />
          <DataRow label="Gender" value={formData.gender} />
          <DataRow label="Date of Birth" value={formData.dob} />
          <DataRow label="Address" value={formData.address} />
          <DataRow label="Profile Photo" value={
            <FileImagePreview 
              file={formData.profilePhoto} 
              altText="Profile photo preview" 
              className="h-20 w-20 rounded-full object-cover border-2 border-blue-500"
            />
          } />
        </ReviewSection>
        
        <ReviewSection title="Vehicle Information" stepIndex={2}>
          <DataRow label="Car Model" value={formData.carModel} />
          <DataRow label="Car Name" value={formData.carName} />
          <DataRow label="Car Number" value={formData.carNumber} />
          <DataRow label="Car Year" value={formData.carYear} />
          <DataRow label="Car Color" value={formData.carColor} />
          <DataRow label="Fuel Type" value={formData.fuelType} />
          <DataRow label="Number of Seats" value={formData.numSeats} />
          <div></div> {/* Spacer */}
          <DataRow label="RC Document" value={renderFileData(formData.rcDoc)} />
          <DataRow label="Insurance Document" value={renderFileData(formData.insuranceDoc)} />
          <DataRow label="Car Image" value={
            <FileImagePreview 
              file={formData.carImage} 
              altText="Car image preview" 
              className="h-20 w-20 rounded-lg object-cover border-2 border-blue-500"
            />
          } />
        </ReviewSection>

        <ReviewSection title="Driver Verification" stepIndex={3}>
          <DataRow label="License Number" value={formData.licenseNumber} />
          <DataRow label="Agreed to Terms" value={formData.agreedToTerms ? "Yes" : "No"} />
          <DataRow label="License (Front)" value={renderFileData(formData.licenseFront)} />
          <DataRow label="License (Back)" value={renderFileData(formData.licenseBack)} />
          <DataRow label="ID Proof" value={renderFileData(formData.idProof)} />
          <DataRow label="Selfie" value={
            <FileImagePreview 
              file={formData.selfie} 
              altText="Selfie preview" 
              className="h-20 w-20 rounded-full object-cover border-2 border-blue-500"
            />
          } />
        </ReviewSection>

        <div className="flex justify-between">
          <FormButton onClick={() => setStep(3)} text="Back" icon={ArrowLeft} variant="secondary" />
          <FormButton onClick={handleSubmit} text="Submit Application" icon={CheckCircle} isLoading={isLoading} />
        </div>
      </div>
    </FormStepLayout>
  );
};

/**
 * Step 5: Success Message
 */
const SuccessMessage = ({ onReset, formData }) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-8 text-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
        className="bg-green-100 dark:bg-green-900/50 p-6 rounded-full"
      >
        <CheckCircle className="h-24 w-24 text-green-600 dark:text-green-400" />
      </motion.div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
        Application Submitted!
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        Your driver profile has been submitted. Our team will verify your details and get back to you soon.
      </p>

      {/* --- New Details Section --- */}
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8 text-left">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
          Submission Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <DataRow label="Full Name" value={formData.fullName} />
          <DataRow label="Email" value={formData.email} />
          <DataRow label="Phone" value={formData.phone} />
          <DataRow label="Car" value={`${formData.carModel} ${formData.carName}`} />
          <DataRow label="Car Number" value={formData.carNumber} />
          <DataRow label="License Number" value={formData.licenseNumber} />
          <DataRow label="Profile Photo" value={
            <FileImagePreview 
              file={formData.profilePhoto} 
              altText="Profile photo" 
              className="h-20 w-20 rounded-full object-cover border-2 border-blue-500"
            />
          } />
          <DataRow label="Car Image" value={
            <FileImagePreview 
              file={formData.carImage} 
              altText="Car image" 
              className="h-20 w-20 rounded-lg object-cover border-2 border-blue-500"
            />
          } />
        </div>
      </div>
      {/* --- End New Details Section --- */}

      <FormButton onClick={onReset} text="Register Another Driver" icon={User} />
    </motion.div>
  );
};

// --- Layout & Helper Components ---

/**
 * Progress Bar
 */
const ProgressBar = ({ currentStep }) => {
  const steps = [
    { title: 'Personal', icon: User },
    { title: 'Vehicle', icon: Car },
    { title: 'Verification', icon: ShieldCheck },
  ];
  
  return (
    <div className="w-full max-w-md mx-auto mb-12">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber <= currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <React.Fragment key={step.title}>
              {/* Line separator */}
              {index > 0 && (
                <div className={`
                  flex-1 h-1 rounded
                  ${stepNumber <= currentStep ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}
                  transition-all duration-500
                `}></div>
              )}
              
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    h-12 w-12 rounded-full flex items-center justify-center
                    transition-all duration-500
                    ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                    ${isCurrent ? 'ring-4 ring-blue-300 dark:ring-blue-800' : ''}
                  `}
                >
                  <step.icon className="h-6 w-6" />
                </div>
                <p className={`
                  mt-2 text-sm font-medium
                  ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}
                `}>
                  {step.title}
                </p>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Reusable Button
 */
const FormButton = ({ onClick, text, icon: Icon, variant = 'primary', isLoading = false, ...props }) => {
  const baseClasses = "flex items-center justify-center space-x-2 font-bold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:cursor-not-allowed shadow-md";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300 dark:disabled:bg-blue-800/50",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
  };
  
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={isLoading}
      className={`${baseClasses} ${variants[variant]}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          {Icon && variant === 'secondary' && <Icon className="h-5 w-5" />}
          <span>{text}</span>
          {Icon && variant === 'primary' && <Icon className="h-5 w-5" />}
        </>
      )}
    </motion.button>
  );
};

/**
 * Animation variants for Framer Motion
 */
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};

/**
 * Step layout wrapper
 */
const FormStepLayout = ({ title, subtitle, children }) => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="w-full"
  >
    <div className="text-center mb-8">
      <motion.h2 variants={itemVariants} className="text-3xl font-bold text-gray-900 dark:text-white">
        {title}
      </motion.h2>
      <motion.p variants={itemVariants} className="text-base text-gray-600 dark:text-gray-400 mt-2">
        {subtitle}
      </motion.p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
      {children}
    </div>
  </motion.div>
);

/**
 * Header Component
 */
const OnboardingHeader = () => (
  <motion.div 
    className="text-center mb-8"
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, type: 'spring' }}
  >
    <Car className="h-20 w-20 text-blue-600 mx-auto" />
    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mt-4">
      Become a Driver
    </h1>
    <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
      Safe, verified, and trusted rides for our community.
    </p>
  </motion.div>
);

/**
 * Dark Mode Toggle
 */
const DarkModeToggle = ({ darkMode, setDarkMode }) => {
  const toggleDarkMode = () => setDarkMode(!darkMode);
  
  return (
    <button
      onClick={toggleDarkMode}
      className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
      aria-label="Toggle dark mode"
    >
      {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
};

// --- Main App Component ---

const Driver = () => {
  // --- State ---
  const [step, setStep] = useState(1); // 1, 2, 3, 4 (review), 5 (success)
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const initialFormData = {
    // Step 1
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    profilePhoto: null,
    address: '',
    // Step 2
    carModel: '',
    carName: '',
    carNumber: '',
    carYear: '',
    carColor: '',
    fuelType: '',
    numSeats: '',
    rcDoc: null,
    insuranceDoc: null,
    carImage: null,
    // Step 3
    licenseNumber: '',
    licenseFront: null,
    licenseBack: null,
    idProof: null,
    selfie: null,
    agreedToTerms: false,
  };
  
  const [formData, setFormData] = useState(initialFormData);

  // --- Effects ---
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // --- Validation Logic ---
  const validateStep1 = (data) => {
    const errors = {};
    if (!data.fullName.trim()) errors.fullName = "Full name is required";
    if (!data.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Email address is invalid";
    }
    if (!data.phone) {
      errors.phone = "Phone number is required";
    } else if (!/^\+?[1-9]\d{1,14}$/.test(data.phone.replace(/\s/g, ''))) {
      // Basic international phone regex
      errors.phone = "Phone number is invalid";
    }
    if (!data.dob) errors.dob = "Date of birth is required";
    if (!data.address.trim()) errors.address = "Address is required";
    if (!data.profilePhoto) errors.profilePhoto = "Profile photo is required";
    if (!data.gender) errors.gender = "Gender is required";
    return errors;
  };

  const validateStep2 = (data) => {
    const errors = {};
    if (!data.carModel.trim()) errors.carModel = "Car model is required";
    if (!data.carName.trim()) errors.carName = "Car name is required";
    if (!data.carNumber.trim()) errors.carNumber = "Car number is required";
    if (!data.carYear) {
      errors.carYear = "Car year is required";
    } else if (data.carYear < 1990 || data.carYear > new Date().getFullYear() + 1) {
      errors.carYear = "Please enter a valid year";
    }
    if (!data.fuelType) errors.fuelType = "Fuel type is required";
    if (!data.numSeats) errors.numSeats = "Number of seats is required";
    if (!data.rcDoc) errors.rcDoc = "RC document is required";
    if (!data.insuranceDoc) errors.insuranceDoc = "Insurance document is required";
    if (!data.carImage) errors.carImage = "Car image is required";
    return errors;
  };

  const validateStep3 = (data) => {
    const errors = {};
    if (!data.licenseNumber.trim()) errors.licenseNumber = "License number is required";
    if (!data.licenseFront) errors.licenseFront = "License front photo is required";
    if (!data.licenseBack) errors.licenseBack = "License back photo is required";
    if (!data.idProof) errors.idProof = "ID proof is required";
    if (!data.selfie) errors.selfie = "Selfie is required";
    if (!data.agreedToTerms) errors.agreedToTerms = "You must agree to the terms";
    return errors;
  };

  const validationFunctions = {
    1: validateStep1,
    2: validateStep2,
    3: validateStep3,
  };

  // --- Navigation Handlers ---
  const nextStep = () => {
    setDirection(1);
    setStep(s => Math.min(s + 1, 5));
  };
  
  const prevStep = () => {
    setDirection(-1);
    setStep(s => Math.max(s - 1, 1));
  };
  
  const goToStep = (stepNumber) => {
    setDirection(stepNumber > step ? 1 : -1);
    setStep(stepNumber);
  };

  // --- Form Submission ---
  const handleSubmit = () => {
    setIsLoading(true);
    console.log("Submitting form data:", formData);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      nextStep(); // Go to success screen
    }, 2000);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    goToStep(1);
  };

  // --- Animation Variants ---
  const stepVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };
  
  // --- Render Logic ---
  const renderStep = () => {
    const currentStep = step > 3 ? 3 : step; // For progress bar
    
    return (
      <div className="w-full max-w-4xl">
        {step <= 4 && (
          <>
            <OnboardingHeader />
            <ProgressBar currentStep={currentStep} />
          </>
        )}
        
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="w-full"
          >
            {step === 1 && (
              <PersonalInfoForm
                formData={formData}
                setFormData={setFormData}
                nextStep={nextStep}
                validate={validationFunctions[1]}
              />
            )}
            {step === 2 && (
              <VehicleInfoForm
                formData={formData}
                setFormData={setFormData}
                nextStep={nextStep}
                prevStep={prevStep}
                validate={validationFunctions[2]}
              />
            )}
            {step === 3 && (
              <VerificationForm
                formData={formData}
                setFormData={setFormData}
                nextStep={nextStep}
                prevStep={prevStep}
                validate={validationFunctions[3]}
              />
            )}
            {step === 4 && (
              <ReviewStep
                formData={formData}
                setStep={goToStep}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
              />
            )}
            {step === 5 && (
              <SuccessMessage onReset={resetForm} formData={formData} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className={`
      min-h-screen w-full 
      bg-gray-100 dark:bg-gray-900 
      text-gray-900 dark:text-white
      flex items-start justify-center p-4 md:p-8
      transition-colors duration-300
    `}>
      <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="w-full max-w-4xl mt-10 md:mt-16">
        {renderStep()}
      </div>
    </div>
  );
};

export default Driver;
