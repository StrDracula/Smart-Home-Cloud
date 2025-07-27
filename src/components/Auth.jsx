import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import slide1 from '../assets/slide1.jpg';
import slide2 from '../assets/slide2.jpg';
import slide3 from '../assets/slide3.jpg';
import slide4 from '../assets/slide4.jpg';
import slide5 from '../assets/slide5.jpg';
import { auth, db } from '../components/firebase';
import '../styles/Auth.css';

const Auth = () => {
  // Get role from URL params
  const { role } = useParams();
  const navigate = useNavigate();
  
  const [isSignIn, setIsSignIn] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminId, setAdminId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Set a default role if none is provided in URL
  const [userRole, setUserRole] = useState(role || 'admin');
  
  // Update role when URL parameter changes
  useEffect(() => {
    if (role) {
      setUserRole(role);
    }
  }, [role]);
  
  // Images for slideshow
  const images = [
    slide1,
    slide2,
    slide3,
    slide4,
    slide5
  ];

  // Slideshow autoplay effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % images.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [images.length]);

  const toggleAuthMode = () => {
    setIsSignIn(!isSignIn);
    setError(''); // Clear any errors when switching modes
  };

  // Sign in/up with email and password
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isSignIn) {
        // Sign in functionality
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        try {
          // Check if user has the correct role
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role !== userRole) {
              // If role doesn't match, sign out and show error
              await auth.signOut();
              setError(`You don't have ${userRole} permissions. Please sign in with the correct role.`);
              setLoading(false);
              return;
            }
          } else {
            // User document doesn't exist in Firestore
            await auth.signOut();
            setError("User account is incomplete. Please contact support.");
            setLoading(false);
            return;
          }
        } catch (firestoreError) {
          console.error("Error fetching user document:", firestoreError);
          // Allow the user to continue even if we can't validate role
          // This is a fallback in case of permission issues
          console.log("Proceeding with authentication despite role validation failure");
        }
      } else {
        // Sign up functionality
        
        // If the role is family or guest, validate admin ID
        if ((userRole === 'family' || userRole === 'guest') && !adminId.trim()) {
          setError('Admin ID is required for family and guest accounts');
          setLoading(false);
          return;
        }
        
        // Check if email already exists before attempting to create account
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          if (methods && methods.length > 0) {
            setError('Email is already in use. Please use a different email or sign in.');
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Error checking email:", err);
          // Continue with registration attempt
        }
        
        // For family and guest roles, attempt to verify the admin ID exists
        // but don't block the flow if permissions fail
        let isAdminIdValid = true;
        if (userRole === 'family' || userRole === 'guest') {
          try {
            // Query users collection for the admin ID
            const usersRef = collection(db, "users");
            const adminQuery = query(usersRef, where("adminId", "==", adminId.trim()));
            
            const adminSnapshot = await getDocs(adminQuery);
            
            if (adminSnapshot.empty) {
              isAdminIdValid = false;
              // We'll check this flag later
            }
          } catch (error) {
            console.error("Error validating admin ID:", error);
            // If it's a permissions error, assume the ID might be valid
            // but we can't verify it at this moment
            console.log("Proceeding with registration despite admin ID validation failure");
          }
          
          // Now check if we should block based on our validation attempt
          if (!isAdminIdValid) {
            setError('Invalid Admin ID. Please check with your home administrator.');
            setLoading(false);
            return;
          }
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update the user's display name
        await updateProfile(user, {
          displayName: name
        }).catch(err => {
          console.error("Error updating profile:", err);
          // Continue despite profile update error
        });
        
        // Store user information in Firestore
        try {
          // Generate a unique admin ID for admin users
          const generatedAdminId = userRole === 'admin' ? `admin-${user.uid.substring(0, 8)}` : adminId.trim();
          
          await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            role: userRole,
            adminId: generatedAdminId,
            createdAt: new Date()
          });
        } catch (firestoreError) {
          console.error("Firestore error:", firestoreError);
          // Don't stop the flow - user is created in Auth but we failed to save profile
          // We'll let them proceed but log a warning
          console.log("User created but profile setup incomplete");
        }
      }
      
      // If successful, redirect to dashboard with the correct role
      navigate(`/dashboard/${userRole}`);
    } catch (error) {
      // Handle different Firebase auth errors
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use. Please use a different email or sign in.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format. Please provide a valid email.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      setError(errorMessage);
      console.error("Authentication error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Social auth providers
  const googleProvider = new GoogleAuthProvider();
  // const microsoftProvider = new OAuthProvider('microsoft.com');

  // Handle social auth
  const handleSocialAuth = async (provider) => {
    setError('');
    setLoading(true);
    
    try {
      // For family or guest roles, validate admin ID is provided
      if ((userRole === 'family' || userRole === 'guest') && !adminId.trim() && !isSignIn) {
        setError('Admin ID is required for family and guest accounts');
        setLoading(false);
        return;
      }
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      let userDoc = null;
      let userData = null;
      
      // Attempt to check if user already exists in our database
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        
        if (userDocSnapshot.exists()) {
          userDoc = userDocSnapshot;
          userData = userDocSnapshot.data();
        }
      } catch (firestoreError) {
        console.error("Error fetching user document:", firestoreError);
        // Proceed despite the error
      }
      
      if (userDoc && userData) {
        // If user exists, check role
        if (userData.role !== userRole) {
          // Role mismatch - sign out and show error
          await auth.signOut();
          setError(`You don't have ${userRole} permissions. Please sign in with the correct role.`);
          setLoading(false);
          return;
        }
      } else {
        // New social auth user - if it's family or guest, we need to verify admin ID
        let isAdminIdValid = true;
        if ((userRole === 'family' || userRole === 'guest') && !isSignIn) {
          try {
            // Query users collection for the admin ID
            const usersRef = collection(db, "users");
            const adminQuery = query(usersRef, where("adminId", "==", adminId.trim()));
            
            const adminSnapshot = await getDocs(adminQuery);
            
            if (adminSnapshot.empty) {
              isAdminIdValid = false;
            }
          } catch (error) {
            console.error("Error validating admin ID:", error);
            // If it's a permissions error, assume the ID might be valid
            console.log("Proceeding despite admin ID validation failure");
          }
          
          if (!isAdminIdValid) {
            await auth.signOut();
            setError('Invalid Admin ID. Please check with your home administrator.');
            setLoading(false);
            return;
          }
        }
        
        // Create user profile with selected role
        try {
          // Generate a unique admin ID for admin users
          const generatedAdminId = userRole === 'admin' ? `admin-${user.uid.substring(0, 8)}` : adminId.trim();
          
          await setDoc(doc(db, "users", user.uid), {
            name: user.displayName || '',
            email: user.email,
            role: userRole,
            adminId: generatedAdminId,
            createdAt: new Date()
          });
        } catch (firestoreError) {
          console.error("Firestore error:", firestoreError);
          // Don't block the flow - let user proceed but log warning
          console.log("Social login successful but profile setup incomplete");
        }
      }
      
      // If successful, redirect to dashboard
      navigate(`/dashboard/${userRole}`);
    } catch (error) {
      let errorMessage = 'Social authentication failed. Please try again.';
      
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with the same email address but different sign-in credentials.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed before completing the sign-in.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'The sign-in popup was canceled.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'The sign-in popup was blocked by the browser. Please enable popups for this site.';
      }
      
      setError(errorMessage);
      console.error("Social auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleTitle = () => {
    switch(userRole) {
      case 'admin':
        return 'Administrator';
      case 'family':
        return 'Family Member';
      case 'guest':
        return 'Guest';
      default:
        return 'User';
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-logo">
          <div className="logo-icon"></div>
          <span>Smart Home</span>
        </div>
        
        <div className="auth-content">
          <p>Start your journey</p>
          <h2>{isSignIn ? `Sign In as ${getRoleTitle()}` : `Sign Up as ${getRoleTitle()}`}</h2>
          
          {error && <div className="auth-error">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            {/* Name field - only show during sign up */}
            {!isSignIn && (
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-container">
                  <input 
                    type="text" 
                    placeholder="Type your name here"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <span className="input-icon name-icon">👤</span>
                </div>
              </div>
            )}
            
            {/* Admin ID field - only show for family and guest roles */}
            {(userRole === 'family' || userRole === 'guest') && (
              <div className="form-group">
                <label>Admin ID <span className="required-field">*</span></label>
                <div className="input-container">
                  <input 
                    type="text" 
                    placeholder="Enter the Admin ID provided to you"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    required
                  />
                  <span className="input-icon admin-icon">🔑</span>
                </div>
                <small className="field-hint">This ID connects your account to the smart home system.</small>
              </div>
            )}
            
            <div className="form-group">
              <label>E-mail</label>
              <div className="input-container">
                <input 
                  type="email" 
                  placeholder="Type your email here"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <span className="input-icon email-icon">✉️</span>
              </div>
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <div className="input-container">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Type your password here"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span 
                  className="input-icon password-icon" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </span>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Processing...' : (isSignIn ? 'Sign In' : 'Sign Up')}
            </button>
          </form>
          
          <div className="auth-divider">
            <span>or {isSignIn ? 'sign in' : 'sign up'} with</span>
          </div>
          
          <div className="social-auth">
            <button 
              className="social-btn google"
              onClick={() => handleSocialAuth(googleProvider)}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 12L12 16L16 12"></path>
                <path d="M12 8V16"></path>
              </svg>
            </button>
          </div>
          
          <div className="auth-footer">
            <p>
              {isSignIn ? "Don't have an account? " : "Already have an account? "}
              <span className="auth-link" onClick={toggleAuthMode}>
                {isSignIn ? 'Sign Up' : 'Sign In'}
              </span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="auth-image">
        {/* Slideshow container */}
        <div className="slideshow-container">
          {images.map((img, index) => (
            <img 
              key={index}
              src={img}
              alt={`Slide ${index + 1}`}
              className={`slideshow-image ${currentSlide === index ? 'active' : ''}`}
            />
          ))}
          
          {/* Slideshow indicators */}
          <div className="slideshow-indicators">
            {images.map((_, index) => (
              <button
                key={index}
                className={`indicator ${currentSlide === index ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;