import React from 'react';
import { motion } from 'framer-motion';

interface AuthCardProps {
  title?: string;
  children: React.ReactNode;
}

const AuthCard: React.FC<AuthCardProps> = ({ title = '', children }) => {
  return (
    <div className="bg-[#111111]/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/5 hover:border-white/10 transition-all duration-300 w-full max-w-md mx-auto">
      {/* Title Only */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FFFFFF] to-[#60A5FA] bg-clip-text text-transparent">
          {title}
        </h1>
      </motion.div>

      {/* Content */}
      <div className="space-y-6">
        {children}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">© 2024 Seinlol</p>
        <p className="mt-1 text-sm text-gray-500">All rights reserved by Seinlol<span className="font-bold text-gray-650 opacity-25"> </span></p>
      </div>
    </div>
  );
};

export default AuthCard; 