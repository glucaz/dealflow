export const Button = ({ children, ...props }) => (
  <button
    {...props}
    className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-full"
  >
    {children}
  </button>
);
