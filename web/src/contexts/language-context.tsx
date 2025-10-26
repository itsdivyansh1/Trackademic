"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation data
const translations = {
  en: {
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.yes': 'Yes',
    'common.no': 'No',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.explore': 'Explore',
    'nav.publications': 'Publications',
    'nav.achievements': 'Achievements',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.form builder': 'Form Builder',
    'nav.logout': 'Logout',
    
    // Settings page
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your account settings and preferences',
    'settings.save': 'Save Changes',
    'settings.saving': 'Saving...',
    'settings.logout': 'Log out',
    'settings.profile': 'Profile',
    'settings.preferences': 'Preferences',
    'settings.cv': 'CV Settings',
    'settings.profile.title': 'Profile Information',
    'settings.profile.name': 'Full Name',
    'settings.profile.email': 'Email',
    'settings.profile.phone': 'Phone',
    'settings.profile.department': 'Department',
    'settings.profile.studentId': 'Student ID',
    'settings.profile.emailDisabled': 'Email cannot be changed',
    'settings.profile.uploadPhoto': 'Upload Photo',
    'settings.profile.uploading': 'Uploading...',
    'settings.profile.imageFormat': 'JPG, PNG or GIF. Max size 2MB.',
    'settings.preferences.title': 'Display & Language',
    'settings.preferences.theme': 'Theme',
    'settings.preferences.themeDesc': 'Choose your preferred theme',
    'settings.preferences.light': 'Light',
    'settings.preferences.dark': 'Dark',
    'settings.preferences.system': 'System',
    'settings.preferences.language': 'Language',
    'settings.preferences.languageDesc': 'Select your preferred language',
    'settings.cv.title': 'CV Generation Settings',
    'settings.cv.template': 'CV Template',
    'settings.cv.includePhoto': 'Include Profile Photo',
    'settings.cv.includeAddress': 'Include Address',
    'settings.cv.includeSummary': 'Include Summary',
    'settings.cv.includePublications': 'Include Publications',
    'settings.cv.includeAchievements': 'Include Achievements',
    'settings.cv.maxPublications': 'Max Publications',
    'settings.cv.maxAchievements': 'Max Achievements',
  },
  hi: {
    // Common
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.edit': 'संपादित करें',
    'common.delete': 'हटाएं',
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
    'common.yes': 'हाँ',
    'common.no': 'नहीं',
    
    // Navigation
    'nav.dashboard': 'डैशबोर्ड',
    'nav.explore': 'एक्सप्लोर',
    'nav.publications': 'प्रकाशन',
    'nav.achievements': 'उपलब्धियां',
    'nav.profile': 'प्रोफाइल',
    'nav.settings': 'सेटिंग्स',
    'nav.form builder': 'फॉर्म बिल्डर',
    'nav.logout': 'लॉग आउट',
    
    // Settings page
    'settings.title': 'सेटिंग्स',
    'settings.subtitle': 'अपनी खाता सेटिंग्स और प्राथमिकताएं प्रबंधित करें',
    'settings.save': 'परिवर्तन सहेजें',
    'settings.saving': 'सहेजा जा रहा है...',
    'settings.logout': 'लॉग आउट',
    'settings.profile': 'प्रोफाइल',
    'settings.preferences': 'प्राथमिकताएं',
    'settings.cv': 'सीवी सेटिंग्स',
    'settings.profile.title': 'प्रोफाइल जानकारी',
    'settings.profile.name': 'पूरा नाम',
    'settings.profile.email': 'ईमेल',
    'settings.profile.phone': 'फोन',
    'settings.profile.department': 'विभाग',
    'settings.profile.studentId': 'छात्र आईडी',
    'settings.profile.emailDisabled': 'ईमेल नहीं बदला जा सकता',
    'settings.profile.uploadPhoto': 'फोटो अपलोड करें',
    'settings.profile.uploading': 'अपलोड हो रहा है...',
    'settings.profile.imageFormat': 'JPG, PNG या GIF। अधिकतम आकार 2MB।',
    'settings.preferences.title': 'डिस्प्ले और भाषा',
    'settings.preferences.theme': 'थीम',
    'settings.preferences.themeDesc': 'अपनी पसंदीदा थीम चुनें',
    'settings.preferences.light': 'हल्का',
    'settings.preferences.dark': 'गहरा',
    'settings.preferences.system': 'सिस्टम',
    'settings.preferences.language': 'भाषा',
    'settings.preferences.languageDesc': 'अपनी पसंदीदा भाषा चुनें',
    'settings.cv.title': 'सीवी जेनरेशन सेटिंग्स',
    'settings.cv.template': 'सीवी टेम्प्लेट',
    'settings.cv.includePhoto': 'प्रोफाइल फोटो शामिल करें',
    'settings.cv.includeAddress': 'पता शामिल करें',
    'settings.cv.includeSummary': 'सारांश शामिल करें',
    'settings.cv.includePublications': 'प्रकाशन शामिल करें',
    'settings.cv.includeAchievements': 'उपलब्धियां शामिल करें',
    'settings.cv.maxPublications': 'अधिकतम प्रकाशन',
    'settings.cv.maxAchievements': 'अधिकतम उपलब्धियां',
  },
  mr: {
    // Common
    'common.save': 'सेव्ह करा',
    'common.cancel': 'रद्द करा',
    'common.edit': 'संपादित करा',
    'common.delete': 'हटवा',
    'common.loading': 'लोड होत आहे...',
    'common.error': 'त्रुटी',
    'common.success': 'यश',
    'common.yes': 'होय',
    'common.no': 'नाही',
    
    // Navigation
    'nav.dashboard': 'डॅशबोर्ड',
    'nav.explore': 'एक्सप्लोर',
    'nav.publications': 'प्रकाशने',
    'nav.achievements': 'उपलब्धी',
    'nav.profile': 'प्रोफाइल',
    'nav.settings': 'सेटिंग्स',
    'nav.form builder': 'फॉर्म बिल्डर',
    'nav.logout': 'लॉग आउट',
    
    // Settings page
    'settings.title': 'सेटिंग्स',
    'settings.subtitle': 'तुमच्या खात्याच्या सेटिंग्स आणि प्राधान्ये व्यवस्थापित करा',
    'settings.save': 'बदल सेव्ह करा',
    'settings.saving': 'सेव्ह होत आहे...',
    'settings.logout': 'लॉग आउट',
    'settings.profile': 'प्रोफाइल',
    'settings.preferences': 'प्राधान्ये',
    'settings.cv': 'सीव्ही सेटिंग्स',
    'settings.profile.title': 'प्रोफाइल माहिती',
    'settings.profile.name': 'पूर्ण नाव',
    'settings.profile.email': 'ईमेल',
    'settings.profile.phone': 'फोन',
    'settings.profile.department': 'विभाग',
    'settings.profile.studentId': 'विद्यार्थी आयडी',
    'settings.profile.emailDisabled': 'ईमेल बदलता येत नाही',
    'settings.profile.uploadPhoto': 'फोटो अपलोड करा',
    'settings.profile.uploading': 'अपलोड होत आहे...',
    'settings.profile.imageFormat': 'JPG, PNG किंवा GIF। कमाल आकार 2MB।',
    'settings.preferences.title': 'डिस्प्ले आणि भाषा',
    'settings.preferences.theme': 'थीम',
    'settings.preferences.themeDesc': 'तुमची आवडती थीम निवडा',
    'settings.preferences.light': 'हलका',
    'settings.preferences.dark': 'गडद',
    'settings.preferences.system': 'सिस्टम',
    'settings.preferences.language': 'भाषा',
    'settings.preferences.languageDesc': 'तुमची आवडती भाषा निवडा',
    'settings.cv.title': 'सीव्ही जनरेशन सेटिंग्स',
    'settings.cv.template': 'सीव्ही टेम्प्लेट',
    'settings.cv.includePhoto': 'प्रोफाइल फोटो समाविष्ट करा',
    'settings.cv.includeAddress': 'पत्ता समाविष्ट करा',
    'settings.cv.includeSummary': 'सारांश समाविष्ट करा',
    'settings.cv.includePublications': 'प्रकाशने समाविष्ट करा',
    'settings.cv.includeAchievements': 'उपलब्धी समाविष्ट करा',
    'settings.cv.maxPublications': 'कमाल प्रकाशने',
    'settings.cv.maxAchievements': 'कमाल उपलब्धी',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'hi', 'mr'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when changed
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
