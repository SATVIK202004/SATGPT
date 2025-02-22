import React from 'react';
import { Github, Linkedin, Instagram, Globe, Calculator, Search, Cloud } from 'lucide-react';
import { DEVELOPER_INFO } from '../config/constants';

export function SocialLinks() {
  const socialLinks = [
    { icon: Github, url: DEVELOPER_INFO.github, label: 'GitHub', color: '#333' },
    { icon: Linkedin, url: DEVELOPER_INFO.linkedin, label: 'LinkedIn', color: '#0A66C2' },
    { icon: Instagram, url: DEVELOPER_INFO.instagram, label: 'Instagram', color: '#E4405F' },
    { icon: Globe, url: DEVELOPER_INFO.SAT_JARVIS, label: 'SAT_JARVIS', color: '#6D83F2' },
    { icon: Calculator, url: DEVELOPER_INFO.SAT_GRADE, label: 'SAT_GRADE', color: '#A1C45A' },
    { icon: Search, url: DEVELOPER_INFO.SAT_SEARCH, label: 'SAT_SEARCH', color: '#F4A261' },
    { icon: Cloud, url: DEVELOPER_INFO.SAT_WEATHER, label: 'SAT_WEATHER', color: '#20B2AA' },
  ];

  return (
    <div className="flex flex-wrap gap-4">
      {socialLinks.map(({ icon: Icon, url, label, color }) => (
        <a
          key={label}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors flex items-center gap-2"
          title={label}
        >
          <Icon className="w-5 h-5" style={{ color }} />
          <span style={{ color }}>{label}</span>
        </a>
      ))}
    </div>
  );
}
