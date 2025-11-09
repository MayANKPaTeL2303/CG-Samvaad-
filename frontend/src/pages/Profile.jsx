import React, { useEffect, useState } from "react";
import { authAPI } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { toast } from "react-toastify";
import "./Profile.css";

const Profile = () => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      toast.error("Failed to load profile. Please log in again.");
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await authAPI.updateProfile(profile);
      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div className="profile-loading">Loading profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>{t("profile") || "Your Profile"}</h2>

        <div className="profile-grid">
          <div className="profile-group">
            <label>First Name</label>
            <input
              type="text"
              name="first_name"
              value={profile.first_name || ""}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>

          <div className="profile-group">
            <label>Last Name</label>
            <input
              type="text"
              name="last_name"
              value={profile.last_name || ""}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>

          <div className="profile-group">
            <label>Username</label>
            <input type="text" value={profile.username || ""} disabled />
          </div>

          <div className="profile-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={profile.email || ""}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>

          <div className="profile-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={profile.phone || ""}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>

          <div className="profile-group">
            <label>District</label>
            <input
              type="text"
              name="district"
              value={profile.district || ""}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>

          <div className="profile-group">
            <label>Role</label>
            <input type="text" value={profile.role || ""} disabled />
          </div>
        </div>

        {/* <div className="profile-actions">
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-primary">
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default Profile;
