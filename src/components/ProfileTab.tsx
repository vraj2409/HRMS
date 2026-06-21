/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Calendar, Heart, Shield, Edit3, Save, CheckCircle, GraduationCap, Award, Compass } from 'lucide-react';
import { Employee } from '../types';
import { api } from '../lib/api';

interface ProfileTabProps {
  employeeId: string;
}

export default function ProfileTab({ employeeId }: ProfileTabProps) {
  const [profile, setProfile] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states matching editable profile data
  const [phone, setPhone] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [panCode, setPanCode] = useState('');
  const [aadhaarCode, setAadhaarCode] = useState('');
  const [passportNo, setPassportNo] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyName, setEmergencyName] = useState('');

  const loadProfile = async () => {
    try {
      const data = await api.getProfile(employeeId);
      setProfile(data);
      // set Form States
      setPhone(data.phone);
      setMaritalStatus(data.personalInfo.maritalStatus);
      setFatherName(data.personalInfo.fatherName || '');
      setMotherName(data.personalInfo.motherName || '');
      setPanCode(data.personalInfo.panCode || '');
      setAadhaarCode(data.personalInfo.aadhaarCode || '');
      setPassportNo(data.personalInfo.passportNo || '');
      setContactAddress(data.contactAddress || '');
      setEmergencyPhone(data.emergencyContact.phone);
      setEmergencyName(data.emergencyContact.name);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [employeeId]);

  const handleSaveProfile = async () => {
    if (!profile) return;
    try {
      const payload = {
        phone,
        contactAddress,
        personalInfo: {
          ...profile.personalInfo,
          maritalStatus,
          fatherName,
          motherName,
          panCode,
          aadhaarCode,
          passportNo
        },
        emergencyContact: {
          ...profile.emergencyContact,
          name: emergencyName,
          phone: emergencyPhone
        }
      };
      await api.updateProfile(profile.id, payload);
      setSaveSuccess(true);
      setEditMode(false);
      // Reload actual database context
      await loadProfile();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert("Error saving profile details: " + err.message);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500">Retrieving profile portfolio card...</div>;
  }

  if (!profile) {
    return <div className="p-12 text-center text-xs text-red-500">Error: Profile details not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">My Profile</h2>
          <p className="text-xs text-[#64748b]">Dashboard &gt; My Profile</p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-green-600 font-bold bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Information Saved!
            </span>
          )}
          
          <button
            onClick={() => {
              if (editMode) {
                handleSaveProfile();
              } else {
                setEditMode(true);
              }
            }}
            className="px-4 py-2 bg-[#1e40af] hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
          >
            {editMode ? (
              <>
                <Save className="w-4 h-4" />
                Save Profile Info
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                Edit Profile Details
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column Core, Right Column Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column Profile Core Highlights Card */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-xs text-center flex flex-col items-center">
            {/* Avatar block */}
            <div className="relative w-24 h-24 rounded-full bg-slate-100 p-1 border border-slate-200 flex items-center justify-center text-slate-700">
              <span className="w-22 h-22 rounded-full bg-blue-900 border-2 border-white text-white font-extrabold text-2xl flex items-center justify-center uppercase">
                {profile.name.split(' ').map((n: string) => n[0]).join('')}
              </span>
            </div>

            <h3 className="text-base font-bold text-[#0f172a] mt-4 leading-tight">{profile.name}</h3>
            <span className="text-xs text-[#64748b] mt-1 block uppercase font-semibold tracking-wider">{profile.title}</span>

            {/* Core facts List */}
            <div className="w-full border-t border-[#f1f5f9] mt-5 pt-4 space-y-3.5 text-left text-xs">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[10px] text-[#64748b] block leading-none">Employee ID</span>
                  <span className="font-mono font-bold text-[#334155] mt-1 block">{profile.id}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Compass className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[10px] text-[#64748b] block leading-none">Department</span>
                  <span className="font-bold text-[#334155] mt-1 block">{profile.department}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[10px] text-[#64748b] block leading-none">Primary Email</span>
                  <span className="font-medium text-[#334155] mt-1 block truncate">{profile.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[10px] text-[#64748b] block leading-none">Mobile Phone</span>
                  {editMode ? (
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-slate-50 border border-slate-200 outline-none p-1 rounded font-mono font-bold mt-1 text-[#334155]"
                    />
                  ) : (
                    <span className="font-mono font-bold text-[#334155] mt-1 block">{profile.phone}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[10px] text-[#64748b] block leading-none">Primary Location</span>
                  <span className="font-bold text-[#334155] mt-1 block">{profile.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[10px] text-[#64748b] block leading-none">Date of Joining</span>
                  <span className="font-bold text-[#334155] mt-1 block font-mono">{profile.dateOfJoining}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-[10px] text-[#64748b] block leading-none">Reporting Manager</span>
                  <span className="font-semibold text-slate-700 mt-1 block">{profile.reportingManager}</span>
                </div>
              </div>
            </div>

            <button className="w-full mt-5 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-[#64748b] transition-all">
              View Organization Chart
            </button>
          </div>

          {/* Work Anniversary Counter card */}
          <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl shadow-xs text-xs text-slate-700">
            <h4 className="font-bold text-[#1e40af] flex items-center gap-1.5 mb-1.5">
              <Compass className="w-4 h-4 text-[#2563eb]" />
              Work Anniversary
            </h4>
            <p className="font-medium leading-relaxed">
              You have completed <strong className="text-blue-900">2 Years 4 Months</strong> with OriginEdge family. Your next journey milestone is on <strong className="text-blue-900 font-mono">Jan 15, 2027</strong>.
            </p>
          </div>
        </div>

        {/* Right Details Column: Personal details, Education, Skills, Certificates */}
        <div className="lg:col-span-2 space-y-6">

          {/* About Me Details Grid */}
          <div className="bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0f172a] border-b border-slate-100 pb-2">About Me Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-[#64748b] block font-bold uppercase tracking-wider">Birth Date</span>
                <span className="font-bold text-[#334155] tracking-tight">{profile.personalInfo.dob}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#64748b] block font-bold uppercase tracking-wider">Gender Profile</span>
                <span className="font-bold text-[#334155]">{profile.personalInfo.gender || 'Male'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#64748b] block font-bold uppercase tracking-wider">Marital Status Status</span>
                {editMode ? (
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value)}
                    className="bg-slate-50 border border-slate-200 outline-none p-1 rounded font-semibold text-[#334155]"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                ) : (
                  <span className="font-bold text-[#334155]">{profile.personalInfo.maritalStatus}</span>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#64748b] block font-bold uppercase tracking-wider">Blood Group Type</span>
                <span className="font-mono font-extrabold text-[#334155]">{profile.personalInfo.bloodGroup}</span>
              </div>
            </div>

            {/* Emergency Contact detail box */}
            <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-[#b45309] block uppercase tracking-widest">Emergency Contacts Record</span>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-amber-800 leading-none block">Contact Name / Relation</span>
                  {editMode ? (
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="bg-white border border-slate-200 outline-none p-1 rounded font-semibold text-slate-700"
                    />
                  ) : (
                    <strong className="text-slate-800 font-bold">{emergencyName}</strong>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-amber-800 leading-none block">Phone Number</span>
                  {editMode ? (
                    <input
                      type="text"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="bg-white border border-slate-200 outline-none p-1 rounded font-semibold text-slate-700"
                    />
                  ) : (
                    <strong className="text-slate-800 font-mono font-bold">{emergencyPhone}</strong>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Extended Personal Identity particulars */}
          <div className="bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0f172a] border-b border-slate-100 pb-2">Employment & ID details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-[#64748b] block">Father's Full Name</span>
                {editMode ? (
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="bg-slate-50 border border-slate-200 outline-none p-1 rounded w-full"
                  />
                ) : (
                  <span className="font-bold text-[#334155]">{fatherName || '--'}</span>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-[#64748b] block">Mother's Full Name</span>
                {editMode ? (
                  <input
                    type="text"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    className="bg-slate-50 border border-slate-200 outline-none p-1 rounded w-full"
                  />
                ) : (
                  <span className="font-bold text-[#334155]">{motherName || '--'}</span>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-[#64748b] block">Permanent Residence Residence</span>
                {editMode ? (
                  <input
                    type="text"
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    className="bg-slate-50 border border-slate-200 outline-none p-1 rounded w-full"
                  />
                ) : (
                  <span className="font-medium text-[#334155] leading-relaxed block">{contactAddress}</span>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[#64748b] block">PAN Number</span>
                    {editMode ? (
                      <input
                        type="text"
                        value={panCode}
                        onChange={(e) => setPanCode(e.target.value)}
                        className="bg-slate-50 border border-slate-200 p-1 rounded max-w-full font-mono text-xs"
                      />
                    ) : (
                      <span className="font-mono font-bold text-[#334155] block uppercase">{panCode || '--'}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748b] block">Aadhaar ID Card</span>
                    {editMode ? (
                      <input
                        type="text"
                        value={aadhaarCode}
                        onChange={(e) => setAadhaarCode(e.target.value)}
                        className="bg-slate-50 border border-slate-200 p-1 rounded max-w-full font-mono text-xs"
                      />
                    ) : (
                      <span className="font-mono font-bold text-[#334155] block">{aadhaarCode || '--'}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skill percentage meters (as shown on screenshots page 3) */}
          <div className="bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0f172a] border-b border-slate-100 pb-2">Evaluated Skill Matrix</h3>
            
            <div className="space-y-3.5">
              {profile.skills.length === 0 ? (
                <div className="text-xs text-slate-400">No skill evaluations listed.</div>
              ) : (
                profile.skills.map((sk, index) => (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">{sk.name}</span>
                      <span className="font-mono font-extrabold text-[#1e40af]">{sk.percentage}%</span>
                    </div>
                    <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${sk.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Educational qualifications */}
          <div className="bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0f172a] border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <GraduationCap className="w-5 h-5 text-[#1e40af]" />
              Academic Portfolios
            </h3>

            <div className="space-y-4">
              {profile.education.map((edu, idx) => (
                <div key={idx} className="flex gap-4 items-start text-xs relative">
                  {/* Visual timeline bullet */}
                  <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1e40af] shrink-0 font-bold font-mono">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800">{edu.degree}</h4>
                    <span className="text-[10px] text-[#64748b] font-semibold mt-0.5 block">{edu.school}</span>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-[#94a3b8] font-semibold font-mono">
                      <span>Years duration: {edu.years}</span>
                      <span className="text-[#10b981] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold">{edu.grade}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
