'use client';

import React, { AnchorHTMLAttributes } from 'react';
import NextLink from 'next/link';

interface CustomLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  noReferrer?: boolean;
}

const CustomLink: React.FC<CustomLinkProps> = ({
  href,
  noReferrer,
  children,
  className,
  ...rest
}) => {
  const isInternalLink = href && (href.startsWith('/') || href.startsWith('.'));
  const isAnchorLink = href && href.startsWith('#');

  if (isInternalLink) {
    return (
      <NextLink className={`break-words ${className || ''}`} href={href} {...(rest as any)}>
        {children}
      </NextLink>
    );
  }

  if (isAnchorLink) {
    return (
      <a className={`break-words ${className || ''}`} href={href} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <a
      className={`break-words ${className || ''}`}
      target="_blank"
      rel={'noopener' + (noReferrer ? ' noreferrer' : '')}
      href={href}
      {...rest}
    >
      {children}
    </a>
  );
};

export default CustomLink;
