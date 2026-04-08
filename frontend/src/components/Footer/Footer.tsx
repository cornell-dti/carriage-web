import React from 'react';

const contact = 'web-accessibility@cornell.edu';

const Footer = () => (
  <footer className="text-center py-8">
    <p>
      If you have a disability and are having trouble accessing information on
      this website or need materials in an alternate format, contact{' '}
      <a href={`mailto:${contact}`}>{contact}</a> for assistance.
    </p>
  </footer>
);

export default Footer;
