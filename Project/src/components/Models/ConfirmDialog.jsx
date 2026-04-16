import "./ConfirmDialog.css";

/**
 * @param {boolean}  isOpen
 * @param {string}   title    
 * @param {string}   message  
 * @param {string}   confirmLabel 
 * @param {function} onConfirm
 * @param {function} onCancel
 */
function ConfirmDialog({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="confirm-backdrop" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-btn cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="confirm-btn delete-btn" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;