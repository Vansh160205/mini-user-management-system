/**
 * Profile Page Component
 * 
 * User profile page with view and edit functionality.
 * Allows users to update their profile and change password.
 */

import { useState } from 'react';
import { useAuth } from '../hooks';
import { userService } from '../services';
import { Button, Input, Card, Modal, Alert } from '../components/ui';
import { useToast } from '../components/ui/Toast';
import { 
  validateProfileForm, 
  validatePasswordChangeForm 
} from '../utils/validators';
import { formatDate, getInitials } from '../utils/helpers';

export function ProfilePage() {
  const { user, updateUser, refreshUser } = useAuth();
  const toast = useToast();

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
  });
  const [profileErrors, setProfileErrors] = useState({});

  // Password form state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  /**
   * Handle profile input change
   */
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (profileErrors[name]) {
      setProfileErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  /**
   * Handle password input change
   */
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  /**
   * Start editing profile
   */
  const handleStartEdit = () => {
    setProfileData({
      full_name: user?.full_name || '',
      email: user?.email || '',
    });
    setProfileErrors({});
    setIsEditing(true);
  };

  /**
   * Cancel editing
   */
  const handleCancelEdit = () => {
    setProfileData({
      full_name: user?.full_name || '',
      email: user?.email || '',
    });
    setProfileErrors({});
    setIsEditing(false);
  };

  /**
   * Save profile changes
   */
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    // Validate
    const validation = validateProfileForm(profileData);
    if (!validation.isValid) {
      setProfileErrors(validation.errors);
      return;
    }

    setIsSaving(true);

    try {
      const response = await userService.updateUser(user.id, {
        full_name: profileData.full_name.trim(),
        email: profileData.email.trim(),
      });

      if (response.success) {
        // Update local user data
        updateUser(response.data.user);
        
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      
      // Handle validation errors
      if (error.errors && error.errors.length > 0) {
        const fieldErrors = {};
        error.errors.forEach((err) => {
          if (err.field) {
            fieldErrors[err.field] = err.message;
          }
        });
        setProfileErrors(fieldErrors);
      }
      
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Open password change modal
   */
  const handleOpenPasswordModal = () => {
    setPasswordData({
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
    setPasswordErrors({});
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
    setIsPasswordModalOpen(true);
  };

  /**
   * Close password change modal
   */
  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordData({
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
    setPasswordErrors({});
  };

  /**
   * Change password
   */
  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validate
    const validation = validatePasswordChangeForm(passwordData);
    if (!validation.isValid) {
      setPasswordErrors(validation.errors);
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await userService.changePassword(user.id, {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      if (response.success) {
        toast.success('Password changed successfully');
        handleClosePasswordModal();
      } else {
        toast.error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      
      // Handle validation errors
      if (error.errors && error.errors.length > 0) {
        const fieldErrors = {};
        error.errors.forEach((err) => {
          if (err.field) {
            fieldErrors[err.field] = err.message;
          }
        });
        setPasswordErrors(fieldErrors);
      }
      
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        {!isEditing && (
          <Button
            variant="primary"
            onClick={handleStartEdit}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          >
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Card */}
      <Card>
        {/* Profile Header */}
        <div className="flex items-center space-x-6 pb-6 border-b border-gray-200">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {getInitials(user?.full_name)}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{user?.full_name}</h2>
            <p className="text-gray-600 mt-1">{user?.email}</p>
            <div className="flex items-center space-x-2 mt-3">
              <span className={`badge ${user?.role === 'admin' ? 'badge-info' : 'badge-success'}`}>
                {user?.role}
              </span>
              <span className={`badge ${user?.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                {user?.status}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSaveProfile} className="mt-6">
          <div className="space-y-5">
            {/* Full Name */}
            <Input
              label="Full Name"
              type="text"
              name="full_name"
              id="full_name"
              value={isEditing ? profileData.full_name : user?.full_name}
              onChange={handleProfileChange}
              error={profileErrors.full_name}
              disabled={!isEditing || isSaving}
              required
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              name="email"
              id="email"
              value={isEditing ? profileData.email : user?.email}
              onChange={handleProfileChange}
              error={profileErrors.email}
              disabled={!isEditing || isSaving}
              required
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />

            {/* Role (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <div className="w-full px-4 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg capitalize">
                {user?.role}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Your role cannot be changed by yourself.
              </p>
            </div>

            {/* Status (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Status
              </label>
              <div className="w-full px-4 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg capitalize">
                {user?.status}
              </div>
            </div>

            {/* Member Since */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member Since
              </label>
              <div className="w-full px-4 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg">
                {formatDate(user?.created_at)}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSaving}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        </form>
      </Card>

      {/* Security Card */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Security</h3>
          <p className="text-sm text-gray-600 mt-1">Manage your password and security settings</p>
        </Card.Header>

        <Card.Body>
          <div className="flex items-center justify-between py-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Password</h4>
              <p className="text-sm text-gray-600 mt-1">
                Last changed on {formatDate(user?.updated_at)}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleOpenPasswordModal}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              }
            >
              Change Password
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Account Information Card */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
        </Card.Header>

        <Card.Body>
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">User ID</dt>
              <dd className="text-sm font-medium text-gray-900 font-mono">{user?.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Account Created</dt>
              <dd className="text-sm font-medium text-gray-900">{formatDate(user?.created_at)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Last Updated</dt>
              <dd className="text-sm font-medium text-gray-900">{formatDate(user?.updated_at)}</dd>
            </div>
            {user?.last_login && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Last Login</dt>
                <dd className="text-sm font-medium text-gray-900">{formatDate(user?.last_login)}</dd>
              </div>
            )}
          </dl>
        </Card.Body>
      </Card>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
        title="Change Password"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={handleClosePasswordModal}
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleChangePassword}
              loading={isChangingPassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleChangePassword} className="space-y-5">
          {/* Current Password */}
          <Input
            label="Current Password"
            type={showPasswords.current ? 'text' : 'password'}
            name="current_password"
            id="current_password"
            value={passwordData.current_password}
            onChange={handlePasswordChange}
            error={passwordErrors.current_password}
            placeholder="Enter your current password"
            required
            disabled={isChangingPassword}
            autoComplete="current-password"
            autoFocus
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
            rightIcon={
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="focus:outline-none pointer-events-auto"
                tabIndex={-1}
              >
                {showPasswords.current ? (
                  <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            }
          />

          {/* New Password */}
          <Input
            label="New Password"
            type={showPasswords.new ? 'text' : 'password'}
            name="new_password"
            id="new_password"
            value={passwordData.new_password}
            onChange={handlePasswordChange}
            error={passwordErrors.new_password}
            placeholder="Enter your new password"
            required
            disabled={isChangingPassword}
            autoComplete="new-password"
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            }
            rightIcon={
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="focus:outline-none pointer-events-auto"
                tabIndex={-1}
              >
                {showPasswords.new ? (
                  <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            }
          />

          {/* Confirm New Password */}
          <Input
            label="Confirm New Password"
            type={showPasswords.confirm ? 'text' : 'password'}
            name="confirm_password"
            id="confirm_password"
            value={passwordData.confirm_password}
            onChange={handlePasswordChange}
            error={passwordErrors.confirm_password}
            placeholder="Confirm your new password"
            required
            disabled={isChangingPassword}
            autoComplete="new-password"
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            rightIcon={
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="focus:outline-none pointer-events-auto"
                tabIndex={-1}
              >
                {showPasswords.confirm ? (
                  <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            }
          />

          {/* Password Requirements Info */}
          <Alert variant="info">
            <p className="text-xs">
              Your new password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.
            </p>
          </Alert>
        </form>
      </Modal>
    </div>
  );
}

export default ProfilePage;