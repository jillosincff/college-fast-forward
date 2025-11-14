import { motion } from 'framer-motion';

const sparkleVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: [0, 1, 0], 
    opacity: [0, 1, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatDelay: 2,
      ease: "easeInOut"
    }
  }
};

export default function SparkleAnimation() {
  const sparkles = Array.from({ length: 4 });
  return (
    <>
      {sparkles.map((_, i) => (
        <motion.div
          key={i}
          variants={sparkleVariants}
          initial="initial"
          animate="animate"
          className="absolute w-3 h-3 bg-yellow-300 rounded-full"
          style={{
            top: `${Math.random() * 100 - 20}%`,
            left: `${Math.random() * 100 - 20}%`,
            transitionDelay: `${Math.random() * 0.5}s`
          }}
        />
      ))}
    </>
  );
}