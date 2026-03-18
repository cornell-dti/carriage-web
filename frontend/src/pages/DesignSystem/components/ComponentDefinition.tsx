import React, { useState } from 'react';
import buttonStyles from '../../../styles/button.module.css';

export type ComponentDefinitionProps = {
  preview: React.ReactNode;
  snippet: string;
  usage: string;
  showSnippets: boolean;
};

const ComponentDefinition = ({
  preview,
  snippet,
  usage,
  showSnippets,
}: ComponentDefinitionProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const cellStyle: React.CSSProperties = {
    flex: '1 1 0',
    minWidth: 0,
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#999',
    marginBottom: '0.25rem',
  };

  const codeStyle: React.CSSProperties = {
    background: '#f5f5f5',
    borderRadius: '0.2rem',
    padding: '0.625rem 0.75rem',
    fontSize: '0.75rem',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    whiteSpace: 'pre',
    overflowX: 'auto',
    margin: 0,
    flex: 1,
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1rem',
        alignItems: 'stretch',
      }}
    >
      <div style={cellStyle}>
        <p style={labelStyle}>Preview</p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            alignItems: 'center',
          }}
        >
          {preview}
        </div>
      </div>

      <div style={cellStyle}>
        <p style={labelStyle}>Usage</p>
        <p
          style={{
            fontSize: '0.875rem',
            color: '#555',
            margin: 0,
            maxWidth: '15rem',
          }}
        >
          {usage}
        </p>
      </div>
      {showSnippets && (
        <div style={{ ...cellStyle, position: 'relative' }}>
          <p style={labelStyle}>Snippet</p>
          <pre style={codeStyle}>
            <code>{snippet}</code>
          </pre>
          <button
            onClick={() => handleCopy(snippet)}
            className={`${buttonStyles.button} ${
              copied ? buttonStyles.buttonPrimary : buttonStyles.buttonSecondary
            }`}
            style={{
              position: 'absolute',
              top: '0.625rem',
              right: '0.625rem',
              width: 'auto',
              height: '1.5rem',
              fontSize: '0.7rem',
            }}
            aria-label="Copy snippet"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ComponentDefinition;
