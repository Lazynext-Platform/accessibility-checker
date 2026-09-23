// File: app/components/Error.tsx
import { TailwindCssClasses } from '../types/tailwind';

interface ErrorProps {
  message: string;
}

const Error = ({ message }: ErrorProps) => {
  return (
    <div className={TailwindCssClasses.container}>
      <h1 className={TailwindCssClasses.heading}>Error</h1>
      <p className={TailwindCssClasses.text}>{message}</p>
    </div>
  );
};

export default Error;