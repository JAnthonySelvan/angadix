import { useEffect } from 'react';

export const useDocumentTitle = (title, overrideSuffix = false) => {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) {
      document.title = overrideSuffix ? title : `${title} | Angadix`;
    }
    return () => {
      document.title = prevTitle;
    };
  }, [title, overrideSuffix]);
};
