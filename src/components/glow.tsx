export const Glow: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-red-500 to-purple-600 opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
      <div className="relative flex items-center gap-2 rounded-lg bg-black text-lg font-semibold leading-none">
        <div className="text-gray-300 transition duration-200 group-hover:text-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
};
