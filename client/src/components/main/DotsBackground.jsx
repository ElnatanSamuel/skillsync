export default function DotsBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full z-0 opacity-[8%]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="dots"
          x="0"
          y="0"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1" fill="white">
            <animate
              attributeName="r"
              values="1;1;1"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  );
}
