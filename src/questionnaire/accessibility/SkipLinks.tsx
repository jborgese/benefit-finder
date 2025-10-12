/**
 * Skip Links Component
 *
 * Accessible skip navigation links for keyboard users
 */

import React from 'react';

export interface SkipLinkProps {
  targetId: string;
  label: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ targetId, label }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="skip-link"
    >
      {label}
    </a>
  );
};

/**
 * Skip Links Container
 */
export const SkipLinks: React.FC<{
  links?: SkipLinkProps[];
  className?: string;
}> = ({ links, className = '' }) => {
  const defaultLinks: SkipLinkProps[] = [
    { targetId: 'main-content', label: 'Skip to main content' },
    { targetId: 'question-content', label: 'Skip to question' },
    { targetId: 'navigation', label: 'Skip to navigation' },
  ];

  const skipLinks = links || defaultLinks;

  return (
    <div className={`skip-links ${className}`}>
      {skipLinks.map((link) => (
        <SkipLink key={link.targetId} {...link} />
      ))}

      <style>{`
        .skip-link {
          position: absolute;
          left: -9999px;
          z-index: 999;
          padding: 1rem 1.5rem;
          background-color: #000;
          color: #fff;
          text-decoration: none;
          font-weight: 600;
        }

        .skip-link:focus {
          left: 50%;
          top: 1rem;
          transform: translateX(-50%);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
          border-radius: 0.375rem;
        }
      `}</style>
    </div>
  );
};

/**
 * Questionnaire Landmarks Component
 *
 * Provides semantic structure with ARIA landmarks
 */
export const QuestionnaireLandmarks: React.FC<{
  children: React.ReactNode;
  showSkipLinks?: boolean;
}> = ({ children, showSkipLinks = true }) => {
  return (
    <>
      {showSkipLinks && <SkipLinks />}

      <div role="main" id="main-content">
        {children}
      </div>
    </>
  );
};

/**
 * Progress landmark
 */
export const ProgressLandmark: React.FC<{
  children: React.ReactNode;
  ariaLabel?: string;
}> = ({ children, ariaLabel = 'Questionnaire progress' }) => {
  return (
    <div
      role="region"
      aria-label={ariaLabel}
      id="progress-region"
    >
      {children}
    </div>
  );
};

/**
 * Navigation landmark
 */
export const NavigationLandmark: React.FC<{
  children: React.ReactNode;
  ariaLabel?: string;
}> = ({ children, ariaLabel = 'Question navigation' }) => {
  return (
    <nav
      aria-label={ariaLabel}
      id="navigation"
    >
      {children}
    </nav>
  );
};

