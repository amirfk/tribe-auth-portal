import { useEffect } from 'react';
import Courses from "./../../../../../pages/Courses.tsx";


const args = {
};

const TempoComponent = () => {
  const notifyStoryRenderedArgs = () => {
    const notification = { filepath: '/home/peter/tempo-api/projects/0a/96/0a96ffb1-51b7-4c33-99c8-c30467fc5f4e/src/pages/Courses.tsx', componentName: 'Courses', args };
    if (typeof window !== "undefined" && (window as any).notifyStoryRenderedArgs) {
      (window as any).notifyStoryRenderedArgs(notification);
    } else if (typeof window !== "undefined") {
      if (!Array.isArray((window as any).pendingStoryArgsNotifications)) {
        (window as any).pendingStoryArgsNotifications = [];
      }
      (window as any).pendingStoryArgsNotifications.push(notification);
    }
  }

  notifyStoryRenderedArgs();

  return <Courses {...args}/>;
}



export default TempoComponent;