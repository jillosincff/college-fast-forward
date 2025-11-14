import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export default function FABConnectButton({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-7 right-6 w-14 h-14 rounded-full text-white font-bold text-lg shadow-lg z-50 flex items-center justify-center"
      style={{ 
        backgroundColor: 'var(--uf-orange)',
        boxShadow: '0 8px 28px rgba(0,0,0,0.11)'
      }}
    >
      <Plus className="w-6 h-6" />
    </motion.button>
  );
}