import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Register.module.css';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  // Manage the current step (1: Name, 2: Birth Date & Sex, 3: Email & Password)
  const [step, setStep] = useState(1);

  // Update state with all required fields
  const [formData, setFormData] = useState({
    name: '',
    familyName: '',
    birthDate: '',
    sex: '',
    email: '',
    password: '',
    phoneNumber: ''
  });

  const { name, familyName, birthDate, sex, email, password, phoneNumber } = formData;

  // Generic onChange handler for input fields
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle moving to the next step with simple validations per step
  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!name.trim()) {
        toast.error("Please enter your first name.");
        return;
      }
      // familyName is optional
    } else if (step === 2) {
      if (!birthDate) {
        toast.error("Please enter your birth date.");
        return;
      }
      if (!sex) {
        toast.error("Please select your sex.");
        return;
      }
    }
    setStep(step + 1);
  };

  // Handle going back to the previous step
  const handleBack = (e) => {
    e.preventDefault();
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Final submission on the last step
  const onSubmit = async (e) => {
    e.preventDefault();
    // Final validations for step 3
    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }
    try {
      // Adjust the register call to match your backend's expectations.
      // Here we pass all fields collected.
      await register(name, familyName, birthDate, sex, email, password, phoneNumber);
      toast.success("Registration successful");
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className={styles.registerContainer}>
      <h2>Register</h2>
      <form
        className={styles.registerForm}
        onSubmit={step === 3 ? onSubmit : handleNext}
      >
        {step === 1 && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="name">First Name:</label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={onChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="familyName">Family Name (optional):</label>
              <input
                type="text"
                name="familyName"
                value={familyName}
                onChange={onChange}
              />
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="birthDate">Birth Date:</label>
              <input
                type="date"
                name="birthDate"
                value={birthDate}
                onChange={onChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Sex:</label>
              <div className={styles.radioGroup}>
                <label htmlFor="male">
                  <input
                    type="radio"
                    id="male"
                    name="sex"
                    value="male"
                    checked={sex === 'male'}
                    onChange={onChange}
                    required
                  />
                  Male
                </label>
                <label htmlFor="female">
                  <input
                    type="radio"
                    id="female"
                    name="sex"
                    value="female"
                    checked={sex === 'female'}
                    onChange={onChange}
                    required
                  />
                  Female
                </label>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="phoneNumber">Phone Number:</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={onChange}
                  pattern="\d{10}"
                  title="Phone number must be exactly 10 digits"
                  required
                />
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                required
              />
            </div>
          </>
        )}
        <div className={styles.buttonGroup}>
          {step > 1 && (
            <button onClick={handleBack} className={styles.backBtn}>
              Back
            </button>
          )}
          <button type="submit" className={styles.nextBtn}>
            {step === 3 ? "Register" : "Next"}
          </button>
        </div>
      </form>
      <p className={styles.loginMsg}>
        Already have an account? <Link to="/login">Login Here</Link>
      </p>
    </div>
  );
};

export default Register;
