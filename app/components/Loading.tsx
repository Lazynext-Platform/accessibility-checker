// File: app/components/Loading.tsx
import { TailwindCssClasses } from '../types/tailwind';

const Loading = () => {
  return (
    <div className={TailwindCssClasses.container}>
      <h1 className={TailwindCssClasses.heading}>Loading...</h1>
    </div>
  );
};

export default Loading;