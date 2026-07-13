import { motion } from 'framer-motion';

export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 p-3 bg-secondary rounded-radius-lg rounded-tl-none border border-border w-max ml-12">
      <div className="flex gap-1">
        <motion.div
          className="w-2 h-2 bg-ring rounded-full"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="w-2 h-2 bg-ring rounded-full"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="w-2 h-2 bg-ring rounded-full"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
        />
      </div>
      <span className="text-xs text-ring font-medium">Agent is thinking...</span>
    </div>
  );
}
