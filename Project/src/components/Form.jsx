export function FormField({ label, required, error, children }) {
  return (
    <div className="form-field">
      <label className="form-label">
        {label} {required && <span className="form-required">*</span>}
      </label>
      {children}
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}