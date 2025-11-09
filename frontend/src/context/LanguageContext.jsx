import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

const translations = {
  en: {
    appName: 'CG Samvaad',
    home: 'Home',
    submitComplaint: 'Submit Complaint',
    viewComplaints: 'View Complaints',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    profile: 'Profile',
    title: 'Title',
    description: 'Description',
    category: 'Category',
    location: 'Location',
    status: 'Status',
    submit: 'Submit',
    pending: 'Pending',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected',
    water: 'Water Supply',
    sanitation: 'Sanitation',
    roads: 'Roads & Infrastructure',
    electricity: 'Electricity',
    streetlight: 'Street Lighting',
    drainage: 'Drainage',
    garbage: 'Garbage Collection',
    other: 'Other',
  },
  hi: {
    appName: 'सीजी संवाद',
    home: 'होम',
    submitComplaint: 'शिकायत दर्ज करें',
    viewComplaints: 'शिकायतें देखें',
    login: 'लॉगिन',
    register: 'पंजीकरण',
    logout: 'लॉगआउट',
    profile: 'प्रोफ़ाइल',
    title: 'शीर्षक',
    description: 'विवरण',
    category: 'श्रेणी',
    location: 'स्थान',
    status: 'स्थिति',
    submit: 'जमा करें',
    pending: 'लंबित',
    inProgress: 'प्रगति में',
    resolved: 'हल हो गया',
    rejected: 'अस्वीकृत',
    water: 'जल आपूर्ति',
    sanitation: 'स्वच्छता',
    roads: 'सड़क और बुनियादी ढांचा',
    electricity: 'बिजली',
    streetlight: 'स्ट्रीट लाइटिंग',
    drainage: 'जल निकासी',
    garbage: 'कचरा संग्रहण',
    other: 'अन्य',
  },
  cg: {
    appName: 'सीजी संवाद',
    home: 'घर',
    submitComplaint: 'शिकायत देवव',
    viewComplaints: 'शिकायत देखव',
    login: 'लॉगिन',
    register: 'रजिस्टर',
    logout: 'लॉगआउट',
    profile: 'प्रोफाइल',
    title: 'नाम',
    description: 'जानकारी',
    category: 'किसम',
    location: 'जगह',
    status: 'हालत',
    submit: 'भेजव',
    pending: 'बाकी हे',
    inProgress: 'काम चालू हे',
    resolved: 'ठीक हो गे',
    rejected: 'मना कर दे',
    water: 'पानी के सुविधा',
    sanitation: 'सफाई',
    roads: 'सड़क',
    electricity: 'बिजली',
    streetlight: 'बत्ती',
    drainage: 'नाली',
    garbage: 'कचरा',
    other: 'अउ',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};