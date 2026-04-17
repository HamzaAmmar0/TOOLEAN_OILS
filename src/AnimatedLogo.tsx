export default function AnimatedLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 200" dir="ltr" className={`animated-logo ${className}`} xmlns="http://www.w3.org/2000/svg">
      {/* Text */}
      <text x="50%" y="90" textAnchor="middle" className="brand">
        TOL OLEAN
      </text>

      {/* Circle O */}
      <circle cx="300" cy="70" r="20" className="logo-circle" />

      {/* Oil Drop */}
      <path 
        d="M300 60 C295 70, 305 70, 300 80 C295 70, 305 70, 300 60Z"
        className="logo-drop" 
      />

      {/* Subtitle */}
      <text x="50%" y="140" textAnchor="middle" className="sub">
        BOTANICAL OILS
      </text>
    </svg>
  );
}
