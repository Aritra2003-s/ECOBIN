import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Modal.css';

export default function Modal({ isOpen, onClose, title, children, width = 520 }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { 
      document.body.style.overflow = ''; 
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="modal-backdrop" 
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: width }}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          >
            <div className="modal-header">
              <h2 className="modal-title">{title}</h2>
              <button 
                className="modal-close-btn" 
                onClick={onClose}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}