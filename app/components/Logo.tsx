// components/Logo.js
const Logo = ({ width = 100, height = 100 }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="logo"
    >
      {/* Definir gradientes */}
      <defs>
        {/* Gradiente radial para el fondo */}
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: "#60A5FA", stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#2563EB", stopOpacity: 1 }}
          />
        </radialGradient>
        {/* Gradiente para el brillo del centro */}
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop
            offset="0%"
            style={{ stopColor: "#FFFFFF", stopOpacity: 0.8 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: "#FFFFFF", stopOpacity: 0 }}
          />
        </radialGradient>
      </defs>

      {/* Círculo de fondo con gradiente y borde sutil */}
      <circle cx="50" cy="50" r="50" fill="url(#bgGrad)" />
      <circle
        cx="50"
        cy="50"
        r="49"
        fill="none"
        stroke="#93C5FD"
        strokeWidth="1"
        opacity="0.5"
      />

      {/* Ondas concéntricas (estáticas por defecto) */}
      <path
        className="wave"
        d="M50 50 m-20,0 a20,20 0 1,1 40,0 a20,20 0 1,1 -40,0"
        fill="none"
        stroke="#BFDBFE"
        strokeWidth="1.5"
        opacity="0.3"
      />
      <path
        className="wave"
        d="M50 50 m-35,0 a35,35 0 1,1 70,0 a35,35 0 1,1 -70,0"
        fill="none"
        stroke="#BFDBFE"
        strokeWidth="1.5"
        opacity="0.3"
      />

      {/* Símbolo central: círculo con brillo y anillo (estático por defecto) */}
      <circle cx="50" cy="50" r="8" fill="url(#glow)" />
      <circle cx="50" cy="50" r="4" fill="#FFFFFF" className="pulse" />
      <circle
        cx="50"
        cy="50"
        r="8"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1"
        opacity="0.5"
        className="pulse-ring"
      />
    </svg>
  );
};

export default Logo;
