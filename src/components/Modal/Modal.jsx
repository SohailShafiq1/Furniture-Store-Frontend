import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, title, message, type = 'info', onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', showCancelButton = true }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal-content modal-${type}`}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        
        <div className="modal-body">
          <div className={`modal-icon modal-icon-${type}`}>
            {type === 'success' && '✓'}
            {type === 'error' && '✕'}
            {type === 'warning' && '!'}
            {type === 'info' && 'ℹ'}
          </div>
          <p>{message}</p>
        </div>

        <div className="modal-footer">
          {showCancelButton && (
            <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
              {cancelText}
            </button>
          )}
          <button className={`modal-btn modal-btn-confirm modal-btn-${type}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
